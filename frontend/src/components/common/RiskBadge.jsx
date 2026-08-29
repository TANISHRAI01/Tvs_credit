import React from 'react';
import { getRiskLevel } from '../../utils/constants';

/**
 * RiskBadge — small colored badge indicating risk level.
 *
 * Props:
 *   score  {number}  — 0–100 risk score
 *   label  {string}  — override label (optional)
 *   size   {'sm'|'md'|'lg'}
 *   pulse  {bool}    — pulse animation for critical
 */
export default function RiskBadge({ score, label, size = 'md', pulse: forcePulse }) {
  const level = getRiskLevel(score ?? 0);

  const SIZES = {
    sm: { fontSize: '9px',  padding: '2px 6px',  borderRadius: '5px', dotSize: '5px' },
    md: { fontSize: '10px', padding: '3px 8px',  borderRadius: '6px', dotSize: '6px' },
    lg: { fontSize: '12px', padding: '4px 10px', borderRadius: '7px', dotSize: '7px' },
  };
  const sz = SIZES[size] ?? SIZES.md;

  const BG_COLORS = {
    safe:     { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)',  text: '#10b981' },
    warning:  { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.35)',  text: '#f59e0b' },
    danger:   { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.35)',   text: '#ef4444' },
    critical: { bg: 'rgba(220,38,38,0.18)',   border: 'rgba(220,38,38,0.45)',   text: '#dc2626' },
  };
  const colors = BG_COLORS[level.key];
  const shouldPulse = forcePulse ?? level.key === 'critical';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: sz.fontSize,
        fontWeight: 700,
        letterSpacing: '0.5px',
        color: colors.text,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: sz.padding,
        borderRadius: sz.borderRadius,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: sz.dotSize,
          height: sz.dotSize,
          borderRadius: '50%',
          background: colors.text,
          boxShadow: `0 0 5px ${colors.text}99`,
          flexShrink: 0,
          animation: shouldPulse ? 'pulse-ring 1.5s ease-in-out infinite' : 'none',
        }}
      />
      {label ?? level.label}
      {score !== undefined && (
        <span style={{ fontFamily: 'JetBrains Mono, monospace', opacity: 0.8, fontWeight: 500 }}>
          {score.toFixed(0)}
        </span>
      )}
    </span>
  );
}
