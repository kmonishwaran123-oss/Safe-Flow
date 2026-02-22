'use client';

import React, { useEffect, useRef, useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import { MapPin, AlertTriangle, RefreshCw, Layers, Filter } from 'lucide-react';

export default function TrafficPage() {
    const { fetchTrafficData, trafficData, loading } = useStore();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    useEffect(() => {
        fetchTrafficData();
        const interval = setInterval(fetchTrafficData, 15000);
        return () => clearInterval(interval);
    }, [fetchTrafficData]);

    useEffect(() => {
        drawHeatmap();
    }, [trafficData, filterLevel]);

    const drawHeatmap = () => {
        const canvas = canvasRef.current;
        if (!canvas || trafficData.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Dark background
        ctx.fillStyle = '#0f1729';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        for (let i = 0; i < height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }

        // Calculate bounds
        const lats = trafficData.map(d => d.lat);
        const lngs = trafficData.map(d => d.lng);
        const minLat = Math.min(...lats) - 0.02;
        const maxLat = Math.max(...lats) + 0.02;
        const minLng = Math.min(...lngs) - 0.02;
        const maxLng = Math.max(...lngs) + 0.02;

        const filteredData = filterLevel === 'all'
            ? trafficData
            : trafficData.filter(d => d.congestionCategory.toLowerCase() === filterLevel);

        // Draw connections between zones
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < filteredData.length; i++) {
            for (let j = i + 1; j < filteredData.length; j++) {
                const x1 = ((filteredData[i].lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
                const y1 = ((maxLat - filteredData[i].lat) / (maxLat - minLat)) * (height - 80) + 40;
                const x2 = ((filteredData[j].lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
                const y2 = ((maxLat - filteredData[j].lat) / (maxLat - minLat)) * (height - 80) + 40;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        // Draw heat zones
        filteredData.forEach(zone => {
            const x = ((zone.lng - minLng) / (maxLng - minLng)) * (width - 80) + 40;
            const y = ((maxLat - zone.lat) / (maxLat - minLat)) * (height - 80) + 40;
            const radius = 30 + zone.congestionLevel * 0.6;

            // Outer glow
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            if (zone.congestionCategory === 'High') {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
                gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            } else if (zone.congestionCategory === 'Medium') {
                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.5)');
                gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
                gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.5)');
                gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Center dot
            const dotColor = zone.congestionCategory === 'High' ? '#ef4444' : zone.congestionCategory === 'Medium' ? '#f59e0b' : '#10b981';
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();

            // White ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();

            // Label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(zone.zoneName, x, y - 18);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '10px Inter, sans-serif';
            ctx.fillText(`${zone.congestionLevel}%`, x, y + 26);
        });
    };

    const selectedData = trafficData.find(z => z.zoneId === selectedZone);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                {/* Map Area */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Map Controls */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--border-color)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Layers size={18} color="var(--accent-blue)" />
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Congestion Heatmap</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Filter size={14} color="var(--text-muted)" />
                            <select
                                className="select"
                                value={filterLevel}
                                onChange={(e) => setFilterLevel(e.target.value)}
                                style={{ padding: '6px 30px 6px 10px', fontSize: 12 }}
                            >
                                <option value="all">All Levels</option>
                                <option value="low">Low Only</option>
                                <option value="medium">Medium Only</option>
                                <option value="high">High Only</option>
                            </select>
                            <motion.button
                                className="btn-icon"
                                onClick={() => fetchTrafficData()}
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                                style={{ width: 32, height: 32 }}
                            >
                                <RefreshCw size={14} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Canvas heatmap */}
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={480}
                        style={{ width: '100%', height: 480, display: 'block' }}
                    />

                    {/* Legend */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 24,
                        padding: '12px 20px',
                        borderTop: '1px solid var(--border-color)',
                    }}>
                        {[
                            { label: 'Low (0-40%)', color: '#10b981' },
                            { label: 'Medium (41-70%)', color: '#f59e0b' },
                            { label: 'High (71-100%)', color: '#ef4444' },
                        ].map((item) => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}40` }} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Zone List */}
                <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>Zone Details</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{trafficData.length} active zones</p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {trafficData.map((zone) => (
                            <motion.div
                                key={zone.zoneId}
                                onClick={() => setSelectedZone(zone.zoneId === selectedZone ? null : zone.zoneId)}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                    padding: '14px',
                                    borderRadius: 12,
                                    cursor: 'pointer',
                                    background: selectedZone === zone.zoneId ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                    border: `1px solid ${selectedZone === zone.zoneId ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}`,
                                    marginBottom: 4,
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MapPin size={14} color={zone.congestionCategory === 'High' ? '#ef4444' : zone.congestionCategory === 'Medium' ? '#f59e0b' : '#10b981'} />
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{zone.zoneName}</span>
                                    </div>
                                    <span className={`badge badge-${zone.congestionCategory.toLowerCase()}`}>
                                        {zone.congestionCategory}
                                    </span>
                                </div>
                                <div className="congestion-bar" style={{ marginBottom: 8 }}>
                                    <div
                                        className={`congestion-fill ${zone.congestionCategory.toLowerCase()}`}
                                        style={{ width: `${zone.congestionLevel}%` }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                                    <span>{zone.averageSpeed} km/h</span>
                                    <span>{zone.vehicleCount.toLocaleString()} vehicles</span>
                                    {zone.incidents > 0 && (
                                        <span style={{ color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <AlertTriangle size={10} /> {zone.incidents}
                                        </span>
                                    )}
                                </div>

                                {/* Expanded Detail */}
                                {selectedZone === zone.zoneId && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Latitude</span>
                                                <p style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{zone.lat.toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Longitude</span>
                                                <p style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{zone.lng.toFixed(4)}</p>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Congestion</span>
                                                <p style={{ fontWeight: 600 }}>{zone.congestionLevel}%</p>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--text-muted)' }}>Updated</span>
                                                <p style={{ fontWeight: 600 }}>{new Date(zone.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
