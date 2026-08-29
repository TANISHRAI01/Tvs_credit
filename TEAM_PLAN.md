# TVS Sentinel — Complete Team Division Plan

## AI-Powered Digital Twin for Predictive Fraud Ecosystems

> *"Fraud doesn't happen in isolation. We detect the ecosystem behind it."*
>
> **Team Size:** 2 members | **Timeline:** 6 days | **Repo:** Shared GitHub repo

---

## 1. Project Overview

We're building **TVS Sentinel** for TVS Credit E.P.I.C. IT Case Study — **Problem Statement E (Swarm Intelligence Lending Network)**.

The platform:
- Builds a **living graph** connecting loan applications, devices, dealers, bank accounts, mobile numbers, locations, guarantors, and payment behaviours
- Uses **AI to detect fraud rings** (clusters of connected suspicious entities)
- **Predicts emerging fraud ecosystems** before fraud actually occurs
- Provides an interactive **dashboard and network visualization** for investigators

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11+ · FastAPI · NetworkX · node2vec · scikit-learn · pandas |
| **Frontend** | React 18 · Vite · Tailwind CSS · vis-network · Recharts · Framer Motion · React Router |
| **Stretch** | react-leaflet (maps) · Google Gemini API (AI copilot) |

---

## 3. Team Roles

| | Member 1: Intelligence Engine 🟦 | Member 2: Product & Experience 🟩 |
|---|---|---|
| **Focus** | Backend · ML · Data · API | Frontend · UI · Visualization · UX |
| **Language** | Python | JavaScript (React) |
| **Directory** | `backend/` | `frontend/` |
| **Merge Conflicts** | None — separate directories | None — separate directories |

---

## 4. Git Workflow

```
main (protected — only working, demo-ready code)
  └── dev (integration branch — merge here daily)
        ├── feat/backend-*    ← Member 1's branches
        └── feat/frontend-*   ← Member 2's branches
```

**Rules:**
1. Member 1 **only** touches `backend/` — Member 2 **only** touches `frontend/`
2. Create feature branches from `dev`, merge back into `dev` via PR
3. Sync at the end of each phase — test together, then merge `dev` → `main`
4. Only shared file is `README.md` — coordinate edits on that one file

---

## 5. File Ownership Map

```
tvs_credit/
│
├── backend/                              ← 🟦 MEMBER 1 ONLY
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py                       # FastAPI app + all routes
│   │   ├── models.py                     # Pydantic schemas
│   │   │
│   │   ├── # ── Priority 1: Core ──
│   │   ├── graph_engine.py               # Graph construction
│   │   ├── fraud_ring_detector.py        # Louvain community detection
│   │   ├── emerging_ecosystem.py         # Temporal fraud prediction
│   │   ├── continuous_learning.py        # Live graph updates
│   │   ├── anomaly_scorer.py             # Node2Vec + Isolation Forest
│   │   │
│   │   ├── # ── Priority 2: Innovations ──
│   │   ├── fraud_dna.py                  # 6-dimensional risk scoring
│   │   ├── risk_propagation.py           # BFS risk decay through network
│   │   ├── explainable_ai.py             # Evidence generation
│   │   ├── what_if_simulator.py          # Decision simulation
│   │   ├── dealer_intelligence.py        # Dealer hub analysis
│   │   ├── device_intelligence.py        # Device sharing patterns
│   │   └── behavioural_intelligence.py   # Temporal patterns
│   │
│   ├── data/
│   │   ├── generate_synthetic_data.py    # Synthetic data generator
│   │   └── generated/                    # Output JSON files
│   │
│   └── tests/
│       └── test_fraud_detection.py
│
├── frontend/                             ← 🟩 MEMBER 2 ONLY
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   │
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                       # Router + layout
│   │   ├── index.css                     # Tailwind + global styles
│   │   │
│   │   ├── pages/
│   │   │   ├── CommandCenter.jsx         # P1 — Main dashboard
│   │   │   ├── NetworkExplorer.jsx       # P1 — Interactive graph
│   │   │   ├── FraudRings.jsx            # P1 — Detected rings list
│   │   │   ├── FraudRingDetail.jsx       # P1 — Single ring detail
│   │   │   ├── ApplicationRisk.jsx       # P2 — Fraud DNA view
│   │   │   └── WhatIfSimulator.jsx       # P2 — Simulator UI
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── graph/
│   │   │   │   └── NetworkGraph.jsx      # vis-network wrapper
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── AlertFeed.jsx
│   │   │   │   └── RiskDistribution.jsx
│   │   │   ├── fraud/
│   │   │   │   ├── FraudRingCard.jsx
│   │   │   │   ├── FraudDNA.jsx          # P2 — Radar chart
│   │   │   │   ├── EvidenceBreakdown.jsx # P2 — Explainable AI
│   │   │   │   └── NetworkTimeline.jsx   # P2 — Evolution timeline
│   │   │   └── common/
│   │   │       ├── RiskBadge.jsx
│   │   │       ├── RiskGauge.jsx         # P2 — Circular gauge
│   │   │       └── LoadingSpinner.jsx
│   │   │
│   │   └── utils/
│   │       ├── api.js                    # Axios wrapper
│   │       └── constants.js              # Colors, config
│   │
│   └── public/
│       └── favicon.svg
│
└── README.md                             ← 🟦🟩 SHARED (coordinate edits)
```

