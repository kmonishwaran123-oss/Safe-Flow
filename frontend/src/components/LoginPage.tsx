'use client';

import React, { useState } from 'react';
import useStore from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Lock, Mail, Shield, Truck, User, Eye, EyeOff,
    ArrowLeft, CheckCircle, AlertCircle, UserPlus, KeyRound,
} from 'lucide-react';

/* ---------- SVG icons for OAuth providers ---------- */
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const GithubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
);

export default function LoginPage() {
    const {
        login, loginWithGoogle, loginWithGithub, register, forgotPassword,
        loginError, loginLoading, authMode, setAuthMode, authView, setAuthView,
        authMessage, clearAuthError,
    } = useStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    const quickLogins = [
        { label: 'City Admin', email: 'admin@smartcity.gov', password: 'admin123', icon: Shield, color: '#8b5cf6' },
        { label: 'Fleet Manager', email: 'fleet@transport.com', password: 'fleet123', icon: Truck, color: '#3b82f6' },
        { label: 'Citizen', email: 'citizen@email.com', password: 'citizen123', icon: User, color: '#10b981' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (authView === 'register') {
            if (password !== confirmPassword) {
                useStore.setState({ loginError: 'Passwords do not match' });
                return;
            }
            if (password.length < 6) {
                useStore.setState({ loginError: 'Password must be at least 6 characters' });
                return;
            }
            await register(email, password, name);
        } else if (authView === 'forgot-password') {
            await forgotPassword(email);
        } else {
            await login(email, password);
        }
    };

    const handleQuickLogin = async (ql: (typeof quickLogins)[0]) => {
        setEmail(ql.email);
        setPassword(ql.password);
        setSelectedRole(ql.label);
        await login(ql.email, ql.password);
    };

    const switchView = (view: 'login' | 'register' | 'forgot-password') => {
        setAuthView(view);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
    };

    return (
        <div className="login-bg">
            {/* Animated background */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        style={{
                            position: 'absolute',
                            width: 200 + i * 60,
                            height: 200 + i * 60,
                            borderRadius: '50%',
                            border: '1px solid rgba(59, 130, 246, 0.06)',
                            left: `${15 + i * 12}%`,
                            top: `${10 + i * 10}%`,
                        }}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}
            </div>

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ maxWidth: 480 }}
            >
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <motion.div
                        style={{
                            width: 64, height: 64, borderRadius: 16,
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                        }}
                        animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.2)', '0 0 40px rgba(59,130,246,0.4)', '0 0 20px rgba(59,130,246,0.2)'] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        <Activity size={32} color="white" />
                    </motion.div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
                        <span className="gradient-text">Smart Mobility</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Urban Emission Reduction Platform</p>
                </div>

                {/* Auth Mode Toggle */}
                <div style={{
                    display: 'flex', borderRadius: 12, overflow: 'hidden',
                    border: '1px solid var(--border-color)', marginBottom: 20,
                }}>
                    <button
                        onClick={() => setAuthMode('local')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                            fontFamily: 'Inter, sans-serif',
                            background: authMode === 'local' ? 'var(--accent-blue)' : 'transparent',
                            color: authMode === 'local' ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        🔑 Local Auth
                    </button>
                    <button
                        onClick={() => setAuthMode('firebase')}
                        style={{
                            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                            fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                            fontFamily: 'Inter, sans-serif',
                            background: authMode === 'firebase' ? '#f59e0b' : 'transparent',
                            color: authMode === 'firebase' ? 'white' : 'var(--text-muted)',
                        }}
                    >
                        🔥 Firebase Auth
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* =========== LOGIN VIEW =========== */}
                    {authView === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Quick Login (local mode only) */}
                            {authMode === 'local' && (
                                <>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                                        Quick Access
                                    </p>
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                        {quickLogins.map((ql) => (
                                            <motion.button
                                                key={ql.label}
                                                onClick={() => handleQuickLogin(ql)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    flex: 1, padding: '10px 8px',
                                                    background: selectedRole === ql.label ? `${ql.color}15` : 'var(--bg-secondary)',
                                                    border: `1px solid ${selectedRole === ql.label ? ql.color + '40' : 'var(--border-color)'}`,
                                                    borderRadius: 10, cursor: 'pointer',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                                    transition: 'all 0.2s',
                                                    color: selectedRole === ql.label ? ql.color : 'var(--text-secondary)',
                                                }}
                                            >
                                                <ql.icon size={18} />
                                                <span style={{ fontSize: 11, fontWeight: 600 }}>{ql.label}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Firebase Social Login Buttons */}
                            {authMode === 'firebase' && (
                                <>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                        <motion.button
                                            onClick={loginWithGoogle}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                flex: 1, padding: '12px', borderRadius: 12,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                                color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                                                fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                                            }}
                                            disabled={loginLoading}
                                        >
                                            <GoogleIcon /> Sign in with Google
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        onClick={loginWithGithub}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: 12,
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                            color: 'var(--text-primary)', fontSize: 14, fontWeight: 500,
                                            fontFamily: 'Inter, sans-serif', marginBottom: 16, transition: 'all 0.2s',
                                        }}
                                        disabled={loginLoading}
                                    >
                                        <GithubIcon /> Sign in with GitHub
                                    </motion.button>
                                </>
                            )}

                            {/* Divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {authMode === 'firebase' ? 'or sign in with email' : 'or sign in manually'}
                                </span>
                                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40 }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40, paddingRight: 44 }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                                                padding: 4,
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot password link */}
                                <div style={{ textAlign: 'right', marginBottom: 16 }}>
                                    <button
                                        type="button"
                                        onClick={() => switchView('forgot-password')}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: 'var(--accent-blue)', fontSize: 12, fontWeight: 500,
                                            fontFamily: 'Inter, sans-serif',
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Error / Success Messages */}
                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -5, height: 0 }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                                fontSize: 13, color: '#fca5a5',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                        >
                                            <AlertCircle size={16} /> {loginError}
                                        </motion.div>
                                    )}
                                    {authMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -5, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, y: -5, height: 0 }}
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                                fontSize: 13, color: '#6ee7b7',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                        >
                                            <CheckCircle size={16} /> {authMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <motion.button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loginLoading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15 }}
                                >
                                    {loginLoading ? (
                                        <motion.div
                                            style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    ) : (
                                        'Sign In to Dashboard'
                                    )}
                                </motion.button>
                            </form>

                            {/* Register link */}
                            <div style={{ textAlign: 'center', marginTop: 16 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Don&apos;t have an account? </span>
                                <button
                                    onClick={() => switchView('register')}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--accent-blue)', fontSize: 13, fontWeight: 600,
                                        fontFamily: 'Inter, sans-serif',
                                    }}
                                >
                                    Create Account
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* =========== REGISTER VIEW =========== */}
                    {authView === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => switchView('login')}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--accent-blue)', fontSize: 13, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <UserPlus size={20} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Create Account</h2>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Join the Smart Mobility platform</p>
                                </div>
                            </div>

                            {/* Social registration */}
                            {authMode === 'firebase' && (
                                <>
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                        <motion.button
                                            onClick={loginWithGoogle}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                flex: 1, padding: '11px', borderRadius: 12,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                                                fontFamily: 'Inter, sans-serif',
                                            }}
                                        >
                                            <GoogleIcon /> Google
                                        </motion.button>
                                        <motion.button
                                            onClick={loginWithGithub}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            style={{
                                                flex: 1, padding: '11px', borderRadius: 12,
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                                color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
                                                fontFamily: 'Inter, sans-serif',
                                            }}
                                        >
                                            <GithubIcon /> GitHub
                                        </motion.button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or register with email</span>
                                        <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                                    </div>
                                </>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Full Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={name}
                                            onChange={(e) => { setName(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40 }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40 }}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min 6 characters"
                                            value={password}
                                            onChange={(e) => { setPassword(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40, paddingRight: 44 }}
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {/* Password strength indicator */}
                                    {password.length > 0 && (
                                        <div style={{ marginTop: 6, display: 'flex', gap: 3 }}>
                                            {[1, 2, 3, 4].map(level => (
                                                <div
                                                    key={level}
                                                    style={{
                                                        flex: 1, height: 3, borderRadius: 2,
                                                        background: password.length >= level * 3
                                                            ? level <= 1 ? '#ef4444' : level <= 2 ? '#f59e0b' : level <= 3 ? '#06b6d4' : '#10b981'
                                                            : 'var(--bg-secondary)',
                                                        transition: 'background 0.3s',
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Confirm Password
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type="password"
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(e) => { setConfirmPassword(e.target.value); clearAuthError(); }}
                                            style={{
                                                paddingLeft: 40,
                                                borderColor: confirmPassword && password !== confirmPassword ? '#ef4444' : undefined,
                                            }}
                                            required
                                        />
                                        {confirmPassword && password === confirmPassword && (
                                            <CheckCircle size={16} color="#10b981" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                        )}
                                    </div>
                                </div>

                                {/* Error / Success */}
                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                                fontSize: 13, color: '#fca5a5',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                        >
                                            <AlertCircle size={16} /> {loginError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loginLoading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    style={{
                                        width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15,
                                        background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                                    }}
                                >
                                    {loginLoading ? (
                                        <motion.div
                                            style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    ) : (
                                        <><UserPlus size={18} /> Create Account</>
                                    )}
                                </motion.button>
                            </form>

                            <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
                                By creating an account, you agree to our Terms of Service
                            </p>
                        </motion.div>
                    )}

                    {/* =========== FORGOT PASSWORD VIEW =========== */}
                    {authView === 'forgot-password' && (
                        <motion.div
                            key="forgot"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => switchView('login')}
                                style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: 'var(--accent-blue)', fontSize: 13, fontWeight: 500,
                                    display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                <ArrowLeft size={16} /> Back to Sign In
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <KeyRound size={20} color="white" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reset Password</h2>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>We&apos;ll send a reset link to your email</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
                                        Email Address
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            className="input"
                                            type="email"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); clearAuthError(); }}
                                            style={{ paddingLeft: 40 }}
                                            required
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {loginError && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                                fontSize: 13, color: '#fca5a5',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                        >
                                            <AlertCircle size={16} /> {loginError}
                                        </motion.div>
                                    )}
                                    {authMessage && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                                borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                                                fontSize: 13, color: '#6ee7b7',
                                                display: 'flex', alignItems: 'center', gap: 8,
                                            }}
                                        >
                                            <CheckCircle size={16} /> {authMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loginLoading}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    style={{
                                        width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 15,
                                        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    }}
                                >
                                    {loginLoading ? (
                                        <motion.div
                                            style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                        />
                                    ) : (
                                        <><Mail size={18} /> Send Reset Link</>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div style={{
                    marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Smart Mobility v2.0 • {authMode === 'firebase' ? '🔥 Firebase' : '🔑 Local'} Auth
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: authMode === 'firebase' ? '#f59e0b' : 'var(--accent-green)',
                        }} />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Secure Login</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
