"""
TVS Sentinel — Fraud Detection Unit & Integration Tests
Tests graph construction, community detection, risk scoring, and API contract logic.
"""

import pytest
from app.graph_engine import SentinelGraph
from app.fraud_ring_detector import detect_fraud_rings, get_detected_rings
from app.anomaly_scorer import compute_risk_scores
from app.emerging_ecosystem import detect_emerging_ecosystems, get_emerging_ecosystems


@pytest.fixture(scope="module")
def initialized_graph():
    """Initialize Sentinel graph and run core intelligence engines."""
    sg = SentinelGraph()
    sg.load_data()
    sg.build_graph()
    return sg


def test_graph_node_and_edge_counts(initialized_graph):
    """Verify heterogeneous graph entity counts."""
    assert initialized_graph.graph.number_of_nodes() > 10000
    assert initialized_graph.graph.number_of_edges() > 20000


def test_fraud_ring_detection(initialized_graph):
    """Verify that Louvain community detection finds suspicious clusters."""
    rings = detect_fraud_rings(initialized_graph, risk_threshold=35.0)
    assert len(rings) >= 3, f"Expected at least 3 fraud rings, detected {len(rings)}"
    
    # Check top ring properties
    top_ring = rings[0]
    assert "ring_id" in top_ring
    assert 0 <= top_ring["risk_score"] <= 100
    assert top_ring["node_count"] >= 5
    assert top_ring["potential_exposure"] > 0


def test_anomaly_scoring(initialized_graph):
    """Verify that Isolation Forest anomaly scoring assigns calibrated 0-100 scores."""
    scores = compute_risk_scores(initialized_graph)
    assert len(scores) == initialized_graph.graph.number_of_nodes()
    
    # Verify score bounds
    for node_id, score in list(scores.items())[:100]:
        assert 0.0 <= score <= 100.0


def test_emerging_ecosystem_detection(initialized_graph):
    """Verify that forming networks are tracked with temporal trajectories."""
    ecosystems = detect_emerging_ecosystems(initialized_graph)
    assert len(ecosystems) >= 1
    
    first_eco = ecosystems[0]
    assert first_eco["stage"] in ("forming", "growing", "established")
    assert len(first_eco["risk_trajectory"]) > 0
    assert 0 <= first_eco["predicted_risk"] <= 100


def test_continuous_learning_application_injection(initialized_graph):
    """Verify that submitting a new application dynamically updates the graph."""
    initial_nodes = initialized_graph.graph.number_of_nodes()
    
    # Inject application with a known high-risk device fingerprint
    app_id = initialized_graph.add_application({
        "applicant_name": "Test Fraudster",
        "phone": "9876543210",
        "device_fingerprint": "FRAUD_DEV_ALPHA_01",
        "dealer_id": "DLR_00005",
        "location": "Hosur",
        "guarantor_id": "GUAR_RING_002",
        "bank_account": "SBI-XXXX9999",
        "loan_amount": 150000,
    })
    
    assert app_id.startswith("APP_")
    assert initialized_graph.graph.number_of_nodes() > initial_nodes
    assert initialized_graph.graph.has_node(app_id)
