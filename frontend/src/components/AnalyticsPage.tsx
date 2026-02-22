'use client';

import React, { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import {
    BarChart3, TrendingUp, TrendingDown, Download, Calendar,
    Clock, Car, Fuel, CloudRain, AlertTriangle, MapPin,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart,
} from 'recharts';

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

export default function AnalyticsPage() {
    const {
        fetchHistoricalData, fetchHourlyData, fetchAnalytics,
        historicalData, hourlyData, overview, trafficData,
    } = useStore();
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        fetchAnalytics();
        fetchHistoricalData(timeRange);
        fetchHourlyData();
    }, [timeRange, fetchAnalytics, fetchHistoricalData, fetchHourlyData]);

    const summaryCards = [
        {
            label: 'Total Vehicles Tracked',
            value: historicalData.reduce((a, b) => a + b.totalVehicles, 0).toLocaleString(),
            icon: Car,
            trend: '+12.4%',
            trendUp: true,
            color: '#3b82f6',
        },
        {
            label: 'Total CO₂ Emitted',
            value: `${historicalData.reduce((a, b) => a + b.co2Emissions, 0).toFixed(0)} t`,
            icon: CloudRain,
            trend: '-8.2%',
            trendUp: false,
            color: '#10b981',
        },
        {
            label: 'Fuel Consumed',
            value: `${historicalData.reduce((a, b) => a + b.fuelConsumed, 0).toFixed(0)} L`,
            icon: Fuel,
            trend: '-5.7%',
            trendUp: false,
            color: '#f59e0b',
        },
        {
            label: 'Total Incidents',
            value: historicalData.reduce((a, b) => a + b.incidents, 0).toLocaleString(),
            icon: AlertTriangle,
            trend: '-3.1%',
            trendUp: false,
            color: '#ef4444',
        },
    ];

    const congestionHeatData = hourlyData.map(h => ({
        hour: h.hour,
        congestion: h.congestion,
        vehicles: h.vehicles,
        speed: h.speed,
    }));

    const handleDownload = () => {
        const csv = [
            'Date,Avg Congestion,Total Vehicles,CO2 Emissions,Fuel Consumed,Avg Speed,Incidents',
            ...historicalData.map(d =>
                `${d.date},${d.avgCongestion},${d.totalVehicles},${d.co2Emissions},${d.fuelConsumed},${d.avgSpeed},${d.incidents}`
            ),
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mobility-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Time Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {[{ label: '7 Days', value: 7 }, { label: '14 Days', value: 14 }, { label: '30 Days', value: 30 }, { label: '90 Days', value: 90 }].map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setTimeRange(opt.value)}
                            className={timeRange === opt.value ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 16px', fontSize: 13 }}
                        >
                            <Calendar size={14} />
                            {opt.label}
                        </button>
                    ))}
                </div>
                <motion.button
                    className="btn-secondary"
                    onClick={handleDownload}
                    whileHover={{ scale: 1.02 }}
                >
                    <Download size={16} /> Export CSV
                </motion.button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, marginBottom: 24 }}>
                {summaryCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="stat-card"
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: card.color, borderRadius: '16px 16px 0 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: `${card.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <card.icon size={20} color={card.color} />
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: card.trendUp ? 'var(--accent-red)' : 'var(--accent-green)',
                            }}>
                                {card.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {card.trend}
                            </div>
                        </div>
                        <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 2 }}>{card.value}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{card.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Historical Congestion & Speed */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Congestion & Speed Trends</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Daily averages over {timeRange} days</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={historicalData.map(d => ({ date: d.date.slice(5), congestion: d.avgCongestion, speed: d.avgSpeed }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="congestion" name="Congestion %" fill="#3b82f6" radius={[3, 3, 0, 0]} opacity={0.7} />
                            <Line type="monotone" dataKey="speed" name="Speed km/h" stroke="#10b981" strokeWidth={2} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Emission & Fuel Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="card"
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Emissions & Fuel</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>CO₂ and fuel consumption</p>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={historicalData.map(d => ({ date: d.date.slice(5), co2: d.co2Emissions, fuel: d.fuelConsumed }))}>
                            <defs>
                                <linearGradient id="gradAco2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradAfuel" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="co2" name="CO₂ (tons)" stroke="#ef4444" fill="url(#gradAco2)" strokeWidth={2} />
                            <Area type="monotone" dataKey="fuel" name="Fuel (L)" stroke="#f59e0b" fill="url(#gradAfuel)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Peak Hours Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <Clock size={18} color="var(--accent-blue)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Peak Hour Analysis</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={congestionHeatData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="congestion" name="Congestion %" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Zone Performance Table */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="card"
                    style={{ overflow: 'hidden' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <MapPin size={18} color="var(--accent-blue)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Zone Performance</h3>
                    </div>
                    <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>Congestion</th>
                                    <th>Vehicles</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trafficData.map(zone => (
                                    <tr key={zone.zoneId}>
                                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>{zone.zoneName}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div className="congestion-bar" style={{ width: 50 }}>
                                                    <div className={`congestion-fill ${zone.congestionCategory.toLowerCase()}`} style={{ width: `${zone.congestionLevel}%` }} />
                                                </div>
                                                <span style={{ fontSize: 12 }}>{zone.congestionLevel}%</span>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{zone.vehicleCount.toLocaleString()}</td>
                                        <td>
                                            <span className={`badge badge-${zone.congestionCategory.toLowerCase()}`}>
                                                {zone.congestionCategory}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
