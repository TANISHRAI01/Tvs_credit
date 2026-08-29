# TVS Sentinel 🛡️

> **AI-Powered Digital Twin for Predictive Fraud Ecosystems**  
> TVS Credit E.P.I.C. IT Case Study — Problem Statement E (Swarm Intelligence Lending Network)

---

## 📌 Project Overview

**TVS Sentinel** shifts loan fraud detection from isolated, customer-by-customer scoring to **ecosystem-level collective intelligence**.

By modeling loan applications, devices, dealers, bank accounts, mobile numbers, locations, guarantors, and payment behaviours as an interconnected **living graph (Digital Twin)**, TVS Sentinel:
- Discovers hidden multi-entity fraud rings using **Louvain Community Detection**
- Calculates 0–100 calibrated entity risk scores using **Graph Anomaly Detection (Isolation Forest)**
- Predicts emerging fraud ecosystems *before* large-scale disbursement occurs using temporal velocity analysis
- Supports continuous learning via live application ingestion (`POST /api/applications`)

---

## 🚀 Quickstart Guide

### 🟦 1. Start the Backend API (Member 1)
```bash
cd backend

# 1. Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 2. Install dependencies (Python 3.11+ / 3.13 supported)
pip install -r requirements.txt

# 3. Generate synthetic lending dataset (5,000+ apps, 5 planted fraud rings)
python data/generate_synthetic_data.py

# 4. Start the FastAPI backend server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: **`http://localhost:8000`**  
Interactive API Docs (Swagger): **`http://localhost:8000/docs`**

---

### 🟩 2. Start the Frontend Dashboard (Member 2)
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start the Vite dev server
npm run dev
```
Frontend UI will be live at: **`http://localhost:5173`**  
*(API requests to `/api/*` are automatically proxied to `http://localhost:8000`)*

---

## 📡 Live API Endpoints

The backend is fully operational with the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status & graph node/edge counts |
| `GET` | `/api/graph/stats` | High-level metrics for the Command Center dashboard |
| `GET` | `/api/graph?limit=N` | Full graph data (nodes + edges) for interactive visualization |
| `GET` | `/api/fraud-rings` | List of all detected fraud rings with exposure amounts (₹ Lakhs) |
| `GET` | `/api/fraud-rings/{id}` | Subgraph and shared entity details for a specific fraud ring |
| `GET` | `/api/node/{id}` | Deep dive on an entity, metadata, and connected neighbors |
| `GET` | `/api/emerging-ecosystems` | Forming fraud networks with historical risk trajectories |
| `GET` | `/api/alerts` | Prioritized risk alerts (Critical / High / Medium) |
| `POST` | `/api/applications` | Dynamic application ingestion + real-time fraud assessment |

---

## 🏗️ Project Architecture

```
tvs_credit/
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app & API route handlers
│   │   ├── models.py                 # Pydantic schemas for API contract
│   │   ├── graph_engine.py           # NetworkX Digital Twin graph builder
│   │   ├── fraud_ring_detector.py    # Louvain community detection engine
│   │   ├── anomaly_scorer.py         # Isolation Forest graph anomaly scorer
│   │   └── emerging_ecosystem.py     # Temporal pattern & stage tracker
│   ├── data/
│   │   └── generate_synthetic_data.py # Realistic synthetic data generator
│   └── tests/
│       └── test_fraud_detection.py   # Automated pytest test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/layout/Sidebar.jsx # Main navigation sidebar
│   │   ├── pages/CommandCenter.jsx       # Command center dashboard
│   │   ├── pages/NetworkExplorer.jsx     # Interactive graph explorer
│   │   ├── pages/FraudRings.jsx          # Fraud rings list & cards
│   │   ├── pages/FraudRingDetail.jsx     # Single ring subgraph view
│   │   ├── pages/EmergingThreats.jsx     # Forming ecosystem tracker
│   │   ├── pages/WhatIfSimulator.jsx     # Decision simulation
│   │   └── utils/api.js                  # Axios client configured with proxies
│   └── package.json
│
├── TEAM_PLAN.md      # Full 6-day task division & API contracts
└── PROJECT_STATUS.md # Live status matrix & pending feature tracker
```

---

## 🧪 Running Automated Tests

```bash
cd backend
.\venv\Scripts\activate
pytest tests/
```

---

## 📚 Team Documentation
- [TEAM_PLAN.md](./TEAM_PLAN.md) — Complete 2-member work division across all 6 phases
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Up-to-date checklist of completed work and pending deliverables
