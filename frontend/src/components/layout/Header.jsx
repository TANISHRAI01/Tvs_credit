import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Shield, Activity } from 'lucide-react';

const PAGE_TITLES = {
  '/': 'Command Center',
  '/dashboard': 'Command Center',
  '/network': 'Network Graph Explorer',
  '/fraud-rings': 'Fraud Ring Directory',
  '/ecosystems': 'Emerging Threat Radar',
  '/application-risk': 'Application Risk Engine',
  '/simulator': 'What-If Fraud Simulator',
};

export default function Header() {
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || (location.pathname.startsWith('/fraud-rings/') ? 'Fraud Ring Investigation' : 'TVS Sentinel Console');

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 36px',
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Page Title & System Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', fontFamily: 'Outfit, sans-serif' }}>
              {currentTitle}
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#6366f1',
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                padding: '2px 8px',
                borderRadius: '999px',
                letterSpacing: '0.5px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Center: Search Capsule with Glass Glow */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(18, 18, 26, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          padding: '8px 20px',
          width: '380px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <Search size={15} color="#71717a" />
        <input
          type="text"
          placeholder="Search entities, rings, dealers..."
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

      {/* Right: Live Engine Indicator & Agent Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Node status capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: 'rgba(18, 18, 26, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', fontFamily: 'JetBrains Mono, monospace' }}>
            18,095 Living Nodes
          </span>
        </div>

        {/* Notification bell */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'rgba(18, 18, 26, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#e11d48',
              boxShadow: '0 0 8px #e11d48',
            }}
          />
        </button>

        {/* Analyst Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #e11d48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '12px',
              color: '#fff',
              boxShadow: '0 2px 12px rgba(99, 102, 241, 0.35)',
            }}
          >
            TS
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>Team Sentinel</div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>Fraud Intelligence</div>
          </div>
        </div>
      </div>
    </header>
  );
}
