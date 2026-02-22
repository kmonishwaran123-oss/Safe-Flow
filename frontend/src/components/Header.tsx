'use client';

import React from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import { Bell, Search, RefreshCw } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Real-time urban mobility overview' },
    traffic: { title: 'Live Traffic', subtitle: 'Real-time congestion monitoring' },
    routes: { title: 'Route Planner', subtitle: 'AI-powered route optimization' },
    emissions: { title: 'Emission Monitor', subtitle: 'CO₂ tracking & analysis' },
    analytics: { title: 'Analytics & Reports', subtitle: 'City-wide transportation insights' },
    alerts: { title: 'Alerts & Notifications', subtitle: 'Traffic and emission alerts' },
    settings: { title: 'Settings', subtitle: 'Platform configuration' },
};

export default function Header() {
    const { activePage, alerts, fetchTrafficData, fetchEmissionData } = useStore();
    const pageInfo = pageTitles[activePage] || { title: 'Dashboard', subtitle: '' };
    const unreadAlerts = alerts.filter(a => !a.isRead).length;

    const handleRefresh = () => {
        fetchTrafficData();
        fetchEmissionData();
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 16,
            }}
        >
            {/* Title */}
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>{pageInfo.title}</h1>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>{pageInfo.subtitle}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input"
                        placeholder="Search zones, routes..."
                        style={{ paddingLeft: 36, width: 240, fontSize: 13 }}
                    />
                </div>

                {/* Refresh */}
                <motion.button
                    className="btn-icon"
                    onClick={handleRefresh}
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    title="Refresh Data"
                >
                    <RefreshCw size={18} />
                </motion.button>

                {/* Notifications */}
                <button className="btn-icon" style={{ position: 'relative' }} title="Notifications">
                    <Bell size={18} />
                    {unreadAlerts > 0 && <span className="notification-dot" />}
                </button>

                {/* Live Indicator */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                    <motion.div
                        style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>LIVE</span>
                </div>
            </div>
        </motion.header>
    );
}
