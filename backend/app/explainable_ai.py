"""
TVS Sentinel -- Explainable AI Evidence Engine
Deconstructs black-box risk scores into transparent, human-auditable
evidence factors with exact point contributions.

Each factor describes a specific risk signal, its numeric contribution,
and maps to a dimension in the 6D Fraud DNA vector.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("tvs-sentinel.explainable-ai")


def compute_evidence(graph_engine, node_id: str) -> dict | None:
    """
    Build an evidence breakdown for a given entity.
    Returns:
      {
        "overall_risk": float,
        "factors": [{"description": str, "contribution": float}, ...]
      }
    or None if the node doesn't exist.
    """
    sg = graph_engine
    G = sg.graph

    target_id = _resolve(G, node_id)
    if target_id is None:
        return None

    data = G.nodes[target_id]
    overall = float(data.get("risk_score", 0))
    factors = []

    neighbors = list(G.neighbors(target_id))
    node_type = data.get("type", "unknown")

    # ── 1. Base entity risk ──
    if overall >= 60:
        factors.append({
            "description": f"Entity base risk score elevated ({overall:.0f}/100)",
            "contribution": round(overall * 0.15, 1),
        })
    else:
        factors.append({
            "description": f"Entity base risk profile ({overall:.0f}/100)",
            "contribution": round(overall * 0.08, 1),
        })

    # ── 2. Device sharing ──
    device_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "device"]
    for dev_id in device_neighbors:
        dev_users = G.degree(dev_id)
        if dev_users >= 3:
            factors.append({
                "description": f"Device {dev_id} shared with {dev_users} other accounts",
                "contribution": round(min(dev_users * 5.0, 28.0), 1),
            })
        elif dev_users == 2:
            factors.append({
                "description": f"Device {dev_id} shared between 2 accounts",
                "contribution": 6.0,
            })

    # ── 3. Dealer collusion ──
    dealer_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "dealer"]
    for dlr_id in dealer_neighbors:
        dlr_risk = float(G.nodes[dlr_id].get("risk_score", 0))
        dlr_degree = G.degree(dlr_id)
        if dlr_risk >= 50 or dlr_degree > 10:
            factors.append({
                "description": f"Connected to high-risk dealer hub {dlr_id} (risk {dlr_risk:.0f}, {dlr_degree} connections)",
                "contribution": round(dlr_risk * 0.35, 1),
            })
        elif dlr_degree > 5:
            factors.append({
                "description": f"Dealer {dlr_id} has {dlr_degree} connections",
                "contribution": round(dlr_degree * 1.5, 1),
            })

    # ── 4. Fraud ring connectivity ──
    try:
        from app.fraud_ring_detector import get_detected_rings
        rings = get_detected_rings()
        neighbor_set = set(neighbors)
        for ring in rings:
            ring_nodes = set(ring.get("node_ids", []))
            overlap = neighbor_set & ring_nodes
            if target_id in ring_nodes or overlap:
                ring_risk = ring.get("risk_score", 0)
                factors.append({
                    "description": f"Connected to known fraud ring {ring['ring_id']} (ring risk {ring_risk:.0f})",
                    "contribution": round(ring_risk * 0.28, 1),
                })
    except Exception:
        pass

    # ── 5. Guarantor cross-linkage ──
    guar_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "guarantor"]
    for gid in guar_neighbors:
        guar_connections = G.degree(gid)
        if guar_connections >= 3:
            factors.append({
                "description": f"Guarantor {gid} backs {guar_connections} applicants (cross-linkage)",
                "contribution": round(min(guar_connections * 4.0, 22.0), 1),
            })

    # ── 6. Location risk ──
    HIGH_RISK = {"chennai", "mumbai", "delhi", "hyderabad", "bangalore", "kolkata", "pune"}
    location_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "location"]
    node_city = str(data.get("city", data.get("location", ""))).lower()
    for loc_id in location_neighbors:
        loc_label = G.nodes[loc_id].get("label", "").lower()
        if any(hr in loc_label for hr in HIGH_RISK):
            factors.append({
                "description": f"Located in high-risk geography ({G.nodes[loc_id].get('label', loc_id)})",
                "contribution": 12.0,
            })
            break
    else:
        if any(hr in node_city for hr in HIGH_RISK):
            factors.append({
                "description": f"Applicant from high-density fraud region ({node_city.title()})",
                "contribution": 10.0,
            })

    # ── 7. Network density ──
    if len(neighbors) >= 8:
        factors.append({
            "description": f"Highly connected entity ({len(neighbors)} direct connections)",
            "contribution": round(min(len(neighbors) * 1.5, 18.0), 1),
        })

    # ── 8. 2-hop high risk ──
    two_hop_risky = 0
    for n1 in neighbors[:20]:  # limit for performance
        for n2 in G.neighbors(n1):
            if n2 != target_id and float(G.nodes[n2].get("risk_score", 0)) >= 70:
                two_hop_risky += 1
    if two_hop_risky >= 3:
        factors.append({
            "description": f"{two_hop_risky} high-risk entities within 2 hops (contagion zone)",
            "contribution": round(min(two_hop_risky * 3.0, 20.0), 1),
        })

    # ── 9. Bank account sharing ──
    bank_neighbors = [n for n in neighbors if G.nodes[n].get("type") == "bank_account"]
    for ba in bank_neighbors:
        ba_users = G.degree(ba)
        if ba_users >= 3:
            factors.append({
                "description": f"Bank account {ba} linked to {ba_users} entities",
                "contribution": round(min(ba_users * 4.0, 20.0), 1),
            })

    # Sort by contribution descending
    factors.sort(key=lambda f: abs(f["contribution"]), reverse=True)

    # Add one positive factor if overall is low
    if overall < 40 and len(factors) < 3:
        factors.append({
            "description": "Low overall graph connectivity — minimal contagion risk",
            "contribution": -5.0,
        })

    return {
        "overall_risk": overall,
        "factors": factors,
    }


def _resolve(G, node_id: str) -> str | None:
    if G.has_node(node_id):
        return node_id
    clean = node_id.upper().strip()
    candidates = []
    if clean.startswith("DEALER_"):
        num = clean.replace("DEALER_", "")
        candidates += [f"DLR_{num.zfill(5)}", f"DLR_{num.zfill(3)}"]
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
    for n in G.nodes:
        if n.lower() == node_id.lower():
            return n
    return None
