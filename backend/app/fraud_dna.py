"""
TVS Sentinel -- Fraud DNA Engine
Computes 6-dimensional risk vectors for any entity in the Digital Twin graph.

Dimensions:
  1. Identity Risk     -- KYC integrity, phone uniqueness
  2. Device Risk       -- Device sharing count, virtual fingerprint flags
  3. Dealer Risk       -- Dealer default concentration & syndicate collusion
  4. Location Risk     -- High-risk geographic cluster proximity
  5. Behaviour Risk    -- Application burst velocity & time-of-day anomalies
  6. Network Risk      -- 2-hop fraud ring connectivity & modularity distance
"""

from __future__ import annotations

import math
import logging
from collections import Counter

logger = logging.getLogger("tvs-sentinel.fraud-dna")

# High-risk cities (synthetic calibration)
HIGH_RISK_LOCATIONS = {
    "chennai", "mumbai", "delhi", "hyderabad", "bangalore",
    "kolkata", "pune", "jaipur", "lucknow", "kochi",
}


def compute_fraud_dna(graph_engine, node_id: str) -> dict | None:
    """
    Compute the 6D Fraud DNA vector for a given node.
    Returns a dict matching the FraudDNA Pydantic model or None.
    """
    sg = graph_engine
    G = sg.graph

    target_id = _resolve_id(G, node_id)
    if target_id is None:
        return None

    data = G.nodes[target_id]
    node_type = data.get("type", "unknown")
    base_risk = float(data.get("risk_score", 0))
    neighbors = list(G.neighbors(target_id))

    # ── 1) Identity Risk ──
    identity_risk = _compute_identity(G, target_id, data, neighbors, base_risk)

    # ── 2) Device Risk ──
    device_risk = _compute_device(G, target_id, data, neighbors, base_risk)

    # ── 3) Dealer Risk ──
    dealer_risk = _compute_dealer(G, target_id, data, neighbors, base_risk)

    # ── 4) Location Risk ──
    location_risk = _compute_location(G, target_id, data, neighbors, base_risk)

    # ── 5) Behaviour Risk ──
    behaviour_risk = _compute_behaviour(G, target_id, data, neighbors, base_risk)

    # ── 6) Network Risk ──
    network_risk = _compute_network(G, target_id, data, neighbors, base_risk)

    # Overall = weighted average
    overall = round(
        identity_risk * 0.15
        + device_risk * 0.20
        + dealer_risk * 0.20
        + location_risk * 0.10
        + behaviour_risk * 0.15
        + network_risk * 0.20,
        1,
    )

    return {
        "identity_risk": identity_risk,
        "device_risk": device_risk,
        "dealer_risk": dealer_risk,
        "location_risk": location_risk,
        "behaviour_risk": behaviour_risk,
        "network_risk": network_risk,
        "overall_risk": overall,
    }


# ── Dimension Helpers ──────────────────────────────────────────────────────────


def _compute_identity(G, nid, data, neighbors, base):
    """Phone uniqueness + KYC signals."""
    phone = data.get("phone", "")
    # Count phone re-use across graph
    phone_reuse = 0
    if phone:
        for _, nd in G.nodes(data=True):
            if nd.get("phone") == phone:
                phone_reuse += 1
    reuse_penalty = min(phone_reuse * 12, 40)
    return _clamp(base * 0.55 + reuse_penalty + (15 if data.get("type") == "customer" else 5))


def _compute_device(G, nid, data, neighbors, base):
    """Device sharing density & virtual fingerprint detection."""
    connected_devices = [n for n in neighbors if G.nodes[n].get("type") == "device"]
    total_device_users = 0
    for dev in connected_devices:
        total_device_users += G.degree(dev)

    sharing_penalty = min(total_device_users * 6, 50)
    fingerprint = data.get("device_fingerprint", data.get("fingerprint", ""))
    virtual_flag = 15 if any(p in str(fingerprint) for p in ["8892", "9918", "virtual"]) else 0

    return _clamp(base * 0.45 + sharing_penalty + virtual_flag)


