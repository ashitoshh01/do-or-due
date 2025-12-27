import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User } from 'lucide-react';

import { createUserProfile } from '../services/dbService';
import { getFriendlyErrorMessage } from '../utils/errorMapping';

const Signup = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const userCred = await signup(email, password);
            // Create User Profile in Firestore
            await createUserProfile(userCred.user.uid, email);
            // Auth listener handles redirect
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email already exists. Redirecting to login...');
                setTimeout(() => onNavigate('login'), 2000);
            } else {
                setError(getFriendlyErrorMessage(err));
            }
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Shield fill="#0F172A" size={28} color="#0F172A" />
                        <span style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>DoOrDue</span>
                    </div>
                </div>

                <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Join the Club</h2>
                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px', textAlign: 'center' }}>
                    Start getting things done. For real.
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
                                placeholder="At least 6 characters"
                            />
                        </div>
                    </div>

                    <button disabled={loading} className="btn" style={{ backgroundColor: '#0F172A', color: 'white', padding: '14px', marginTop: '8px' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                    Already have an account? <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}>Log In</button>
                </p>

            </div>
        </div>
    );
};

export default Signup;
