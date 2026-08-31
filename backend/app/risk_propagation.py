"""
TVS Sentinel -- Risk Propagation Engine
BFS multi-hop risk contagion with geometric decay.

Algorithm:
  Risk_hop(v) = Risk_source * alpha^d(source, v)

Where alpha (decay factor) defaults to 0.55, producing meaningful
propagation up to 3 hops before the risk decays below significance.
"""

from __future__ import annotations

import logging
from collections import deque

logger = logging.getLogger("tvs-sentinel.risk-propagation")

# Decay factor per hop
ALPHA = 0.55
MAX_HOPS = 3
MAX_PROPAGATED = 100  # cap returned nodes


def compute_risk_propagation(
    graph_engine,
    source_id: str,
    max_hops: int = MAX_HOPS,
    alpha: float = ALPHA,
) -> dict | None:
    """
    BFS risk propagation from `source_id`.
    Returns:
      {
        "source": <formatted source node dict>,
        "propagated": [
          {"id": ..., "label": ..., "type": ..., "propagated_risk": ..., "hops": ...},
          ...
        ]
      }
    or None if the source node doesn't exist.
    """
    sg = graph_engine
    G = sg.graph

    target = _resolve(G, source_id)
    if target is None:
        return None

    source_data = G.nodes[target]
    source_risk = float(source_data.get("risk_score", 0))
    source_formatted = sg._format_node(target, source_data)

    # BFS with depth tracking
    visited = {target}
    queue = deque()
    propagated = []

    # Seed: direct neighbors at hop 1
    for neighbor in G.neighbors(target):
        if neighbor not in visited:
            queue.append((neighbor, 1))
            visited.add(neighbor)

    while queue and len(propagated) < MAX_PROPAGATED:
        current_id, hops = queue.popleft()
        if hops > max_hops:
            continue

        nd = G.nodes[current_id]
        own_risk = float(nd.get("risk_score", 0))
        decayed = source_risk * (alpha ** hops)
        # Combined = max of own risk or propagated contagion
        propagated_risk = round(max(own_risk, decayed), 1)

        propagated.append({
            "id": current_id,
            "label": nd.get("label", current_id),
            "type": nd.get("type", "unknown"),
            "propagated_risk": propagated_risk,
            "hops": hops,
        })

        # Expand next hop
        if hops < max_hops:
            for next_neighbor in G.neighbors(current_id):
                if next_neighbor not in visited:
                    visited.add(next_neighbor)
                    queue.append((next_neighbor, hops + 1))

    # Sort by propagated risk descending
    propagated.sort(key=lambda p: p["propagated_risk"], reverse=True)

    return {
        "source": source_formatted,
        "propagated": propagated[:MAX_PROPAGATED],
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
