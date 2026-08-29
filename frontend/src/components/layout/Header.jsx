import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 28px',
      background: '#0a0a0a',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Left: Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.3px' }}>
          DASHBOARD
        </span>
      </div>

      {/* Center: Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px', padding: '9px 18px', width: '380px',
      }}>
        <Search size={15} color="#606060" />
        <input
          type="text"
          placeholder="Search entities, rings, dealers..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: '#f0f0f0', fontSize: '13px', width: '100%',
          }}
        />
      </div>

      {/* Right: Agent Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: '#161616', border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a0a0a0', cursor: 'pointer', position: 'relative',
        }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: '7px', right: '7px',
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#e11d48', boxShadow: '0 0 6px #e11d48',
          }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e11d48, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '12px', color: '#fff',
            boxShadow: '0 2px 10px rgba(225,29,72,0.3)',
          }}>
            TS
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f0f0' }}>Team Sentinel</div>
            <div style={{ fontSize: '10px', color: '#606060' }}>Fraud Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
}
