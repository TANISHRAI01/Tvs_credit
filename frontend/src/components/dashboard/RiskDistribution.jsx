import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, ReferenceLine,
} from 'recharts';

const BINS = [
  { range: '0–10',  min: 0,  max: 10,  color: '#10b981' },
  { range: '10–20', min: 10, max: 20,  color: '#10b981' },
  { range: '20–30', min: 20, max: 30,  color: '#34d399' },
  { range: '30–40', min: 30, max: 40,  color: '#fbbf24' },
  { range: '40–50', min: 40, max: 50,  color: '#f59e0b' },
  { range: '50–60', min: 50, max: 60,  color: '#f97316' },
  { range: '60–70', min: 60, max: 70,  color: '#ef4444' },
  { range: '70–80', min: 70, max: 80,  color: '#dc2626' },
  { range: '80–90', min: 80, max: 90,  color: '#b91c1c' },
  { range: '90–100',min: 90, max: 101, color: '#7f1d1d' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#1a1e3a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        color: '#e2e8f0',
      }}
    >
      <div style={{ color: '#64748b', marginBottom: '2px' }}>Risk {label}</div>
      <div style={{ fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
        {payload[0].value.toLocaleString()} nodes
      </div>
    </div>
  );
};

/**
 * RiskDistribution — histogram of node risk scores using Recharts.
 *
 * Props:
 *   nodes   {GraphNode[]}  — from GET /api/graph (filtered subset preferred)
 *   stats   {GraphStats}   — from GET /api/graph/stats (used when nodes not provided)
 *   loading {bool}
 */
export default function RiskDistribution({ nodes = [], stats = null, loading = false }) {
  const data = useMemo(() => {
    if (nodes.length) {
      // Build histogram from node risk_score values
      return BINS.map(bin => ({
        ...bin,
        count: nodes.filter(n => {
          const s = n.risk_score ?? 0;
          return s >= bin.min && s < bin.max;
        }).length,
      }));
    }

    // Fallback: use stats to approximate distribution
    if (stats) {
      const total = stats.total_applications ?? 0;
      const high  = stats.high_risk_count ?? 0;
      const susp  = stats.suspicious_networks ?? 0;
      const safe  = Math.max(total - high - susp, 0);
      return BINS.map((bin, i) => ({
        ...bin,
        count: i < 3 ? Math.round(safe * (0.5 - i * 0.1))
              : i < 6 ? Math.round(susp * 0.3)
              : Math.round(high * (0.4 - (i - 6) * 0.08)),
      }));
    }

    return BINS.map(bin => ({ ...bin, count: 0 }));
  }, [nodes, stats]);

  if (loading) {
    return (
      <div style={{ height: '180px', borderRadius: '10px', background: 'linear-gradient(90deg, #1a1e3a 25%, #242848 50%, #1a1e3a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="range"
          tick={{ fontSize: 9, fill: '#475569' }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tick={{ fontSize: 9, fill: '#475569' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <ReferenceLine x="60–70" stroke="#ef444422" strokeDasharray="4 4" />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
