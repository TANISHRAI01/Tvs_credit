"""
TVS Sentinel — FastAPI Application
Main entry point with all API routes.

Run with: uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from datetime import datetime

from app.graph_engine import get_sentinel_graph
from app.models import (
    GraphResponse, GraphNode, GraphEdge, GraphStats,
    FraudRingSummary, FraudRingDetail, NodeDetail,
    EmergingEcosystem, NewApplicationRequest, NewApplicationResponse,
    Alert, EntityTypeCounts, SharedEntities, TimelineEvent,
    ConnectionInfo, ConnectedRingInfo, RelatedEntity,
)

# ── App Setup ──

app = FastAPI(
    title="TVS Sentinel API",
    description="AI-Powered Digital Twin for Predictive Fraud Ecosystems",
    version="1.0.0",
)

# CORS — allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Startup Event ──

@app.on_event("startup")
async def startup_event():
    """Load data and build graph on startup."""
    print("\n🚀 TVS Sentinel starting up...")
    graph = get_sentinel_graph()
    
    # Run fraud detection if available
    try:
        from app.fraud_ring_detector import detect_fraud_rings
        detect_fraud_rings(graph)
        print("✅ Fraud ring detection complete")
    except ImportError:
        print("⚠️  fraud_ring_detector not yet available — skipping")
    
    try:
        from app.anomaly_scorer import compute_risk_scores
        compute_risk_scores(graph)
        print("✅ Risk scoring complete")
    except ImportError:
        print("⚠️  anomaly_scorer not yet available — skipping")
    
    try:
        from app.emerging_ecosystem import detect_emerging_ecosystems
        detect_emerging_ecosystems(graph)
        print("✅ Emerging ecosystem detection complete")
    except ImportError:
        print("⚠️  emerging_ecosystem not yet available — skipping")
    
    print("🟢 TVS Sentinel is ready!\n")


# ── Health Check ──

@app.get("/")
async def root():
    return {
        "name": "TVS Sentinel",
        "tagline": "Fraud doesn't happen in isolation. We detect the ecosystem behind it.",
        "version": "1.0.0",
        "status": "operational",
    }


@app.get("/health")
async def health():
    graph = get_sentinel_graph()
    return {
        "status": "healthy",
        "nodes": graph.graph.number_of_nodes(),
        "edges": graph.graph.number_of_edges(),
    }


# ── Priority 1 API Endpoints ──

@app.get("/api/graph", response_model=GraphResponse)
async def get_graph(
    node_type: Optional[str] = Query(None, description="Filter by node type"),
    min_risk: float = Query(0, description="Minimum risk score filter"),
    limit: int = Query(2000, description="Max nodes to return"),
):
    """
    Get the full entity graph (nodes + edges).
    Use filters to reduce response size for visualization.
    """
    graph = get_sentinel_graph()
    
    nodes = graph.get_all_nodes(node_type=node_type, min_risk=min_risk)
    
    # Limit nodes for performance
    if len(nodes) > limit:
        # Prioritize high-risk nodes
        nodes.sort(key=lambda n: n["risk_score"], reverse=True)
        nodes = nodes[:limit]
    
    # Get only edges between included nodes
    included_ids = {n["id"] for n in nodes}
    all_edges = graph.get_all_edges()
    edges = [e for e in all_edges if e["from"] in included_ids and e["to"] in included_ids]
    
    return GraphResponse(
        nodes=[GraphNode(**n) for n in nodes],
        edges=[GraphEdge(**e) for e in edges],
    )


@app.get("/api/graph/stats", response_model=GraphStats)
async def get_graph_stats():
    """Get summary statistics for the dashboard."""
    graph = get_sentinel_graph()
    stats = graph.get_stats()
    
    # Update with fraud ring data if available
    try:
        from app.fraud_ring_detector import get_detected_rings
        rings = get_detected_rings()
        stats["suspicious_networks"] = len([r for r in rings if r["risk_score"] >= 50])
        stats["critical_networks"] = len([r for r in rings if r["risk_score"] >= 80])
    except (ImportError, Exception):
        pass
    
    return GraphStats(**stats)


@app.get("/api/fraud-rings", response_model=list[FraudRingSummary])
async def get_fraud_rings():
    """Get all detected fraud rings."""
    try:
        from app.fraud_ring_detector import get_detected_rings
        rings = get_detected_rings()
    except ImportError:
        rings = []
    
    graph = get_sentinel_graph()
    result = []
    
    for ring in rings:
        ring_node_ids = ring.get("node_ids", [])
        nodes, edges = graph.get_subgraph(ring_node_ids)
        
        # Count entity types
        type_counts = {}
        for n in nodes:
            t = n["type"]
            type_counts[t] = type_counts.get(t, 0) + 1
        
        result.append(FraudRingSummary(
            id=ring["ring_id"],
            risk_score=ring.get("risk_score", 0),
            node_count=len(nodes),
            entity_types=EntityTypeCounts(
                customers=type_counts.get("customer", 0),
                devices=type_counts.get("device", 0),
                dealers=type_counts.get("dealer", 0),
                bank_accounts=type_counts.get("bank_account", 0),
                mobiles=type_counts.get("mobile", 0),
                locations=type_counts.get("location", 0),
                guarantors=type_counts.get("guarantor", 0),
                loan_applications=type_counts.get("loan_application", 0),
            ),
            potential_exposure=ring.get("potential_exposure", 0),
            nodes=[GraphNode(**n) for n in nodes],
            edges=[GraphEdge(**e) for e in edges],
        ))
    
    # Sort by risk score (highest first)
    result.sort(key=lambda r: r.risk_score, reverse=True)
    return result


@app.get("/api/fraud-rings/{ring_id}", response_model=FraudRingDetail)
async def get_fraud_ring_detail(ring_id: str):
    """Get detailed info about a specific fraud ring."""
    try:
        from app.fraud_ring_detector import get_detected_rings
        rings = get_detected_rings()
    except ImportError:
        raise HTTPException(status_code=503, detail="Fraud ring detector not available")
    
    ring = next((r for r in rings if r["ring_id"] == ring_id), None)
    if not ring:
        raise HTTPException(status_code=404, detail=f"Fraud ring {ring_id} not found")
    
    graph = get_sentinel_graph()
    ring_node_ids = ring.get("node_ids", [])
    nodes, edges = graph.get_subgraph(ring_node_ids)
    
    # Find shared entities
    shared = _find_shared_entities(nodes, edges, graph)
    
    # Build timeline
    timeline = ring.get("timeline", [])
    timeline_events = [TimelineEvent(**t) for t in timeline] if timeline else []
    
    return FraudRingDetail(
        id=ring_id,
        risk_score=ring.get("risk_score", 0),
        node_count=len(nodes),
        potential_exposure=ring.get("potential_exposure", 0),
        nodes=[GraphNode(**n) for n in nodes],
        edges=[GraphEdge(**e) for e in edges],
        shared_entities=SharedEntities(**shared),
        timeline=timeline_events,
    )


@app.get("/api/node/{node_id}", response_model=NodeDetail)
async def get_node_detail(node_id: str):
    """Get detailed info about a specific node and its connections."""
    graph = get_sentinel_graph()
    detail = graph.get_node_detail(node_id)
    
    if not detail:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    
    return NodeDetail(
        id=detail["id"],
        label=detail["label"],
        type=detail["type"],
        risk_score=detail["risk_score"],
        connections=[ConnectionInfo(**c) for c in detail["connections"]],
        metadata=detail["metadata"],
    )


@app.get("/api/emerging-ecosystems", response_model=list[EmergingEcosystem])
async def get_emerging_ecosystems():
    """Get networks that are currently forming (predicted threats)."""
    try:
        from app.emerging_ecosystem import get_emerging_ecosystems
        ecosystems = get_emerging_ecosystems()
    except ImportError:
        ecosystems = []
    
    graph = get_sentinel_graph()
    result = []
    
    for eco in ecosystems:
        node_ids = eco.get("node_ids", [])
        nodes, _ = graph.get_subgraph(node_ids)
        
        result.append(EmergingEcosystem(
            id=eco["id"],
            current_stage=eco.get("stage", "forming"),
            risk_trajectory=eco.get("risk_trajectory", []),
            days_forming=eco.get("days_forming", 0),
            nodes=[GraphNode(**n) for n in nodes],
            predicted_risk=eco.get("predicted_risk", 0),
        ))
    
    return result


@app.post("/api/applications", response_model=NewApplicationResponse)
async def submit_application(request: NewApplicationRequest):
    """
    Submit a new loan application.
    The system adds it to the graph, recalculates risk, and returns assessment.
    """
    graph = get_sentinel_graph()
    
    # Add to graph
    new_id = graph.add_application({
        "applicant_name": request.applicant_name,
        "phone": request.phone,
        "device_fingerprint": request.device_fingerprint,
        "dealer_id": request.dealer_id,
        "location": request.location,
        "guarantor_id": request.guarantor_id,
        "bank_account": request.bank_account,
        "loan_amount": request.loan_amount,
        "customer_id": f"CUST_NEW_{request.phone[-6:]}",
    })
    
    # Check connections to existing fraud rings
    connected_rings = []
    risk_score = 10.0  # base risk
    is_suspicious = False
    alert_message = "Application received — no immediate risk signals detected."
    
    try:
        from app.fraud_ring_detector import get_detected_rings
        rings = get_detected_rings()
        
        # Check if new application connects to any known ring
        new_node_neighbors = set(graph.graph.neighbors(new_id))
        customer_id = f"CUST_NEW_{request.phone[-6:]}"
        if graph.graph.has_node(customer_id):
            new_node_neighbors.update(graph.graph.neighbors(customer_id))
        
        for ring in rings:
            ring_nodes = set(ring.get("node_ids", []))
            overlap = new_node_neighbors & ring_nodes
            if overlap:
                connected_rings.append(ConnectedRingInfo(
                    ring_id=ring["ring_id"],
                    risk_score=ring["risk_score"],
                ))
                risk_score += 25  # Significant risk increase
                is_suspicious = True
        
        if connected_rings:
            alert_message = (
                f"⚠️ WARNING: Application connects to {len(connected_rings)} "
                f"known fraud ring(s). Manual review required."
            )
            risk_score = min(risk_score, 100)
    except (ImportError, Exception):
        pass
    
    # Check device sharing
    dev_node_id = f"DEV_{request.device_fingerprint[:12]}"
    if graph.graph.has_node(dev_node_id):
        device_users = len(list(graph.graph.neighbors(dev_node_id)))
        if device_users > 3:
            risk_score += 15
            is_suspicious = True
            alert_message = (
                f"⚠️ Device shared with {device_users} other entities. "
                + alert_message
            )
    
    # Update risk score on the node
    graph.graph.nodes[new_id]["risk_score"] = min(risk_score, 100)
    
    return NewApplicationResponse(
        application_id=new_id,
        risk_score=min(risk_score, 100),
        connected_rings=connected_rings,
        is_suspicious=is_suspicious,
        alert_message=alert_message,
    )


@app.get("/api/alerts", response_model=list[Alert])
async def get_alerts():
    """Get recent suspicious activity alerts."""
    graph = get_sentinel_graph()
    alerts = []
    
    # Generate alerts from high-risk nodes
    high_risk_nodes = graph.get_all_nodes(min_risk=60)
    high_risk_nodes.sort(key=lambda n: n["risk_score"], reverse=True)
    
    for i, node in enumerate(high_risk_nodes[:50]):
        risk = node["risk_score"]
        node_type = node["type"]
        
        if risk >= 90:
            severity = "critical"
            msg = f"CRITICAL: {node['label']} ({node_type}) — risk score {risk:.0f}/100"
        elif risk >= 80:
            severity = "high"
            msg = f"HIGH RISK: {node['label']} ({node_type}) — risk score {risk:.0f}/100"
        elif risk >= 70:
            severity = "medium"
            msg = f"ELEVATED: {node['label']} ({node_type}) — risk score {risk:.0f}/100"
        else:
            severity = "low"
            msg = f"MONITOR: {node['label']} ({node_type}) — risk score {risk:.0f}/100"
        
        # Determine alert type based on node type
        if node_type == "device":
            alert_type = "shared_device"
        elif node_type == "dealer":
            alert_type = "suspicious_dealer"
        elif node_type == "guarantor":
            alert_type = "guarantor_overuse"
        elif node_type == "customer":
            alert_type = "high_risk_customer"
        else:
            alert_type = "general_risk"
        
        alerts.append(Alert(
            id=f"ALERT_{str(i+1).zfill(4)}",
            type=alert_type,
            severity=severity,
            message=msg,
            timestamp=datetime.now(),
            related_entities=[
                RelatedEntity(id=node["id"], type=node["type"])
            ],
        ))
    
    return alerts


# ── Helper Functions ──

def _find_shared_entities(nodes: list, edges: list, graph) -> dict:
    """Find entities shared across multiple customers in a ring."""
    shared = {
        "shared_devices": [],
        "shared_guarantors": [],
        "shared_mobiles": [],
        "shared_locations": [],
        "shared_bank_accounts": [],
        "shared_dealers": [],
    }
    
    # Count how many customers connect to each non-customer node
    from collections import defaultdict
    entity_customer_count = defaultdict(int)
    
    node_ids = {n["id"] for n in nodes}
    
    for node in nodes:
        if node["type"] == "customer":
            for edge in edges:
                target = edge["to"] if edge["from"] == node["id"] else edge["from"]
                if target in node_ids:
                    target_node = next((n for n in nodes if n["id"] == target), None)
                    if target_node and target_node["type"] != "customer":
                        entity_customer_count[target] += 1
    
    # Entities shared by 2+ customers are suspicious
    for entity_id, count in entity_customer_count.items():
        if count >= 2:
            entity_node = next((n for n in nodes if n["id"] == entity_id), None)
            if entity_node:
                entity_type = entity_node["type"]
                if entity_type == "device":
                    shared["shared_devices"].append(entity_id)
                elif entity_type == "guarantor":
                    shared["shared_guarantors"].append(entity_id)
                elif entity_type == "mobile":
                    shared["shared_mobiles"].append(entity_id)
                elif entity_type == "location":
                    shared["shared_locations"].append(entity_id)
                elif entity_type == "bank_account":
                    shared["shared_bank_accounts"].append(entity_id)
                elif entity_type == "dealer":
                    shared["shared_dealers"].append(entity_id)
    
    return shared
