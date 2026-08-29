import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
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

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />

        <main className="main-content">
          <Header />
          <div className="page-container">
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
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
