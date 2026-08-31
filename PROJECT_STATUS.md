# TVS Sentinel — Project Progress & Context Tracker

> **AI-Powered Digital Twin for Predictive Fraud Ecosystems**  
> TVS Credit E.P.I.C. IT Case Study — Problem Statement E (Swarm Intelligence Lending Network)  
> **Last Updated:** September 1, 2026 · 01:39 IST  
> **Release Status:** `main` branch deployed with **Priority 1 + Priority 2 Complete (Phases 1–5)**

---

## 📊 High-Level Summary

| Track | Phase 1 (Foundation) | Phase 2 (Core Intelligence) | Phase 3 (Visualization API) | Phase 4 (P1 Polish & Merge) | Phase 5 (P2 Innovations) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Member 1 (Backend 🟦)** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** |
| **Member 2 (Frontend 🟩)** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** | ✅ **100% DONE** |

---

## ✅ WHAT IS COMPLETED (DONE)

### 🟦 Backend (Member 1) — Phases 1, 2 & 3 Complete
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
- [x] **Phase 3 Graph API Visual Optimization** (`GET /api/graph`) — Added vis-network visual styling (node colors by entity type, risk-scaled sizes 16px–30px, shapes, rich HTML tooltips) and advanced multi-parameter filtering (`node_types`, `min_risk`, `max_risk`, `search`, `ring_id`, `include_neighbors`).
- [x] **Automated Test Suite** (`tests/test_fraud_detection.py`) — Pytest suite covering graph integrity, community detection, anomaly scoring, filtered queries, visual styling, and dynamic updates (**7/7 tests passing in 3.2s**).
- [x] **Live API Verification** — Tested all multi-node filtering, risk threshold filtering, Hosur search queries, and isolated ring subgraph queries (all returning 200 OK).

### 🟩 Frontend (Member 2) — Phases 1, 2 & 3 Complete
- [x] **Vite 6 + React 19 Project Setup** (`frontend/`) with Tailwind CSS v4 and Lucide icons.
- [x] **Navigation & Layout** (`src/components/layout/Sidebar.jsx`) with TVS Sentinel branding, gradient logo, cyan/purple active states, Core & Intelligence nav sections, and live API status dot.
- [x] **Page Shells** for all 7 views with Framer Motion fade transitions:
  - `CommandCenter.jsx` (Dashboard)
  - `NetworkExplorer.jsx` (Interactive Graph)
  - `FraudRings.jsx` & `FraudRingDetail.jsx` (Ring Analysis)
  - `EmergingThreats.jsx` (Temporal Predictions)
  - `ApplicationRisk.jsx` & `WhatIfSimulator.jsx` (P2 Innovations)
