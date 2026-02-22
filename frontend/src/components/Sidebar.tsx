'use client';

import React from 'react';
import useStore from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Map,
    Navigation,
    CloudRain,
    BarChart3,
    Bell,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Activity,
    Zap,
} from 'lucide-react';

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'traffic', label: 'Live Traffic', icon: Map },
    { id: 'routes', label: 'Route Planner', icon: Navigation },
    { id: 'emissions', label: 'Emissions', icon: CloudRain },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
    const { activePage, setActivePage, sidebarCollapsed, toggleSidebar, user, logout, alerts } = useStore();
    const unreadAlerts = alerts.filter(a => !a.isRead).length;

    return (
        <motion.aside
            className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}
            initial={false}
            animate={{ width: sidebarCollapsed ? 72 : 260 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
            {/* Logo */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                }}>
                    <Activity size={22} color="white" />
                </div>
                <AnimatePresence>
                    {!sidebarCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <h2 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>
                                <span className="gradient-text">Smart</span> <span style={{ color: 'var(--text-primary)' }}>Mobility</span>
                            </h2>
                            <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>Urban Platform</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <p style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    fontWeight: 700,
                    padding: '8px 12px',
                    display: sidebarCollapsed ? 'none' : 'block',
                }}>
                    Navigation
                </p>

                {navItems.map((item) => (
                    <motion.button
                        key={item.id}
                        className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => setActivePage(item.id)}
                        whileTap={{ scale: 0.98 }}
                        style={{ position: 'relative', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}
                    >
                        <item.icon size={20} />
                        <AnimatePresence>
                            {!sidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {item.label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                        {item.id === 'alerts' && unreadAlerts > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    right: sidebarCollapsed ? 8 : 12,
                                    top: sidebarCollapsed ? 6 : '50%',
                                    transform: sidebarCollapsed ? 'none' : 'translateY(-50%)',
                                    background: 'var(--accent-red)',
                                    color: 'white',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                {unreadAlerts}
                            </motion.span>
                        )}
                    </motion.button>
                ))}
            </nav>

            {/* System Status */}
            {!sidebarCollapsed && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        margin: '0 12px 12px',
                        padding: '12px',
                        borderRadius: 12,
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Zap size={14} color="var(--accent-green)" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-green)' }}>System Online</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>All sensors active • Real-time</p>
                </motion.div>
            )}

            {/* User & Collapse */}
            <div style={{ borderTop: '1px solid var(--border-color)', padding: '12px' }}>
                {/* User Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, padding: '8px', borderRadius: 10 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: 'white',
                        flexShrink: 0,
                    }}>
                        {user?.avatar || 'U'}
                    </div>
                    <AnimatePresence>
                        {!sidebarCollapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ flex: 1, minWidth: 0 }}
                            >
                                <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.name}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!sidebarCollapsed && (
                        <button onClick={logout} className="btn-icon" style={{ width: 32, height: 32 }} title="Sign Out">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', padding: '8px' }}
                >
                    {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!sidebarCollapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
                </button>
            </div>
        </motion.aside>
    );
}
