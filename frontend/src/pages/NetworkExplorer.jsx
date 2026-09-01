import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Filter, X, ZoomIn, ZoomOut, Maximize2,
  AlertTriangle, Cpu, User, Building2, CreditCard,
  Smartphone, MapPin, Shield, ChevronRight, RefreshCw,
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
    <span
      style={{
        fontSize:      '11px',
        fontWeight:    700,
        color:         lvl.color,
        background:    `${lvl.color}15`,
        border:        `1px solid ${lvl.color}40`,
        borderRadius:  '999px',
        padding:       '3px 10px',
        fontFamily:    'JetBrains Mono, monospace',
      }}
    >
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
  const [sortOrder,      setSortOrder]      = useState('mixed'); // 'mixed' = stratified, 'desc' = high risk first, 'asc' = low risk first

  // Selection state
  const [selectedId,     setSelectedId]     = useState(null);
  const [selectedNode,   setSelectedNode]   = useState(null);
  const [nodeDetail,     setNodeDetail]     = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);

  // Debounce timer ref for server-side fetches
  const fetchTimerRef = React.useRef(null);

  // ── Load graph — fetches from backend with min_risk + node_types ────────
  const fetchGraphData = useCallback((overrideRisk, overrideTypes) => {
    setLoading(true);
    setError(null);

    const minRisk = overrideRisk ?? riskRange[0];
    const types   = overrideTypes ?? activeTypes;

    const params = { limit: 300, sort_order: sortOrder, min_risk: minRisk };

    // Build node_types filter
    const allTypesSelected = types.size === ENTITY_TYPES.length;
    if (!allTypesSelected && types.size > 0) {
      params.node_types = [...types].join(',');
    }

    // When viewing low-risk first, restrict to interesting entity types
    if (sortOrder === 'asc' && allTypesSelected) {
      params.node_types = 'customer,dealer,device,guarantor,loan_application';
    }

    getGraph(params)
      .then((data) => {
        setAllNodes(data.nodes ?? []);
        setAllEdges(data.edges ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sortOrder, riskRange, activeTypes]);

  // Initial fetch + re-fetch when sort order changes
  useEffect(() => { fetchGraphData(); }, [sortOrder]);

  // ── Debounced re-fetch when risk slider or type toggles change ──────────
  useEffect(() => {
    // Skip the initial render (handled above)
    if (fetchTimerRef.current === undefined) {
      fetchTimerRef.current = null;
      return;
    }
    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchGraphData(riskRange[0], activeTypes);
    }, 400); // 400ms debounce so slider feels smooth

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [riskRange[0], activeTypes]);

  // ── Client-side filter (fast local filtering within fetched data) ───────
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>

      {/* ── Top Bar with Capsule Controls ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="inv-card"
        style={{
          display:       'flex',
          alignItems:    'center',
          gap:           '16px',
          padding:       '16px 24px',
          flexWrap:      'wrap',
          flexShrink:    0,
        }}
      >
        {/* Title */}
        <div style={{ marginRight: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} color="#818cf8" />
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
              Network Explorer
            </h1>
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>
            {filteredNodes.length.toLocaleString()} nodes · {filteredEdges.length.toLocaleString()} edges
            {allNodes.length !== filteredNodes.length && ` (of ${allNodes.length.toLocaleString()})`}
          </p>
        </div>

        {/* Entity type capsule toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {ENTITY_TYPES.map(({ key, label, icon: Icon, color }) => {
            const active = activeTypes.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleType(key)}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '6px',
                  padding:      '6px 12px',
                  borderRadius: '999px',
                  border:       `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
                  background:   active ? `${color}18` : 'rgba(18, 18, 26, 0.6)',
                  color:        active ? '#ffffff' : '#71717a',
                  fontSize:     '11px',
                  fontWeight:   600,
                  cursor:       'pointer',
                  boxShadow:    active ? `0 0 10px ${color}30` : 'none',
                  transition:   'all 0.2s ease',
                }}
              >
                <Icon size={12} color={active ? color : '#71717a'} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Risk slider capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(18, 18, 26, 0.7)',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600, whiteSpace: 'nowrap' }}>Risk ≥</span>
          <input
            type="range"
            min={0}
            max={RISK_MAX}
            step={5}
            value={riskRange[0]}
            onChange={(e) => setRiskRange([Number(e.target.value), riskRange[1]])}
            style={{ width: '100px', accentColor: '#6366f1' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#818cf8', fontWeight: 700, minWidth: '24px' }}>
            {riskRange[0]}
          </span>
        </div>

        {/* Sort order toggle capsule */}
        <button
          onClick={() => setSortOrder((prev) => prev === 'mixed' ? 'desc' : prev === 'desc' ? 'asc' : 'mixed')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(129, 140, 248, 0.35)',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#c7d2fe',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {sortOrder === 'mixed' ? '◆ Mixed View' : sortOrder === 'desc' ? '↓ High Risk First' : '↑ Low Risk First'}
        </button>

        {/* Refresh button */}
        <button
          onClick={fetchGraphData}
          title="Refresh graph (shows newly added applications)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(18, 18, 26, 0.6)',
            color: '#94a3b8',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </motion.div>

      {/* ── Graph Canvas + Side Inspector ── */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: '560px' }}>

        {/* Graph canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inv-card"
          style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}
        >
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '12px', color: '#64748b' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Rendering Living Graph Twin…</span>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '10px', color: '#f43f5e' }}>
              <AlertTriangle size={36} />
              <p style={{ fontSize: '14px' }}>{error}</p>
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

          {/* Canvas Hint */}
          {!loading && !error && (
            <div style={{ position: 'absolute', bottom: '14px', left: '16px', fontSize: '11px', color: '#64748b', pointerEvents: 'none', fontFamily: 'JetBrains Mono, monospace' }}>
              Click node to isolate • Drag to pan • Scroll to zoom
            </div>
          )}
        </motion.div>

        {/* Right Node Inspector */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="inv-card"
              style={{ width: '320px', flexShrink: 0, padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: NODE_COLORS[selectedNode.type] ?? '#94a3b8', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    {selectedNode.type?.replace('_', ' ') ?? 'Entity'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', wordBreak: 'break-all', fontFamily: 'Outfit, sans-serif' }}>
                    {selectedNode.label ?? selectedNode.id}
                  </div>
                </div>
                <button
                  onClick={clearSelection}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Risk score gauge card */}
              <div style={{ padding: '14px 16px', borderRadius: '14px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ fontSize: '10px', color: '#71717a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Anomaly Risk Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: getRiskLevel(selectedNode.risk_score ?? 0).color, lineHeight: 1 }}>
                    {(selectedNode.risk_score ?? 0).toFixed(1)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <RiskBadge score={selectedNode.risk_score} />
                    <div style={{ marginTop: '8px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${selectedNode.risk_score ?? 0}%`, borderRadius: '2px', background: getRiskLevel(selectedNode.risk_score ?? 0).color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ID */}
              <div>
                <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '4px' }}>System Entity ID</div>
                <div style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', wordBreak: 'break-all' }}>{selectedNode.id}</div>
              </div>

              {/* API detail attributes */}
              {detailLoading && (
                <div style={{ fontSize: '12px', color: '#71717a' }}>Querying intelligence ledger…</div>
              )}
              {nodeDetail && !detailLoading && nodeDetail.metadata && Object.keys(nodeDetail.metadata).length > 0 && (
                <div>
                  <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '8px' }}>Metadata Attributes</div>
                  {Object.entries(nodeDetail.metadata).slice(0, 8).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#71717a', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: '11px', color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
                        {String(v).length > 18 ? String(v).slice(0, 18) + '…' : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Connected Relationships — use real backend data when available */}
              <div style={{ flex: 1 }}>
                {(() => {
                  // Use real connections from the backend API (full graph) if available
                  const realConnections = nodeDetail?.connections ?? [];
                  const displayConnections = realConnections.length > 0 ? realConnections : nodeConnections.map(c => c.peer).filter(Boolean);
                  const totalCount = realConnections.length > 0 ? realConnections.length : nodeConnections.length;

                  return (
                    <>
                      <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '8px' }}>
                        Connected Relationships ({totalCount})
                        {realConnections.length > 0 && nodeConnections.length === 0 && (
                          <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '9px', marginLeft: '6px' }}>
                            (not in current view)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                        {totalCount === 0 && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>No connections found.</div>
                        )}
                        {displayConnections.slice(0, 20).map((conn, i) => {
                          const connId = conn.id ?? conn?.id;
                          const connLabel = conn.label ?? conn?.label ?? connId ?? '(unknown)';
                          const connType = conn.type ?? conn?.type ?? 'entity';
                          const connColor = NODE_COLORS[connType] ?? '#94a3b8';

                          return (
                            <div
                              key={connId ?? i}
                              onClick={() => connId && handleNodeClick(connId)}
                              style={{
                                display:      'flex',
                                alignItems:   'center',
                                gap:          '10px',
                                padding:      '8px 12px',
                                borderRadius: '10px',
                                background:   'rgba(18, 18, 26, 0.6)',
                                border:       '1px solid rgba(255, 255, 255, 0.05)',
                                cursor:       connId ? 'pointer' : 'default',
                                transition:   'border-color 0.15s ease, background 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                e.currentTarget.style.background = 'rgba(24, 24, 36, 0.8)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                e.currentTarget.style.background = 'rgba(18, 18, 26, 0.6)';
                              }}
                            >
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: connColor }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {connLabel}
                                </div>
                                <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'capitalize' }}>
                                  {connType.replace('_', ' ')} {conn.relationship ? `· ${conn.relationship.replace(/_/g, ' ')}` : ''}
                                </div>
                              </div>
                              <ChevronRight size={14} color="#71717a" />
                            </div>
                          );
                        })}
                        {displayConnections.length > 20 && (
                          <div style={{ fontSize: '11px', color: '#71717a', textAlign: 'center', padding: '4px' }}>
                            +{displayConnections.length - 20} more connections
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
