'use client';

import React, { useState } from 'react';
import useStore from '@/store/useStore';
import { motion } from 'framer-motion';
import {
    Navigation, Clock, Fuel, CloudRain, Leaf, Route as RouteIcon,
    MapPin, ArrowRight, CheckCircle, Zap, Car,
} from 'lucide-react';

const presetLocations = [
    { name: 'Downtown Core', lat: 28.6139, lng: 77.2090 },
    { name: 'Tech District', lat: 28.6292, lng: 77.2194 },
    { name: 'Industrial Zone', lat: 28.5986, lng: 77.2322 },
    { name: 'Residential North', lat: 28.6448, lng: 77.2167 },
    { name: 'Green Belt', lat: 28.6095, lng: 77.1855 },
    { name: 'Airport Hub', lat: 28.5562, lng: 77.1000 },
    { name: 'University Area', lat: 28.6353, lng: 77.1935 },
    { name: 'Market District', lat: 28.6507, lng: 77.2334 },
];

export default function RoutePlannerPage() {
    const { fetchRoutes, routes, loading } = useStore();
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [vehicleType, setVehicleType] = useState('car');

    const handleSearch = async () => {
        const originLoc = presetLocations.find(l => l.name === origin);
        const destLoc = presetLocations.find(l => l.name === destination);
        if (!originLoc || !destLoc) return;
        await fetchRoutes(
            { lat: originLoc.lat, lng: originLoc.lng },
            { lat: destLoc.lat, lng: destLoc.lng }
        );
    };

    const vehicleTypes = [
        { id: 'car', label: 'Car', icon: Car },
        { id: 'electric', label: 'Electric', icon: Zap },
        { id: 'motorcycle', label: 'Bike', icon: Navigation },
        { id: 'bus', label: 'Bus', icon: RouteIcon },
    ];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            {/* Route Input Section */}
            <motion.div
                className="card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{ marginBottom: 20, padding: 28 }}
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
                        <Navigation size={22} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>AI Route Optimizer</h3>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Find the most efficient, eco-friendly route</p>
                    </div>
                </div>

                {/* Vehicle Type */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                    {vehicleTypes.map(vt => (
                        <motion.button
                            key={vt.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setVehicleType(vt.id)}
                            className={vehicleType === vt.id ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 16px', fontSize: 13 }}
                        >
                            <vt.icon size={16} />
                            {vt.label}
                        </motion.button>
                    ))}
                </div>

                {/* Origin / Destination */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Origin
                        </label>
                        <select className="select" value={origin} onChange={e => setOrigin(e.target.value)} style={{ width: '100%' }}>
                            <option value="">Select starting point</option>
                            {presetLocations.map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <ArrowRight size={18} color="var(--accent-blue)" />
                    </div>

                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Destination
                        </label>
                        <select className="select" value={destination} onChange={e => setDestination(e.target.value)} style={{ width: '100%' }}>
                            <option value="">Select destination</option>
                            {presetLocations.filter(l => l.name !== origin).map(loc => (
                                <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <motion.button
                        className="btn-primary"
                        onClick={handleSearch}
                        disabled={!origin || !destination || loading.routes}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ padding: '12px 28px', height: 44 }}
                    >
                        {loading.routes ? (
                            <motion.div
                                style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <>
                                <Navigation size={16} /> Find Routes
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>

            {/* Routes Results */}
            {routes.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                        Optimized Routes
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
                            {routes.length} alternatives found
                        </span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                        {routes.map((route, idx) => (
                            <motion.div
                                key={route.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => setSelectedRoute(route.id === selectedRoute ? null : route.id)}
                                className="card"
                                style={{
                                    cursor: 'pointer',
                                    borderColor: selectedRoute === route.id ? route.color + '60' : undefined,
                                    boxShadow: selectedRoute === route.id ? `0 0 20px ${route.color}20` : undefined,
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Top accent bar */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 3,
                                    background: route.color,
                                }} />

                                {/* Eco badge */}
                                {route.type === 'eco' && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 14,
                                        right: 14,
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                        borderRadius: 8,
                                        padding: '4px 10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}>
                                        <Leaf size={12} color="#10b981" />
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>Eco</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                    <div style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: route.color,
                                        boxShadow: `0 0 8px ${route.color}60`,
                                    }} />
                                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>{route.name}</h4>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <RouteIcon size={15} color="var(--text-muted)" />
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Distance</p>
                                            <p style={{ fontSize: 14, fontWeight: 700 }}>{route.distance} km</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Clock size={15} color="var(--text-muted)" />
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Est. Time</p>
                                            <p style={{ fontSize: 14, fontWeight: 700 }}>{route.estimatedTime} min</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <CloudRain size={15} color="var(--text-muted)" />
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>CO₂</p>
                                            <p style={{ fontSize: 14, fontWeight: 700 }}>{route.co2Emission} kg</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Fuel size={15} color="var(--text-muted)" />
                                        <div>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fuel</p>
                                            <p style={{ fontSize: 14, fontWeight: 700 }}>{route.fuelConsumption} L</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Congestion bar */}
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                                        <span>Congestion Level</span>
                                        <span>{route.congestionLevel}%</span>
                                    </div>
                                    <div className="congestion-bar">
                                        <div
                                            className={`congestion-fill ${route.congestionLevel > 70 ? 'high' : route.congestionLevel > 40 ? 'medium' : 'low'}`}
                                            style={{ width: `${route.congestionLevel}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Emission saved */}
                                {route.emissionSaved > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        style={{
                                            marginTop: 14,
                                            padding: '10px 14px',
                                            borderRadius: 10,
                                            background: 'rgba(16, 185, 129, 0.08)',
                                            border: '1px solid rgba(16, 185, 129, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <CheckCircle size={16} color="var(--accent-green)" />
                                        <span style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600 }}>
                                            Saves {route.emissionSaved} kg CO₂ vs fastest route
                                        </span>
                                    </motion.div>
                                )}

                                {/* Select button */}
                                <motion.button
                                    className={selectedRoute === route.id ? 'btn-primary' : 'btn-secondary'}
                                    style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '10px' }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    {selectedRoute === route.id ? (
                                        <><CheckCircle size={16} /> Selected</>
                                    ) : (
                                        <><Navigation size={16} /> Select Route</>
                                    )}
                                </motion.button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {routes.length === 0 && !loading.routes && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card"
                    style={{ textAlign: 'center', padding: '60px 40px' }}
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Navigation size={48} color="var(--accent-blue)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                    </motion.div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Plan Your Journey</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                        Select an origin and destination above to discover AI-optimized routes with emission comparisons.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
