import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  TrendingUp,
  Activity,
  Zap,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  HelpCircle,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Command Center',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: '/network',
    label: 'Network Explorer',
    icon: Network,
  },
  {
    path: '/fraud-rings',
    label: 'Fraud Rings',
    icon: ShieldAlert,
    badge: '40',
  },
  {
    path: '/ecosystems',
    label: 'Emerging Threats',
    icon: TrendingUp,
    badge: '1 Live',
  },
];

const P2_NAV_ITEMS = [
  {
    path: '/application-risk',
    label: 'Application Risk',
    icon: Activity,
  },
  {
    path: '/simulator',
    label: 'What-If Simulator',
    icon: Zap,
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        background: 'linear-gradient(180deg, #0e1233 0%, #080a1c 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 18px',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 30,
      }}
    >
      {/* ── Brand Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '6px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #e11d48 0%, #7928ca 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(225, 29, 72, 0.35)',
        }}>
          <ShieldAlert size={22} color="#ffffff" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{
            fontSize: '17px',
            fontWeight: 900,
            letterSpacing: '-0.4px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            TVS <span style={{ color: '#e11d48' }}>SENTINEL</span>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, letterSpacing: '0.8px' }}>
            SWARM FRAUD AI
          </div>
        </div>
      </div>

      {/* ── Primary Action Button (Reference red action button) ── */}
      <NavLink
        to="/simulator"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '16px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '13px',
          boxShadow: '0 8px 24px rgba(225, 29, 72, 0.45)',
          marginBottom: '28px',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <PlusCircle size={16} />
        <span>+ Run Loan Simulation</span>
      </NavLink>

      {/* ── Core Navigation ── */}
      <div style={{ marginBottom: '8px', paddingLeft: '8px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: '#475569',
          textTransform: 'uppercase',
        }}>
          Main Menu
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '24px' }}>
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact, badge }) => {
          const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              end={exact}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 14px',
                borderRadius: '14px',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(255, 255, 255, 0.09)' : 'transparent',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon
                  size={18}
                  color={isActive ? '#e11d48' : '#64748b'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span>{label}</span>
              </div>
              {badge && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(225, 29, 72, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#f43f5e' : '#64748b',
                  border: isActive ? '1px solid rgba(225, 29, 72, 0.4)' : 'none',
                }}>
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Intelligence Section ── */}
      <div style={{ marginBottom: '8px', paddingLeft: '8px' }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: '#475569',
          textTransform: 'uppercase',
        }}>
          AI Intelligence
        </span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {P2_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '14px',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon
                size={18}
                color={isActive ? '#8b5cf6' : '#64748b'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981',
          }} />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>API v1.0 Live</span>
        </div>
        <span style={{ fontSize: '10px', color: '#475569' }}>TVS Credit E.P.I.C.</span>
      </div>
    </aside>
  );
}