- [x] **API Client & Constants** (`src/utils/api.js`, `src/utils/constants.js`) — Axios wrapper with all P1 + P2 endpoints, error interceptor, 15s timeout, node color palette, risk level helpers, and Fraud DNA dimension definitions.
- [x] **Global Design System** (`src/index.css`) — Deep navy dark theme, glassmorphism `.glass-card` utility, Inter + JetBrains Mono fonts, risk color utilities, shimmer skeleton keyframes, glow effects, gradient text.
- [x] **StatCard** (`src/components/dashboard/StatCard.jsx`) — RAF-based animated number counter (ease-out cubic), accent icon badge with glow, trend indicator, skeleton loading state, hover lift.
- [x] **AlertFeed** (`src/components/dashboard/AlertFeed.jsx`) — Scrollable live alerts with 4 severity tiers, pulsing critical dot, type icons, staggered fade-in animation, and empty/error states.
- [x] **RiskDistribution** (`src/components/dashboard/RiskDistribution.jsx`) — Recharts BarChart with 10 color-coded risk bins (emerald → dark red gradient), custom tooltip, CartesianGrid.
- [x] **RiskBadge** (`src/components/common/RiskBadge.jsx`) — Color-coded severity badge (Low / Medium / High / Critical), glowing dot, pulsing animation for critical, 3 size variants.
- [x] **LoadingSpinner** (`src/components/common/LoadingSpinner.jsx`) — Three variants (`spin`, `pulse`, `dots`), optional fullPage overlay with backdrop blur.
- [x] **Command Center Dashboard** (`src/pages/CommandCenter.jsx`) — 6 live StatCards, average risk progress bar, RiskDistribution chart, AlertFeed, Emerging Threats strip — all wired to real API with error banner and refresh button.
- [x] **NetworkGraph Component** (`src/components/graph/NetworkGraph.jsx`) — `vis-network/standalone` force-directed graph; nodes colored by entity type (customer=blue, device=orange, dealer=green, etc.), shape-coded (dot/square/triangle/diamond/star), size proportional to risk score (8–36px), amber/red risk border at score ≥50/≥80, `forceAtlas2Based` physics with 200-iteration stabilization (handles 1000+ nodes), click-to-select, zoom/pan, double-click-to-fit, rich HTML tooltips.
- [x] **NetworkExplorer Page** (`src/pages/NetworkExplorer.jsx`) — Full-page graph canvas + right sidebar (node name/type/risk gauge/attributes/connections list, each connection clickable to hop), top filter bar (entity type toggle pills for all 8 types, risk minimum slider), auto-hides labels >300 nodes, fetches `GET /node/:id` on click for live attributes.
- [x] **FraudRingCard Component** (`src/components/fraud/FraudRingCard.jsx`) — SVG circular gauge with drop-shadow glow matching risk level, ring ID + name + risk badge, 3 stat pills (Nodes/Edges/Exposure in Lakhs), entity breakdown as colored type pills, critical pulsing badge, Framer Motion stagger entrance, click-to-navigate.
- [x] **FraudRings Page** (`src/pages/FraudRings.jsx`) — Grid/list toggle, 5 sort modes (risk↑↓, size↑↓, exposure↓), live search, min-node slider, summary stat bar (total/critical/high/exposure), shimmer skeleton loading, error banner.
- [x] **FraudRingDetail Page** (`src/pages/FraudRingDetail.jsx`) — Isolated subgraph via `NetworkGraph` reuse (physics auto-disabled >500 nodes, labels hidden >150 nodes), left panel with SVG gauge + 4 mini-stats + entity breakdown pills, shared entities scrollable table with type color + shared count + risk score, entity legend overlay on graph canvas.
- [x] **Build Verification** — Clean production build: 0 errors, 2871 modules transformed (`npm run build` in 842ms). All 5 new modules code-split and lazy-loaded.

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
| `GET` | `/api/node/{id}/fraud-dna` | 6-dimensional Fraud DNA risk vector for any entity | ✅ Live |
| `GET` | `/api/node/{id}/evidence` | Explainable AI evidence breakdown with point contributions | ✅ Live |
| `GET` | `/api/risk-propagation/{id}` | BFS multi-hop risk contagion heatmap (3 hops, 0.55× decay) | ✅ Live |
| `GET` | `/api/dealers/intelligence` | Dealer hub centrality & syndicate classification | ✅ Live |
| `GET` | `/api/devices/intelligence` | Device sharing clusters & virtual device detection | ✅ Live |
| `POST`| `/api/simulate` | What-If fraud intervention scenario simulation | ✅ Live |

---

## ⏳ WHAT IS LEFT TO DO

### 1. Phase 4 (Priority 1 Polish & Integration — COMPLETE ✅)
- [x] Full end-to-end integration testing between frontend and backend.
- [x] Verify `NetworkExplorer` renders live with 18,095-node graph from backend.
- [x] Verify `FraudRings` lists all Louvain-detected rings with correct exposure figures.
- [x] Verify `FraudRingDetail` isolated subgraph renders for each ring ID with pan/zoom and interactive canvas.
- [x] Framer Motion polish pass — smooth page transitions across all routes.
- [x] Full test suite (7/7 pytest passing, 0 build errors in Vite, all API endpoints 200 OK).

### 2. Phase 5 (Priority 2 Innovations — COMPLETE ✅)

*Differentiating competition features:*
- [x] **Fraud DNA Engine** (`app/fraud_dna.py` & `FraudDNA.jsx`): 6-dimensional risk radar chart (Identity, Device, Dealer, Location, Behaviour, Network).
- [x] **Explainable AI Breakdown** (`app/explainable_ai.py` & `EvidenceBreakdown.jsx`): Human-readable evidence list with severity badges (CRITICAL/HIGH/MEDIUM/LOW) and point contributions.
- [x] **Risk Propagation Engine** (`app/risk_propagation.py`): BFS decaying risk heatmap across connected entities (3 hops, 0.55× geometric decay).
- [x] **What-If Fraud Simulator** (`app/main.py` & `WhatIfSimulator.jsx`): Interactive simulation of fraud interventions with capital protection and contagion arrest metrics.
- [x] **Dealer & Device Intelligence Modules** (`app/dealer_intelligence.py` & `app/device_intelligence.py`): Hub centrality analysis for 40 dealers and sharing cluster detection across 2,188 devices.

### 3. Phase 6 (Final Polish & Presentation — Day 6)
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
