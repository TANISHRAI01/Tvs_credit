"""
TVS Sentinel — Pydantic Models
All request/response schemas matching the shared API contract.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# ── Enums ──

class NodeType(str, Enum):
    CUSTOMER = "customer"
    DEVICE = "device"
    DEALER = "dealer"
    BANK_ACCOUNT = "bank_account"
    MOBILE = "mobile"
    LOCATION = "location"
    GUARANTOR = "guarantor"
    LOAN_APPLICATION = "loan_application"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EcosystemStage(str, Enum):
    FORMING = "forming"
    GROWING = "growing"
    ESTABLISHED = "established"


# ── Graph Models ──

class GraphNode(BaseModel):
    id: str
    label: str
    type: NodeType
    risk_score: float = Field(ge=0, le=100)
    color: Optional[str] = None
    size: Optional[int] = None
    shape: Optional[str] = None
    title: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class GraphEdge(BaseModel):
    source: str = Field(alias="from")
    target: str = Field(alias="to")
    relationship: str
    weight: float = 1.0

    model_config = {"populate_by_name": True}


class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


# ── Stats ──

class GraphStats(BaseModel):
    total_applications: int
    total_customers: int
    total_networks: int
    suspicious_networks: int
    critical_networks: int
    high_risk_count: int
    avg_risk_score: float


# ── Fraud Rings ──

class EntityTypeCounts(BaseModel):
    customers: int = 0
    devices: int = 0
    dealers: int = 0
    bank_accounts: int = 0
    mobiles: int = 0
    locations: int = 0
    guarantors: int = 0
    loan_applications: int = 0


class FraudRingSummary(BaseModel):
    id: str
    risk_score: float = Field(ge=0, le=100)
    node_count: int
    entity_types: EntityTypeCounts
    potential_exposure: float  # in lakhs
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class TimelineEvent(BaseModel):
    day: int
    event: str
    description: str


class SharedEntities(BaseModel):
    shared_devices: list[str] = Field(default_factory=list)
    shared_guarantors: list[str] = Field(default_factory=list)
    shared_mobiles: list[str] = Field(default_factory=list)
    shared_locations: list[str] = Field(default_factory=list)
    shared_bank_accounts: list[str] = Field(default_factory=list)
    shared_dealers: list[str] = Field(default_factory=list)


class FraudRingDetail(BaseModel):
    id: str
    risk_score: float = Field(ge=0, le=100)
    node_count: int
    potential_exposure: float
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    shared_entities: SharedEntities
    timeline: list[TimelineEvent]


# ── Node Detail ──

class ConnectionInfo(BaseModel):
    id: str
    label: str
    type: NodeType
    relationship: str


class NodeDetail(BaseModel):
    id: str
    label: str
    type: NodeType
    risk_score: float = Field(ge=0, le=100)
    connections: list[ConnectionInfo]
    metadata: dict = Field(default_factory=dict)


# ── Emerging Ecosystems ──

class EmergingEcosystem(BaseModel):
    id: str
    current_stage: EcosystemStage
    risk_trajectory: list[float]
    days_forming: int
    nodes: list[GraphNode]
    predicted_risk: float


# ── Applications ──

class NewApplicationRequest(BaseModel):
    applicant_name: str
    phone: str
    device_fingerprint: str
    dealer_id: str
    location: str
    guarantor_id: str
    bank_account: str
    loan_amount: float


class ConnectedRingInfo(BaseModel):
    ring_id: str
    risk_score: float


class NewApplicationResponse(BaseModel):
    application_id: str
    risk_score: float
    connected_rings: list[ConnectedRingInfo]
    is_suspicious: bool
    alert_message: str


# ── Alerts ──

class RelatedEntity(BaseModel):
    id: str
    type: NodeType


class Alert(BaseModel):
    id: str
    type: str
    severity: Severity
    message: str
    timestamp: datetime
    related_entities: list[RelatedEntity]


# ── Priority 2 Models (for later) ──

class FraudDNA(BaseModel):
    identity_risk: float = Field(ge=0, le=100)
    device_risk: float = Field(ge=0, le=100)
    dealer_risk: float = Field(ge=0, le=100)
    location_risk: float = Field(ge=0, le=100)
    behaviour_risk: float = Field(ge=0, le=100)
    network_risk: float = Field(ge=0, le=100)
    overall_risk: float = Field(ge=0, le=100)


class EvidenceFactor(BaseModel):
    description: str
    contribution: float


class EvidenceResponse(BaseModel):
    overall_risk: float
    factors: list[EvidenceFactor]


class RiskPropagationNode(BaseModel):
    id: str
    label: str
    type: NodeType
    propagated_risk: float
    hops: int


class RiskPropagationResponse(BaseModel):
    source: GraphNode
    propagated: list[RiskPropagationNode]


class SimulateRequest(BaseModel):
    applicant_name: str
    phone: str
    device_fingerprint: str
    dealer_id: str
    location: str
    guarantor_id: str
    bank_account: str
    loan_amount: float
    action: str = "approve"  # "approve" | "hold" | "reject"


class RiskSnapshot(BaseModel):
    network_risk: float
    connections: int
    exposure: float


class SimulateResponse(BaseModel):
    before: RiskSnapshot
    after: RiskSnapshot
    delta: RiskSnapshot
    warning: Optional[str] = None
