'use client';

import React, { useEffect } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import {
    Car, CloudRain, Gauge, TrendingDown, TrendingUp, AlertTriangle,
    MapPin, Zap, Fuel, Wind,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const containerVariant = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    if (!active || !payload) return null;
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: '12px 16px',
            boxShadow: 'var(--shadow-card)',
        }}>
            <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>{label}</p>
            {payload.map((item, i) => (
                <p key={i} style={{ fontSize: 12, color: item.color, marginBottom: 2 }}>
                    {item.name}: <strong>{typeof item.value === 'number' ? item.value.toFixed(1) : item.value}</strong>
                </p>
            ))}
        </div>
    );
};

export default function DashboardPage() {
    const { fetchAnalytics, fetchHourlyData, fetchAlerts, overview, trafficData, hourlyData, alerts } = useStore();

    useEffect(() => {
        fetchAnalytics();
        fetchHourlyData();
        fetchAlerts();
        const interval = setInterval(() => { fetchAnalytics(); }, 30000);
        return () => clearInterval(interval);
    }, [fetchAnalytics, fetchHourlyData, fetchAlerts]);

    const stats = [
        {
            label: 'Avg Congestion',
            value: overview ? `${overview.avgCongestion}%` : '--',
            trend: overview?.congestionTrend,
            icon: Gauge,
            color: 'blue',
            gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
        },
        {
            label: 'Active Vehicles',
            value: overview ? overview.totalVehicles.toLocaleString() : '--',
            trend: 'increasing',
            icon: Car,
            color: 'purple',
            gradient: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        },
        {
            label: 'CO₂ Emissions',
            value: overview ? `${overview.totalCO2} t` : '--',
            trend: overview?.emissionTrend,
            icon: CloudRain,
            color: 'green',
            gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
        },
        {
            label: 'Avg Speed',
            value: overview ? `${overview.avgSpeed} km/h` : '--',
            trend: overview?.avgSpeed && overview.avgSpeed > 30 ? 'increasing' : 'decreasing',
            icon: Zap,
            color: 'amber',
            gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        },
    ];

    const congestionDistribution = trafficData.length > 0 ? [
        { name: 'Low', value: trafficData.filter(t => t.congestionCategory === 'Low').length, color: '#10b981' },
        { name: 'Medium', value: trafficData.filter(t => t.congestionCategory === 'Medium').length, color: '#f59e0b' },
        { name: 'High', value: trafficData.filter(t => t.congestionCategory === 'High').length, color: '#ef4444' },
    ] : [];

    return (
        <motion.div variants={containerVariant} initial="hidden" animate="show">
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                {stats.map((stat, idx) => (
                    <motion.div key={idx} variants={itemVariant} className={`stat-card ${stat.color}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: stat.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 0 15px ${stat.color === 'blue' ? 'rgba(59,130,246,0.3)' : stat.color === 'green' ? 'rgba(16,185,129,0.3)' : stat.color === 'amber' ? 'rgba(245,158,11,0.3)' : 'rgba(139,92,246,0.3)'}`,
                            }}>
                                <stat.icon size={22} color="white" />
                            </div>
                            {stat.trend && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '4px 8px',
                                    borderRadius: 8,
                                    background: stat.trend === 'decreasing' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: stat.trend === 'decreasing' ? 'var(--accent-green)' : 'var(--accent-red)',
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}>
                                    {stat.trend === 'decreasing' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                                    {stat.trend === 'decreasing' ? '-4.2%' : '+2.8%'}
                                </div>
                            )}
                        </div>
                        <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, marginBottom: 2 }}>{stat.value}</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Hourly Traffic Chart */}
                <motion.div variants={itemVariant} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Traffic Flow Analysis</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>24-hour congestion & speed</p>
                        </div>
                        <div className="badge badge-info">Today</div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={hourlyData}>
                            <defs>
                                <linearGradient id="gradCongestion" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradSpeed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="congestion" name="Congestion %" stroke="#3b82f6" fill="url(#gradCongestion)" strokeWidth={2} />
                            <Area type="monotone" dataKey="speed" name="Avg Speed km/h" stroke="#10b981" fill="url(#gradSpeed)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Congestion Distribution */}
                <motion.div variants={itemVariant} className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Congestion Distribution</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Across all zones</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={congestionDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {congestionDistribution.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                        {congestionDistribution.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Zone Status Table */}
                <motion.div variants={itemVariant} className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Zone Status</h3>
                        <MapPin size={18} color="var(--text-muted)" />
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>Congestion</th>
                                    <th>Speed</th>
                                    <th>Vehicles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trafficData.slice(0, 8).map((zone) => (
                                    <tr key={zone.zoneId}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{zone.zoneName}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="congestion-bar" style={{ width: 60 }}>
                                                    <div
                                                        className={`congestion-fill ${zone.congestionCategory.toLowerCase()}`}
                                                        style={{ width: `${zone.congestionLevel}%` }}
                                                    />
                                                </div>
                                                <span className={`badge badge-${zone.congestionCategory.toLowerCase()}`}>
                                                    {zone.congestionLevel}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>{zone.averageSpeed} km/h</td>
                                        <td>{zone.vehicleCount.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Recent Alerts */}
                <motion.div variants={itemVariant} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Alerts</h3>
                        <AlertTriangle size={18} color="var(--accent-amber)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                        {alerts.slice(0, 5).map((alert) => (
                            <motion.div
                                key={alert.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    padding: '12px 14px',
                                    borderRadius: 12,
                                    background: alert.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                    border: `1px solid ${alert.isRead ? 'var(--border-color)' : 'rgba(59, 130, 246, 0.15)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: 20 }}>{alert.icon}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{alert.title}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{alert.zone}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                                <span className={`badge badge-${alert.severity === 'critical' ? 'critical' : alert.severity === 'high' ? 'high' : alert.severity === 'warning' ? 'medium' : 'info'}`}>
                                    {alert.severity}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Emission Mini Chart */}
            <motion.div variants={itemVariant} className="card" style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Wind size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Hourly CO₂ Emissions</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tons per hour across city zones</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Fuel size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            Total: <strong style={{ color: 'var(--accent-green)' }}>{hourlyData.reduce((a, b) => a + b.co2, 0).toFixed(1)} t</strong>
                        </span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="co2" name="CO₂ (tons)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    );
}
