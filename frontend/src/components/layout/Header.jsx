import React from 'react';
import { ShieldCheck, Bell, Search, Sparkles, Layers } from 'lucide-react';

export default function Header({ totalNodes = 18095, totalExposure = '4,821.5L', riskStatus = 'Low' }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 28px',
      background: 'rgba(13, 17, 48, 0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
    }}>
      {/* ── Search / Command Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '8px 16px',
        width: '320px',
      }}>
        <Search size={15} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search entities, dealers, devices..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontSize: '13px',
            width: '100%',
          }}
        />
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: '#64748b',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'monospace',
        }}>⌘K</span>
      </div>

      {/* ── Floating Stats & Status Pills ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Available Nodes Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '12px',
        }}>
          <Layers size={14} color="#00d4ff" />
          <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LIVING GRAPH</span>
          <span style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
            {totalNodes.toLocaleString()} NODES
          </span>
        </div>

        {/* AML Swarm Risk Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '20px',
          padding: '6px 14px',
          fontSize: '12px',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }} />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Swarm Status:</span>
          <span style={{ fontWeight: 700, color: '#10b981' }}>Active & Monitoring</span>
        </div>

        {/* Notifications */}
        <button style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e2e8f0',
          cursor: 'pointer',
          position: 'relative',
        }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
          }} />
        </button>

        {/* Profile Avatar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '6px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff0055, #7928ca)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '13px',
            color: '#ffffff',
            boxShadow: '0 2px 10px rgba(121, 40, 202, 0.4)',
          }}>
            TS
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>TVS Sentinel</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>Investigator L3</div>
          </div>
        </div>
      </div>
    </header>
  );
}
