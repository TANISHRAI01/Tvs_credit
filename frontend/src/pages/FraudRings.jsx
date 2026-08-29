import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert, SortAsc, SortDesc, Search,
  LayoutGrid, List, AlertTriangle, RefreshCw, Layers, IndianRupee,
} from 'lucide-react';
import FraudRingCard from '../components/fraud/FraudRingCard';
import { getFraudRings } from '../utils/api';

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'risk_desc',     label: 'Risk High to Low' },
  { value: 'risk_asc',      label: 'Risk Low to High' },
  { value: 'size_desc',     label: 'Size Largest' },
  { value: 'size_asc',      label: 'Size Smallest' },
  { value: 'exposure_desc', label: 'Highest Exposure' },
];

function sortRings(rings, sortBy) {
  const sorted = [...rings];
  switch (sortBy) {
    case 'risk_asc':      return sorted.sort((a, b) => (a.risk_score ?? 0) - (b.risk_score ?? 0));
    case 'risk_desc':     return sorted.sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
    case 'size_asc':      return sorted.sort((a, b) => (a.node_count ?? 0) - (b.node_count ?? 0));
    case 'size_desc':     return sorted.sort((a, b) => (b.node_count ?? 0) - (a.node_count ?? 0));
    case 'exposure_desc': return sorted.sort((a, b) => ((b.exposure_lakhs ?? b.potential_exposure_lakhs ?? 0) - (a.exposure_lakhs ?? a.potential_exposure_lakhs ?? 0)));
    default:              return sorted;
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
    high:     rings.filter((r) => (r.risk_score ?? 0) >= 50 && (r.risk_score ?? 0) < 80).length,
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
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Page Header Banner with Metrics ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inv-card"
        style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e11d48, #9f1239)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(225, 29, 72, 0.4)',
              }}
            >
              <ShieldAlert size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              Detected Fraud Rings
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Louvain community detection clusters & systemic dealer collusion networks across 18,095 living entities.
          </p>
        </div>

        {/* Quick KPI Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 18px', borderRadius: '14px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Total Rings</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>{stats.total}</div>
          </div>

          <div style={{ padding: '10px 18px', borderRadius: '14px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#f43f5e', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>High Risk</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#f43f5e', fontFamily: 'JetBrains Mono, monospace' }}>{stats.high + stats.critical}</div>
          </div>

          <div style={{ padding: '10px 18px', borderRadius: '14px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700 }}>Total Exposure</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#818cf8', fontFamily: 'JetBrains Mono, monospace' }}>₹{stats.exposure.toFixed(1)}L</div>
          </div>

          <button
            onClick={fetchRings}
            disabled={loading}
            className="btn-outline"
            style={{ padding: '10px 16px', height: '44px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Search & Filter Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        {/* Search capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(18, 18, 26, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            padding: '9px 20px',
            width: '360px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Search size={15} color="#71717a" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ring ID, dealer or entity..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '13px',
              width: '100%',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}
          />
        </div>

        {/* Sort Select Capsule */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(18, 18, 26, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              padding: '6px 14px',
            }}
          >
            <span style={{ fontSize: '11px', color: '#71717a', fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} style={{ background: '#0a0a0e', color: '#fff' }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{ padding: '14px 20px', borderRadius: '14px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', color: '#f43f5e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Ring Grid List ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="inv-card" style={{ height: '220px', opacity: 0.4 }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="inv-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <ShieldAlert size={36} color="#71717a" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>No Fraud Rings Match Filter</div>
          <p style={{ fontSize: '13px', color: '#71717a' }}>Try clearing the search query or adjusting filter parameters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {displayed.map((ring, idx) => (
            <FraudRingCard key={ring.id} ring={ring} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
