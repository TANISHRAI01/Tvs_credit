import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, SortAsc, SortDesc, Search,
  LayoutGrid, List, AlertTriangle, RefreshCw,
} from 'lucide-react';
import FraudRingCard from '../components/fraud/FraudRingCard';
import { getFraudRings } from '../utils/api';

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'risk_desc',    label: 'Risk ↓' },
  { value: 'risk_asc',     label: 'Risk ↑' },
  { value: 'size_desc',    label: 'Size ↓' },
  { value: 'size_asc',     label: 'Size ↑' },
  { value: 'exposure_desc', label: 'Exposure ↓' },
];

function sortRings(rings, sortBy) {
  const sorted = [...rings];
  switch (sortBy) {
    case 'risk_asc':     return sorted.sort((a, b) => (a.risk_score ?? 0) - (b.risk_score ?? 0));
    case 'risk_desc':    return sorted.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
    case 'size_asc':     return sorted.sort((a, b) => (a.node_count ?? 0) - (b.node_count ?? 0));
    case 'size_desc':    return sorted.sort((a, b) => (b.node_count ?? 0) - (a.node_count ?? 0));
    case 'exposure_desc': return sorted.sort((a, b) => ((b.exposure_lakhs ?? b.potential_exposure_lakhs ?? 0) - (a.exposure_lakhs ?? a.potential_exposure_lakhs ?? 0)));
    default:             return sorted;
  }
}

export default function FraudRings() {
  const [rings,   setRings]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Filters
  const [search,    setSearch]    = useState('');
  const [sortBy,    setSortBy]    = useState('risk_desc');
  const [sizeRange, setSizeRange] = useState([0, 9999]);
  const [viewMode,  setViewMode]  = useState('grid'); // 'grid' | 'list'

  const fetchRings = () => {
    setLoading(true);
    setError(null);
    getFraudRings()
      .then((data) => setRings(Array.isArray(data) ? data : (data.rings ?? [])))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRings(); }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    rings.length,
    critical: rings.filter((r) => (r.risk_score ?? 0) >= 80).length,
    high:     rings.filter((r) => (r.risk_score ?? 0) >= 60 && (r.risk_score ?? 0) < 80).length,
    exposure: rings.reduce((s, r) => s + (r.exposure_lakhs ?? r.potential_exposure_lakhs ?? 0), 0),
  }), [rings]);

  // ── Filtered + sorted list ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let filtered = rings.filter((r) => {
      const q     = search.toLowerCase();
      const match = !q || (r.id?.toLowerCase?.().includes(q)) || (r.name?.toLowerCase?.().includes(q));
      const size  = r.node_count ?? 0;
      return match && size >= sizeRange[0];
    });
    return sortRings(filtered, sortBy);
  }, [rings, search, sortBy, sizeRange]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}
      >
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldAlert size={20} color="#8b5cf6" />
            Fraud Rings
          </h1>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            {stats.total} rings detected · {stats.critical} critical · ₹{stats.exposure.toFixed(1)}L total exposure
          </p>
        </div>
        <button
          onClick={fetchRings}
          disabled={loading}
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '6px',
            padding:     '8px 14px',
            borderRadius: '8px',
            background:  'rgba(139,92,246,0.1)',
            border:      '1px solid rgba(139,92,246,0.25)',
            color:       '#8b5cf6',
            fontSize:    '12px',
            fontWeight:  600,
            cursor:      loading ? 'not-allowed' : 'pointer',
            opacity:     loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 0.75s linear infinite' : 'none' }} />
          Refresh
        </button>
      </motion.div>

      {/* ── Summary Stat Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}
      >
        {[
          { label: 'Total Rings',     value: stats.total,                             color: '#8b5cf6' },
          { label: 'Critical',        value: stats.critical,                          color: '#dc2626' },
          { label: 'High Risk',       value: stats.high,                              color: '#ef4444' },
          { label: 'Total Exposure',  value: `₹${stats.exposure.toFixed(1)}L`,       color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color }}>{value}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Filter / Sort Bar ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            type="text"
            placeholder="Search rings…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width:        '100%',
              padding:      '8px 10px 8px 32px',
              borderRadius: '8px',
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid rgba(255,255,255,0.08)',
              color:        '#e2e8f0',
              fontSize:     '13px',
              outline:      'none',
            }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding:      '8px 12px',
            borderRadius: '8px',
            background:   'rgba(255,255,255,0.04)',
            border:       '1px solid rgba(255,255,255,0.08)',
            color:        '#e2e8f0',
            fontSize:     '13px',
            outline:      'none',
            cursor:       'pointer',
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} style={{ background: '#1a1e3a' }}>{o.label}</option>
          ))}
        </select>

        {/* Min size filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>Min nodes</span>
          <input
            type="range" min={0} max={50} step={1}
            value={sizeRange[0]}
            onChange={(e) => setSizeRange([Number(e.target.value), sizeRange[1]])}
            style={{ width: '80px', accentColor: '#8b5cf6' }}
          />
          <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#8b5cf6', minWidth: '20px' }}>{sizeRange[0]}</span>
        </div>

        {/* Count */}
        <span style={{ fontSize: '12px', color: '#334155', marginLeft: 'auto' }}>
          {displayed.length} of {rings.length}
        </span>

        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[['grid', LayoutGrid], ['list', List]].map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding:      '7px',
                borderRadius: '7px',
                border:       `1px solid ${viewMode === mode ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                background:   viewMode === mode ? 'rgba(139,92,246,0.15)' : 'transparent',
                color:        viewMode === mode ? '#8b5cf6' : '#475569',
                cursor:       'pointer',
                display:      'flex',
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px', height: '200px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={skel(62, 62, '50%')} />
                <div style={{ flex: 1 }}>
                  <div style={skel('60%', 10)} />
                  <div style={{ ...skel('80%', 14), marginTop: '6px' }} />
                </div>
              </div>
              <div style={skel('100%', 10)} />
              <div style={{ ...skel('100%', 10), marginTop: '6px' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Cards ── */}
      {!loading && (
        <div style={{
          display:               'grid',
          gridTemplateColumns:   viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
          gap:                   viewMode === 'grid' ? '16px' : '10px',
        }}>
          {displayed.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: '#334155', fontSize: '14px' }}>
              No fraud rings match your filters.
            </div>
          ) : (
            displayed.map((ring, i) => (
              <FraudRingCard key={ring.id} ring={ring} index={i} />
            ))
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function skel(width, height, borderRadius = '6px') {
  return {
    width:           typeof width === 'number' ? `${width}px` : width,
    height:          typeof height === 'number' ? `${height}px` : height,
    borderRadius,
    background:      'linear-gradient(90deg, #1a1e3a 25%, #242848 50%, #1a1e3a 75%)',
    backgroundSize:  '200% 100%',
    animation:       'shimmer 1.4s infinite',
  };
}
