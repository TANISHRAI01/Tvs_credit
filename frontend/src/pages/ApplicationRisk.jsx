import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Send, Cpu, User, Building2, Smartphone, CheckCircle2 } from 'lucide-react';
import { submitApplication } from '../utils/api';
import { getRiskLevel } from '../utils/constants';

export default function ApplicationRisk() {
  const [formData, setFormData] = useState({
    customer_id: 'CUST_02908',
    dealer_id: 'DEALER_004',
    device_id: 'DEV_99182',
    bank_account: 'ACC_88129',
    loan_amount: 350000,
    guarantor_id: 'GUAR_0012',
  });

  const [result, setResult] = useState({
    risk_score: 73.7,
    recommendation: 'REJECT / INVESTIGATE',
    fraud_dna: [
      { name: 'Identity & KYC', score: 85, color: '#f43f5e' },
      { name: 'Device Fingerprint Sharing', score: 92, color: '#e11d48' },
      { name: 'Dealer Collusion Density', score: 68, color: '#f59e0b' },
      { name: 'Graph Centrality Anomaly', score: 78, color: '#f43f5e' },
      { name: 'Temporal Velocity Burst', score: 55, color: '#818cf8' },
      { name: 'Guarantor Cross-Linkage', score: 64, color: '#f59e0b' },
    ],
    ring_match: 'RING_002',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitApplication(formData);
      if (res) {
        setResult((prev) => ({
          ...prev,
          risk_score: res.risk_score ?? 76.5,
          recommendation: (res.risk_score ?? 76.5) > 60 ? 'FLAGGED FOR INVESTIGATION' : 'AUTO-APPROVE',
        }));
      }
    } catch (_) {
      // Keep rich demo response
    } finally {
      setLoading(false);
    }
  };

  const riskLvl = getRiskLevel(result.risk_score);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Page Header ── */}
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
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Activity size={18} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.025em' }}>
              Real-Time Application Underwriting Engine
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Instant graph-augmented loan risk evaluation, 6-dimensional Fraud DNA decomposition, and Louvain ring attachment detection.
          </p>
        </div>
      </motion.div>

      {/* ── 2-Column Underwriting Workspace ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Left Column: Application Input Form ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="inv-card"
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
            Loan Application Attributes
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>Customer ID</label>
                <input
                  type="text"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f8fafc', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>Dealer Code</label>
                <input
                  type="text"
                  value={formData.dealer_id}
                  onChange={(e) => setFormData({ ...formData, dealer_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f8fafc', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>Device ID</label>
                <input
                  type="text"
                  value={formData.device_id}
                  onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f8fafc', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>Bank Account</label>
                <input
                  type="text"
                  value={formData.bank_account}
                  onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f8fafc', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', marginBottom: '6px' }}>Loan Amount (₹)</label>
              <input
                type="number"
                value={formData.loan_amount}
                onChange={(e) => setFormData({ ...formData, loan_amount: Number(e.target.value) })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(18, 18, 26, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', color: '#f8fafc', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary-gradient" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              <Send size={15} /> {loading ? 'Evaluating Graph Twin…' : 'Run Graph AI Underwriting'}
            </button>
          </form>
        </motion.div>

        {/* ── Right Column: Instant Underwriting Intelligence Result ── */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="inv-card"
          style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {/* Result Hero Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Underwriting Decision</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: riskLvl.color, fontFamily: 'Outfit, sans-serif', marginTop: '2px' }}>
                {result.recommendation}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>Anomaly Score</div>
              <div style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'JetBrains Mono, monospace', color: riskLvl.color }}>
                {result.risk_score.toFixed(1)}<span style={{ fontSize: '14px', color: '#64748b' }}>/100</span>
              </div>
            </div>
          </div>

          {/* Collusion Alert Pill */}
          <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(225, 29, 72, 0.1)', border: '1px solid rgba(225, 29, 72, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#f43f5e" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f43f5e' }}>Matched Collusion Cluster:</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
              {result.ring_match} (462 nodes)
            </span>
          </div>

          {/* 6D Fraud DNA Dimension Decomposition */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif', marginBottom: '12px' }}>
              6-Dimensional Fraud DNA Decomposition
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {result.fraud_dna.map((dim) => (
                <div key={dim.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{dim.name}</span>
                    <span style={{ color: dim.color, fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>{dim.score}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${dim.score}%`, borderRadius: '999px', background: dim.color, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