---

## 6. Shared API Contract

**Base URL:** `http://localhost:8000/api`

### Priority 1 Endpoints

```
GET  /graph
  Response: {
    nodes: [{ id, label, type, risk_score, metadata }],
    edges: [{ from, to, relationship, weight }]
  }
  Node types: "customer", "device", "dealer", "bank_account",
              "mobile", "location", "guarantor", "loan_application"

GET  /graph/stats
  Response: {
    total_applications: number,
    total_customers: number,
    total_networks: number,
    suspicious_networks: number,
    critical_networks: number,
    high_risk_count: number,
    avg_risk_score: number
  }

GET  /fraud-rings
  Response: [{
    id: string,
    risk_score: number (0-100),
    node_count: number,
    entity_types: { customers: n, devices: n, ... },
    potential_exposure: number (in lakhs),
    nodes: [{ id, label, type, risk_score }],
    edges: [{ from, to, relationship }]
  }]

GET  /fraud-rings/{id}
  Response: {
    id, risk_score, node_count, potential_exposure,
    nodes: [...], edges: [...],
    shared_entities: { shared_devices: [...], shared_guarantors: [...], ... },
    timeline: [{ day, event, description }]
  }

GET  /node/{id}
  Response: {
    id, label, type, risk_score,
    connections: [{ id, label, type, relationship }],
    metadata: { ... type-specific fields ... }
  }

GET  /emerging-ecosystems
  Response: [{
    id: string,
    current_stage: string ("forming" | "growing" | "established"),
    risk_trajectory: number[] (risk over time),
    days_forming: number,
    nodes: [...],
    predicted_risk: number
  }]

POST /applications
  Body: {
    applicant_name, phone, device_fingerprint,
    dealer_id, location, guarantor_id,
    bank_account, loan_amount
  }
  Response: {
    application_id, risk_score,
    connected_rings: [{ ring_id, risk_score }],
    is_suspicious: boolean,
    alert_message: string
  }

GET  /alerts
  Response: [{
    id, type, severity ("low"|"medium"|"high"|"critical"),
    message, timestamp,
    related_entities: [{ id, type }]
  }]
```

---

## 7. Setup Instructions

### Member 1 — Backend Setup

```bash
# Clone the repo
git clone <repo-url>
cd tvs_credit/backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Generate synthetic data
python data/generate_synthetic_data.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

### Member 2 — Frontend Setup

```bash
# Clone the repo
git clone <repo-url>
cd tvs_credit/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Opens on http://localhost:5173
```
