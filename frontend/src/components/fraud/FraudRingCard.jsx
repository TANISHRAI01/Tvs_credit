import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Layers, IndianRupee, ChevronRight, Shield } from 'lucide-react';
import { getRiskLevel, NODE_COLORS } from '../../utils/constants';

// ─── Circular risk gauge SVG ──────────────────────────────────────────────────
function RiskGauge({ score, size = 64 }) {
  const lvl        = getRiskLevel(score ?? 0);
  const radius     = (size - 8) / 2;
  const circ       = 2 * Math.PI * radius;
  const filled     = circ * ((score ?? 0) / 100);
  const cx         = size / 2;
  const cy         = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={6} />
        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={lvl.color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={0}
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 8px ${lvl.color}90)` }}
        />
      </svg>
      {/* Center text */}
      <div style={{
        position:       'absolute',
        inset:          0,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: lvl.color, lineHeight: 1 }}>
          {(score ?? 0).toFixed(0)}
        </span>
      </div>
    </div>
  );
}

// ─── Entity breakdown mini pills ──────────────────────────────────────────────
function EntityBreakdown({ breakdown }) {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '10px' }}>
      {Object.entries(breakdown).map(([type, count]) => {
        const color = NODE_COLORS[type] ?? '#94a3b8';
        return (
          <div
            key={type}
            title={`${type}: ${count}`}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '5px',
              padding:      '3px 8px',
              borderRadius: '999px',
              background:   `${color}12`,
              border:       `1px solid ${color}30`,
              fontSize:     '10px',
              fontWeight:   600,
              color,
              fontFamily:   'JetBrains Mono, monospace',
            }}
          >
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {count} {type.replace('_', ' ')}
          </div>
        );
      })}
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
  return (
    <div
      style={{
        padding: '10px 8px',
        borderRadius: '12px',
        background: 'rgba(18, 18, 26, 0.65)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color, marginBottom: '3px' }}>
        {icon}
        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

export default function FraudRingCard({ ring, index = 0 }) {
  const navigate  = useNavigate();
  const lvl       = getRiskLevel(ring.risk_score ?? 0);
  const exposure  = ring.exposure_lakhs ?? ring.potential_exposure_lakhs ?? 0;

  const handleClick = () => navigate(`/fraud-rings/${ring.id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: 'easeOut' }}
      onClick={handleClick}
      className="inv-card"
      style={{
        padding: '22px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(255, 255, 255, 0.18)' }}
    >
      {/* Accent corner ambient glow */}
      <div
        style={{
          position:     'absolute',
          top:          '-20px',
          right:        '-20px',
          width:        '100px',
          height:       '100px',
          borderRadius: '50%',
          background:   lvl.color,
          opacity:      0.08,
          filter:       'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Critical pulse badge */}
      {lvl.key === 'critical' && (
        <div
          style={{
            position:     'absolute',
            top:          '14px',
            right:        '14px',
            fontSize:     '9px',
            fontWeight:   700,
            color:        '#f43f5e',
            background:   'rgba(225, 29, 72, 0.15)',
            border:       '1px solid rgba(225, 29, 72, 0.35)',
            padding:      '3px 8px',
            borderRadius: '999px',
            animation:    'pulse 1.5s infinite',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
          }}
        >
          ● Critical Ring
        </div>
      )}

      {/* ── Top row: gauge + header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <RiskGauge score={ring.risk_score} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
            {ring.id}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px', fontFamily: 'Outfit, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ring.name ?? `Ring ${ring.id}`}
          </div>
          <span
            style={{
              fontSize:     '10px',
              fontWeight:   700,
              color:        lvl.color,
              background:   `${lvl.color}15`,
              border:       `1px solid ${lvl.color}35`,
              borderRadius: '6px',
              padding:      '2px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
            }}
          >
            {lvl.label} Risk
          </span>
        </div>
      </div>

      {/* ── Stats grid row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <StatPill icon={<Users size={12} />} label="Nodes" value={ring.node_count ?? 0} color="#818cf8" />
        <StatPill icon={<Layers size={12} />} label="Edges" value={ring.edge_count ?? 0} color="#38bdf8" />
        <StatPill icon={<IndianRupee size={12} />} label="Exposure" value={`${exposure.toFixed(1)}L`} color="#f59e0b" />
      </div>

      {/* ── Entity breakdown pills ── */}
      <EntityBreakdown breakdown={ring.entity_breakdown ?? ring.breakdown} />

      {/* ── Footer ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
          {ring.detected_at ? new Date(ring.detected_at).toLocaleDateString('en-IN') : 'Active Cluster'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '12px', fontWeight: 700 }}>
          Inspect Ring <ChevronRight size={14} />
        </div>
      </div>
    </motion.div>
  );
}
