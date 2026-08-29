import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Filter, X, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Cpu, User, Building2, CreditCard,
  Smartphone, MapPin, Shield, ChevronRight,
} from 'lucide-react';
import NetworkGraph from '../components/graph/NetworkGraph';
import { getGraph, getNodeById } from '../utils/api';
import { NODE_COLORS, getRiskLevel } from '../utils/constants';

// ─── Entity type filter config ────────────────────────────────────────────────
const ENTITY_TYPES = [
  { key: 'customer',         label: 'Customer',        icon: User,         color: NODE_COLORS.customer },
  { key: 'device',           label: 'Device',          icon: Cpu,          color: NODE_COLORS.device },
  { key: 'dealer',           label: 'Dealer',          icon: Building2,    color: NODE_COLORS.dealer },
  { key: 'bank_account',     label: 'Bank Account',    icon: CreditCard,   color: NODE_COLORS.bank_account },
  { key: 'mobile',           label: 'Mobile',          icon: Smartphone,   color: NODE_COLORS.mobile },
  { key: 'location',         label: 'Location',        icon: MapPin,       color: NODE_COLORS.location },
  { key: 'guarantor',        label: 'Guarantor',       icon: Shield,       color: NODE_COLORS.guarantor },
  { key: 'loan_application', label: 'Loan App',        icon: CreditCard,   color: NODE_COLORS.loan_application },
];

const RISK_MAX = 100;

// ─── Risk badge helper ────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  const lvl = getRiskLevel(score ?? 0);
  return (
    <span style={{
      fontSize:      '11px',
      fontWeight:    700,
      color:         lvl.color,
      background:    `${lvl.color}20`,
      border:        `1px solid ${lvl.color}50`,
      borderRadius:  '6px',
      padding:       '2px 8px',
    }}>
      {lvl.label} {(score ?? 0).toFixed(1)}
    </span>
  );
}

