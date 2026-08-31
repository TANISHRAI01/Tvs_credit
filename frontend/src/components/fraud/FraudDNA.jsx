import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip,
} from 'recharts';
import { Dna, ShieldAlert } from 'lucide-react';

/**
 * FraudDNA — Interactive 6-dimensional Radar Chart
 * Visualizes the Fraud DNA polygon with glow accents and benchmark overlay.
 *
 * Props:
 *   dna: { identity_risk, device_risk, dealer_risk, location_risk, behaviour_risk, network_risk, overall_risk }
 */
export default function FraudDNA({ dna }) {
  if (!dna) return null;

  const dimensions = [
    { key: 'identity_risk', label: 'Identity', fullLabel: 'Identity & KYC' },
    { key: 'device_risk', label: 'Device', fullLabel: 'Device Fingerprint' },
    { key: 'dealer_risk', label: 'Dealer', fullLabel: 'Dealer Collusion' },
    { key: 'location_risk', label: 'Location', fullLabel: 'Geographic Risk' },
    { key: 'behaviour_risk', label: 'Behaviour', fullLabel: 'Burst Velocity' },
    { key: 'network_risk', label: 'Network', fullLabel: 'Graph Connectivity' },
  ];

  const chartData = dimensions.map((dim) => ({
    dimension: dim.label,
    fullLabel: dim.fullLabel,
    value: dna[dim.key] ?? 0,
    benchmark: 40, // industry benchmark line
  }));

  const overallColor = dna.overall_risk >= 75
    ? '#e11d48'
    : dna.overall_risk >= 50
      ? '#f59e0b'
      : '#22c55e';

  const riskLabel = dna.overall_risk >= 75
    ? 'Critical'
    : dna.overall_risk >= 50
      ? 'Elevated'
      : 'Normal';

  const getBarColor = (score) =>
    score >= 75 ? '#e11d48' : score >= 50 ? '#f59e0b' : '#22c55e';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="inv-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
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
              background: `linear-gradient(135deg, ${overallColor}30, ${overallColor}10)`,
              border: `1px solid ${overallColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Dna size={16} color={overallColor} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', fontFamily: 'Outfit, sans-serif' }}>
              6D Fraud DNA Radar
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>
              Multi-dimensional risk vector analysis
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 900,
            fontFamily: 'JetBrains Mono, monospace',
            color: overallColor,
            lineHeight: 1,
          }}>
            {dna.overall_risk.toFixed(1)}
          </div>
          <div style={{
            fontSize: '10px',
            fontWeight: 800,
            color: overallColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {riskLabel}
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
            <PolarGrid
              stroke="rgba(255, 255, 255, 0.06)"
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{
                fill: '#94a3b8',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 9 }}
              axisLine={false}
            />

            {/* Benchmark overlay */}
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#3b82f640"
              fill="#3b82f608"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {/* Entity risk polygon */}
            <Radar
              name="Risk"
              dataKey="value"
              stroke={overallColor}
              fill={`${overallColor}25`}
              strokeWidth={2.5}
              dot={{
                r: 4,
                fill: overallColor,
                stroke: '#0a0a14',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: overallColor,
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />

            <Tooltip
              contentStyle={{
                background: 'rgba(10, 10, 20, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '10px 14px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
              }}
              labelStyle={{ color: '#f8fafc', fontSize: '12px', fontWeight: 800 }}
              itemStyle={{ color: '#94a3b8', fontSize: '11px' }}
              formatter={(value, name) => [`${value.toFixed(1)}/100`, name]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {dimensions.map((dim) => {
          const score = dna[dim.key] ?? 0;
          const barColor = getBarColor(score);
          return (
            <div key={dim.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>{dim.fullLabel}</span>
                <span style={{
                  color: barColor,
                  fontWeight: 800,
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {score.toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: '5px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.06)',
                overflow: 'hidden',
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    height: '100%',
                    borderRadius: '999px',
                    background: barColor,
                    boxShadow: `0 0 6px ${barColor}50`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
