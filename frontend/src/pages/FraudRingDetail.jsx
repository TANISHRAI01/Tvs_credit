import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ShieldAlert, Users, Layers,
  IndianRupee, AlertTriangle, Share2,
} from 'lucide-react';
import NetworkGraph from '../components/graph/NetworkGraph';
import { getFraudRingById } from '../utils/api';
import { getRiskLevel, NODE_COLORS } from '../utils/constants';

// ─── Shared entities breakdown table ─────────────────────────────────────────
function SharedEntitiesTable({ entities }) {
  const list = Array.isArray(entities) ? entities : [];
  if (list.length === 0) return (
    <p style={{ fontSize: '12px', color: '#64748b', padding: '8px 0' }}>No shared entities identified.</p>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {list.slice(0, 20).map((ent, i) => {
        const color = NODE_COLORS[ent.type] ?? '#94a3b8';
        return (
          <div key={ent.id ?? i} style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '10px',
            padding:      '8px 12px',
            borderRadius: '8px',
            background:   'rgba(255,255,255,0.03)',
            border:       '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ent.label ?? ent.id}
              </div>
              <div style={{ fontSize: '10px', color, textTransform: 'capitalize' }}>{ent.type?.replace('_', ' ')}</div>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', flexShrink: 0 }}>
              {ent.shared_count > 1 && <span style={{ color: '#f59e0b', fontWeight: 600 }}>×{ent.shared_count}</span>}
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{
                fontSize:     '11px',
                fontWeight:   700,
                color:        getRiskLevel(ent.risk_score ?? 0).color,
                fontFamily:   'JetBrains Mono, monospace',
              }}>{(ent.risk_score ?? 0).toFixed(0)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Risk gauge (reusable) ────────────────────────────────────────────────────
function RiskGauge({ score, size = 80 }) {
  const lvl    = getRiskLevel(score ?? 0);
  const radius = (size - 10) / 2;
  const circ   = 2 * Math.PI * radius;
  const filled = circ * ((score ?? 0) / 100);
  const cx     = size / 2;
  const cy     = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx={cx} cy={cy} r={radius} fill="none"
          stroke={lvl.color} strokeWidth="6"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ filter: `drop-shadow(0 0 8px ${lvl.color}90)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: lvl.color, lineHeight: 1 }}>
          {(score ?? 0).toFixed(0)}
        </span>
        <span style={{ fontSize: '9px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>risk</span>
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
    
    // Normalize object of arrays { shared_devices: [...], ... }
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
        <div style={{ width: '32px', height: '32px', border: '3px solid #1a1e3a', borderTop: '3px solid #8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '13px' }}>Loading ring {id}…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px', color: '#ef4444' }}>
        <AlertTriangle size={32} />
        <p style={{ fontSize: '14px' }}>{error}</p>
        <button onClick={() => navigate('/fraud-rings')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', cursor: 'pointer', fontSize: '13px' }}>
          Back to Rings
        </button>
      </div>
    );
  }

  if (!ring) return null;

  const lvl      = getRiskLevel(ring.risk_score ?? 0);
  const exposure = ring.exposure_lakhs ?? ring.potential_exposure_lakhs ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>

      {/* ── Back + Header ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ flexShrink: 0 }}>
        <button
          onClick={() => navigate('/fraud-rings')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer', marginBottom: '12px', padding: '0' }}
        >
          <ArrowLeft size={14} /> Back to Fraud Rings
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ShieldAlert size={22} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#475569', marginBottom: '2px' }}>{ring.id}</div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0' }}>
              {ring.name ?? `Fraud Ring ${ring.id}`}
            </h1>
          </div>
          <span style={{
            marginLeft:   'auto',
            fontSize:     '12px',
            fontWeight:   700,
            color:        lvl.color,
            background:   `${lvl.color}18`,
            border:       `1px solid ${lvl.color}40`,
            borderRadius: '8px',
            padding:      '4px 12px',
            textTransform: 'uppercase',
          }}>
            {lvl.label} Risk
          </span>
        </div>
      </motion.div>

      {/* ── Main 2-col layout ── */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>

        {/* Left: Stats + Shared Entities */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}
        >
          {/* Ring stats card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <RiskGauge score={ring.risk_score} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <MiniStat icon={<Users size={11} />} label="Nodes"    value={nodes.length || ring.node_count || 0} color="#8b5cf6" />
                  <MiniStat icon={<Layers size={11} />} label="Edges"   value={edges.length || ring.edge_count || 0} color="#3b82f6" />
                  <MiniStat icon={<Share2 size={11} />} label="Shared"  value={shared.length} color="#f59e0b" />
                  <MiniStat icon={<IndianRupee size={11} />} label="Exposure" value={`${exposure.toFixed(1)}L`} color="#ef4444" />
                </div>
              </div>
            </div>

            {/* Entity breakdown */}
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Entity Breakdown</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Object.entries(breakdown).map(([type, count]) => {
                const color = NODE_COLORS[type] ?? '#94a3b8';
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}40`, fontSize: '11px', fontWeight: 600, color }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {count} {type.replace('_', ' ')}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared entities */}
          <div className="glass-card" style={{ padding: '16px 18px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Share2 size={14} color="#f59e0b" />
              Shared Entities
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <SharedEntitiesTable entities={shared} />
            </div>
          </div>
        </motion.div>

        {/* Right: Isolated graph */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}
        >
          {nodes.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px', color: '#334155' }}>
              <AlertTriangle size={24} />
              <p style={{ fontSize: '13px' }}>No subgraph data available for this ring.</p>
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

          {/* Legend */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.entries(breakdown).map(([type, count]) => {
              const color = NODE_COLORS[type] ?? '#94a3b8';
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(10,14,39,0.8)', border: `1px solid ${color}30` }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'capitalize' }}>{type.replace('_', ' ')}</span>
                  <span style={{ fontSize: '10px', color, fontWeight: 700 }}>{count}</span>
                </div>
              );
            })}
          </div>

          <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', color: '#334155', pointerEvents: 'none' }}>
            Click node to inspect · Double-click canvas to fit
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MiniStat({ icon, label, value, color }) {
  return (
    <div style={{ padding: '7px 10px', borderRadius: '8px', background: `${color}10`, border: `1px solid ${color}25`, textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color, marginBottom: '2px' }}>
        {icon}
        <span style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
