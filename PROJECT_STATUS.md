# TVS Sentinel — Project Progress & Context Tracker

> **AI-Powered Digital Twin for Predictive Fraud Ecosystems**  
> TVS Credit E.P.I.C. IT Case Study — Problem Statement E (Swarm Intelligence Lending Network)  
> **Last Updated:** August 29, 2026

---

## 📊 High-Level Summary

| Track | Phase 1 (Foundation) | Phase 2 (Core Intelligence) | Phase 3 (Visualization) | Phase 4 (P1 Polish) | Phase 5 (P2 Innovations) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Member 1 (Backend 🟦)** | ✅ **100% DONE** | ✅ **100% DONE** | ⏳ NEXT | ⏳ Pending | ⏳ Pending |
| **Member 2 (Frontend 🟩)** | ✅ **100% DONE** | 🔨 In Progress | ⏳ Pending | ⏳ Pending | ⏳ Pending |

---

## ✅ WHAT IS COMPLETED (DONE)

### 🟦 Backend (Member 1) — Phase 1 & Phase 2 Complete
- [x] **Project Scaffolding & Dependencies** (`requirements.txt`) — Python 3.13-ready setup with FastAPI, NetworkX, python-louvain, scikit-learn, and pandas.
- [x] **Pydantic API Schemas** (`app/models.py`) — Full request/response contracts for nodes, edges, rings, emerging ecosystems, alerts, and continuous learning.
- [x] **Synthetic Dataset Generator** (`data/generate_synthetic_data.py`) — Generates 5,049 loan applications across 3,000 customers, 40 dealers, 2,158 devices, and 799 guarantors with 5 planted fraud rings:
  1. *Device Sharing Ring* (8 customers, 2 shared devices)
  2. *Guarantor Ring* (1 guarantor backing 7 unrelated applicants across 7 cities)
  3. *Location Cluster* (10 applications from same GPS radius with different addresses)
  4. *Dealer Collusion* (12 applications with shared devices and high default rates)
  5. *Temporal Burst* (12 applications over 12 days forming an emerging ecosystem)
- [x] **Digital Twin Graph Engine** (`app/graph_engine.py`) — Constructs a heterogeneous NetworkX graph with **18,095 nodes** and **35,158 edges** representing all 8 entity types (Customers, Devices, Dealers, Bank Accounts, Mobiles, Locations, Guarantors, Applications).
- [x] **Louvain Fraud Ring Detector** (`app/fraud_ring_detector.py`) — Community detection algorithm discovering tightly connected clusters, computing multi-entity concentration ratios, and tracking potential loss exposure in Lakhs.
- [x] **Graph Anomaly Scorer** (`app/anomaly_scorer.py`) — Topological feature extraction + Isolation Forest anomaly detection assigning calibrated 0–100 risk scores across all 18,095 entities.
- [x] **Emerging Ecosystem Detector** (`app/emerging_ecosystem.py`) — Temporal velocity analysis identifying networks in `forming`, `growing`, or `established` stages with risk trajectories over time.
- [x] **Continuous Learning Module** (`POST /api/applications`) — Dynamic injection of new loan applications into the live graph with real-time risk assessment and fraud ring connection alerts.
- [x] **Automated Test Suite** (`tests/test_fraud_detection.py`) — Pytest suite covering graph integrity, community detection, anomaly scoring, and dynamic updates (**5/5 tests passing in 10s**).

### 🟩 Frontend (Member 2) — Phase 1 Complete
- [x] **Vite 6 + React 19 Project Setup** (`frontend/`) with Tailwind CSS v4 and Lucide icons.
- [x] **Navigation & Layout** (`src/components/layout/Sidebar.jsx`) with TVS Sentinel branding and active page indicators.
- [x] **Page Shells** for all views:
  - `CommandCenter.jsx` (Dashboard)
  - `NetworkExplorer.jsx` (Interactive Graph)
  - `FraudRings.jsx` & `FraudRingDetail.jsx` (Ring Analysis)
  - `EmergingThreats.jsx` (Temporal Predictions)
  - `ApplicationRisk.jsx` & `WhatIfSimulator.jsx` (P2 Innovations)
