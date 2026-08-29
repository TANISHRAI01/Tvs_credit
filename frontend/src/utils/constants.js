// ─── Node Type Colors ────────────────────────────────────────────────────────
export const NODE_COLORS = {
  customer:         '#3b82f6',  // blue
  device:           '#f97316',  // orange
  dealer:           '#10b981',  // emerald
  bank_account:     '#8b5cf6',  // purple
  mobile:           '#06b6d4',  // cyan
  location:         '#ec4899',  // pink
  guarantor:        '#f59e0b',  // amber
  loan_application: '#6366f1',  // indigo
};

// ─── Risk Thresholds ─────────────────────────────────────────────────────────
export const RISK_LEVELS = {
  safe:     { max: 30,  label: 'Low',      color: '#10b981', bg: 'risk-bg-safe' },
  warning:  { max: 60,  label: 'Medium',   color: '#f59e0b', bg: 'risk-bg-warning' },
  danger:   { max: 80,  label: 'High',     color: '#ef4444', bg: 'risk-bg-danger' },
  critical: { max: 100, label: 'Critical', color: '#dc2626', bg: 'risk-bg-critical' },
};

/**
 * Returns the risk level object for a given score (0–100).
 */
export function getRiskLevel(score) {
  if (score <= RISK_LEVELS.safe.max)    return { key: 'safe',     ...RISK_LEVELS.safe };
  if (score <= RISK_LEVELS.warning.max) return { key: 'warning',  ...RISK_LEVELS.warning };
  if (score <= RISK_LEVELS.danger.max)  return { key: 'danger',   ...RISK_LEVELS.danger };
  return                                       { key: 'critical', ...RISK_LEVELS.critical };
}

// ─── Severity Colors (alerts) ─────────────────────────────────────────────────
export const SEVERITY_COLORS = {
  low:      '#10b981',
  medium:   '#f59e0b',
  high:     '#ef4444',
  critical: '#dc2626',
};

// ─── Design Palette ───────────────────────────────────────────────────────────
export const PALETTE = {
  bgBase:     '#0a0e27',
  bgSurface:  '#1a1e3a',
  bgElevated: '#242848',
  border:     '#2a2e4a',
  accent:     '#00d4ff',
  ring:       '#8b5cf6',
  info:       '#3b82f6',
};

// ─── API Base URL ─────────────────────────────────────────────────────────────
export const API_BASE_URL = 'http://localhost:8000/api';

// ─── Recharts / Chart Colors ──────────────────────────────────────────────────
export const CHART_COLORS = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

// ─── Fraud DNA Dimensions ─────────────────────────────────────────────────────
export const FRAUD_DNA_DIMENSIONS = [
  { key: 'identity',  label: 'Identity Risk' },
  { key: 'device',    label: 'Device Risk' },
  { key: 'dealer',    label: 'Dealer Risk' },
  { key: 'location',  label: 'Location Risk' },
  { key: 'behaviour', label: 'Behaviour Risk' },
  { key: 'network',   label: 'Network Risk' },
];
