import React, { useState } from 'react';
import { adminLogin } from '../../services/adminService';
import { Shield, Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(email, password);
            // Call parent handler to update App state if necessary, 
            // but mainly we just need to navigate to the portal.
            // We'll rely on the localStorage token for protection.
            if (onLogin) onLogin();
            // Since this component is likely rendered inside the App router,
            // we might want to let the App handle the view switch, 
            // OR if this is a route, navigate to /admin/portal

            // For this non-router architecture (conditional rendering), 
            // onLogin is passed from App.jsx to setAppView('admin_portal')

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F172A',
            color: 'white'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: '#1E293B',
                borderRadius: '16px',
                border: '1px solid #334155',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: '#334155',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Shield size={32} color="#F59E0B" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white' }}>Admin Portal</h1>
                    <p style={{ color: '#94A3B8' }}>Restricted Access</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #EF4444', borderRadius: '8px',
                        color: '#EF4444', fontSize: '14px', marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '8px' }}>EMAIL</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: '#0F172A', border: '1px solid #334155',
                            borderRadius: '8px', padding: '12px'
                        }}>
                            <Lock size={16} color="#64748B" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@doordue.com"
                                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#CBD5E1', marginBottom: '8px' }}>PASSWORD</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: '#0F172A', border: '1px solid #334155',
                            borderRadius: '8px', padding: '12px'
                        }}>
                            <Lock size={16} color="#64748B" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#F59E0B', color: '#0F172A', fontWeight: 700,
                            border: 'none', borderRadius: '8px', padding: '14px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '12px'
                        }}
                    >
                        {loading ? 'Verifying...' : 'Access Portal'}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <button
                        onClick={() => window.location.reload()} // Quick way to go back to main app for now
                        style={{
                            background: 'none', border: 'none', color: '#64748B',
                            fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
                        }}
                    >
                        Back to DoOrDue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
