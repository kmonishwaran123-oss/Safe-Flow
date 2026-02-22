'use client';

import React, { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import {
    CloudRain, TrendingDown, TrendingUp, Leaf, Factory,
    Droplets, Wind, TreePine, Calculator, BarChart3,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, LineChart, Line,
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
                    {item.name}: <strong>{typeof item.value === 'number' ? item.value.toFixed(2) : item.value}</strong>
                </p>
            ))}
        </div>
    );
};

export default function EmissionsPage() {
    const { fetchEmissionData, emissionData, fetchHistoricalData, historicalData } = useStore();
    const [timeRange, setTimeRange] = useState('30');
    const [calculatorDistance, setCalculatorDistance] = useState('10');
    const [calculatorVehicle, setCalculatorVehicle] = useState('car');
    const [calcResult, setCalcResult] = useState<{ co2: number; fuel: number; trees: number } | null>(null);

    useEffect(() => {
        fetchEmissionData();
        fetchHistoricalData(parseInt(timeRange));
    }, [fetchEmissionData, fetchHistoricalData, timeRange]);

    const totalCO2 = emissionData.reduce((a, b) => a + b.co2Emission, 0);
    const totalNOx = emissionData.reduce((a, b) => a + b.noxEmission, 0);
    const avgAQI = emissionData.length > 0
        ? Math.round(emissionData.reduce((a, b) => a + b.airQualityIndex, 0) / emissionData.length)
        : 0;
    const highEmissionZones = emissionData.filter(z => z.co2Emission > 100).length;

    const emissionFactors: Record<string, number> = { car: 0.21, suv: 0.28, truck: 0.45, bus: 0.89, motorcycle: 0.11, electric: 0.05 };

    const handleCalculate = () => {
        const dist = parseFloat(calculatorDistance) || 0;
        const factor = emissionFactors[calculatorVehicle] || 0.21;
        const co2 = Math.round(dist * factor * 100) / 100;
        const fuel = Math.round(dist * factor * 0.38 * 100) / 100;
        const trees = Math.ceil(co2 / 21.77);
        setCalcResult({ co2, fuel, trees });
    };

    const emissionStats = [
        { label: 'Total CO₂', value: `${totalCO2.toFixed(1)} t`, icon: CloudRain, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
        { label: 'NOₓ Emissions', value: `${totalNOx.toFixed(2)} t`, icon: Factory, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
        { label: 'Air Quality Index', value: avgAQI.toString(), icon: Wind, color: avgAQI > 200 ? '#ef4444' : avgAQI > 100 ? '#f59e0b' : '#10b981', gradient: avgAQI > 200 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : avgAQI > 100 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #06b6d4)' },
        { label: 'High Emission Zones', value: highEmissionZones.toString(), icon: Droplets, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
    ];

    const trendData = historicalData.map(d => ({
        date: d.date.slice(5), // MM-DD
        co2: d.co2Emissions,
        nox: d.noxEmissions,
        fuel: d.fuelConsumed,
    }));

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {emissionStats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="stat-card"
                        style={{ position: 'relative', overflow: 'hidden' }}
                    >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: stat.gradient }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{stat.label}</p>
                                <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>{stat.value}</p>
                            </div>
                            <div style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: stat.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <stat.icon size={20} color="white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
                {/* Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Emission Trends</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>CO₂ & NOₓ daily tracking</p>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['7', '14', '30'].map(d => (
                                <button
                                    key={d}
                                    onClick={() => setTimeRange(d)}
                                    className={timeRange === d ? 'btn-primary' : 'btn-secondary'}
                                    style={{ padding: '6px 12px', fontSize: 12 }}
                                >
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trendData}>
                            <defs>
                                <linearGradient id="gradCO2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradNOx" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="co2" name="CO₂ (tons)" stroke="#ef4444" fill="url(#gradCO2)" strokeWidth={2} />
                            <Area type="monotone" dataKey="nox" name="NOₓ (tons)" stroke="#f59e0b" fill="url(#gradNOx)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Calculator */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Calculator size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Emission Calculator</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Per-trip estimation</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Distance (km)</label>
                        <input
                            className="input"
                            type="number"
                            value={calculatorDistance}
                            onChange={e => setCalculatorDistance(e.target.value)}
                            placeholder="Enter distance"
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>Vehicle Type</label>
                        <select className="select" value={calculatorVehicle} onChange={e => setCalculatorVehicle(e.target.value)} style={{ width: '100%' }}>
                            <option value="car">🚗 Car</option>
                            <option value="suv">🚙 SUV</option>
                            <option value="truck">🚛 Truck</option>
                            <option value="bus">🚌 Bus</option>
                            <option value="motorcycle">🏍️ Motorcycle</option>
                            <option value="electric">⚡ Electric Vehicle</option>
                        </select>
                    </div>

                    <motion.button
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}
                        onClick={handleCalculate}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Calculator size={16} /> Calculate Emissions
                    </motion.button>

                    {calcResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: 16,
                                borderRadius: 12,
                                background: 'rgba(16, 185, 129, 0.06)',
                                border: '1px solid rgba(16, 185, 129, 0.12)',
                            }}
                        >
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
                                <div>
                                    <CloudRain size={18} color="#ef4444" style={{ margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{calcResult.co2}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>kg CO₂</p>
                                </div>
                                <div>
                                    <Droplets size={18} color="#3b82f6" style={{ margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800, color: '#3b82f6' }}>{calcResult.fuel}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>L Fuel</p>
                                </div>
                                <div>
                                    <TreePine size={18} color="#10b981" style={{ margin: '0 auto 4px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{calcResult.trees}</p>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Trees Needed</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Zone Emissions */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="card"
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Zone Emission Levels</h3>
                    <BarChart3 size={18} color="var(--text-muted)" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={emissionData.map(z => ({ name: z.zoneName.split(' ')[0], co2: z.co2Emission, aqi: z.airQualityIndex / 10 }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="co2" name="CO₂ Emission" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="aqi" name="AQI/10" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Fuel Consumption Trend */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card"
                style={{ marginTop: 16 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Leaf size={18} color="var(--accent-green)" />
                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>Fuel Consumption Trend</h3>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="fuel" name="Fuel (L)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
        </motion.div>
    );
}
