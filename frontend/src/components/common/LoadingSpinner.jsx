import React from 'react';

/**
 * LoadingSpinner — flexible pulsing / spinning loader.
 *
 * Props:
 *   size     {number}  — diameter in px (default 32)
 *   color    {string}  — spinner color (default cyan accent)
 *   label    {string}  — text beneath spinner (optional)
 *   fullPage {bool}    — center in the full viewport
 *   variant  {'spin'|'pulse'|'dots'}
 */
export default function LoadingSpinner({
  size = 32,
  color = '#00d4ff',
  label,
  fullPage = false,
  variant = 'spin',
}) {
  const spinner = <Spinner variant={variant} size={size} color={color} />;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {spinner}
      {label && (
        <span style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.2px' }}>
          {label}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10,14,39,0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {content}
    </div>
  );
}

// ─── Variants ─────────────────────────────────────────────────────────────────

function Spinner({ variant, size, color }) {
  if (variant === 'dots') {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width: size / 4,
              height: size / 4,
              borderRadius: '50%',
              background: color,
              animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
            }}
          />
        ))}
        <style>{`
          @keyframes dotBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40%            { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: color,
            opacity: 0.15,
            animation: 'pulsate 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '20%',
            borderRadius: '50%',
            background: color,
            opacity: 0.6,
          }}
        />
        <style>{`
          @keyframes pulsate {
            0%, 100% { transform: scale(0.8); opacity: 0.1; }
            50%       { transform: scale(1.3); opacity: 0.2; }
          }
        `}</style>
      </div>
    );
  }

  // default: 'spin'
  return (
    <>
      <div
        style={{
          width: size,
          height: size,
          border: `${Math.max(2, size / 12)}px solid rgba(255,255,255,0.08)`,
          borderTop: `${Math.max(2, size / 12)}px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
          boxShadow: `0 0 ${size / 3}px ${color}33`,
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
