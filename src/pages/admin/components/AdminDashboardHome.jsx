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
        <div className="animate-in admin-container">
            {/* Header */}
            <div className="admin-header" style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: textColor, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    Dashboard Overview
                </h1>
                <p style={{ color: subTextColor, fontSize: '15px' }}>
                    Welcome back. Here's what's happening today.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="admin-dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* 1. Pending Tasks */}
                <div
                    onClick={() => onNavigate('pending')}
                    className="hover-card admin-dashboard-card"
                    style={{
                        background: cardBg,
                        borderRadius: '20px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 10px 40px -10px rgba(0,0,0,0.05)',
                        border: '1px solid transparent', // smoother rendering
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Accent Line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#3B82F6' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '14px', fontWeight: 600, color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending</h2>
                            <div style={{ fontSize: '42px', fontWeight: 800, color: textColor, marginTop: '8px' }}>{stats.pending}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={24} color="#3B82F6" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#3B82F6' }}>
                        Review Queue <ChevronRight size={14} />
                    </div>
                </div>

                {/* 2. Approved Tasks */}
                <div
                    onClick={() => onNavigate('approved')}
                    className="hover-card admin-dashboard-card"
                    style={{
                        background: cardBg,
                        borderRadius: '20px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 10px 40px -10px rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#22C55E' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '14px', fontWeight: 600, color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Approved</h2>
                            <div style={{ fontSize: '42px', fontWeight: 800, color: textColor, marginTop: '8px' }}>{stats.approved}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isDark ? 'rgba(34, 197, 94, 0.2)' : '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={24} color="#22C55E" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#22C55E' }}>
                        View History <ChevronRight size={14} />
                    </div>
                </div>

                {/* 3. Rejected Tasks */}
                <div
                    onClick={() => onNavigate('failed')}
                    className="hover-card admin-dashboard-card"
                    style={{
                        background: cardBg,
                        borderRadius: '20px',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.2)' : '0 10px 40px -10px rgba(0,0,0,0.05)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#EF4444' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '14px', fontWeight: 600, color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejected</h2>
                            <div style={{ fontSize: '42px', fontWeight: 800, color: textColor, marginTop: '8px' }}>{stats.failed}</div>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <XCircle size={24} color="#EF4444" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#EF4444' }}>
                        View Details <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            {/* Quick Activity */}
            <div className="admin-system-status" style={{ marginTop: '40px', padding: '32px', background: cardBg, borderRadius: '24px', boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.02)', border: isDark ? '1px solid #334155' : '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Activity size={20} color={subTextColor} />
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: subTextColor }}>System Health</h3>
                </div>
                <div className="status-bars-container" style={{ display: 'flex', gap: '48px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: textColor, fontWeight: 600 }}>Response Time</div>
                            <div style={{ fontSize: '13px', color: '#22C55E', fontWeight: 700 }}>Optimal</div>
                        </div>
                        <div style={{ height: '6px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '92%', height: '100%', background: '#22C55E', borderRadius: '4px' }}></div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div style={{ fontSize: '13px', color: textColor, fontWeight: 600 }}>Queue Capacity</div>
                            <div style={{ fontSize: '13px', color: stats.pending > 10 ? '#EF4444' : '#3B82F6', fontWeight: 700 }}>{stats.pending > 10 ? 'High' : 'Normal'}</div>
                        </div>
                        <div style={{ height: '6px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(stats.pending * 5 + 10, 100)}%`, height: '100%', background: stats.pending > 10 ? '#EF4444' : '#3B82F6', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                }
            `}</style>
        </div >
    );
};

export default AdminDashboardHome;
