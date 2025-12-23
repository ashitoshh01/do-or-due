import React from 'react';
import { Shield, Users, ArrowRight, Zap, Target } from 'lucide-react';

const Landing = ({ onNavigate }) => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0F172A', // Slate 900
            fontFamily: "'Outfit', sans-serif",
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Ambient Background Effects */}
            <div style={{
                position: 'absolute', top: '-20%', left: '-10%', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(60px)', zIndex: 0
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(60px)', zIndex: 0
            }} />

            <div className="animate-in" style={{
                position: 'relative', zIndex: 1, maxWidth: '900px', width: '100%', padding: '20px',
                textAlign: 'center'
            }}>
                {/* Hero Section */}
                <div style={{ marginBottom: '60px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        background: 'rgba(30, 41, 59, 0.5)', padding: '8px 24px', borderRadius: '50px',
                        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                        marginBottom: '24px'
                    }}>
                        <Shield size={20} className="text-amber-500" />
                        <span style={{ color: 'white', fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>
                            OFFICIAL PLATFORM
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: '64px', fontWeight: 800, color: 'white', lineHeight: 1.1,
                        marginBottom: '20px', letterSpacing: '-0.02em'
                    }}>
                        Do Or <span style={{ color: '#F59E0B' }}>Due</span>
                    </h1>
                    <p style={{
                        fontSize: '18px', color: '#94A3B8', maxWidth: '500px', margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        The ultimate accountability platform. Stake your coins, prove your work, and level up.
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px',
                    padding: '0 20px'
                }}>
                    {/* User Portal Card */}
                    <button
                        onClick={() => onNavigate('login')}
                        className="landing-card"
                        style={{
                            background: '#1E293B', borderRadius: '24px', padding: '40px',
                            border: '1px solid #334155', textAlign: 'left', cursor: 'pointer',
                            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', gap: '20px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = '#3B82F6';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#334155';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '56px', height: '56px', background: 'rgba(59, 130, 246, 0.1)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#3B82F6', marginBottom: '8px'
                        }}>
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                User App
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.5 }}>
                                Access your dashboard, manage tasks, and climb the leaderboard.
                            </p>
                        </div>
                        <div style={{
                            marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#3B82F6', fontWeight: 600, fontSize: '14px'
                        }}>
                            Launch App <ArrowRight size={16} />
                        </div>
                    </button>

                    {/* Admin Portal Card */}
                    <button
                        onClick={() => onNavigate('admin_login')}
                        className="landing-card"
                        style={{
                            background: '#1E293B', borderRadius: '24px', padding: '40px',
                            border: '1px solid #334155', textAlign: 'left', cursor: 'pointer',
                            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', gap: '20px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = '#F59E0B';
                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(245, 158, 11, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = '#334155';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            width: '56px', height: '56px', background: 'rgba(245, 158, 11, 0.1)',
                            borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F59E0B', marginBottom: '8px'
                        }}>
                            <Target size={28} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
                                Admin Portal
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: 1.5 }}>
                                Review proofs, manage users, and oversee platform operations.
                            </p>
                        </div>
                        <div style={{
                            marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#F59E0B', fontWeight: 600, fontSize: '14px'
                        }}>
                            Access Portal <ArrowRight size={16} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Landing;
