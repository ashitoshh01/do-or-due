import React, { useState } from 'react';
import { adminLogin } from '../../services/adminService';
import { Shield, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminLogin = ({ onLogin }) => {
    const { isDark, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        // ... (existing logic)
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await adminLogin(email, password);
            if (onLogin) onLogin();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const bg = isDark ? '#0F172A' : '#F8FAFC';
    const cardBg = isDark ? '#1E293B' : 'white';
    const textColor = isDark ? 'white' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    const inputBg = isDark ? '#0F172A' : '#F1F5F9';

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bg,
            color: textColor,
            transition: 'background-color 0.3s, color 0.3s'
        }}>
            <div style={{ position: 'absolute', top: 24, right: 24 }}>
                <button
                    onClick={toggleTheme}
                    style={{
                        background: isDark ? '#334155' : 'white',
                        border: `1px solid ${borderColor}`,
                        color: isDark ? '#FCD34D' : '#64748B',
                        padding: '10px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '40px',
                background: cardBg,
                borderRadius: '16px',
                border: `1px solid ${borderColor}`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: isDark ? '#334155' : '#E0F2FE',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Shield size={32} color={isDark ? "#F59E0B" : "#0284C7"} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: textColor }}>Admin Portal</h1>
                    <p style={{ color: subTextColor }}>Restricted Access</p>
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
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: subTextColor, marginBottom: '8px' }}>EMAIL</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: inputBg, border: `1px solid ${borderColor}`,
                            borderRadius: '8px', padding: '12px'
                        }}>
                            <Lock size={16} color="#64748B" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@doordue.com"
                                style={{ background: 'transparent', border: 'none', color: textColor, width: '100%', outline: 'none' }}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: subTextColor, marginBottom: '8px' }}>PASSWORD</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            background: inputBg, border: `1px solid ${borderColor}`,
                            borderRadius: '8px', padding: '12px'
                        }}>
                            <Lock size={16} color="#64748B" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ background: 'transparent', border: 'none', color: textColor, width: '100%', outline: 'none' }}
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
                            background: 'none', border: 'none', color: subTextColor,
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
