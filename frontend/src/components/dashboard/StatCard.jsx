import React, { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `value` over `duration` ms.
 */
function useCounter(value, duration = 1200) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const start = Date.now();
    const from = 0;
    const to = Number(value);

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return display;
}

/**
 * StatCard — animated KPI tile with icon, label, value counter, and optional trend.
 *
 * Props:
 *   label      {string}  — Card title
 *   value      {number}  — Numeric value to display
 *   icon       {node}    — React element (lucide icon)
 *   accent     {string}  — CSS color for icon bg and glow
 *   prefix     {string}  — e.g. "₹" (optional)
 *   suffix     {string}  — e.g. "%" or "L" (optional)
 *   trend      {number}  — positive = up, negative = down (optional)
 *   trendLabel {string}  — e.g. "vs last week" (optional)
 *   loading    {bool}    — show skeleton state
 */
export default function StatCard({
  label,
  value,
  icon,
  accent = '#00d4ff',
  prefix = '',
  suffix = '',
  trend,
  trendLabel = '',
  loading = false,
}) {
  const animated = useCounter(loading ? 0 : value ?? 0);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '20px 24px', minWidth: '0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={shimmer(100, 16)} />
          <div style={shimmer(60, 32)} />
          <div style={shimmer(120, 12)} />
        </div>
      </div>
    );
  }

  const trendUp = trend > 0;
  const trendDown = trend < 0;
  const trendColor = trendUp ? '#10b981' : trendDown ? '#ef4444' : '#64748b';

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        minWidth: '0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.35), 0 0 20px ${accent}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* Accent glow blob */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: accent,
          opacity: 0.06,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `${accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${accent}30`,
            }}
          >
            {React.cloneElement(icon, { size: 15, color: accent, strokeWidth: 2.2 })}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: '30px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1, fontFamily: 'JetBrains Mono, monospace', marginBottom: '10px' }}>
        {prefix}<span>{animated.toLocaleString()}</span>{suffix}
      </div>

      {/* Trend */}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: trendColor, fontWeight: 600 }}>
            {trendUp ? '↑' : trendDown ? '↓' : '—'} {Math.abs(trend)}%
          </span>
          {trendLabel && (
            <span style={{ fontSize: '11px', color: '#475569' }}>{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton shimmer helper ───────────────────────────────────────────────────
function shimmer(width, height) {
  return {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: '6px',
    background: 'linear-gradient(90deg, #1a1e3a 25%, #242848 50%, #1a1e3a 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
  };
}
