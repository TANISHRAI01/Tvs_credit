import React from 'react';

/**
 * TVS Sentinel Brand Emblem & Vector Logo
 * Features precision geometric shield, kinetic chevron nodes, and high-tech TVS styling.
 */
export default function TvsLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Precision Geometric SVG Shield Emblem */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 44 44"
          width="100%"
          height="100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(225, 29, 72, 0.45))' }}
        >
          <defs>
            <linearGradient id="tvsRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a5f" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="tvsDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a0812" />
              <stop offset="100%" stopColor="#120306" />
            </linearGradient>
            <linearGradient id="cyberGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Outer Shield Boundary */}
          <path
            d="M22 2L39 8.5V21C39 31.8 31.8 39.4 22 42C12.2 39.4 5 31.8 5 21V8.5L22 2Z"
            fill="url(#tvsDarkGrad)"
            stroke="url(#tvsRedGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Inner Geometric Circuit Matrix / TVS Wing Motif */}
          <path
            d="M22 8L33 13V20.5C33 27.5 28.5 33.2 22 35.8C15.5 33.2 11 27.5 11 20.5V13L22 8Z"
            fill="url(#tvsRedGrad)"
            opacity="0.22"
          />

          {/* Dynamic TVS Fast-Forward / Kinetic Chevron & Swarm Vertex */}
          <path
            d="M16 16L24 22L16 28"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 16L31 22L23 28"
            stroke="#ff4d79"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Swarm Core Glow Node */}
          <circle cx="22" cy="22" r="3.2" fill="#ffffff" />
          <circle cx="22" cy="22" r="1.8" fill="#e11d48" />

          {/* Top Radar Sentinel Beacon */}
          <circle cx="22" cy="6" r="1.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.5px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              TVS
            </span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 800,
                background: 'linear-gradient(90deg, #ff3366, #ff758c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.8px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              SENTINEL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#71717a',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Swarm AI
            </span>
            <span
              style={{
                fontSize: '8px',
                fontWeight: 700,
                color: '#e11d48',
                background: 'rgba(225, 29, 72, 0.15)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                padding: '1px 4px',
                borderRadius: '4px',
                lineHeight: 1,
              }}
            >
              v2.0
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
