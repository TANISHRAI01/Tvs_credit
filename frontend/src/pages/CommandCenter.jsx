import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Users, AlertTriangle, TrendingUp,
  ArrowUpRight, ArrowDownRight, Layers, Clock,
  CheckCircle2, XCircle, Share2, MapPin,
  Activity, ChevronRight, RefreshCw,
} from 'lucide-react';

import AlertFeed from '../components/dashboard/AlertFeed';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import { getGraphStats, getAlerts, getEmergingEcosystems, getFraudRings } from '../utils/api';
import { getRiskLevel } from '../utils/constants';

// ─── Animation helper ─────────────────────────────────────────────────────────
const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: 'easeOut' },
});

// ─── Large Risk Score Display (matches reference 87/100 display) ──────────────
function RiskScoreHero({ score = 0, label = 'Network Risk' }) {
  const lvl = getRiskLevel(score);
  // Sparkline data for background chart
  const sparkPoints = [30, 35, 28, 42, 38, 55, 50, 62, 58, 72, 68, 80, 75, score];

  return (
    <div className="inv-card" style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#a0a0a0', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '16px' }}>
        {label}
      </div>

      {/* Background sparkline */}
      <svg
        viewBox="0 0 280 80"
        style={{ position: 'absolute', bottom: '20px', right: '20px', width: '55%', height: '60%', opacity: 0.2 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lvl.color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={lvl.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={lvl.color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          points={sparkPoints.map((v, i) => `${(i / (sparkPoints.length - 1)) * 280},${80 - (v / 100) * 75}`).join(' ')}
        />
        <polygon
          fill="url(#sparkGrad)"
          points={`0,80 ${sparkPoints.map((v, i) => `${(i / (sparkPoints.length - 1)) * 280},${80 - (v / 100) * 75}`).join(' ')} 280,80`}
        />
      </svg>

      {/* Score */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{
            fontSize: '56px', fontWeight: 900,
            fontFamily: 'JetBrains Mono, monospace',
            color: lvl.color,
            lineHeight: 1, letterSpacing: '-2px',
            textShadow: `0 0 40px ${lvl.color}40`,
          }}>
            {score.toFixed(1)}
          </span>
          <span style={{ fontSize: '22px', fontWeight: 400, color: '#606060' }}>/100</span>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '13px', fontWeight: 700, color: lvl.color,
          }}>
            {lvl.label} Risk
          </span>
        </div>
      </div>

      {/* Bottom pills */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', color: '#e11d48' }}>
          Investigation Priority: HIGH
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 12px', borderRadius: '8px', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', color: '#e11d48' }}>
          Evidence Confidence: HIGH
        </span>
      </div>

      {/* Time axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingLeft: '45%' }}>
        {['0h', '4h', '8h', '12h', '24h'].map(t => (
          <span key={t} style={{ fontSize: '9px', color: '#404040' }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Entity Summary Card (matches reference Customer/Case Summary) ────────────
function EntitySummaryCard({ stats }) {
  const items = [
    { label: 'Total Entities', value: '18,095', sub: 'Living Graph' },
    { label: 'Entity ID', value: 'TVS-SENTINEL', sub: 'Digital Twin' },
    { label: 'Account Status', value: 'Active', isGreen: true },
    { label: 'Segment', value: 'Retail Lending' },
    { label: 'Operating Since', value: 'Aug 29, 2026' },
  ];

  return (
    <div className="inv-card" style={{ padding: '28px 32px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', marginBottom: '20px' }}>
        Network / Case Summary
      </div>

      {/* Avatar + ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          border: '2px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Layers size={24} color="#a0a0a0" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 600 }}>Active Network</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f0f0f0', marginTop: '2px' }}>
            TVS Sentinel
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span style={{ fontSize: '11px', color: '#606060' }}>Network ID</span>
            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#a0a0a0' }}>DGTWIN-001</span>
          </div>
        </div>
      </div>

      {/* Meta rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          ['Account Status', 'Active', '#22c55e'],
          ['Segment', 'Retail Lending', '#a0a0a0'],
          ['Operating Since', 'Aug 29, 2026', '#a0a0a0'],
        ].map(([label, value, color]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#606060' }}>{label}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Risk Score Mini */}
      <div style={{
        marginTop: '20px', padding: '14px 16px', borderRadius: '12px',
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            border: '3px solid #e11d48',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#e11d48' }}>
              {(stats?.avg_risk_score ?? 25.1).toFixed(0)}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#606060' }}>Transaction Risk Score</div>
            <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#f0f0f0' }}>
              {(stats?.avg_risk_score ?? 25.1).toFixed(1)} /100
            </div>
          </div>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#e11d48' }}>High Risk</span>
      </div>
    </div>
  );
}

// ─── Activity Timeline (matches reference Account Activity Timeline) ──────────
function ActivityTimeline({ alerts = [] }) {
  const timelineItems = [
    { icon: XCircle, color: '#e11d48', title: 'Fraud Ring Detected', detail: 'RING_002 · 462 nodes', sub: 'Dealer Collusion', time: 'Today' },
    { icon: AlertTriangle, color: '#f59e0b', title: 'Risk Score Spike', detail: 'Avg Risk ↑ to 25.1', sub: 'Anomaly Flagged', time: 'Today' },
    { icon: Share2, color: '#3b82f6', title: 'Device Sharing Alert', detail: '8 customers · 2 devices', sub: 'Ring Pattern', time: 'Today' },
    { icon: CheckCircle2, color: '#22c55e', title: 'Graph Built Successfully', detail: '18,095 nodes · 35,158 edges', sub: 'Approved', time: 'Today' },
    { icon: Activity, color: '#a78bfa', title: 'Emerging Ecosystem', detail: '12-day velocity burst', sub: 'Pending Review', time: 'Today' },
  ];

  return (
    <div className="inv-card" style={{ padding: '24px 28px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', marginBottom: '20px' }}>
        Investigation Activity Timeline
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {timelineItems.map((item, i) => (
          <div key={i} style={{
            display: 'flex', gap: '14px', padding: '12px 0',
            borderBottom: i < timelineItems.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
          }}>
            {/* Timeline dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '24px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                background: `${item.color}15`, border: `1px solid ${item.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <item.icon size={14} color={item.color} />
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0' }}>{item.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '12px', color: '#a0a0a0' }}>{item.detail}</span>
                <span style={{ fontSize: '10px', color: '#606060' }}>·</span>
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: item.color,
                  ...(item.sub === 'Approved' ? {} : item.sub === 'Pending Review' ? {} : {}),
                }}>
                  {item.sub}
                </span>
              </div>
            </div>

            {/* Time */}
            <span style={{ fontSize: '11px', color: '#606060', whiteSpace: 'nowrap' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Connected Entities Card (matches reference Linked Accounts) ──────────────
function ConnectedEntities({ stats }) {
  const entities = [
    { icon: Users, label: 'Customers', count: stats?.total_customers ?? 2481, activity: 'High Activity', actColor: '#e11d48' },
    { icon: Layers, label: 'Applications', count: stats?.total_applications ?? 5049, activity: 'Normal', actColor: '#22c55e' },
    { icon: ShieldAlert, label: 'Fraud Rings', count: 40, activity: 'High Activity', actColor: '#e11d48' },
  ];

  return (
    <div className="inv-card" style={{ padding: '24px 28px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', marginBottom: '20px' }}>
        Linked Entities
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {entities.map((ent, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: '12px',
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ent.icon size={18} color="#a0a0a0" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f0' }}>{ent.label}</div>
                <div style={{ fontSize: '11px', color: '#606060', fontFamily: 'JetBrains Mono, monospace' }}>
                  ✱✱ {ent.count.toLocaleString()}
                </div>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: ent.actColor }}>
              {ent.activity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Detected Anomalies Map Card ──────────────────────────────────────────────
function DetectedAnomalies() {
  const locations = [
    { name: 'Chennai, TN', type: 'Cluster Hub', x: '62%', y: '68%', color: '#e11d48' },
    { name: 'Hosur, TN', type: 'Known Location', x: '60%', y: '62%', color: '#22c55e' },
    { name: 'Bengaluru, KA', type: 'Unusual Location', x: '56%', y: '64%', color: '#f59e0b' },
  ];

  return (
    <div className="inv-card" style={{ padding: '24px 28px' }}>
      <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0', marginBottom: '16px' }}>
        Detected Anomalies
      </div>

      {/* Stylized map placeholder */}
      <div style={{
        position: 'relative', height: '180px', borderRadius: '12px',
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        {/* Map grid lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.08 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <React.Fragment key={i}>
              <line x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="#fff" strokeWidth="0.5" />
              <line x1={`${i * 25}%`} y1="0" x2={`${i * 25}%`} y2="100%" stroke="#fff" strokeWidth="0.5" />
            </React.Fragment>
          ))}
        </svg>

        {/* Connection lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <line x1="60%" y1="62%" x2="62%" y2="68%" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
          <line x1="56%" y1="64%" x2="60%" y2="62%" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        </svg>

        {/* Location markers */}
        {locations.map((loc, i) => (
          <div key={i} style={{
            position: 'absolute', left: loc.x, top: loc.y,
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: loc.color, boxShadow: `0 0 10px ${loc.color}60`,
            }} />
            <div style={{
              fontSize: '10px', fontWeight: 600, color: '#f0f0f0',
              background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px',
              whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {loc.name}
            </div>
            <span style={{ fontSize: '9px', color: loc.color }}>{loc.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND CENTER MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CommandCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ecosystems, setEcosystems] = useState([]);
  const [rings, setRings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, e, r] = await Promise.allSettled([
        getGraphStats(), getAlerts(), getEmergingEcosystems(), getFraudRings(),
      ]);
      if (s.status === 'fulfilled') setStats(s.value);
      if (a.status === 'fulfilled') setAlerts(a.value);
      if (e.status === 'fulfilled') setEcosystems(e.value);
      if (r.status === 'fulfilled') setRings(r.value);
      if (s.status === 'rejected') setError('Backend not reachable on port 8000.');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const avgRisk = stats?.avg_risk_score ?? 25.1;

  return (
    <div style={{ maxWidth: '1500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Error Banner ── */}
      {error && (
        <motion.div {...fadeIn(0)} style={{
          padding: '12px 16px', borderRadius: '12px',
          background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)',
          color: '#e11d48', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <AlertTriangle size={15} /> {error}
        </motion.div>
      )}

      {/* ══════ ROW 1: Case Summary + Risk Score ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
        <motion.div {...fadeIn(0)}>
          <EntitySummaryCard stats={stats} />
        </motion.div>
        <motion.div {...fadeIn(0.05)}>
          <RiskScoreHero score={avgRisk} label="Network Average Risk Score" />
        </motion.div>
      </div>

      {/* ══════ ROW 2: Timeline + Anomaly Map + Linked Entities ══════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <motion.div {...fadeIn(0.1)}>
          <ActivityTimeline alerts={alerts} />
        </motion.div>
        <motion.div {...fadeIn(0.15)}>
          <DetectedAnomalies />
        </motion.div>
        <motion.div {...fadeIn(0.2)}>
          <ConnectedEntities stats={stats} />
        </motion.div>
      </div>

      {/* ══════ ROW 3: Bottom Action Bar (matches reference) ══════ */}
      <motion.div {...fadeIn(0.25)} className="inv-card" style={{
        padding: '16px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={18} color="#e11d48" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f0f0' }}>Recommended Action</div>
            <div style={{ fontSize: '12px', color: '#606060' }}>
              Multiple high-risk indicators detected. Select an action to proceed.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-red"
            onClick={() => navigate('/fraud-rings')}
          >
            Escalate Case <ChevronRight size={16} />
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/network')}
          >
            <Layers size={14} /> Explore Network
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/simulator')}
          >
            <CheckCircle2 size={14} /> Simulate
          </button>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