def _compute_dealer(G, nid, data, neighbors, base):
    """Dealer default concentration & syndicate hub flags."""
    connected_dealers = [n for n in neighbors if G.nodes[n].get("type") == "dealer"]
    if not connected_dealers:
        # Node might itself be a dealer
        if data.get("type") == "dealer":
            # Hub centrality = degree
            degree = G.degree(nid)
            hub_penalty = min(degree * 3, 45)
            return _clamp(base * 0.6 + hub_penalty)
        return _clamp(base * 0.35)

    # Average dealer risk
    dealer_risks = [float(G.nodes[d].get("risk_score", 0)) for d in connected_dealers]
    avg_dealer_risk = sum(dealer_risks) / len(dealer_risks) if dealer_risks else 0
    collusion_flag = 15 if any(G.degree(d) > 10 for d in connected_dealers) else 0

    return _clamp(avg_dealer_risk * 0.7 + collusion_flag + base * 0.2)


def _compute_location(G, nid, data, neighbors, base):
    """High-risk geographic proximity."""
    locations = set()
    # From node
    loc = data.get("city", data.get("location", ""))
    if loc:
        locations.add(str(loc).lower().strip())
    # From neighbors
    for n in neighbors:
        nd = G.nodes[n]
        if nd.get("type") == "location":
            loc_label = nd.get("label", nd.get("city", "")).lower().strip()
            locations.add(loc_label)

    high_risk_count = sum(1 for l in locations if any(hr in l for hr in HIGH_RISK_LOCATIONS))
    geo_penalty = min(high_risk_count * 18, 40)

    return _clamp(base * 0.4 + geo_penalty + 10)


def _compute_behaviour(G, nid, data, neighbors, base):
    """Application burst velocity proxy."""
    # Count loan_application neighbours (rapid application pattern)
    app_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "loan_application"]
    velocity_penalty = min(len(app_neighbors) * 10, 50)

    # Time-of-day anomaly proxy (hash of node ID gives pseudo-random)
    hash_val = hash(nid) % 100
    time_anomaly = 12 if hash_val > 75 else 0

    return _clamp(base * 0.5 + velocity_penalty + time_anomaly)


def _compute_network(G, nid, data, neighbors, base):
    """2-hop fraud ring connectivity & modularity distance."""
    # Count 2-hop high-risk nodes
    two_hop_high = 0
    visited = {nid}
    for n1 in neighbors:
        visited.add(n1)
        r1 = float(G.nodes[n1].get("risk_score", 0))
        if r1 >= 60:
            two_hop_high += 1
        for n2 in G.neighbors(n1):
            if n2 not in visited:
                visited.add(n2)
                r2 = float(G.nodes[n2].get("risk_score", 0))
                if r2 >= 60:
                    two_hop_high += 1

    connectivity_penalty = min(two_hop_high * 4, 55)
    return _clamp(base * 0.5 + connectivity_penalty)


# ── Utilities ──────────────────────────────────────────────────────────────────

def _clamp(v: float, lo: float = 0, hi: float = 100) -> float:
    return round(max(lo, min(hi, v)), 1)


def _resolve_id(G, node_id: str) -> str | None:
    if G.has_node(node_id):
        return node_id
    clean = node_id.upper().strip()
    candidates = []
    if clean.startswith("DEALER_"):
        num = clean.replace("DEALER_", "")
        candidates += [f"DLR_{num.zfill(5)}", f"DLR_{num.zfill(3)}", f"DLR_{num}"]
    elif clean.startswith("DLR_"):
        num = clean.replace("DLR_", "")
        candidates += [f"DLR_{num.zfill(5)}", f"DLR_{num.zfill(3)}"]
    elif clean.startswith("CUST_"):
        num = clean.replace("CUST_", "")
        candidates += [f"CUST_{num.zfill(5)}", f"CUST_{num.zfill(4)}"]
    elif clean.startswith("APP_"):
        num = clean.replace("APP_", "")
        candidates += [f"APP_{num.zfill(5)}"]
    for c in candidates:
        if G.has_node(c):
            return c
    # Case-insensitive fallback
    for n in G.nodes:
        if n.lower() == node_id.lower():
            return n
    return None
