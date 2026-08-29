import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Sparkles, ArrowRight, CheckCircle2, Lock, Cpu, Globe, Search, Layers } from 'lucide-react';
import TvsLogo from '../components/common/TvsLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('CUST_02908');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/fraud-rings');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#07070a',
        backgroundImage: `
          radial-gradient(circle at 18% 18%, rgba(79, 70, 229, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 75% 35%, rgba(168, 85, 247, 0.18) 0%, transparent 45%),
          radial-gradient(circle at 50% 85%, rgba(225, 29, 72, 0.08) 0%, transparent 50%)
        `,
        color: '#f4f4f5',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Background Subtle Tech Grid ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Ambient Polygonal Line Glows (Top Left) ── */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '500px',
          height: '400px',
          opacity: 0.25,
          pointerEvents: 'none',
          zIndex: 0,
        }}
        viewBox="0 0 500 400"
        fill="none"
      >
        <path d="M-50 50 L200 80 L350 220 L150 350 Z" stroke="rgba(129, 140, 248, 0.4)" strokeWidth="1" />
        <path d="M-20 180 L280 120 L420 300" stroke="rgba(192, 132, 252, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="200" cy="80" r="3" fill="#818cf8" />
        <circle cx="350" cy="220" r="3" fill="#c084fc" />
      </svg>

      {/* ══════════════════════════════════════════════════════════════════
          TOP NAVIGATION BAR (Exact Glass Pill Style)
      ══════════════════════════════════════════════════════════════════ */}
      <header
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        {/* Left: Brand */}
        <div
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <TvsLogo size={32} showText={true} />
        </div>

        {/* Center: Floating Glass Pill Navigation with Top Badge */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Glowing Top Shield Indicator */}
          <div
            style={{
              position: 'absolute',
              top: '-14px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(168, 85, 247, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              zIndex: 2,
            }}
          >
            <Shield size={12} color="#ffffff" />
          </div>

          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              background: 'rgba(18, 18, 24, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              padding: '10px 32px',
              borderRadius: '999px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {[
              { label: 'Home', path: '/' },
              { label: 'Network Graph', path: '/network' },
              { label: 'Fraud Rings', path: '/fraud-rings' },
              { label: 'Simulator', path: '/simulator' },
            ].map((item, index) => (
              <span
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  fontSize: '13px',
                  fontWeight: index === 0 ? 600 : 500,
                  color: index === 0 ? '#ffffff' : '#a1a1aa',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.target.style.color = index === 0 ? '#ffffff' : '#a1a1aa')}
              >
                {item.label}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Auth / Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span
            onClick={() => navigate('/ecosystems')}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#a1a1aa',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.target.style.color = '#a1a1aa')}
          >
            Emerging Threats
          </span>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '9px 22px',
              borderRadius: '999px',
              background: '#161620',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
              e.currentTarget.style.background = '#20202e';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.background = '#161620';
            }}
          >
            Launch Console
          </button>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION (2-Column Exact Layout)
      ══════════════════════════════════════════════════════════════════ */}
      <main
        style={{
          flex: 1,
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 48px 20px',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          alignItems: 'center',
          gap: '40px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* ── Left Column: Headline & Interactive Input ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* Main Headline (Outfit geometric styling) */}
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '56px',
              fontWeight: 800,
              lineHeight: '1.08',
              letterSpacing: '-0.035em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            Protect Your Lending <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Against Swarm Fraud
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.65',
              color: '#94a3b8',
              maxWidth: '480px',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Enter the future of decentralized lending defense. Simplify multi-entity collusion detection, enhance underwriting confidence, and fortify your living credit ecosystem.
          </p>

          {/* Dual Pill Capsule Input & CTA (Exact reference style) */}
          <form
            onSubmit={handleSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '460px',
              width: '100%',
              background: 'rgba(18, 18, 24, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '999px',
              padding: '6px 6px 6px 18px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Search size={16} color="#71717a" style={{ marginRight: '10px', flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Verify loan applicant / entity ID..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '13px',
                width: '100%',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                flexShrink: 0,
                padding: '10px 24px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 26px rgba(124, 58, 237, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(99, 102, 241, 0.45)';
              }}
            >
              Try Demo
            </button>
          </form>

          {/* Sub-status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '-4px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#a855f7',
                boxShadow: '0 0 10px #a855f7',
              }}
            />
            <span style={{ fontSize: '11px', color: '#71717a', fontFamily: "'JetBrains Mono', monospace" }}>
              Production Engine Active • 18,095 Nodes • 35,158 Edges
            </span>
          </div>
        </motion.div>

        {/* ── Right Column: 3D Holographic Device & Glowing Luminescent Orb ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
          style={{
            position: 'relative',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Background Perspective Wireframe / Grid Mesh */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            viewBox="0 0 600 460"
            fill="none"
          >
            <defs>
              <linearGradient id="wireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0.05)" />
              </linearGradient>
            </defs>

            {/* Isometric Hardware Wireframe Perspective Lines */}
            <path d="M120 280 L300 370 L480 280 L300 190 Z" stroke="url(#wireGrad)" strokeWidth="1.2" strokeDasharray="3 3" />
            <path d="M120 280 L120 340 L300 430 L300 370" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />
            <path d="M480 280 L480 340 L300 430" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.2" />

            {/* Radar Spherical Latitude & Longitude Geodesic Dome */}
            <ellipse cx="300" cy="200" rx="140" ry="140" stroke="rgba(168, 85, 247, 0.18)" strokeWidth="1" />
            <ellipse cx="300" cy="200" rx="140" ry="50" stroke="rgba(129, 140, 248, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <ellipse cx="300" cy="200" rx="60" ry="140" stroke="rgba(129, 140, 248, 0.15)" strokeWidth="1" />
          </svg>

          {/* 3D Glass Device Container */}
          <div
            style={{
              position: 'relative',
              width: '380px',
              height: '240px',
              transform: 'perspective(900px) rotateX(24deg) rotateY(-18deg) rotateZ(6deg)',
              background: 'linear-gradient(135deg, rgba(30, 30, 45, 0.8), rgba(12, 12, 18, 0.95))',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px',
            }}
          >
            {/* Top Device Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'JetBrains Mono, monospace' }}>
                DIGITAL-TWIN-3D
              </span>
            </div>

            {/* Device Internal Circuits */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Network Defense</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>40 Fraud Rings Isolated</span>
              </div>
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(225, 29, 72, 0.15)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  color: '#f43f5e',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                99.4% Recall
              </div>
            </div>
          </div>

          {/* ── Volumetric Glowing Luminescent Orb (Centerpiece) ── */}
          <div
            style={{
              position: 'absolute',
              top: '12%',
              left: '52%',
              transform: 'translate(-50%, -50%)',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #d8b4fe 20%, #a855f7 45%, #6366f1 75%, transparent 100%)',
              boxShadow: `
                0 0 50px rgba(168, 85, 247, 0.8),
                0 0 100px rgba(99, 102, 241, 0.5),
                inset 0 0 30px rgba(255, 255, 255, 0.6)
              `,
              filter: 'blur(0.5px)',
              pointerEvents: 'none',
            }}
          />

          {/* Floating Luminescent Node Vertices (Glowing Dots) */}
          {[
            { top: '35%', left: '28%', size: '12px', delay: '0s', glow: '#a855f7' },
            { top: '68%', left: '78%', size: '10px', delay: '1s', glow: '#6366f1' },
            { top: '75%', left: '38%', size: '14px', delay: '2s', glow: '#ffffff' },
            { top: '22%', left: '72%', size: '8px', delay: '1.5s', glow: '#38bdf8' },
          ].map((dot, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: dot.top,
                left: dot.left,
                width: dot.size,
                height: dot.size,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: `0 0 14px 4px ${dot.glow}`,
                animation: 'pulse 2.5s infinite ease-in-out',
                animationDelay: dot.delay,
              }}
            />
          ))}
        </motion.div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM TRUST & ECOSYSTEM LOGO BAR (Exact Reference Styling)
      ══════════════════════════════════════════════════════════════════ */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '30px 48px 40px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#a1a1aa',
            margin: 0,
            letterSpacing: '0.2px',
          }}
        >
          Guarding The Industry's Top Lending Portfolios And Retail Networks.
          <br />
          From Innovative Borrowers To Renowned Dealership Enterprises.
        </p>

        {/* Partner / Technology Vector Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '56px',
            opacity: 0.65,
            flexWrap: 'wrap',
          }}
        >
          {/* TVS Credit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TvsLogo size={22} showText={false} />
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
              TVS CREDIT
            </span>
          </div>

          {/* Unreal / Vis Engine */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#ffffff" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              VIS GRAPH 3D
            </span>
          </div>

          {/* Fast Swarm AI */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} color="#ffffff" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              LOUVAIN SWARM
            </span>
          </div>

          {/* Meta / Twin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#ffffff" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              DIGITAL TWIN AI
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
