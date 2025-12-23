import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, Zap } from 'lucide-react';
// Note: We'll assume the parent component handles navigation after login via user state

import { createUserProfile } from '../services/dbService';

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
            setError('Failed to log in: ' + err.message);
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
            setError('Google Log in failed: ' + err.message);
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>

                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield fill="#0F172A" size={28} color="#0F172A" />
                        <span style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>DoOrDue</span>
                    </div>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
                    Commit to your goals today
                </p>

                {error && <div style={{ backgroundColor: '#FEF2F2', color: '#EF4444', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Mail size={16} color="#64748B" />
                            <input
                                type="email" required
                                style={{ border: 'none', outline: 'none', width: '100%' }}
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Password</label>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Lock size={16} color="#64748B" />
                            <input
                                type="password" required
                                style={{ border: 'none', outline: 'none', width: '100%' }}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="btn" style={{ backgroundColor: '#0F172A', color: 'white', padding: '14px', marginTop: '8px' }}>
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ margin: '24px 0', borderTop: '1px solid #E2E8F0', position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0 10px', fontSize: '12px', color: '#94A3B8' }}>OR</span>
                </div>

                <button onClick={handleGoogle} className="btn" style={{ width: '100%', backgroundColor: 'white', border: '1px solid #E2E8F0', color: '#0F172A' }}>
                    <Zap size={16} fill="orange" color="orange" /> Continue with Google
                </button>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                    Don't have an account? <button onClick={() => onNavigate('signup')} style={{ background: 'none', border: 'none', color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}>Sign up</button>
                </p>

                {/* Admin Link */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        onClick={() => onNavigate('admin_login')}
                        style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '11px', cursor: 'pointer' }}
                    >
                        Admin Portal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
