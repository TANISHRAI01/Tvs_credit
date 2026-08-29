import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import './index.css';

// ─── Lazy-load pages ─────────────────────────────────────────────────────────
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
    style={{ height: '100%' }}
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
      height: '100%',
      gap: '12px',
      color: '#64748b',
      fontSize: '14px',
    }}
  >
    <div
      style={{
        width: '20px',
        height: '20px',
        border: '2px solid #1a1e3a',
        borderTop: '2px solid #00d4ff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    Loading…
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PageWrapper>
                      <CommandCenter />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/network"
                  element={
                    <PageWrapper>
                      <NetworkExplorer />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/fraud-rings"
                  element={
                    <PageWrapper>
                      <FraudRings />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/fraud-rings/:id"
                  element={
                    <PageWrapper>
                      <FraudRingDetail />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/ecosystems"
                  element={
                    <PageWrapper>
                      <EmergingThreats />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/application-risk"
                  element={
                    <PageWrapper>
                      <ApplicationRisk />
                    </PageWrapper>
                  }
                />
                <Route
                  path="/simulator"
                  element={
                    <PageWrapper>
                      <WhatIfSimulator />
                    </PageWrapper>
                  }
                />
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
