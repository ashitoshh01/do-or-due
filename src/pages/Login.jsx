import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Zap } from 'lucide-react';
// Note: We'll assume the parent component handles navigation after login via user state

import { createUserProfile } from '../services/dbService';
import { getFriendlyErrorMessage } from '../utils/errorMapping';

const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            // Auth listener in App.jsx will redirect
        } catch (err) {
            setError(getFriendlyErrorMessage(err));
        }
        setLoading(false);
    };

    const handleGoogle = async () => {
        try {
            setError('');
            const result = await googleLogin();
            // Ensure profile exists (safe to call multiple times)
            await createUserProfile(result.user.uid, result.user.email);
        } catch (err) {
            console.error(err);
            setError(getFriendlyErrorMessage(err));
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">

                {/* Logo */}
                <div className="login-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield fill="hsl(var(--color-text-main))" size={28} color="hsl(var(--color-text-main))" />
                        <span style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', color: 'hsl(var(--color-text-main))' }}>DoOrDue</span>
                    </div>
                </div>

                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">
                    Commit to your goals today
                </p>

                {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'hsl(var(--color-accent-red))', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="login-input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Email</label>
                        <div className="login-input-wrapper">
                            <Mail size={16} />
                            <input
                                type="email" required
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Password</label>
                        <div className="login-input-wrapper">
                            <Lock size={16} />
                            <input
                                type="password" required
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-divider">
                    <span>OR</span>
                </div>

                <button onClick={handleGoogle} className="btn" style={{ width: '100%', backgroundColor: 'hsl(var(--color-bg-input))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text-main))' }}>
                    <Zap size={16} fill="#F59E0B" color="#F59E0B" /> Continue with Google
                </button>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--color-text-secondary))' }}>
                    Don't have an account? <button onClick={() => onNavigate('signup')} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-text-main))', fontWeight: 700, cursor: 'pointer' }}>Sign up</button>
                </p>

                {/* Admin Link */}
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <button
                        onClick={() => onNavigate('admin_login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'hsl(var(--color-text-secondary))',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            opacity: 0.6,
                            transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.opacity = 1}
                        onMouseLeave={e => e.target.style.opacity = 0.6}
                    >
                        Admin Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