- [x] **API Client & Constants** (`src/utils/api.js`, `src/utils/constants.js`) configured for proxying to `http://localhost:8000/api`.
- [x] **Build Verification** — Clean production build with 0 bundle errors (`npm run build` in 4.23s).

---

## 🌐 Active & Verified API Endpoints

All endpoints are live and returning real data from the Digital Twin:

| Method | Endpoint | Description | Status |
|---|---|---|:---:|
| `GET` | `/health` | Server health & total node/edge counts | ✅ Live |
| `GET` | `/api/graph/stats` | High-level KPIs (total apps, suspicious networks, avg risk) | ✅ Live |
| `GET` | `/api/graph?limit=N` | Node & edge graph payload for vis-network | ✅ Live |
| `GET` | `/api/fraud-rings` | List of all detected fraud rings with exposure metrics | ✅ Live |
| `GET` | `/api/fraud-rings/{id}` | Detailed subgraph & entity breakdown for a single ring | ✅ Live |
| `GET` | `/api/node/{id}` | Entity detail with connection list & metadata | ✅ Live |
| `GET` | `/api/emerging-ecosystems`| Networks actively forming with trajectory data | ✅ Live |
| `GET` | `/api/alerts` | Live alert feed sorted by severity (Critical / High / Medium) | ✅ Live |
| `POST`| `/api/applications` | Submit new loan app → dynamic graph update & instant score | ✅ Live |

---

## ⏳ WHAT IS LEFT TO DO

### 1. Phase 2 (Frontend — Member 2 In Progress)
- [ ] Connect `CommandCenter.jsx` to `GET /api/graph/stats` and `GET /api/alerts`.
- [ ] Build KPI `StatCard` components with animated counters.
- [ ] Build `RiskDistribution` chart using Recharts.
- [ ] Build `AlertFeed` component showing real-time fraud alerts.

### 2. Phase 3 (Visualization & Interaction — Days 3–4)
- [ ] **Interactive Network Graph** (`NetworkExplorer.jsx`): Render force-directed graph using `vis-network` with color-coded node types and risk-scaled sizes.
- [ ] **Node Detail Side Panel**: Click on any graph node to inspect metadata and connections.
- [ ] **Fraud Rings Directory** (`FraudRings.jsx`): Cards displaying detected rings with exposure in Lakhs and click-to-isolate subgraph.
- [ ] **Fraud Ring Detail View** (`FraudRingDetail.jsx`): Isolated visual subgraph + shared entity breakdown + formation timeline.
- [ ] **Graph Filtering**: Filter by node type (Customer, Device, Dealer, Location) and minimum risk threshold.

### 3. Phase 4 (Priority 1 Polish & Integration — Day 4)
- [ ] Full end-to-end integration testing between frontend and backend.
- [ ] Framer Motion page transitions and glassmorphism styling polish.
- [ ] Merge `dev` → `main` for clean Priority 1 completion milestone.

### 4. Phase 5 (Priority 2 Innovations — Days 5–6)
*Differentiating competition features:*
- [ ] **Fraud DNA Engine** (`app/fraud_dna.py` & `FraudDNA.jsx`): 6-dimensional risk radar chart (Identity, Device, Dealer, Location, Behaviour, Network).
- [ ] **Explainable AI Breakdown** (`app/explainable_ai.py` & `EvidenceBreakdown.jsx`): Human-readable evidence list (e.g. `+25 Device shared with 7 apps`).
- [ ] **Risk Propagation Engine** (`app/risk_propagation.py`): BFS decaying risk heatmap across connected entities.
- [ ] **What-If Fraud Simulator** (`app/what_if_simulator.py` & `WhatIfSimulator.jsx`): Interactive simulation of approving/holding loan applications with before/after network risk delta.
- [ ] **Dealer & Device Intelligence Modules**: Specialized views for dealers acting as fraud hubs.

### 5. Phase 6 (Final Polish & Presentation — Day 6)
- [ ] Screenshots and architecture diagrams for Round 2 PPT.
- [ ] Demo rehearsal and video walkthrough.

---

## 🛠️ How to Run & Verify the Project

### Start Backend
```bash
cd backend
# Windows:
.\venv\Scripts\activate
# Start FastAPI:
python -m uvicorn app.main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Opens at http://localhost:5173
```
