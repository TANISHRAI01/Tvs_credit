import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import './index.css';

// ─── Lazy-load pages ─────────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('./pages/LandingPage'));
const CommandCenter     = lazy(() => import('./pages/CommandCenter'));
const NetworkExplorer   = lazy(() => import('./pages/NetworkExplorer'));
const FraudRings        = lazy(() => import('./pages/FraudRings'));
const FraudRingDetail   = lazy(() => import('./pages/FraudRingDetail'));
const EmergingThreats   = lazy(() => import('./pages/EmergingThreats'));
const ApplicationRisk   = lazy(() => import('./pages/ApplicationRisk'));
const WhatIfSimulator   = lazy(() => import('./pages/WhatIfSimulator'));

// ─── Page transition wrapper ─────────────────────────────────────────────────
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    style={{ minHeight: '100%' }}
  >
    {children}
  </motion.div>
);

// ─── Fallback spinner ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      gap: '12px',
      color: '#94a3b8',
      fontSize: '14px',
    }}
  >
    <div
      style={{
        width: '24px',
        height: '24px',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTop: '2px solid #e11d48',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    Loading TVS Sentinel…
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── App Shell Wrapper for Operational Console ───────────────────────────────
function DashboardLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="page-container">
          <PageWrapper>{children}</PageWrapper>
        </div>
      </main>
    </div>
  );
}

// ─── Main App Router ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* High-Tech Homepage / Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<LandingPage />} />

            {/* Operational Console Routes */}
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <CommandCenter />
                </DashboardLayout>
              }
            />
            <Route
              path="/network"
              element={
                <DashboardLayout>
                  <NetworkExplorer />
                </DashboardLayout>
              }
            />
            <Route
              path="/fraud-rings"
              element={
                <DashboardLayout>
                  <FraudRings />
                </DashboardLayout>
              }
            />
            <Route
              path="/fraud-rings/:id"
              element={
                <DashboardLayout>
                  <FraudRingDetail />
                </DashboardLayout>
              }
            />
            <Route
              path="/ecosystems"
              element={
                <DashboardLayout>
                  <EmergingThreats />
                </DashboardLayout>
              }
            />
            <Route
              path="/application-risk"
              element={
                <DashboardLayout>
                  <ApplicationRisk />
                </DashboardLayout>
              }
            />
            <Route
              path="/simulator"
              element={
                <DashboardLayout>
                  <WhatIfSimulator />
                </DashboardLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </BrowserRouter>
  );
}
