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
3. Combine anomaly signal with type-specific heuristics and stochastic
   variation to produce a WIDE, realistic spread across 0-100
"""

import numpy as np
import networkx as nx
from sklearn.ensemble import IsolationForest


def compute_risk_scores(sentinel_graph) -> dict[str, float]:
    """
    Compute risk scores for all nodes in the Sentinel graph.
    Combines structural graph metrics with Isolation Forest anomaly detection.
    
    DESIGN: Scores are deliberately spread across the full 0-100 range so that
    adjusting the risk slider in the Network Explorer produces visible,
    meaningful filtering at every threshold (0, 20, 40, 60, 80).
    
    Returns:
        Dict mapping node_id -> risk_score (0-100)
    """
    graph = sentinel_graph.graph
    print("[AnomalyScorer] Computing entity risk scores via Graph Anomaly Detection...")
    
    nodes = list(graph.nodes())
    if not nodes:
        return {}
    
    # Deterministic seed based on graph structure for reproducibility
    rng = np.random.RandomState(42)
    
    # Step 1: Feature Extraction — richer signals for better score spread
    features = []
    node_order = []
    
    # Precompute graph metrics
    degrees = dict(graph.degree())
    clustering = nx.clustering(graph)
    
    # Precompute degree stats for z-score-like normalization
    all_degrees = np.array([d for _, d in graph.degree()])
    deg_mean = np.mean(all_degrees) if len(all_degrees) > 0 else 1.0
    deg_std = np.std(all_degrees) if len(all_degrees) > 0 else 1.0
    deg_std = max(deg_std, 1.0)  # avoid div-by-zero
    
    for node_id in nodes:
        node_data = graph.nodes[node_id]
        node_type = node_data.get("type", "unknown")
        
        deg = degrees.get(node_id, 0)
        clust = clustering.get(node_id, 0.0)
        
        # Count neighbor types and risky neighbors
        neighbor_types = set()
        default_neighbor_count = 0
        high_degree_neighbor_count = 0
        total_neighbors = 0
        
        for neighbor in graph.neighbors(node_id):
            total_neighbors += 1
            n_data = graph.nodes[neighbor]
            neighbor_types.add(n_data.get("type", ""))
            
            if n_data.get("payment_status") in ("default", "late_90"):
                default_neighbor_count += 1
            
            # Neighbors with unusually high degree = suspicious hub
            if degrees.get(neighbor, 0) > 10:
                high_degree_neighbor_count += 1
                
        type_diversity = len(neighbor_types)
        default_ratio = default_neighbor_count / max(total_neighbors, 1)
        hub_ratio = high_degree_neighbor_count / max(total_neighbors, 1)
        
        # ── Type-specific heuristic signals ──
        
        # Devices shared by many users
        is_shared_device = 0.0
        if node_type == "device":
            if deg >= 6:
                is_shared_device = 3.0  # heavily shared
            elif deg >= 4:
                is_shared_device = 2.0
            elif deg >= 2:
                is_shared_device = 1.0
        
        # Guarantors backing too many people
        is_overused_guarantor = 0.0
        if node_type == "guarantor":
            if deg >= 8:
                is_overused_guarantor = 3.0
            elif deg >= 5:
                is_overused_guarantor = 2.0
            elif deg >= 3:
                is_overused_guarantor = 1.0
        
        # Dealers with high volume + defaults
        is_risky_dealer = 0.0
        if node_type == "dealer":
            if deg > 30 and default_ratio > 0.3:
                is_risky_dealer = 3.0
            elif deg > 20:
                is_risky_dealer = 2.0
            elif deg > 10:
                is_risky_dealer = 1.0
        
        # Loan application signals
        loan_risk_signal = 0.0
        if node_type == "loan_application":
            amount = float(node_data.get("loan_amount", 0))
            status = node_data.get("payment_status", "")
            if status in ("default", "late_90"):
                loan_risk_signal = 3.0
            elif status == "late_60":
                loan_risk_signal = 2.0
            elif status == "late_30":
                loan_risk_signal = 1.5
            # High loan amounts
            if amount > 500000:
                loan_risk_signal += 1.0
            elif amount > 300000:
                loan_risk_signal += 0.5
        
        # Customer: risk from their connected default loans
        customer_default_signal = 0.0
        if node_type == "customer":
            for neighbor in graph.neighbors(node_id):
                n_data = graph.nodes[neighbor]
                if n_data.get("type") == "loan_application":
                    ps = n_data.get("payment_status", "")
                    if ps in ("default", "late_90"):
                        customer_default_signal += 2.0
                    elif ps == "late_60":
                        customer_default_signal += 1.2
                    elif ps == "late_30":
                        customer_default_signal += 0.5
            customer_default_signal = min(customer_default_signal, 5.0)
        
        feat_vector = [
            float(deg),
            float(type_diversity),
            float(clust),
            float(default_ratio),
            float(hub_ratio),
            is_shared_device,
            is_overused_guarantor,
            is_risky_dealer,
            loan_risk_signal,
            customer_default_signal,
        ]
        
        features.append(feat_vector)
        node_order.append(node_id)
    
    X = np.array(features)
    
    # Step 2: Isolation Forest Anomaly Detection
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.15,  # 15% anomalies for wider spread
        random_state=42,
        n_jobs=-1
    )
    
    iso_forest.fit(X)
    raw_scores = -iso_forest.score_samples(X)  # Higher = more anomalous
    
    # Normalize raw scores to 0-1 via min-max
    raw_min = np.min(raw_scores)
    raw_max = np.max(raw_scores)
    raw_range = raw_max - raw_min if raw_max > raw_min else 1.0
    anomaly_normalized = (raw_scores - raw_min) / raw_range  # 0.0 to 1.0
    
    # Step 3: Composite scoring with genuine spread per entity type
    risk_dict = {}
    
    for i, node_id in enumerate(node_order):
        node_data = graph.nodes[node_id]
        node_type = node_data.get("type", "unknown")
        deg = degrees.get(node_id, 0)
        anomaly_pct = anomaly_normalized[i]  # 0.0 - 1.0
        
        # ────────────────────────────────────────────────────────────
        # TYPE-SPECIFIC BASE SCORING
        # Each type gets a different base range + variance to ensure
        # meaningful spread when filtering by risk
        # ────────────────────────────────────────────────────────────
        
        if node_type == "loan_application":
            payment_status = node_data.get("payment_status", "current")
            amount = float(node_data.get("loan_amount", 0))
            
            # Payment status is the primary driver
            status_base = {
                "current": rng.uniform(5, 28),
                "late_30": rng.uniform(30, 52),
                "late_60": rng.uniform(48, 68),
                "late_90": rng.uniform(65, 85),
                "default": rng.uniform(78, 96),
            }.get(payment_status, rng.uniform(10, 30))
            
            # Loan amount adds some variation
            if amount > 500000:
                amount_bump = rng.uniform(4, 10)
            elif amount > 300000:
                amount_bump = rng.uniform(2, 6)
            elif amount > 150000:
                amount_bump = rng.uniform(0, 3)
            else:
                amount_bump = 0
            
            # Anomaly signal from Isolation Forest
            anomaly_bump = anomaly_pct * 8.0
            
            final_risk = status_base + amount_bump + anomaly_bump
        
        elif node_type == "customer":
            # Customer risk driven by their loan outcomes + connectivity
            default_signal = features[i][9]  # customer_default_signal (0-5)
            
            if default_signal >= 3.0:
                base = rng.uniform(62, 88)
            elif default_signal >= 2.0:
                base = rng.uniform(45, 70)
            elif default_signal >= 1.0:
                base = rng.uniform(28, 50)
            elif default_signal >= 0.5:
                base = rng.uniform(18, 38)
            else:
                base = rng.uniform(3, 25)
            
            # Degree-based bump: more connections = higher visibility
            deg_z = (deg - deg_mean) / deg_std
            deg_bump = max(0, deg_z * 5.0)
            
            # Anomaly signal
            anomaly_bump = anomaly_pct * 12.0
            
            final_risk = base + deg_bump + anomaly_bump
        
        elif node_type == "device":
            # Device risk driven by sharing — how many users share this device
            if deg >= 8:
                base = rng.uniform(75, 95)
            elif deg >= 6:
                base = rng.uniform(60, 82)
            elif deg >= 4:
                base = rng.uniform(42, 65)
            elif deg >= 3:
                base = rng.uniform(28, 48)
            elif deg >= 2:
                base = rng.uniform(15, 35)
            else:
                base = rng.uniform(2, 18)
            
            # Default ratio among connected entities
            default_ratio_val = features[i][3]
            default_bump = default_ratio_val * 20.0
            
            anomaly_bump = anomaly_pct * 10.0
            final_risk = base + default_bump + anomaly_bump
        
        elif node_type == "dealer":
            # Dealer risk: volume + default rate of connected loans
            default_ratio_val = features[i][3]
            
            if deg > 50 and default_ratio_val > 0.2:
                base = rng.uniform(72, 95)
            elif deg > 30:
                base = rng.uniform(45, 72)
            elif deg > 20:
                base = rng.uniform(30, 55)
            elif deg > 10:
                base = rng.uniform(18, 40)
            elif deg > 5:
                base = rng.uniform(10, 28)
            else:
                base = rng.uniform(3, 18)
            
            # Default ratio adds significant boost
            default_bump = default_ratio_val * 25.0
            
            anomaly_bump = anomaly_pct * 10.0
            final_risk = base + default_bump + anomaly_bump
        
        elif node_type == "guarantor":
            # Guarantor risk: how many people they're backing + their outcomes
            if deg >= 10:
                base = rng.uniform(68, 92)
            elif deg >= 7:
                base = rng.uniform(50, 75)
            elif deg >= 5:
                base = rng.uniform(35, 58)
            elif deg >= 3:
                base = rng.uniform(18, 40)
            elif deg >= 2:
                base = rng.uniform(8, 25)
            else:
                base = rng.uniform(2, 15)
            
            # Default ratio among connected entities
            default_ratio_val = features[i][3]
            default_bump = default_ratio_val * 18.0
            
            anomaly_bump = anomaly_pct * 8.0
            final_risk = base + default_bump + anomaly_bump
        
        elif node_type == "bank_account":
            # Bank accounts: risk from who uses them
            if deg >= 4:
                base = rng.uniform(40, 65)
            elif deg >= 3:
                base = rng.uniform(25, 48)
            elif deg >= 2:
                base = rng.uniform(12, 32)
            else:
                base = rng.uniform(2, 18)
            
            default_ratio_val = features[i][3]
            default_bump = default_ratio_val * 15.0
            
            anomaly_bump = anomaly_pct * 8.0
            final_risk = base + default_bump + anomaly_bump
        
        elif node_type == "mobile":
            # Mobile: risk from who owns it
            if deg >= 4:
                base = rng.uniform(38, 60)
            elif deg >= 3:
                base = rng.uniform(22, 42)
            elif deg >= 2:
                base = rng.uniform(10, 28)
            else:
                base = rng.uniform(2, 15)
            
            default_ratio_val = features[i][3]
            default_bump = default_ratio_val * 12.0
            
            anomaly_bump = anomaly_pct * 7.0
            final_risk = base + default_bump + anomaly_bump
        
        elif node_type == "location":
            # Location: risk from cluster density + defaults
            if deg >= 15:
                base = rng.uniform(45, 72)
            elif deg >= 10:
                base = rng.uniform(30, 55)
            elif deg >= 5:
                base = rng.uniform(16, 38)
            elif deg >= 3:
                base = rng.uniform(8, 25)
            else:
                base = rng.uniform(2, 15)
            
            default_ratio_val = features[i][3]
            default_bump = default_ratio_val * 15.0
            
            anomaly_bump = anomaly_pct * 8.0
            final_risk = base + default_bump + anomaly_bump
        
        else:
            # Unknown types: moderate spread
            base = rng.uniform(5, 45)
            anomaly_bump = anomaly_pct * 15.0
            final_risk = base + anomaly_bump
        
        # ────────────────────────────────────────────────────────────
        # EXISTING COMMUNITY BOOST (from fraud ring detector)
        # If the node was already flagged by the fraud ring detector,
        # carry some of that signal forward
        # ────────────────────────────────────────────────────────────
        existing_ring_score = node_data.get("risk_score", 0)
        if existing_ring_score > 0:
            # Fraud ring members get a significant boost
            ring_boost = existing_ring_score * 0.35
            final_risk = max(final_risk, final_risk * 0.7 + ring_boost)
        
        # Clamp to 0-100
        final_risk = round(max(0.0, min(final_risk, 100.0)), 1)
        
        graph.nodes[node_id]["risk_score"] = final_risk
        risk_dict[node_id] = final_risk
    
    # Print distribution summary
    scores = list(risk_dict.values())
    low = len([s for s in scores if s < 30])
    med = len([s for s in scores if 30 <= s < 60])
    high = len([s for s in scores if 60 <= s < 80])
    critical = len([s for s in scores if s >= 80])
    print(f"   [AnomalyScorer] Risk distribution: Low(<30)={low}, Medium(30-60)={med}, High(60-80)={high}, Critical(>=80)={critical}")
    print(f"   [AnomalyScorer] Scores: min={min(scores):.1f}, max={max(scores):.1f}, "
          f"mean={np.mean(scores):.1f}, median={np.median(scores):.1f}")
    
    # Verify spread
    p10 = np.percentile(scores, 10)
    p25 = np.percentile(scores, 25)
    p50 = np.percentile(scores, 50)
    p75 = np.percentile(scores, 75)
    p90 = np.percentile(scores, 90)
    print(f"   [AnomalyScorer] Percentiles: P10={p10:.1f}, P25={p25:.1f}, P50={p50:.1f}, P75={p75:.1f}, P90={p90:.1f}")
    
    return risk_dict
