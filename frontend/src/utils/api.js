import axios from 'axios';
import { API_BASE_URL } from './constants';

// ─── Axios Instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'API error';
    console.error('[TVS Sentinel API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ─── Priority 1 Endpoints ────────────────────────────────────────────────────

/** Full graph (nodes + edges) for vis-network */
export const getGraph = (params = {}) => api.get('/graph', { params });

/** KPI summary: total apps, networks, risk levels */
export const getGraphStats = () => api.get('/graph/stats');

/** All detected fraud rings with metadata */
export const getFraudRings = () => api.get('/fraud-rings');

/** Single ring detail — subgraph, shared entities, timeline */
export const getFraudRingById = (id) => api.get(`/fraud-rings/${id}`);

/** Single entity detail + its connections */
export const getNodeById = (id) => api.get(`/node/${id}`);

/** Emerging ecosystems — networks currently forming */
export const getEmergingEcosystems = () => api.get('/emerging-ecosystems');

/** Submit new loan application (continuous learning) */
export const submitApplication = (payload) => api.post('/applications', payload);

/** Recent suspicious activity alerts */
export const getAlerts = () => api.get('/alerts');

// ─── Priority 2 Endpoints ────────────────────────────────────────────────────

/** 6-dimensional Fraud DNA for an entity */
export const getFraudDNA = (id) => api.get(`/node/${id}/fraud-dna`);

/** Explainable AI evidence breakdown for an entity */
export const getEvidence = (id) => api.get(`/node/${id}/evidence`);

/** Risk propagation heatmap from a suspicious entity */
export const getRiskPropagation = (id) => api.get(`/risk-propagation/${id}`);

/** What-If simulation — approve / hold / reject */
export const simulate = (payload) => api.post('/simulate', payload);

/** Dealer hub analysis */
export const getDealerIntelligence = () => api.get('/dealers/intelligence');

/** Device sharing analysis */
export const getDeviceIntelligence = () => api.get('/devices/intelligence');

/** Temporal pattern anomalies */
export const getBehaviourPatterns = () => api.get('/behaviour/patterns');

export default api;
