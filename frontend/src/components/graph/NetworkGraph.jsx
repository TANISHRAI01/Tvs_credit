import React, { useEffect, useRef, useCallback } from 'react';
import { Network } from 'vis-network/standalone';
import { NODE_COLORS } from '../../utils/constants';

// ─── Entity type → vis-network shape ─────────────────────────────────────────
const NODE_SHAPES = {
  customer:         'dot',
  device:           'square',
  dealer:           'triangle',
  bank_account:     'diamond',
  mobile:           'dot',
  location:         'star',
  guarantor:        'dot',
  loan_application: 'dot',
};

/** Returns a vis-network node color block based on entity type and risk score */
function buildNodeColor(type, risk) {
  const r = risk ?? 0;
  const base   = NODE_COLORS[type] ?? '#94a3b8';
  const border  = r >= 80 ? '#dc2626' : r >= 50 ? '#f59e0b' : base;
  const hilight = r >= 80 ? '#ff4444' : base;
  return {
    background: base,
    border,
    highlight: { background: hilight, border: '#ffffff' },
    hover:      { background: base,    border: '#ffffff' },
  };
}

/** Map risk score (0-100) -> node pixel radius (8-36) */
function riskToSize(risk) {
  return 8 + ((risk ?? 0) / 100) * 28;
}

/**
 * NetworkGraph - vis-network force-directed graph
 *
 * Props:
 *   nodes          {Array}   - raw node objects from API
 *   edges          {Array}   - raw edge objects from API
 *   onNodeClick    {fn}      - called with node id (or null) on click
 *   selectedNodeId {any}     - id of currently selected node
 *   height         {string}  - CSS height, default '100%'
 *   showLabels     {bool}    - show node labels, default true
 *   physicsEnabled {bool}    - enable physics simulation, default true
 */
export default function NetworkGraph({
  nodes = [],
  edges = [],
  onNodeClick,
  selectedNodeId = null,
  height = '100%',
  showLabels = true,
  physicsEnabled = true,
}) {
  const containerRef = useRef(null);
  const networkRef   = useRef(null);

  // Build vis-network nodes array
  const buildVisNodes = useCallback(
    (rawNodes) =>
      rawNodes.map((n) => {
        // vis-network renders HTML tooltips only when `title` is a DOM element
        const tip = document.createElement('div');
        tip.style.cssText = 'font-family:Inter,sans-serif;font-size:12px;padding:8px 12px;background:#111111;border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#f0f0f0;min-width:150px;line-height:1.6;box-shadow:0 8px 24px rgba(0,0,0,0.5)';
        const riskColor = (n.risk_score ?? 0) >= 70 ? '#e11d48' : (n.risk_score ?? 0) >= 40 ? '#f59e0b' : '#22c55e';
        tip.innerHTML = `<b style="color:${NODE_COLORS[n.type] ?? '#94a3b8'}">${n.label ?? n.id}</b><br/><span style="color:#606060">Type:</span> ${n.type ?? 'unknown'}<br/><span style="color:#606060">Risk:</span> <span style="color:${riskColor};font-weight:700">${(n.risk_score ?? 0).toFixed(1)}</span>`;

        return {
          id:    n.id,
          label: showLabels ? (n.label ?? String(n.id ?? '')) : '',
          title: tip,
          size:  riskToSize(n.risk_score),
          shape: NODE_SHAPES[n.type] ?? 'dot',
          color: buildNodeColor(n.type, n.risk_score),
          font: {
            color:       '#f0f0f0',
            size:        10,
            face:        'Inter, sans-serif',
            strokeWidth: 2,
            strokeColor: '#080808',
          },
          _data: n,
        };
      }),
    [showLabels],
  );

  // Build vis-network edges array
  const buildVisEdges = useCallback(
    (rawEdges) =>
      rawEdges.map((e) => ({
        id:    e.id ?? `${e.from}->${e.to}`,
        from:  e.from,
        to:    e.to,
        label: e.label ?? '',
        width: e.weight ? Math.max(1, Math.min(e.weight * 2, 5)) : 1,
        color: {
          color:     'rgba(255,255,255,0.08)',
          highlight: '#e11d48',
          hover:     '#a78bfa',
        },
        font: {
          color: '#404040',
          size:  9,
          face:  'Inter, sans-serif',
          align: 'middle',
        },
        smooth:  { type: 'continuous', roundness: 0.2 },
        arrows:  { to: { enabled: false } },
        dashes:  e.suspicious ? [6, 4] : false,
      })),
    [],
  );

  // ── Init / re-init the network whenever data changes ──────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    const network = new Network(
      containerRef.current,
      { nodes: buildVisNodes(nodes), edges: buildVisEdges(edges) },
      {
        autoResize: true,
        height:     '100%',
        width:      '100%',
        physics: {
          enabled: physicsEnabled,
          forceAtlas2Based: {
            gravitationalConstant: -80,
            centralGravity:         0.01,
            springLength:           100,
            springConstant:         0.04,
            damping:                0.4,
          },
          solver:     'forceAtlas2Based',
          maxVelocity: 50,
          stabilization: {
            enabled:        true,
            iterations:     200,
            updateInterval: 50,
            fit:            true,
          },
          adaptiveTimestep: true,
        },
        interaction: {
          hover:             true,
          tooltipDelay:      120,
          zoomView:          true,
          dragView:          true,
          multiselect:       false,
          keyboard:          { enabled: false },
          navigationButtons: false,
          hideEdgesOnDrag:   true,
          hideNodesOnDrag:   false,
        },
        nodes: {
          borderWidth:         2,
          borderWidthSelected: 3,
          scaling:             { min: 8, max: 36 },
        },
        edges: {
          chosen: true,
          scaling: { min: 1, max: 5 },
        },
      },
    );

    networkRef.current = network;

    // Click handler
    network.on('click', (params) => {
      onNodeClick?.(params.nodes.length > 0 ? params.nodes[0] : null);
    });

    // Double-click blank space -> fit all
    network.on('doubleClick', (params) => {
      if (params.nodes.length === 0) {
        network.fit({ animation: { duration: 600, easingFunction: 'easeInOutQuad' } });
      }
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, physicsEnabled]);

  // ── Sync selected node highlight ──────────────────────────────────────────
  useEffect(() => {
    const net = networkRef.current;
    if (!net) return;
    if (selectedNodeId !== null && selectedNodeId !== undefined) {
      net.selectNodes([selectedNodeId], false);
      try {
        net.focus(selectedNodeId, {
          scale:     1.2,
          animation: { duration: 400, easingFunction: 'easeInOutQuad' },
        });
      } catch (_) { /* node might not exist yet */ }
    } else {
      net.unselectAll();
    }
  }, [selectedNodeId]);

  return (
    <div
      ref={containerRef}
      style={{
        height:       height || '100%',
        minHeight:    '480px',
        width:        '100%',
        background:   'transparent',
        borderRadius: '12px',
        overflow:     'hidden',
        position:     'relative',
      }}
    />
  );
}
