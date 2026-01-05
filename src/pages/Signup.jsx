import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User } from 'lucide-react';

import { createUserProfile } from '../services/dbService';
import { getFriendlyErrorMessage } from '../utils/errorMapping';

const Signup = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setError('');
            setSuccess('');
            setLoading(true);
            const userCred = await signup(email, password);
            // Create User Profile in Firestore with Name
            await createUserProfile(userCred.user.uid, email, name);
            setSuccess('Account created! Redirecting...');
            // Auth listener handles redirect
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already exists. Redirecting to login...');
                setTimeout(() => onNavigate('login'), 2000);
            } else {
                setError(getFriendlyErrorMessage(err));
            }
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <div className="login-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield fill="hsl(var(--color-text-main))" size={28} color="hsl(var(--color-text-main))" />
                        <span style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px', color: 'hsl(var(--color-text-main))' }}>DoOrDue</span>
                    </div>
                </div>

                <h2 className="login-title">Join the Club</h2>
                <p className="login-subtitle">
                    Start getting things done. For real.
                </p>

                {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'hsl(var(--color-accent-red))', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

                {success && <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'hsl(var(--color-accent-green))', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', textAlign: 'center', fontWeight: 600 }}>{success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Name Field */}
                    <div className="login-input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Full Name</label>
                        <div className="login-input-wrapper">
                            <User size={16} />
                            <input
                                type="text" required
                                value={name} onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                            />
                        </div>
                    </div>

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
                                placeholder="At least 6 characters"
                            />
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="login-input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Confirm Password</label>
                        <div className="login-input-wrapper">
                            <Lock size={16} />
                            <input
                                type="password" required
                                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    <button disabled={loading || success} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                        {success ? 'Success!' : (loading ? 'Creating Account...' : 'Sign Up')}
                    </button>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'hsl(var(--color-text-secondary))' }}>
                    Already have an account? <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: 'hsl(var(--color-text-main))', fontWeight: 700, cursor: 'pointer' }}>Log In</button>
                </p>

            </div>
        </div>
    );
};

export default Signup;