export default function NetworkExplorer() {
  const [allNodes,       setAllNodes]       = useState([]);
  const [allEdges,       setAllEdges]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);

  // Filter state
  const [activeTypes,    setActiveTypes]    = useState(new Set(ENTITY_TYPES.map((t) => t.key)));
  const [riskRange,      setRiskRange]      = useState([0, 100]);

  // Selection state
  const [selectedId,     setSelectedId]     = useState(null);
  const [selectedNode,   setSelectedNode]   = useState(null);
  const [nodeDetail,     setNodeDetail]     = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);

  // ── Load graph ────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setError(null);
    getGraph()
      .then((data) => {
        setAllNodes(data.nodes ?? []);
        setAllEdges(data.edges ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Filter nodes / edges ──────────────────────────────────────────────────
  const { filteredNodes, filteredEdges } = useMemo(() => {
    const [minRisk, maxRisk] = riskRange;
    const fn = allNodes.filter((n) => {
      const typeMatch = activeTypes.has(n.type);
      const riskMatch = (n.risk_score ?? 0) >= minRisk && (n.risk_score ?? 0) <= maxRisk;
      return typeMatch && riskMatch;
    });
    const nodeSet = new Set(fn.map((n) => n.id));
    const fe = allEdges.filter((e) => nodeSet.has(e.from) && nodeSet.has(e.to));
    return { filteredNodes: fn, filteredEdges: fe };
  }, [allNodes, allEdges, activeTypes, riskRange]);

  // ── Node click → fetch detail ─────────────────────────────────────────────
  const handleNodeClick = useCallback(
    async (nodeId) => {
      if (nodeId === null) {
        setSelectedId(null);
        setSelectedNode(null);
        setNodeDetail(null);
        return;
      }
      setSelectedId(nodeId);
      const rawNode = allNodes.find((n) => n.id === nodeId);
      setSelectedNode(rawNode ?? null);

      setDetailLoading(true);
      try {
        const detail = await getNodeById(nodeId);
        setNodeDetail(detail);
      } catch (_) {
        setNodeDetail(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [allNodes],
  );

  // ── Toggle entity type filter ─────────────────────────────────────────────
  const toggleType = (key) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else { next.add(key); }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedId(null);
    setSelectedNode(null);
    setNodeDetail(null);
  };

  const nodeConnections = useMemo(() => {
    if (!selectedId) return [];
    return allEdges
      .filter((e) => e.from === selectedId || e.to === selectedId)
      .map((e) => {
        const peerId = e.from === selectedId ? e.to : e.from;
        const peer   = allNodes.find((n) => n.id === peerId);
        return { edge: e, peer };
      });
  }, [selectedId, allEdges, allNodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0' }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '12px',
          padding:       '0 0 16px 0',
          flexWrap:      'wrap',
          flexShrink:    0,
        }}
      >
        {/* Title */}
        <div style={{ marginRight: 'auto' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} color="#00d4ff" />
            Network Explorer
          </h1>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
            {filteredNodes.length.toLocaleString()} nodes · {filteredEdges.length.toLocaleString()} edges
            {allNodes.length !== filteredNodes.length && ` (filtered from ${allNodes.length.toLocaleString()})`}
          </p>
        </div>

        {/* Entity type toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={13} color="#64748b" />
          {ENTITY_TYPES.map(({ key, label, icon: Icon, color }) => {
            const active = activeTypes.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '5px',
                  padding:      '5px 10px',
                  borderRadius: '20px',
                  border:       `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                  background:   active ? `${color}20` : 'transparent',
                  color:        active ? color : '#475569',
                  fontSize:     '11px',
                  fontWeight:   600,
                  cursor:       'pointer',
                  transition:   'all 0.15s ease',
                }}
              >
                <Icon size={11} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Risk slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>Risk ≥</span>
          <input
            type="range"
            min={0}
            max={RISK_MAX}
            step={5}
            value={riskRange[0]}
            onChange={(e) => setRiskRange([Number(e.target.value), riskRange[1]])}
            style={{ flex: 1, accentColor: '#00d4ff' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#00d4ff', minWidth: '28px' }}>
            {riskRange[0]}
          </span>
        </div>
      </motion.div>

      {/* ── Graph + Sidebar ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: 0 }}>

        {/* Graph canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #1a1e3a', borderTop: '3px solid #00d4ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Loading graph…</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px', color: '#ef4444' }}>
              <AlertTriangle size={32} />
              <p style={{ fontSize: '13px' }}>{error}</p>
            </div>
          ) : (
            <NetworkGraph
              nodes={filteredNodes}
              edges={filteredEdges}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedId}
              height="100%"
              showLabels={filteredNodes.length <= 300}
            />
          )}

          {/* Hint overlay */}
          {!loading && !error && (
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', fontSize: '11px', color: '#334155', pointerEvents: 'none' }}>
              Click node to inspect · Double-click canvas to fit · Scroll to zoom
            </div>
          )}
        </motion.div>

        {/* Right sidebar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-card"
              style={{ width: '300px', flexShrink: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: NODE_COLORS[selectedNode.type] ?? '#94a3b8', marginBottom: '2px', textTransform: 'capitalize' }}>
                    {selectedNode.type?.replace('_', ' ') ?? 'Entity'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#e2e8f0', wordBreak: 'break-all' }}>
                    {selectedNode.label ?? selectedNode.id}
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Risk score */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: getRiskLevel(selectedNode.risk_score ?? 0).color }}>
                    {(selectedNode.risk_score ?? 0).toFixed(1)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <RiskBadge score={selectedNode.risk_score} />
                    <div style={{ marginTop: '6px', height: '4px', borderRadius: '2px', background: '#1a1e3a', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${selectedNode.risk_score ?? 0}%`, borderRadius: '2px', background: getRiskLevel(selectedNode.risk_score ?? 0).color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ID */}
              <div>
                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Entity ID</div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', wordBreak: 'break-all' }}>{selectedNode.id}</div>
              </div>

              {/* API detail attributes */}
              {detailLoading && (
                <div style={{ fontSize: '12px', color: '#475569' }}>Loading detail…</div>
              )}
              {nodeDetail && !detailLoading && nodeDetail.attributes && (
                <div>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Attributes</div>
                  {Object.entries(nodeDetail.attributes).slice(0, 8).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
                        {String(v).length > 18 ? String(v).slice(0, 18) + '…' : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connections */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Connections ({nodeConnections.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                  {nodeConnections.length === 0 && (
                    <div style={{ fontSize: '12px', color: '#334155' }}>No visible connections in current filter.</div>
                  )}
                  {nodeConnections.map(({ edge, peer }, i) => (
                    <div
                      key={edge.id ?? i}
                      onClick={() => peer && handleNodeClick(peer.id)}
                      style={{
                        display:      'flex',
                        alignItems:   'center',
                        gap:          '8px',
                        padding:      '7px 10px',
                        borderRadius: '8px',
                        background:   'rgba(255,255,255,0.03)',
                        border:       '1px solid rgba(255,255,255,0.05)',
                        cursor:       peer ? 'pointer' : 'default',
                        transition:   'border-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: peer ? (NODE_COLORS[peer.type] ?? '#94a3b8') : '#334155' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {peer?.label ?? peer?.id ?? '(hidden)'}
                        </div>
                        <div style={{ fontSize: '10px', color: '#475569', textTransform: 'capitalize' }}>
                          {peer?.type?.replace('_', ' ')} {edge.label ? `· ${edge.label}` : ''}
                        </div>
                      </div>
                      {peer && <ChevronRight size={12} color="#334155" />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
