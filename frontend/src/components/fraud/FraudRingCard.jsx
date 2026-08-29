import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, Layers, IndianRupee, ChevronRight } from 'lucide-react';
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
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1a1e3a" strokeWidth={6} />
        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={lvl.color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={0}
          style={{ transition: 'stroke-dasharray 0.8s ease', filter: `drop-shadow(0 0 6px ${lvl.color}80)` }}
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
        <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: lvl.color, lineHeight: 1 }}>
          {(score ?? 0).toFixed(0)}
        </span>
      </div>
    </div>
  );
}

// ─── Entity breakdown mini pills ──────────────────────────────────────────────
function EntityBreakdown({ breakdown }) {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  const total = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
      {Object.entries(breakdown).map(([type, count]) => {
        const color = NODE_COLORS[type] ?? '#94a3b8';
        return (
          <div
            key={type}
            title={`${type}: ${count}`}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '4px',
              padding:      '2px 7px',
              borderRadius: '12px',
              background:   `${color}18`,
              border:       `1px solid ${color}40`,
              fontSize:     '10px',
              fontWeight:   600,
              color,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {count} {type.replace('_', ' ')}
          </div>
        );
      })}
    </div>
  );
}

/**
 * FraudRingCard
 *
 * Props:
 *   ring {object} - fraud ring data from API
 *   index {number} - card index for stagger animation
 */
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
      className="glass-card"
      style={{
        padding:    '20px',
        cursor:     'pointer',
        position:   'relative',
        overflow:   'hidden',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      whileHover={{ y: -3 }}
    >
      {/* Accent corner glow */}
      <div style={{
        position:     'absolute',
        top:          '-24px',
        right:        '-24px',
        width:        '80px',
        height:       '80px',
        borderRadius: '50%',
        background:   lvl.color,
        opacity:      0.07,
        filter:       'blur(24px)',
        pointerEvents: 'none',
      }} />

      {/* Critical pulse badge */}
      {lvl.key === 'critical' && (
        <div style={{
          position:     'absolute',
          top:          '12px',
          right:        '12px',
          fontSize:     '9px',
          fontWeight:   700,
          color:        '#dc2626',
          background:   'rgba(220,38,38,0.15)',
          border:       '1px solid rgba(220,38,38,0.35)',
          padding:      '2px 7px',
          borderRadius: '5px',
          animation:    'pulse-ring 1.5s infinite',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          ● Critical
        </div>
      )}

      {/* ── Top row: gauge + header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <RiskGauge score={ring.risk_score} size={62} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
            {ring.id}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ring.name ?? `Ring ${ring.id}`}
          </div>
          <span style={{
            fontSize:     '10px',
            fontWeight:   600,
            color:        lvl.color,
            background:   `${lvl.color}18`,
            border:       `1px solid ${lvl.color}40`,
            borderRadius: '5px',
            padding:      '2px 7px',
            textTransform: 'uppercase',
          }}>
            {lvl.label} Risk
          </span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <StatPill icon={<Users size={11} />} label="Nodes" value={ring.node_count ?? 0} color="#8b5cf6" />
        <StatPill icon={<Layers size={11} />} label="Edges" value={ring.edge_count ?? 0} color="#3b82f6" />
        <StatPill icon={<IndianRupee size={11} />} label="Exposure" value={`${exposure.toFixed(1)}L`} color="#f59e0b" />
      </div>

      {/* ── Entity breakdown ── */}
      <EntityBreakdown breakdown={ring.entity_breakdown ?? ring.breakdown} />

      {/* ── Footer ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: '11px', color: '#334155' }}>
          {ring.detected_at ? new Date(ring.detected_at).toLocaleDateString('en-IN') : 'Recently detected'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00d4ff', fontSize: '11px', fontWeight: 600 }}>
          Inspect <ChevronRight size={13} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mini stat pill ───────────────────────────────────────────────────────────
function StatPill({ icon, label, value, color }) {
  return (
    <div style={{ padding: '8px 10px', borderRadius: '8px', background: `${color}10`, border: `1px solid ${color}25`, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color, marginBottom: '2px' }}>
        {icon}
        <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
