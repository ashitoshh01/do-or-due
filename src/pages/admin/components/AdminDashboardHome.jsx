import React from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, Activity } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AdminDashboardHome = ({ stats, onNavigate }) => {
    const { isDark } = useTheme();

    const cardBg = isDark ? '#1E293B' : 'white';
    const cardBorder = isDark ? '1px solid #334155' : '1px solid #E2E8F0';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';

    return (
        <div className="animate-in">
            {/* Header / Welcome */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: textColor, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    Dashboard Overview
                </h1>
                <p style={{ color: subTextColor, fontSize: '16px', maxWidth: '600px' }}>
                    Monitor user verifications, approve requests, and manage task disputes efficiently.
                </p>
            </div>

            {/* Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* 1. Pending Tasks (Focus) */}
                <div
                    onClick={() => onNavigate('pending')}
                    style={{
                        background: isDark ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)',
                        border: isDark ? '1px solid #1E40AF' : '1px solid #BFDBFE',
                        borderRadius: '24px',
                        padding: '32px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    className="hover-card"
                >
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.1 }}>
                        <Clock size={120} color="#2563EB" />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <div style={{ width: '48px', height: '48px', background: '#2563EB', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                            <Clock size={24} color="white" />
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#60A5FA' : '#1E3A8A', marginBottom: '8px' }}>Pending Reviews</h2>
                        <div style={{ fontSize: '48px', fontWeight: 800, color: textColor, lineHeight: 1 }}>{stats.pending}</div>
                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#2563EB', fontWeight: 600 }}>
                            Review Queue <ChevronRight size={16} />
                        </div>
                    </div>
                </div>

                {/* 2. Approved Tasks */}
                <div
                    onClick={() => onNavigate('approved')}
                    style={{
                        background: cardBg,
                        border: cardBorder,
                        borderRadius: '24px',
                        padding: '32px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    className="hover-card"
                >
                    <div style={{ width: '48px', height: '48px', background: isDark ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <CheckCircle size={24} color="#16A34A" />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#4ADE80' : '#14532D', marginBottom: '8px' }}>Approved</h2>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: textColor, lineHeight: 1 }}>{stats.approved}</div>
                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#16A34A', fontWeight: 600 }}>
                        View History <ChevronRight size={16} />
                    </div>
                </div>

                {/* 3. Rejected Tasks */}
                <div
                    onClick={() => onNavigate('failed')}
                    style={{
                        background: cardBg,
                        border: cardBorder,
                        borderRadius: '24px',
                        padding: '32px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    className="hover-card"
                >
                    <div style={{ width: '48px', height: '48px', background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                        <XCircle size={24} color="#EF4444" />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: isDark ? '#F87171' : '#991B1B', marginBottom: '8px' }}>Rejected / Failed</h2>
                    <div style={{ fontSize: '48px', fontWeight: 800, color: textColor, lineHeight: 1 }}>{stats.failed}</div>
                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#EF4444', fontWeight: 600 }}>
                        View Details <ChevronRight size={16} />
                    </div>
                </div>
            </div>

            {/* Quick Activity / Recent */}
            <div style={{ marginTop: '40px', padding: '32px', background: cardBg, borderRadius: '24px', border: cardBorder }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Activity size={20} color={subTextColor} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: subTextColor }}>Live System Status</h3>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Admin Response Rate</div>
                        <div style={{ height: '8px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '85%', height: '100%', background: '#4F46E5', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: textColor }}>Very High</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pending Queue Load</span>
                            <span style={{ fontSize: '10px', opacity: 0.7 }}>Low</span>
                        </div>
                        <div style={{ height: '8px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(stats.pending * 5, 100)}%`, height: '100%', background: stats.pending > 10 ? '#EF4444' : '#22C55E', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 600, color: textColor }}>
                            {stats.pending > 10 ? 'Heavy Load' : 'Normal'}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.1) !important;
                }
            `}</style>
        </div >
    );
};

export default AdminDashboardHome;
