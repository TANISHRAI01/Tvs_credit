"""
TVS Sentinel -- Device Intelligence Engine
Detects device sharing clusters, virtual device fingerprints,
and device-mediated fraud ring connectivity.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("tvs-sentinel.device-intelligence")

# Known suspicious fingerprint patterns
VIRTUAL_PATTERNS = ["8892", "9918", "virtual", "emulator", "root"]


def compute_device_intelligence(graph_engine) -> list[dict]:
    """
    Analyse all device nodes for sharing clusters and anomaly flags.
    Returns a list of device intelligence records:
      [
        {
          "device_id": str,
          "label": str,
          "risk_score": float,
          "shared_users": int,
          "connected_applications": int,
          "is_virtual": bool,
          "fraud_ring_connections": int,
          "cluster_classification": "compromised" | "shared" | "clean",
        }, ...
      ]
    """
    sg = graph_engine
    G = sg.graph

    # Collect ring node sets
    ring_node_sets = []
    try:
        from app.fraud_ring_detector import get_detected_rings
        for ring in get_detected_rings():
            ring_node_sets.append(set(ring.get("node_ids", [])))
    except Exception:
        pass

    devices = []
    for nid, data in G.nodes(data=True):
        if data.get("type") != "device":
            continue

        neighbors = list(G.neighbors(nid))
        risk = float(data.get("risk_score", 0))

        # Users sharing this device
        users = [n for n in neighbors if G.nodes[n].get("type") == "customer"]
        applications = [n for n in neighbors if G.nodes[n].get("type") == "loan_application"]

        # Virtual device detection
        label = str(data.get("label", nid)).lower()
        fingerprint = str(data.get("fingerprint", data.get("device_fingerprint", ""))).lower()
        is_virtual = any(vp in label or vp in fingerprint for vp in VIRTUAL_PATTERNS)

        # Fraud ring overlap
        neighbor_set = set(neighbors) | {nid}
        ring_connections = sum(1 for rs in ring_node_sets if rs & neighbor_set)

        # Classification
        shared_count = len(users)
        if is_virtual or shared_count >= 5 or (shared_count >= 3 and ring_connections >= 1):
            cluster_class = "compromised"
        elif shared_count >= 2:
            cluster_class = "shared"
        else:
            cluster_class = "clean"

        devices.append({
            "device_id": nid,
            "label": data.get("label", nid),
            "risk_score": risk,
            "shared_users": shared_count,
            "connected_applications": len(applications),
            "is_virtual": is_virtual,
            "fraud_ring_connections": ring_connections,
            "cluster_classification": cluster_class,
        })

    # Sort by risk descending
    devices.sort(key=lambda d: d["risk_score"], reverse=True)
    return devices
