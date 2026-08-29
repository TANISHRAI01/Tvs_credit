import React from 'react';
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

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/network', icon: Network, label: 'Network' },
  { path: '/fraud-rings', icon: ShieldAlert, label: 'Rings' },
  { path: '/ecosystems', icon: TrendingUp, label: 'Threats' },
  { path: '/application-risk', icon: Activity, label: 'Risk' },
  { path: '/simulator', icon: Zap, label: 'Simulate' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside style={{
      width: '68px',
      minWidth: '68px',
      height: '100vh',
      background: '#0a0a0a',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: '20px',
      paddingBottom: '20px',
      zIndex: 30,
    }}>
      {/* Logo */}
      <div style={{
        width: '38px', height: '38px', borderRadius: '12px',
        background: 'linear-gradient(135deg, #e11d48, #9f1239)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px',
        boxShadow: '0 4px 16px rgba(225,29,72,0.35)',
      }}>
        <ShieldAlert size={20} color="#fff" strokeWidth={2.5} />
      </div>

      {/* Nav Icons */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {NAV.map(({ path, icon: Icon, label, exact }) => {
          const active = exact
            ? location.pathname === path
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              end={exact}
              title={label}
              style={{
                width: '42px', height: '42px',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? 'rgba(225,29,72,0.12)' : 'transparent',
                border: active ? '1px solid rgba(225,29,72,0.3)' : '1px solid transparent',
                color: active ? '#e11d48' : '#505050',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#505050', cursor: 'pointer',
        }}>
          <Settings size={20} strokeWidth={1.8} />
        </div>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #e11d48, #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 800, color: '#fff',
        }}>
          TS
        </div>
      </div>
    </aside>
  );
}
