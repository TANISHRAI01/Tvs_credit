import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Zap,
  TrendingUp,
  AlertTriangle,
  Activity,
  RefreshCw,
  ArrowUpRight,
  Search,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  Share2,
  FileCheck2,
  Clock,
} from 'lucide-react';

import AlertFeed from '../components/dashboard/AlertFeed';
import RiskDistribution from '../components/dashboard/RiskDistribution';
import { getGraphStats, getAlerts, getEmergingEcosystems } from '../utils/api';

// ─── Radial Speedometer Dial (Matches Reference Conversion Dial) ───────────────
function RadialThreatDial({ score = 25.15, suspiciousCount = 19, totalRings = 40 }) {
  const percentage = Math.min(Math.max(score, 0), 100);
  const radius = 95;
  const strokeWidth = 14;
  const cx = 130;
  const cy = 130;
  
  // 240-degree arc from 150deg to 390deg
  const startAngle = 140;
  const endAngle = 400;
  const angleRange = endAngle - startAngle;
  const totalCircumference = (angleRange / 360) * (2 * Math.PI * radius);
  const strokeDashoffset = totalCircumference - (percentage / 100) * totalCircumference;

  // Generate radial tick marks
  const ticks = [];
  const totalTicks = 24;
  for (let i = 0; i <= totalTicks; i++) {
    const tickAngle = startAngle + (i / totalTicks) * angleRange;
    const rad = (tickAngle * Math.PI) / 180;
    const innerR = radius - 16;
    const outerR = radius - 8;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    const isActive = (i / totalTicks) * 100 <= percentage;
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'}
        strokeWidth={isActive ? 2 : 1.5}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="fintech-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
          SWARM THREAT INDEX
        </span>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '2px 8px', borderRadius: '12px' }}>
          MODERATE
        </span>
      </div>

      <div style={{ position: 'relative', width: '260px', height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="260" height="210" viewBox="0 0 260 210">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="gaugeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Tick marks */}
          {ticks}

          {/* Background Track */}
          <path
            d="M 57 191 A 95 95 0 1 1 203 191"
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Gradient Arc */}
          <path
            d="M 57 191 A 95 95 0 1 1 203 191"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={totalCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
          />
        </svg>

        {/* Center Text */}
        <div style={{ position: 'absolute', top: '75px', textAlign: 'center' }}>
          <div style={{ fontSize: '38px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
            {score.toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} color="#10b981" />
            <span>{suspiciousCount} suspicious out of {totalRings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Micro Bar Chart Component ──────────────────────────────────────────
function MiniBarChart() {
  const bars = [25, 45, 65, 30, 80, 55, 90, 70, 85, 100, 60, 75];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', marginTop: '12px' }}>
      {bars.map((h, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${h}%`,
            borderRadius: '2px',
            background: i === bars.length - 3 ? '#e11d48' : 'rgba(255, 255, 255, 0.15)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Mini Sparkline Curve Component ───────────────────────────────────────────
function MiniSparkline() {
  return (
    <div style={{ height: '40px', marginTop: '12px', position: 'relative' }}>
      <svg width="100%" height="40" viewBox="0 0 120 40" preserveAspectRatio="none">
        <path
          d="M 0 30 Q 20 10, 40 25 T 80 15 T 120 5"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 0 30 Q 20 10, 40 25 T 80 15 T 120 5 L 120 40 L 0 40 Z"
          fill="rgba(16, 185, 129, 0.12)"
        />
      </svg>
    </div>
  );
}

export default function CommandCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [ecosystems, setEcosystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, alertsData, ecoData] = await Promise.allSettled([
        getGraphStats(),
        getAlerts(),
        getEmergingEcosystems(),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (alertsData.status === 'fulfilled') setAlerts(alertsData.value);
      if (ecoData.status === 'fulfilled') setEcosystems(ecoData.value);

      if (statsData.status === 'rejected') {
        setError('Could not reach backend API at port 8000.');
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const avgRisk = stats?.avg_risk_score ?? 25.15;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Top Hero Row: Hero Crimson Card + Radial Threat Dial + Micro Metrics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '20px' }}>
        
        {/* 1. Hero Crimson Card (Matches Reference Top Red Card) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-crimson-card"
          style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '260px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' }}>
                TOTAL PORTFOLIO AT RISK
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', background: 'rgba(255, 255, 255, 0.15)', padding: '3px 10px', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
                40 RINGS
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '42px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', letterSpacing: '-1px' }}>
                ₹4,821.50
              </span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.8)' }}>
                LAKHS
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={13} />
              <span>≈ ₹48.21 Cr Total Detected Exposure Across 8 Node Types</span>
            </div>
          </div>

          {/* Sub Action Pills (Matches Reference Deposit / Withdraw / Swap buttons) */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button
              onClick={() => navigate('/network')}
              className="action-pill-btn"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ArrowUpRight size={15} color="#00d4ff" />
              <span>Scan Graph</span>
            </button>
            <button
              onClick={() => navigate('/fraud-rings')}
              className="action-pill-btn"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ShieldAlert size={15} color="#e11d48" />
              <span>Isolate Rings</span>
            </button>
            <button
              onClick={() => navigate('/simulator')}
              className="action-pill-btn action-pill-primary"
              style={{ flex: 1.2, justifyContent: 'center' }}
            >
              <Zap size={15} />
              <span>Simulate</span>
            </button>
          </div>
        </motion.div>

        {/* 2. Radial Threat Dial (Matches Reference Conversion Speedometer) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <RadialThreatDial score={avgRisk} suspiciousCount={stats?.suspicious_networks ?? 19} totalRings={40} />
        </motion.div>

        {/* 3. Dual Micro-Chart Metric Cards (Matches Reference Payments Created & Total Amount) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 1: Applications Processed */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="fintech-card"
            style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  APPLICATIONS PROCESSED
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', marginTop: '2px' }}>
                  {stats?.total_applications?.toLocaleString() ?? '5,049'}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Today
              </span>
            </div>
            <MiniBarChart />
          </motion.div>

          {/* Card 2: High-Risk Entities */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="fintech-card"
            style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  HIGH-RISK ENTITIES
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f43f5e', marginTop: '2px' }}>
                  {stats?.high_risk_count?.toLocaleString() ?? '1,296'}
                </div>
              </div>
              <span style={{ fontSize: '10px', color: '#f43f5e', background: 'rgba(244, 63, 94, 0.12)', padding: '2px 6px', borderRadius: '6px', fontWeight: 700 }}>
                ▲ Flagged
              </span>
            </div>
            <MiniSparkline />
          </motion.div>

        </div>
      </div>

      {/* ── Middle Row: Quick Action Hub Cards (Matches Reference Actions Row) ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingLeft: '4px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            INTELLIGENCE MODULES
          </div>
          <button
            onClick={() => navigate('/network')}
            style={{ background: 'none', border: 'none', color: '#00d4ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>See All Modules</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          
          {/* Card 1: Fraud Rings */}
          <div
            onClick={() => navigate('/fraud-rings')}
            className="fintech-card"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #e11d48, #be123c)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(225, 29, 72, 0.3)' }}>
              <ShieldAlert size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Fraud Rings</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>40 Louvain detected clusters</div>
            </div>
            <div style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 600, marginTop: 'auto' }}>
              ₹443.4L Max Exposure →
            </div>
          </div>

          {/* Card 2: Emerging Threats */}
          <div
            onClick={() => navigate('/ecosystems')}
            className="fintech-card"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)' }}>
              <TrendingUp size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Emerging Ecosystems</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>1 Forming network detected</div>
            </div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: 'auto' }}>
              12 Days Velocity →
            </div>
          </div>

          {/* Card 3: What-If Simulator */}
          <div
            onClick={() => navigate('/simulator')}
            className="fintech-card"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)' }}>
              <Zap size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>What-If Simulator</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Network delta simulation</div>
            </div>
            <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600, marginTop: 'auto' }}>
              Interactive Sandbox →
            </div>
          </div>

          {/* Card 4: Network Explorer */}
          <div
            onClick={() => navigate('/network')}
            className="fintech-card"
            style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #00d4ff, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)' }}>
              <Layers size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Network Explorer</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>18,095 living Digital Twin nodes</div>
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600, marginTop: 'auto' }}>
              Explore Graph →
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Section: Risk Distribution Chart + Live Alert Stream ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        
        {/* Risk Distribution Chart */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                Risk Score Distribution Histogram
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Entity risk scoring across 18,095 nodes in the Digital Twin
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Safe', color: '#10b981' },
                { label: 'Medium', color: '#f59e0b' },
                { label: 'Critical', color: '#ef4444' },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <RiskDistribution stats={stats} loading={loading} />
        </div>

        {/* Live Alerts Stream */}
        <div className="fintech-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                Real-Time Alert Feed
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                {alerts.length} prioritized intelligence alerts
              </p>
            </div>
            <button
              onClick={fetchAll}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            >
              <RefreshCw size={14} style={{ animation: loading ? 'spin 0.75s linear infinite' : 'none' }} />
            </button>
          </div>

          <AlertFeed alerts={alerts} loading={loading} maxHeight="340px" />
        </div>

      </div>

    </div>
  );
}
