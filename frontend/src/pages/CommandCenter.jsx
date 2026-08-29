import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Network, ShieldAlert,
  TrendingUp, AlertTriangle, Activity, RefreshCw,
} from 'lucide-react';

import StatCard          from '../components/dashboard/StatCard';
import AlertFeed         from '../components/dashboard/AlertFeed';
import RiskDistribution  from '../components/dashboard/RiskDistribution';
import { getGraphStats, getAlerts, getEmergingEcosystems } from '../utils/api';

// ─── Stat card definitions ────────────────────────────────────────────────────
const STAT_DEFINITIONS = [
  {
    key: 'total_applications',
    label: 'Total Applications',
    icon: <LayoutDashboard />,
    accent: '#00d4ff',
  },
  {
    key: 'total_customers',
    label: 'Customers',
    icon: <Users />,
    accent: '#3b82f6',
  },
  {
    key: 'total_networks',
    label: 'Networks Detected',
    icon: <Network />,
    accent: '#8b5cf6',
  },
  {
    key: 'suspicious_networks',
    label: 'Suspicious Networks',
    icon: <ShieldAlert />,
    accent: '#f59e0b',
  },
  {
    key: 'critical_networks',
    label: 'Critical Networks',
    icon: <AlertTriangle />,
    accent: '#ef4444',
  },
  {
    key: 'high_risk_count',
    label: 'High-Risk Entities',
    icon: <Activity />,
    accent: '#dc2626',
  },
];

// ─── Animation variants ────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' },
});

export default function CommandCenter() {
  const [stats,      setStats]      = useState(null);
  const [alerts,     setAlerts]     = useState([]);
  const [ecosystems, setEcosystems] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, alertsData, ecoData] = await Promise.allSettled([
        getGraphStats(),
        getAlerts(),
        getEmergingEcosystems(),
      ]);

      if (statsData.status === 'fulfilled')  setStats(statsData.value);
      if (alertsData.status === 'fulfilled') setAlerts(alertsData.value);
      if (ecoData.status === 'fulfilled')    setEcosystems(ecoData.value);

      if (statsData.status === 'rejected') {
        setError('Could not reach the API. Is the backend running on port 8000?');
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const avgRisk = stats?.avg_risk_score ?? 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>
            Command Center
          </h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Real-time fraud intelligence dashboard · TVS Sentinel
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '11px', color: '#334155' }}>
              Updated {lastUpdated.toLocaleTimeString('en-IN')}
            </span>
          )}
          <button
            onClick={fetchAll}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.25)',
              color: '#00d4ff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 0.75s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {error && (
        <motion.div {...fadeUp(0.05)}
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={15} />
          {error}
        </motion.div>
      )}

      {/* ── Stat Cards Grid ──────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.05)}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {STAT_DEFINITIONS.map((def, i) => (
          <StatCard
            key={def.key}
            label={def.label}
            value={stats?.[def.key] ?? 0}
            icon={def.icon}
            accent={def.accent}
            loading={loading}
          />
        ))}
      </motion.div>

      {/* ── Avg Risk Score Banner ────────────────────────────────────────── */}
      {!loading && stats && (
        <motion.div {...fadeUp(0.1)}
          className="glass-card"
          style={{ marginBottom: '24px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <TrendingUp size={18} color="#00d4ff" />
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Network Average Risk Score
          </span>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              fontSize: '24px',
              color: avgRisk >= 70 ? '#ef4444' : avgRisk >= 40 ? '#f59e0b' : '#10b981',
            }}
          >
            {avgRisk.toFixed(1)}
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#475569' }}> / 100</span>
          </div>
          <div
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              background: '#1a1e3a',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${avgRisk}%`,
                borderRadius: '3px',
                background: avgRisk >= 70
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : avgRisk >= 40
                  ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                  : 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 1s ease',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* ── Main Content: Chart + Alerts ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px', marginBottom: '24px' }}>

        {/* Risk Distribution Chart */}
        <motion.div {...fadeUp(0.15)} className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '3px' }}>
              Risk Score Distribution
            </h2>
            <p style={{ fontSize: '11px', color: '#475569' }}>
              Node count per risk band across the full entity graph
            </p>
          </div>
          <RiskDistribution stats={stats} loading={loading} />
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Safe (0–30)',    color: '#10b981' },
              { label: 'Medium (30–60)',  color: '#f59e0b' },
              { label: 'High (60–80)',    color: '#ef4444' },
              { label: 'Critical (80+)', color: '#7f1d1d' },
            ].map(({ label, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color }} />
                <span style={{ fontSize: '10px', color: '#475569' }}>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alert Feed */}
        <motion.div {...fadeUp(0.2)} className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '3px' }}>
                Live Alerts
              </h2>
              <p style={{ fontSize: '11px', color: '#475569' }}>
                {alerts.length} active · sorted by severity
              </p>
            </div>
            {alerts.some(a => a.severity === 'critical') && (
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: '#dc2626',
                  background: 'rgba(220,38,38,0.15)',
                  border: '1px solid rgba(220,38,38,0.3)',
                  padding: '3px 7px',
                  borderRadius: '5px',
                  animation: 'pulse-ring 1.5s infinite',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                ● Critical Active
              </span>
            )}
          </div>
          <AlertFeed alerts={alerts} loading={loading} maxHeight="360px" />
        </motion.div>
      </div>

      {/* ── Emerging Ecosystems Strip ─────────────────────────────────────── */}
      {!loading && ecosystems.length > 0 && (
        <motion.div {...fadeUp(0.25)} className="glass-card" style={{ padding: '20px 24px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '14px' }}>
            🚨 Emerging Threat Ecosystems
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {ecosystems.slice(0, 6).map((eco, i) => (
              <div
                key={eco.id ?? i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(139,92,246,0.08)',
                  border: '1px solid rgba(139,92,246,0.2)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8b5cf6', marginBottom: '4px' }}>
                  {eco.id}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                  Stage: <span style={{ color: '#94a3b8' }}>{eco.current_stage}</span>
                  · {eco.days_forming}d forming
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#475569' }}>Predicted Risk</span>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: (eco.predicted_risk ?? 0) >= 70 ? '#ef4444' : '#f59e0b',
                    }}
                  >
                    {(eco.predicted_risk ?? 0).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
