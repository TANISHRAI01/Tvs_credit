import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  ShieldAlert,
  TrendingUp,
  Activity,
  Zap,
  Settings,
  User,
} from 'lucide-react';
import TvsLogo from '../common/TvsLogo';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/network', icon: Network, label: 'Network' },
  { path: '/fraud-rings', icon: ShieldAlert, label: 'Fraud Rings' },
  { path: '/ecosystems', icon: TrendingUp, label: 'Threats' },
  { path: '/application-risk', icon: Activity, label: 'Risk' },
  { path: '/simulator', icon: Zap, label: 'Simulator' },
];

export default function Sidebar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  const width = hovered ? 220 : 68;

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: `${width}px`,
        minWidth: `${width}px`,
        height: '100vh',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 10px',
        zIndex: 30,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* Brand Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px',
        marginBottom: '26px',
        height: '40px',
        overflow: 'hidden',
      }}>
        <TvsLogo size={38} showText={hovered} />
      </div>

      {/* Nav Icons */}
      <nav style={{
        display: 'flex', flexDirection: 'column', gap: '4px', flex: 1,
      }}>
        {NAV.map(({ path, icon: Icon, label, exact }) => {
          const active = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              end={exact}
              title={!hovered ? label : undefined}
              style={{
                height: '42px',
                width: '100%',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center',
                gap: '12px',
                padding: '0 13px',
                background: active ? 'rgba(225,29,72,0.12)' : 'transparent',
                border: active ? '1px solid rgba(225,29,72,0.3)' : '1px solid transparent',
                color: active ? '#e11d48' : '#505050',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} style={{ minWidth: '20px' }} />
              <span style={{
                fontSize: '13px', fontWeight: active ? 700 : 500,
                opacity: hovered ? 1 : 0,
                transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
                transition: 'opacity 0.15s ease 0.08s, transform 0.15s ease 0.08s',
              }}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}>
        <div style={{
          height: '42px', width: '100%', borderRadius: '12px',
          display: 'flex', alignItems: 'center',
          gap: '12px',
          padding: '0 13px',
          color: '#505050', cursor: 'pointer',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          <Settings size={20} strokeWidth={1.8} style={{ minWidth: '20px' }} />
          <span style={{
            fontSize: '13px', fontWeight: 500,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s ease 0.08s',
          }}>
            Settings
          </span>
        </div>

        {/* User avatar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 8px 0',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          <div style={{
            width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #e11d48, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color: '#fff',
          }}>
            TS
          </div>
          <div style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateX(0)' : 'translateX(-8px)',
            transition: 'opacity 0.15s ease 0.08s, transform 0.15s ease 0.08s',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f0f0f0' }}>Team Sentinel</div>
            <div style={{ fontSize: '10px', color: '#606060' }}>Fraud Analyst</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
