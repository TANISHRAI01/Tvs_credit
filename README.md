# TVS Sentinel

> **AI-Powered Digital Twin for Predictive Fraud Ecosystems**  
> TVS Credit E.P.I.C. IT Case Study — Problem Statement E (Swarm Intelligence Lending Network)

---

## 📌 Project Overview
TVS Sentinel is an AI-driven collective intelligence platform that builds a living entity graph across loan applications, devices, dealers, bank accounts, mobile numbers, locations, guarantors, and payment behaviours to detect and predict emerging fraud ecosystems before fraud occurs.

## 🚀 Quickstart

### Backend (Member 1)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python data/generate_synthetic_data.py
uvicorn app.main:app --reload --port 8000
```

### Frontend (Member 2)
```bash
cd frontend
npm install
npm run dev
```

See [TEAM_PLAN.md](./TEAM_PLAN.md) for full team division, API contracts, and architecture.
