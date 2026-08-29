import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ShieldAlert, Zap, Clock, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import { getEmergingEcosystems } from '../utils/api';
import { getRiskLevel } from '../utils/constants';

export default function EmergingThreats() {
  const [ecosystems, setEcosystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchThreats = () => {
    setLoading(true);
    setError(null);
    getEmergingEcosystems()
      .then((data) => setEcosystems(Array.isArray(data) ? data : (data.ecosystems ?? [])))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchThreats(); }, []);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inv-card"
        style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(168, 85, 247, 0.4)',
              }}
            >
              <TrendingUp size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              Emerging Threat Radar
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Real-time velocity tracking of rapidly forming synthetic networks & early collusion hubs before full crystallization.
          </p>
        </div>

        <button onClick={fetchThreats} disabled={loading} className="btn-outline">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Scan Ecosystems
        </button>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '14px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#f43f5e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Live Velocity Radar Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
        {loading ? (
          [1, 2].map((n) => (
            <div key={n} className="inv-card" style={{ height: '260px', opacity: 0.4 }} />
          ))
        ) : ecosystems.length === 0 ? (
          <div className="inv-card" style={{ padding: '60px 20px', textAlign: 'center', gridColumn: '1 / -1' }}>
            <Activity size={36} color="#71717a" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>No Active Velocity Bursts Detected</div>
            <p style={{ fontSize: '13px', color: '#71717a' }}>The temporal clustering engine is continuously monitoring incoming loan batches.</p>
          </div>
        ) : (
          ecosystems.map((eco, idx) => {
            const riskLvl = getRiskLevel(eco.risk_score ?? 75);
            return (
              <motion.div
                key={eco.id ?? idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="inv-card"
                style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}
              >
                {/* Ambient glow */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#a855f7',
                    opacity: 0.1,
                    filter: 'blur(30px)',
                  }}
                />

                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#a855f7', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                      BURST VELOCITY THREAT
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>
                      {eco.name ?? `Threat Cluster #${idx + 1}`}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: riskLvl.color,
                      background: `${riskLvl.color}15`,
                      border: `1px solid ${riskLvl.color}35`,
                      borderRadius: '999px',
                      padding: '3px 10px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    ● {(eco.risk_score ?? 75).toFixed(0)} RISK
                  </span>
                </div>

                {/* Velocity Metric Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Formation Velocity</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f43f5e', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                      {eco.velocity ?? '+14 app/day'}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Active Nodes</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                      {eco.node_count ?? 18}
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Exposure Risk</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', marginTop: '2px' }}>
                      ₹{(eco.exposure_lakhs ?? 42.5).toFixed(1)}L
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  {eco.description ?? 'Rapid device sharing observed across multiple newly registered borrower accounts within a 12-day window.'}
                </p>

                {/* Action CTA */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Active detection window
                  </span>
                  <button className="btn-primary-gradient" style={{ padding: '8px 16px', fontSize: '12px' }}>
                    Isolate Threat <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
