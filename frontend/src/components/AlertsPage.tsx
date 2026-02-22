'use client';

import React, { useEffect } from 'react';
import useStore from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, AlertTriangle, CheckCircle, Clock, MapPin,
    Filter, Eye, Trash2,
} from 'lucide-react';

export default function AlertsPage() {
    const { fetchAlerts, alerts, markAlertRead } = useStore();

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const severityOrder = { critical: 0, high: 1, warning: 2, medium: 3, info: 4 };
    const sortedAlerts = [...alerts].sort((a, b) => {
        const sa = severityOrder[a.severity as keyof typeof severityOrder] ?? 5;
        const sb = severityOrder[b.severity as keyof typeof severityOrder] ?? 5;
        return sa - sb;
    });

    const unreadCount = alerts.filter(a => !a.isRead).length;

    const severityStats = [
        { label: 'Critical', count: alerts.filter(a => a.severity === 'critical').length, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        { label: 'High', count: alerts.filter(a => a.severity === 'high').length, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
        { label: 'Warning', count: alerts.filter(a => a.severity === 'warning').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
        { label: 'Info', count: alerts.filter(a => a.severity === 'info').length, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    ];

    const timeSince = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Summary Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
                {/* Unread count */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stat-card blue"
                    style={{ position: 'relative' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: '16px 16px 0 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'rgba(59, 130, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Bell size={20} color="var(--accent-blue)" />
                        </div>
                        <div>
                            <p style={{ fontSize: 22, fontWeight: 800 }}>{unreadCount}</p>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unread Alerts</p>
                        </div>
                    </div>
                </motion.div>

                {severityStats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx + 1) * 0.06 }}
                        className="stat-card"
                        style={{ position: 'relative' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stat.color, borderRadius: '16px 16px 0 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: stat.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                fontWeight: 800,
                                color: stat.color,
                            }}>
                                {stat.count}
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600 }}>{stat.label}</p>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>alerts</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Alert List */}
            <div className="card" style={{ padding: 0 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>All Alerts</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                            <Filter size={14} /> Filter
                        </button>
                    </div>
                </div>

                <div style={{ padding: '8px' }}>
                    <AnimatePresence>
                        {sortedAlerts.map((alert, idx) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: idx * 0.03 }}
                                style={{
                                    display: 'flex',
                                    gap: 14,
                                    padding: '16px',
                                    borderRadius: 12,
                                    marginBottom: 4,
                                    background: alert.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                                    border: `1px solid ${alert.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.1)'}`,
                                    transition: 'all 0.2s',
                                    cursor: 'pointer',
                                }}
                                onClick={() => markAlertRead(alert.id)}
                                whileHover={{ background: 'rgba(255, 255, 255, 0.02)' }}
                            >
                                {/* Icon */}
                                <div style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: alert.severity === 'critical' ? 'rgba(239,68,68,0.1)' : alert.severity === 'high' ? 'rgba(249,115,22,0.1)' : alert.severity === 'warning' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    flexShrink: 0,
                                }}>
                                    {alert.icon}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 600 }}>
                                            {!alert.isRead && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: '50%',
                                                    background: 'var(--accent-blue)',
                                                    marginRight: 8,
                                                    verticalAlign: 'middle',
                                                }} />
                                            )}
                                            {alert.title}
                                        </h4>
                                        <span className={`badge badge-${alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'high' : alert.severity === 'warning' ? 'medium' : 'info'}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                                        {alert.message}
                                    </p>
                                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={12} /> {alert.zone}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Clock size={12} /> {timeSince(alert.timestamp)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
                                            <AlertTriangle size={12} /> {alert.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <button
                                        className="btn-icon"
                                        style={{ width: 32, height: 32 }}
                                        onClick={(e) => { e.stopPropagation(); markAlertRead(alert.id); }}
                                        title="Mark as read"
                                    >
                                        {alert.isRead ? <CheckCircle size={14} color="var(--accent-green)" /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {alerts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No alerts</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>All clear! No active traffic or emission alerts.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
