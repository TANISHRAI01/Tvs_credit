"""
TVS Sentinel -- Dealer Intelligence Engine
Analyses dealer hub centrality, connected fraud ring density,
and customer default concentration for each dealer node.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("tvs-sentinel.dealer-intelligence")


def compute_dealer_intelligence(graph_engine) -> list[dict]:
    """
    Rank all dealer nodes by hub centrality and risk indicators.
    Returns a list of dealer intelligence records:
      [
        {
          "dealer_id": str,
          "label": str,
          "risk_score": float,
          "degree_centrality": int,
          "connected_customers": int,
          "connected_applications": int,
          "avg_customer_risk": float,
          "fraud_ring_connections": int,
          "hub_classification": "syndicate_hub" | "high_volume" | "normal",
        }, ...
      ]
    """
    sg = graph_engine
    G = sg.graph

    # Collect detected rings for cross-reference
    ring_node_sets = []
    try:
        from app.fraud_ring_detector import get_detected_rings
        for ring in get_detected_rings():
            ring_node_sets.append(set(ring.get("node_ids", [])))
    except Exception:
        pass

    dealers = []
    for nid, data in G.nodes(data=True):
        if data.get("type") != "dealer":
            continue

        neighbors = list(G.neighbors(nid))
        degree = len(neighbors)

        # Categorize neighbors
        customers = [n for n in neighbors if G.nodes[n].get("type") == "customer"]
        applications = [n for n in neighbors if G.nodes[n].get("type") == "loan_application"]

        # Average customer risk
        customer_risks = [float(G.nodes[c].get("risk_score", 0)) for c in customers]
        avg_cust_risk = round(sum(customer_risks) / len(customer_risks), 1) if customer_risks else 0.0

        # Fraud ring overlap
        neighbor_set = set(neighbors) | {nid}
        ring_connections = sum(1 for rs in ring_node_sets if rs & neighbor_set)

        # Classification
        risk = float(data.get("risk_score", 0))
        if ring_connections >= 2 or (risk >= 65 and degree >= 12):
            hub_class = "syndicate_hub"
        elif degree >= 8 or risk >= 45:
            hub_class = "high_volume"
        else:
            hub_class = "normal"

        dealers.append({
            "dealer_id": nid,
            "label": data.get("label", nid),
            "risk_score": risk,
            "degree_centrality": degree,
            "connected_customers": len(customers),
            "connected_applications": len(applications),
            "avg_customer_risk": avg_cust_risk,
            "fraud_ring_connections": ring_connections,
            "hub_classification": hub_class,
        })

    # Sort by risk descending
    dealers.sort(key=lambda d: d["risk_score"], reverse=True)
    return dealers
