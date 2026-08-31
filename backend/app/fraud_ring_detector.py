"""
TVS Sentinel — Fraud Ring Detector
Uses Louvain community detection to find suspicious clusters in the graph.

Algorithm:
1. Run Louvain community detection on the full graph
2. For each community, analyze:
   - How many entities are shared (devices, guarantors, locations, dealers, mobiles, bank accounts)
   - Graph density & interconnectedness
   - Payment default and delinquency history
3. Score each community based on multi-entity fraud indicators
4. Flag communities above the risk threshold as fraud rings
"""

import community as community_louvain
import networkx as nx
from collections import defaultdict, Counter

# Module-level storage for detected rings
_detected_rings: list[dict] = []


def detect_fraud_rings(sentinel_graph, risk_threshold: float = 40.0) -> list[dict]:
    """
    Run fraud ring detection on the Sentinel graph.
    
    Args:
        sentinel_graph: SentinelGraph instance
        risk_threshold: Minimum risk score to classify a community as a fraud ring
    
    Returns:
        List of detected fraud ring dicts
    """
    global _detected_rings
    
    graph = sentinel_graph.graph
    print("[FraudRingDetector] Running fraud ring detection (Louvain community detection)...")

    # Step 1: Run Louvain community detection
    partition = community_louvain.best_partition(graph, random_state=42)
    
    # Group nodes by community
    communities = defaultdict(list)
    for node_id, community_id in partition.items():
        communities[community_id].append(node_id)
    
    print(f"   [FraudRingDetector] Found {len(communities)} total communities")

    # Step 2: Analyze each community for fraud indicators
    fraud_rings = []
    ring_counter = 1

    for comm_id, node_ids in communities.items():
        # Filter communities with meaningful multi-node interaction
        if len(node_ids) < 5 or len(node_ids) > 600:
            continue

        # Analyze this community
        analysis = _analyze_community(graph, node_ids)
        
        # Score the community
        risk_score = _compute_community_risk(analysis)
        
        if risk_score >= risk_threshold:
            # Calculate potential exposure
            total_exposure = sum(
                graph.nodes[n].get("loan_amount", 0)
                for n in node_ids
                if graph.nodes[n].get("type") == "loan_application"
            )
            
            # Determine ring type based on dominant fraud signal
            ring_type = _determine_ring_type(analysis)
            
            # Build timeline
            timeline = _build_ring_timeline(graph, node_ids, analysis)
            
            fraud_ring = {
                "ring_id": f"RING_{str(ring_counter).zfill(3)}",
                "community_id": comm_id,
                "risk_score": round(min(risk_score, 100), 1),
                "node_ids": node_ids,
                "node_count": len(node_ids),
                "type": ring_type,
                "potential_exposure": round(total_exposure / 100000, 2),  # in lakhs
                "analysis": analysis,
                "timeline": timeline,
            }
            
            fraud_rings.append(fraud_ring)
            ring_counter += 1
            
            # Update risk scores for nodes in this ring
            for node_id in node_ids:
                current_risk = graph.nodes[node_id].get("risk_score", 0)
                boost = risk_score * 0.65
                graph.nodes[node_id]["risk_score"] = min(
                    current_risk + boost, 100
                )

    # Sort by risk score (highest first)
    fraud_rings.sort(key=lambda r: r["risk_score"], reverse=True)
    
    _detected_rings = fraud_rings
    
    print(f"   [FraudRingDetector] Detected {len(fraud_rings)} fraud rings (threshold: {risk_threshold})")
    for ring in fraud_rings:
        print(f"      -> {ring['ring_id']}: risk={ring['risk_score']}, "
              f"nodes={ring['node_count']}, type={ring['type']}, "
              f"exposure=Rs.{ring['potential_exposure']}L")
    
    return fraud_rings


def get_detected_rings() -> list[dict]:
    """Get the list of detected fraud rings."""
    return _detected_rings


def _analyze_community(graph: nx.Graph, node_ids: list[str]) -> dict:
    """
    Analyze a community for fraud indicators.
    Returns a dict of metrics.
    """
    subgraph = graph.subgraph(node_ids)
    
    # Count node types
    type_counts = Counter()
    customers = []
    devices = []
    guarantors = []
    dealers = []
    locations = []
    mobiles = []
    bank_accounts = []
    applications = []
    
    for node_id in node_ids:
        node_data = graph.nodes[node_id]
        node_type = node_data.get("type", "unknown")
        type_counts[node_type] += 1
        
        if node_type == "customer":
            customers.append(node_id)
        elif node_type == "device":
            devices.append(node_id)
        elif node_type == "guarantor":
            guarantors.append(node_id)
        elif node_type == "dealer":
            dealers.append(node_id)
        elif node_type == "location":
            locations.append(node_id)
        elif node_type == "mobile":
            mobiles.append(node_id)
        elif node_type == "bank_account":
            bank_accounts.append(node_id)
        elif node_type == "loan_application":
            applications.append(node_id)
    
    num_customers = max(len(customers), 1)
    
    # Device sharing: how many customers per device (higher = more suspicious)
    device_sharing_ratio = num_customers / max(len(devices), 1)
    
    # Guarantor concentration: how many customers per guarantor
    guarantor_concentration = num_customers / max(len(guarantors), 1)
    
    # Dealer concentration: how many customers per dealer
    dealer_concentration = num_customers / max(len(dealers), 1)
    
    # Location concentration
    location_concentration = num_customers / max(len(locations), 1)
    
    # Payment defaults in this community
    default_count = 0
    late_count = 0
    for app_id in applications:
        payment_status = graph.nodes[app_id].get("payment_status", "current")
        if payment_status == "default":
            default_count += 1
        elif payment_status in ("late_30", "late_60", "late_90"):
            late_count += 1
    
    total_apps = max(len(applications), 1)
    default_rate = default_count / total_apps
    late_rate = late_count / total_apps
    
    # Graph density
    density = nx.density(subgraph)
    
    # Average degree within community
    degrees = [d for _, d in subgraph.degree()]
    avg_degree = sum(degrees) / max(len(degrees), 1)
    
    return {
        "num_customers": num_customers,
        "num_devices": len(devices),
        "num_guarantors": len(guarantors),
        "num_dealers": len(dealers),
        "num_locations": len(locations),
        "num_applications": len(applications),
        "device_sharing_ratio": round(device_sharing_ratio, 2),
        "guarantor_concentration": round(guarantor_concentration, 2),
        "dealer_concentration": round(dealer_concentration, 2),
        "location_concentration": round(location_concentration, 2),
        "default_rate": round(default_rate, 3),
        "late_rate": round(late_rate, 3),
        "density": round(density, 4),
        "avg_degree": round(avg_degree, 2),
        "type_counts": dict(type_counts),
    }


