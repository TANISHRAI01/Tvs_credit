import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch, ArrowUp, ArrowDown, Minus, Shield } from 'lucide-react';

/**
 * EvidenceBreakdown — Explainable AI Evidence Waterfall
 * Shows positive and negative risk contributors with severity badges.
 *
 * Props:
 *   evidence: { overall_risk: float, factors: [{ description: string, contribution: float }] }
 */
export default function EvidenceBreakdown({ evidence }) {
  if (!evidence || !evidence.factors) return null;

  const getSeverityBadge = (contribution) => {
    const abs = Math.abs(contribution);
    if (abs >= 20)
      return { label: 'CRITICAL', bg: 'rgba(225, 29, 72, 0.15)', border: 'rgba(225, 29, 72, 0.4)', color: '#f43f5e' };
    if (abs >= 12)
      return { label: 'HIGH', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.35)', color: '#f97316' };
    if (abs >= 6)
      return { label: 'MEDIUM', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', color: '#f59e0b' };
    return { label: 'LOW', bg: 'rgba(34, 197, 94, 0.08)', border: 'rgba(34, 197, 94, 0.25)', color: '#22c55e' };
  };

  const overallColor = evidence.overall_risk >= 75
    ? '#e11d48'
    : evidence.overall_risk >= 50
      ? '#f59e0b'
      : '#22c55e';

  // Split into risk-adding and risk-reducing
  const riskFactors = evidence.factors.filter((f) => f.contribution > 0);
  const mitigating = evidence.factors.filter((f) => f.contribution <= 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="inv-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.1))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSearch size={16} color="#818cf8" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
              Explainable AI Evidence
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>
              Transparent risk factor decomposition
            </div>
          </div>
        </div>
        <div
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            background: `${overallColor}15`,
            border: `1px solid ${overallColor}30`,
            fontSize: '12px',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: overallColor,
          }}
        >
          {evidence.overall_risk.toFixed(1)}/100
        </div>
      </div>

      {/* Risk Factors */}
      {riskFactors.length > 0 && (
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#f43f5e',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <ArrowUp size={12} /> Risk Contributors ({riskFactors.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {riskFactors.map((factor, idx) => {
              const badge = getSeverityBadge(factor.contribution);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(18, 18, 26, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>
                      {factor.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {/* Severity badge */}
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.color,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {badge.label}
                    </span>

                    {/* Points */}
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 900,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: '#f43f5e',
                        minWidth: '46px',
                        textAlign: 'right',
                      }}
                    >
                      +{factor.contribution.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mitigating Factors */}
      {mitigating.length > 0 && (
        <div>
          <div style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#22c55e',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <ArrowDown size={12} /> Mitigating Factors ({mitigating.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mitigating.map((factor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (riskFactors.length + idx) * 0.05 }}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.04)',
                  border: '1px solid rgba(34, 197, 94, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 600, flex: 1 }}>
                  {factor.description}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 900,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: '#22c55e',
                    minWidth: '46px',
                    textAlign: 'right',
                  }}
                >
                  {factor.contribution.toFixed(1)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Audit trail footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
          <Shield size={12} />
          <span>Audit-ready evidence trail</span>
        </div>
        <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
          {evidence.factors.length} factors analysed
        </span>
      </div>
    </motion.div>
  );
}
