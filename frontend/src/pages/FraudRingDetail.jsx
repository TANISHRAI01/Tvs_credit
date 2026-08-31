import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ShieldAlert, Users, Layers,
  IndianRupee, AlertTriangle, Share2, Eye,
} from 'lucide-react';
import NetworkGraph from '../components/graph/NetworkGraph';
import { getFraudRingById } from '../utils/api';
import { getRiskLevel, NODE_COLORS } from '../utils/constants';

// ─── Shared entities breakdown table ─────────────────────────────────────────
function SharedEntitiesTable({ entities }) {
  const list = Array.isArray(entities) ? entities : [];
  if (list.length === 0) return (
    <p style={{ fontSize: '12px', color: '#64748b', padding: '12px 0' }}>No shared entities identified in this cluster.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {list.slice(0, 25).map((ent, i) => {
        const color = NODE_COLORS[ent.type] ?? '#94a3b8';
        const riskLvl = getRiskLevel(ent.risk_score ?? 0);
        return (
          <div
            key={ent.id ?? i}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
              padding:      '10px 14px',
              borderRadius: '12px',
              background:   'rgba(18, 18, 26, 0.6)',
              border:       '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}`, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ent.label ?? ent.id}
              </div>
              <div style={{ fontSize: '11px', color, textTransform: 'capitalize', fontWeight: 600 }}>
                {ent.type?.replace('_', ' ')}
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              {ent.shared_count > 1 && (
                <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '11px', background: 'rgba(245,158,11,0.12)', padding: '2px 6px', borderRadius: '4px' }}>
                  ×{ent.shared_count}
                </span>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              <span
                style={{
                  fontSize:     '12px',
                  fontWeight:   800,
                  color:        riskLvl.color,
                  fontFamily:   'JetBrains Mono, monospace',
                }}
              >
                {(ent.risk_score ?? 0).toFixed(0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Risk gauge (reusable) ────────────────────────────────────────────────────
function RiskGauge({ score, size = 84 }) {
  const lvl    = getRiskLevel(score ?? 0);
  const radius = (size - 10) / 2;
  const circ   = 2 * Math.PI * radius;
  const filled = circ * ((score ?? 0) / 100);
  const cx     = size / 2;
  const cy     = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth={7} />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={lvl.color} strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ filter: `drop-shadow(0 0 10px ${lvl.color}90)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: lvl.color, lineHeight: 1 }}>
          {(score ?? 0).toFixed(0)}
        </span>
        <span style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>risk</span>
      </div>
    </div>
  );
}

export default function FraudRingDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [data,     setData]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getFraudRingById(id)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const ring   = data?.ring ?? data ?? null;
  const nodes  = useMemo(() => data?.nodes ?? ring?.nodes ?? [], [data, ring]);
  const edges  = useMemo(() => data?.edges ?? ring?.edges ?? [], [data, ring]);
  
  const shared = useMemo(() => {
    if (!data?.shared_entities) return [];
    if (Array.isArray(data.shared_entities)) return data.shared_entities;
    
    const items = [];
    const nodeMap = new Map((nodes ?? []).map((n) => [n.id, n]));
    
    Object.entries(data.shared_entities).forEach(([key, list]) => {
      if (Array.isArray(list)) {
        const rawType = key.replace('shared_', '').replace(/s$/, '');
        list.forEach((item) => {
          if (typeof item === 'string') {
            const matched = nodeMap.get(item);
            items.push({
              id: item,
              label: matched?.label ?? item,
              type: matched?.type ?? rawType,
              risk_score: matched?.risk_score ?? 75,
              shared_count: 2,
            });
          } else if (item && typeof item === 'object') {
            items.push(item);
          }
        });
      }
    });
    return items;
  }, [data, nodes]);

  // Entity breakdown from nodes
  const breakdown = useMemo(() => {
    const map = {};
    nodes.forEach((n) => { map[n.type] = (map[n.type] ?? 0) + 1; });
    return map;
  }, [nodes]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid #e11d48', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '13px' }}>Isolating ring {id}…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '14px', color: '#f43f5e' }}>
        <AlertTriangle size={36} />
        <p style={{ fontSize: '14px' }}>{error}</p>
        <button onClick={() => navigate('/fraud-rings')} className="btn-outline">
          Back to Fraud Rings
        </button>
      </div>
    );
  }

  if (!ring) return null;

  const lvl      = getRiskLevel(ring.risk_score ?? 0);
  const exposure = ring.exposure_lakhs ?? ring.potential_exposure_lakhs ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '18px' }}>

      {/* ── Top Header Navigation ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ flexShrink: 0 }}>
        <button
          onClick={() => navigate('/fraud-rings')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', padding: '0', fontWeight: 600 }}
        >
          <ArrowLeft size={14} /> Back to Fraud Rings
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e11d48, #9f1239)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(225, 29, 72, 0.4)',
            }}
          >
            <ShieldAlert size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#71717a', marginBottom: '2px' }}>CLUSTER ID: {ring.id}</div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em', margin: 0 }}>
              {ring.name ?? `Fraud Ring ${ring.id}`}
            </h1>
          </div>
          <span
            style={{
              marginLeft:   'auto',
              fontSize:     '12px',
              fontWeight:   700,
              color:        lvl.color,
              background:   `${lvl.color}15`,
              border:       `1px solid ${lvl.color}40`,
              borderRadius: '999px',
              padding:      '6px 16px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
            }}
          >
            ● {lvl.label} Risk
          </span>
        </div>
      </motion.div>

      {/* ── Main 2-Column Split: Inspector + Subgraph Canvas ── */}
      <div style={{ display: 'flex', flex: 1, gap: '18px', minHeight: '580px' }}>

        {/* Left: Cluster Metrics & Shared Entities */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '580px', overflowY: 'auto' }}
        >
          {/* Ring stats card */}
          <div className="inv-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
              <RiskGauge score={ring.risk_score} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <MiniStat icon={<Users size={11} />} label="Nodes" value={nodes.length || ring.node_count || 0} color="#818cf8" />
                  <MiniStat icon={<Layers size={11} />} label="Edges" value={edges.length || ring.edge_count || 0} color="#38bdf8" />
                  <MiniStat icon={<Share2 size={11} />} label="Shared" value={shared.length} color="#f59e0b" />
                  <MiniStat icon={<IndianRupee size={11} />} label="Exposure" value={`${exposure.toFixed(1)}L`} color="#f43f5e" />
                </div>
              </div>
            </div>

            {/* Entity breakdown */}
            <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '8px' }}>
              Entity Breakdown
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.entries(breakdown).map(([type, count]) => {
                const color = NODE_COLORS[type] ?? '#94a3b8';
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '999px', background: `${color}12`, border: `1px solid ${color}30`, fontSize: '11px', fontWeight: 600, color, fontFamily: 'JetBrains Mono, monospace' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {count} {type.replace('_', ' ')}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared entities */}
          <div className="inv-card" style={{ padding: '20px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif' }}>
              <Share2 size={15} color="#f59e0b" />
              Shared Collusion Entities
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <SharedEntitiesTable entities={shared} />
            </div>
          </div>
        </motion.div>

        {/* Right: Subgraph Canvas Frame */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inv-card"
          style={{ flex: 1, position: 'relative', minHeight: '580px', height: '620px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          {nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '10px', color: '#64748b' }}>
              <AlertTriangle size={28} />
              <p style={{ fontSize: '14px' }}>No subgraph data available for this ring.</p>
            </div>
          ) : (
            <NetworkGraph
              nodes={nodes}
              edges={edges}
              onNodeClick={setSelected}
              selectedNodeId={selected}
              height="100%"
              showLabels={nodes.length <= 150}
              physicsEnabled={nodes.length <= 500}
            />
          )}

          {/* Floating Canvas Legend */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              background: 'rgba(10, 10, 14, 0.85)',
              backdropFilter: 'blur(16px)',
              padding: '10px 14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Node Types</span>
            {Object.entries(breakdown).map(([type, count]) => {
              const color = NODE_COLORS[type] ?? '#94a3b8';
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
                  <span style={{ fontSize: '11px', color, fontWeight: 800, marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>{count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'absolute', bottom: '14px', left: '16px', fontSize: '11px', color: '#64748b', pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
            Click node to isolate • Drag to pan • Scroll to zoom
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(18, 18, 26, 0.65)', border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color, marginBottom: '2px' }}>
        {icon}
        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
