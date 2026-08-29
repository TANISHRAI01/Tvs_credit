import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  TrendingUp,
  Activity,
  Zap,
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
  },
  {
    path: '/ecosystems',
    label: 'Emerging Threats',
    icon: TrendingUp,
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
        width: '240px',
        minWidth: '240px',
        height: '100vh',
        background: 'linear-gradient(180deg, #0d1130 0%, #0a0e27 100%)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        overflowY: 'auto',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* ── Logo ─────────────────────────────────────────── */}
      <div
        style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sentinel Shield Icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 0 16px rgba(0,212,255,0.3)',
            }}
          >
            <ShieldAlert size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.3px',
              }}
            >
              TVS Sentinel
            </div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '1px', letterSpacing: '0.5px' }}>
              FRAUD INTELLIGENCE
            </div>
          </div>
        </div>
      </div>

      {/* ── Primary Nav ──────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '1px',
              color: '#475569',
              padding: '0 8px',
              textTransform: 'uppercase',
            }}
          >
            Core
          </span>
        </div>

        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              end={exact}
              style={({ isActive: routerActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                marginBottom: '2px',
                fontSize: '13.5px',
                fontWeight: routerActive ? 600 : 400,
                color: routerActive ? '#e2e8f0' : '#64748b',
                background: routerActive
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.12), rgba(139,92,246,0.08))'
                  : 'transparent',
                borderLeft: routerActive ? '2px solid #00d4ff' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                cursor: 'pointer',
              })}
            >
              {({ isActive: routerActive }) => (
                <>
                  <Icon
                    size={16}
                    color={routerActive ? '#00d4ff' : '#475569'}
                    strokeWidth={routerActive ? 2.5 : 2}
                    style={{ flexShrink: 0 }}
                  />
                  {label}
                </>
              )}
            </NavLink>
          );
        })}

        {/* ── P2 Section ─────────────────────────────────── */}
        <div style={{ margin: '20px 0 8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '1px',
              color: '#475569',
              padding: '0 8px',
              textTransform: 'uppercase',
            }}
          >
            Intelligence
          </span>
        </div>

        {P2_NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive: routerActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '2px',
              fontSize: '13.5px',
              fontWeight: routerActive ? 600 : 400,
              color: routerActive ? '#e2e8f0' : '#64748b',
              background: routerActive
                ? 'linear-gradient(90deg, rgba(139,92,246,0.15), rgba(0,212,255,0.06))'
                : 'transparent',
              borderLeft: routerActive ? '2px solid #8b5cf6' : '2px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.18s ease',
              cursor: 'pointer',
            })}
          >
            {({ isActive: routerActive }) => (
              <>
                <Icon
                  size={16}
                  color={routerActive ? '#8b5cf6' : '#475569'}
                  strokeWidth={routerActive ? 2.5 : 2}
                  style={{ flexShrink: 0 }}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer Status ────────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 6px rgba(16,185,129,0.7)',
              animation: 'pulse-ring 2s ease-in-out infinite',
            }}
          />
          <span style={{ fontSize: '11px', color: '#475569' }}>
            API Connected · Port 8000
          </span>
        </div>
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#334155' }}>
          TVS Credit E.P.I.C. · Team Sentinel
        </div>
      </div>
    </aside>
  );
}