def _compute_community_risk(analysis: dict) -> float:
    """
    Compute a risk score for a community based on fraud indicators.
    Score range: 0-100.
    """
    score = 0.0
    
    # Device sharing (normal: ~1, suspicious: >2, very suspicious: >4)
    dsr = analysis["device_sharing_ratio"]
    if dsr > 4:
        score += 30
    elif dsr > 2:
        score += 20
    elif dsr > 1.5:
        score += 10
    
    # Guarantor concentration (normal: ~1, suspicious: >3)
    gc = analysis["guarantor_concentration"]
    if gc > 5:
        score += 25
    elif gc > 3:
        score += 15
    elif gc > 2:
        score += 8
    
    # Dealer concentration (normal: varies, suspicious: very high)
    dc = analysis["dealer_concentration"]
    if dc > 8:
        score += 20
    elif dc > 5:
        score += 12
    elif dc > 3:
        score += 5
    
    # Location concentration
    lc = analysis["location_concentration"]
    if lc > 5:
        score += 15
    elif lc > 3:
        score += 8
    
    # Default rate (normal: ~5%, suspicious: >20%)
    dr = analysis["default_rate"]
    if dr > 0.5:
        score += 20
    elif dr > 0.3:
        score += 12
    elif dr > 0.15:
        score += 5
    
    # Late payment rate
    lr = analysis["late_rate"]
    if lr > 0.5:
        score += 10
    elif lr > 0.3:
        score += 5
    
    # Graph density (very dense communities are suspicious)
    density = analysis["density"]
    if density > 0.3:
        score += 10
    elif density > 0.15:
        score += 5
    
    return min(score, 100)


def _determine_ring_type(analysis: dict) -> str:
    """Determine the dominant fraud pattern in a community."""
    signals = {
        "device_sharing": analysis["device_sharing_ratio"],
        "guarantor_ring": analysis["guarantor_concentration"],
        "dealer_collusion": analysis["dealer_concentration"],
        "location_cluster": analysis["location_concentration"],
    }
    
    dominant = max(signals, key=signals.get)
    
    if analysis["default_rate"] > 0.4:
        return f"{dominant}_with_defaults"
    
    return dominant


def _build_ring_timeline(graph: nx.Graph, node_ids: list[str], 
                         analysis: dict) -> list[dict]:
    """Build a timeline of events for a fraud ring."""
    timeline = []
    
    # Gather application dates
    app_dates = []
    for node_id in node_ids:
        node_data = graph.nodes[node_id]
        if node_data.get("type") == "loan_application":
            submitted = node_data.get("submitted_at", "")
            if submitted:
                app_dates.append((node_id, submitted))
    
    # Sort by date
    app_dates.sort(key=lambda x: x[1])
    
    if not app_dates:
        return timeline
    
    for i, (app_id, date) in enumerate(app_dates[:12]):
        if i == 0:
            event = "First application"
            desc = f"Application {app_id} submitted — initial entry point"
        elif i == 1:
            event = "Second application"
            desc = f"Application {app_id} — connection forming"
        elif i == len(app_dates) - 1:
            event = "Network fully formed"
            desc = f"Application {app_id} — fraud ecosystem established"
        else:
            if analysis["device_sharing_ratio"] > 2 and i == 2:
                event = "Shared device detected"
                desc = f"Application {app_id} uses a device seen in earlier applications"
            elif analysis["guarantor_concentration"] > 2 and i == 3:
                event = "Guarantor link found"
                desc = f"Same guarantor backing multiple applicants"
            elif analysis["dealer_concentration"] > 3 and i == 4:
                event = "Dealer pattern emerging"
                desc = f"Same dealer processing suspicious volume"
            elif analysis["location_concentration"] > 2 and i == 5:
                event = "Location cluster identified"
                desc = f"Multiple applications from same location"
            else:
                event = f"Connection #{i+1}"
                desc = f"Application {app_id} — network expanding"
        
        timeline.append({
            "day": i + 1,
            "event": event,
            "description": desc,
        })
    
    return timeline
