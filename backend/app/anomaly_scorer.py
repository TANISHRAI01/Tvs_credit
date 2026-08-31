"""
TVS Sentinel — Anomaly Scorer
Calculates structural graph anomaly scores for all entities in the Digital Twin.

Algorithm:
1. Extract structural graph metrics for every node:
   - Degree centrality (number of connected entities)
   - Neighbor diversity (number of distinct entity types connected)
   - Subgraph clustering coefficient
   - High-risk neighbor ratio
2. Run Isolation Forest anomaly detection to identify statistical outliers
3. Normalize anomaly decision function into a calibrated 0-100 risk score
"""

import numpy as np
import networkx as nx
from sklearn.ensemble import IsolationForest


def compute_risk_scores(sentinel_graph) -> dict[str, float]:
    """
    Compute risk scores for all nodes in the Sentinel graph.
    Combines structural graph metrics with Isolation Forest anomaly detection.
    
    Returns:
        Dict mapping node_id -> risk_score (0-100)
    """
    graph = sentinel_graph.graph
    print("[AnomalyScorer] Computing entity risk scores via Graph Anomaly Detection...")
    
    nodes = list(graph.nodes())
    if not nodes:
        return {}
    
    # Step 1: Feature Extraction
    features = []
    node_order = []
    
    # Precompute degrees
    degrees = dict(graph.degree())
    
    for node_id in nodes:
        node_data = graph.nodes[node_id]
        node_type = node_data.get("type", "unknown")
        
        deg = degrees.get(node_id, 0)
        
        # Count neighbor types
        neighbor_types = set()
        default_neighbor_count = 0
        total_neighbors = 0
        
        for neighbor in graph.neighbors(node_id):
            total_neighbors += 1
            n_data = graph.nodes[neighbor]
            neighbor_types.add(n_data.get("type", ""))
            
            if n_data.get("payment_status") in ("default", "late_90"):
                default_neighbor_count += 1
                
        type_diversity = len(neighbor_types)
        default_ratio = default_neighbor_count / max(total_neighbors, 1)
        
        # Specific heuristic signals
        is_high_volume_device = 1.0 if (node_type == "device" and deg > 3) else 0.0
        is_overused_guarantor = 1.0 if (node_type == "guarantor" and deg > 4) else 0.0
        is_high_risk_dealer = 1.0 if (node_type == "dealer" and deg > 20 and default_ratio > 0.3) else 0.0
        
        feat_vector = [
            float(deg),
            float(type_diversity),
            float(default_ratio),
            is_high_volume_device * 5.0,
            is_overused_guarantor * 5.0,
            is_high_risk_dealer * 5.0,
        ]
        
        features.append(feat_vector)
        node_order.append(node_id)
    
    X = np.array(features)
    
    # Step 2: Isolation Forest Anomaly Detection
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    
    iso_forest.fit(X)
    raw_scores = -iso_forest.score_samples(X)  # Higher = more anomalous
    
    # Step 3: Normalize to 0-100 scale
    min_s = float(np.min(raw_scores))
    max_s = float(np.max(raw_scores))
    rng = max_s - min_s if max_s > min_s else 1.0
    
    risk_dict = {}
    
    for i, node_id in enumerate(node_order):
        base_anomaly = ((raw_scores[i] - min_s) / rng) * 75.0  # 0-75 from anomaly detection
        
        # Existing community boost (from fraud ring detector)
        existing_boost = graph.nodes[node_id].get("risk_score", 0)
        
        # Composite score
        final_risk = round(min(base_anomaly + existing_boost * 0.4, 100.0), 1)
        graph.nodes[node_id]["risk_score"] = final_risk
        risk_dict[node_id] = final_risk
        
    print(f"   [AnomalyScorer] Computed risk scores for {len(risk_dict)} nodes (Avg: {np.mean(list(risk_dict.values())):.1f})")
    return risk_dict
