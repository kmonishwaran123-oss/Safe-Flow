'use client';

import React, { useEffect, useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import {
    Settings, Wifi, Satellite, Globe, Database,
    Bell, BellOff, Save, RotateCcw, Monitor, Ruler,
    Gauge, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
    const { fetchSettings, updateSettings, settings, user } = useStore();
    const [localSettings, setLocalSettings] = useState(settings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (section: string, key: string) => {
        if (!localSettings) return;
        setLocalSettings(prev => {
            if (!prev) return prev;
            const sectionObj = prev[section as keyof typeof prev];
            if (typeof sectionObj === 'object' && sectionObj !== null) {
                return { ...prev, [section]: { ...sectionObj, [key]: !(sectionObj as Record<string, boolean>)[key] } };
            }
            return prev;
        });
    };

    const handleSave = async () => {
        if (!localSettings) return;
        await updateSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        if (settings) setLocalSettings(settings);
    };

    if (!localSettings) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Data Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Satellite size={22} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Data Sources</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure traffic data feeds</p>
                        </div>
                    </div>

                    {[
                        { key: 'gps', label: 'GPS Tracking', desc: 'Vehicle GPS coordinate feeds', icon: Satellite },
                        { key: 'iot', label: 'IoT Sensors', desc: 'Smart city traffic sensors', icon: Wifi },
                        { key: 'publicApi', label: 'Public APIs', desc: 'Government traffic data APIs', icon: Globe },
                        { key: 'historical', label: 'Historical Data', desc: 'Past traffic pattern analysis', icon: Database },
                    ].map(source => (
                        <div
                            key={source.key}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 0',
                                borderBottom: '1px solid var(--border-color)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <source.icon size={18} color="var(--text-muted)" />
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{source.label}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{source.desc}</p>
                                </div>
                            </div>
                            <div
                                className={`toggle ${localSettings.dataSources[source.key as keyof typeof localSettings.dataSources] ? 'active' : ''}`}
                                onClick={() => handleToggle('dataSources', source.key)}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Bell size={22} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Notifications</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Alert preferences</p>
                        </div>
                    </div>

                    {[
                        { key: 'congestion', label: 'Congestion Alerts', desc: 'High traffic notifications', icon: Gauge },
                        { key: 'accidents', label: 'Accident Alerts', desc: 'Accident and roadblock reports', icon: AlertTriangle },
                        { key: 'emissions', label: 'Emission Alerts', desc: 'High emission zone warnings', icon: Settings },
                        { key: 'roadwork', label: 'Roadwork Alerts', desc: 'Construction zone notifications', icon: Settings },
                    ].map(notif => (
                        <div
                            key={notif.key}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '14px 0',
                                borderBottom: '1px solid var(--border-color)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {localSettings.notifications[notif.key as keyof typeof localSettings.notifications] ?
                                    <Bell size={18} color="var(--accent-blue)" /> :
                                    <BellOff size={18} color="var(--text-muted)" />
                                }
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>{notif.label}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{notif.desc}</p>
                                </div>
                            </div>
                            <div
                                className={`toggle ${localSettings.notifications[notif.key as keyof typeof localSettings.notifications] ? 'active' : ''}`}
                                onClick={() => handleToggle('notifications', notif.key)}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Emission Thresholds */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Gauge size={22} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Emission Thresholds</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>CO₂ alert levels (tons/day)</p>
                        </div>
                    </div>

                    {[
                        { key: 'low', label: 'Low Threshold', color: '#10b981' },
                        { key: 'medium', label: 'Medium Threshold', color: '#f59e0b' },
                        { key: 'high', label: 'High Threshold', color: '#ef4444' },
                    ].map(threshold => (
                        <div key={threshold.key} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <label style={{ fontSize: 13, fontWeight: 500 }}>{threshold.label}</label>
                                <span style={{ fontSize: 13, fontWeight: 700, color: threshold.color, fontFamily: 'JetBrains Mono, monospace' }}>
                                    {localSettings.emissionThresholds[threshold.key as keyof typeof localSettings.emissionThresholds]}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="500"
                                value={localSettings.emissionThresholds[threshold.key as keyof typeof localSettings.emissionThresholds]}
                                onChange={(e) => {
                                    setLocalSettings(prev => prev ? {
                                        ...prev,
                                        emissionThresholds: {
                                            ...prev.emissionThresholds,
                                            [threshold.key]: parseInt(e.target.value),
                                        },
                                    } : prev);
                                }}
                                style={{
                                    width: '100%',
                                    accentColor: threshold.color,
                                    height: 6,
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    ))}
                </motion.div>

                {/* General */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card"
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Monitor size={22} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>General</h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Display & preferences</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Data Refresh Interval</label>
                        <select
                            className="select"
                            style={{ width: '100%' }}
                            value={localSettings.refreshInterval}
                            onChange={(e) => setLocalSettings(prev => prev ? { ...prev, refreshInterval: parseInt(e.target.value) } : prev)}
                        >
                            <option value={10}>Every 10 seconds</option>
                            <option value={30}>Every 30 seconds</option>
                            <option value={60}>Every 1 minute</option>
                            <option value={300}>Every 5 minutes</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Map Style</label>
                        <select
                            className="select"
                            style={{ width: '100%' }}
                            value={localSettings.mapStyle}
                            onChange={(e) => setLocalSettings(prev => prev ? { ...prev, mapStyle: e.target.value } : prev)}
                        >
                            <option value="dark">Dark Mode</option>
                            <option value="satellite">Satellite</option>
                            <option value="terrain">Terrain</option>
                            <option value="light">Light Mode</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, display: 'block' }}>Measurement Unit</label>
                        <select
                            className="select"
                            style={{ width: '100%' }}
                            value={localSettings.unit}
                            onChange={(e) => setLocalSettings(prev => prev ? { ...prev, unit: e.target.value } : prev)}
                        >
                            <option value="metric">Metric (km, kg)</option>
                            <option value="imperial">Imperial (mi, lb)</option>
                        </select>
                    </div>

                    {/* User Info */}
                    <div style={{
                        marginTop: 20,
                        padding: 16,
                        borderRadius: 12,
                        background: 'rgba(59, 130, 246, 0.06)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                    }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Logged in as</p>
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role?.replace('_', ' ')} • {user?.email}</p>
                    </div>
                </motion.div>
            </div>

            {/* Save Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    marginTop: 20,
                    padding: '16px 24px',
                    borderRadius: 16,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                }}
            >
                <button className="btn-secondary" onClick={handleReset}>
                    <RotateCcw size={16} /> Reset
                </button>
                <motion.button
                    className="btn-primary"
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {saved ? (
                        <><motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}><Save size={16} /></motion.span> Saved!</>
                    ) : (
                        <><Save size={16} /> Save Settings</>
                    )}
                </motion.button>
            </motion.div>
        </motion.div>
    );
}
