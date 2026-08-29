import React from 'react';
import { getRiskLevel } from '../../utils/constants';

const SEVERITY_CONFIG = {
  low:      { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)',  dot: '#10b981', label: 'LOW' },
  medium:   { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  dot: '#f59e0b', label: 'MED' },
  high:     { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   dot: '#ef4444', label: 'HIGH' },
  critical: { bg: 'rgba(220,38,38,0.15)',   border: 'rgba(220,38,38,0.4)',   dot: '#dc2626', label: 'CRIT' },
};

const TYPE_ICONS = {
  shared_device:       '📱',
  suspicious_dealer:   '🏪',
  guarantor_overuse:   '🤝',
  high_risk_customer:  '👤',
  general_risk:        '⚠️',
};

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * AlertFeed — scrollable list of alerts with severity color coding.
 *
 * Props:
 *   alerts  {Alert[]}  — array from GET /api/alerts
 *   loading {bool}
 *   maxHeight {string} — CSS max-height (default '360px')
 */
export default function AlertFeed({ alerts = [], loading = false, maxHeight = '360px' }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              height: '60px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, #1a1e3a 25%, #242848 50%, #1a1e3a 75%)',
              backgroundSize: '200% 100%',
              animation: `shimmer 1.4s ${i * 0.1}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div style={{ textAlign: 'center', color: '#475569', padding: '32px 0', fontSize: '13px' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>✅</div>
        No active alerts — system nominal
      </div>
    );
  }

  return (
    <div
      style={{
        maxHeight,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingRight: '2px',
      }}
    >
      {alerts.map((alert, idx) => {
        const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
        const icon = TYPE_ICONS[alert.type] ?? '⚠️';

        return (
          <div
            key={alert.id ?? idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              transition: 'opacity 0.15s ease',
              animation: `fadeInUp 0.3s ${idx * 0.04}s both`,
            }}
          >
            {/* Severity dot */}
            <div style={{ paddingTop: '3px', flexShrink: 0 }}>
              <div
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: cfg.dot,
                  boxShadow: `0 0 6px ${cfg.dot}aa`,
                  ...(alert.severity === 'critical' ? { animation: 'pulse-ring 1.5s infinite' } : {}),
                }}
              />
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.dot, letterSpacing: '0.5px' }}>
                  {cfg.label}
                </span>
                <span style={{ fontSize: '10px', color: '#475569' }}>
                  {icon} {alert.type?.replace(/_/g, ' ')}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#334155', flexShrink: 0 }}>
                  {formatTime(alert.timestamp)}
                </span>
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={alert.message}
              >
                {alert.message}
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
