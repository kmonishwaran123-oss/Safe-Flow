'use client';

import React, { useEffect } from 'react';
import useStore from '@/store/useStore';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import DashboardPage from '@/components/DashboardPage';
import TrafficPage from '@/components/TrafficPage';
import RoutePlannerPage from '@/components/RoutePlannerPage';
import EmissionsPage from '@/components/EmissionsPage';
import AnalyticsPage from '@/components/AnalyticsPage';
import AlertsPage from '@/components/AlertsPage';
import SettingsPage from '@/components/SettingsPage';
import { motion, AnimatePresence } from 'framer-motion';

const pageComponents: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  traffic: TrafficPage,
  routes: RoutePlannerPage,
  emissions: EmissionsPage,
  analytics: AnalyticsPage,
  alerts: AlertsPage,
  settings: SettingsPage,
};

export default function Home() {
  const { isAuthenticated, token, user, sidebarCollapsed, activePage, authMode, initFirebaseAuth } = useStore();

  // Initialize Firebase Auth listener on mount
  useEffect(() => {
    if (authMode === 'firebase') {
      initFirebaseAuth();
    }
  }, [authMode, initFirebaseAuth]);

  // Auto-login check on mount if token exists (local mode)
  useEffect(() => {
    if (authMode === 'local' && token && !user) {
      fetch('http://localhost:4000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            useStore.setState({ user: data.user, isAuthenticated: true });
          } else {
            useStore.setState({ token: null, isAuthenticated: false });
            localStorage.removeItem('mobility_token');
          }
        })
        .catch(() => {
          useStore.setState({ token: null, isAuthenticated: false });
          localStorage.removeItem('mobility_token');
        });
    }
  }, [token, user, authMode]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const ActivePage = pageComponents[activePage] || DashboardPage;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Header />
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
