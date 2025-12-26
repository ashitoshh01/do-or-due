import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Clock, Check, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AdminTaskList = ({ tasks, category, onBack, onSelectTask }) => {
    const { isDark } = useTheme();

    // Derived state
    const categoryTitle =
        category === 'pending' ? 'Pending Reviews' :
            category === 'approved' ? 'Approved History' : 'Rejected Items';

    const categoryColor =
        category === 'pending' ? '#2563EB' :
            category === 'approved' ? '#16A34A' : '#EF4444';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending_review': return { bg: isDark ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF', color: '#2563EB', text: 'Pending' };
            case 'success': return { bg: isDark ? 'rgba(22, 163, 74, 0.2)' : '#F0FDF4', color: '#16A34A', text: 'Approved' };
            case 'failed': return { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', color: '#EF4444', text: 'Rejected' };
            default: return { bg: isDark ? '#334155' : '#F1F5F9', color: '#64748B', text: status };
        }
    };

    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const cardBg = isDark ? '#1E293B' : 'white';
    const borderColor = isDark ? '#334155' : '#E2E8F0';

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        width: '40px', height: '40px', borderRadius: '12px', background: cardBg, border: `1px solid ${borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: subTextColor
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: textColor }}>{categoryTitle}</h2>
                    <p style={{ fontSize: '14px', color: subTextColor }}>Showing {tasks.length} tasks</p>
                </div>
            </div>

            {/* List Grid */}
            {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: cardBg, borderRadius: '24px', border: '1px dashed #CBD5E1' }}>
                    <div style={{ color: '#CBD5E1', marginBottom: '16px' }}>
                        <Filter size={48} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: subTextColor }}>No tasks found in this category</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {tasks.map(task => {
                        const badge = getStatusBadge(task.status);
                        return (
                            <div
                                key={task.taskId}
                                onClick={() => onSelectTask(task)}
                                className="task-card"
                                style={{
                                    background: cardBg,
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}
                            >
                                {/* Img */}
                                <div style={{ height: '140px', background: isDark ? '#0F172A' : '#F8FAFC', position: 'relative' }}>
                                    {task.proofUrl ? (
                                        <img src={task.proofUrl} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>No Image</div>
                                    )}
                                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                                        <span style={{
                                            background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
                                            backdropFilter: 'blur(4px)',
                                            padding: '4px 8px', borderRadius: '8px',
                                            fontSize: '11px', fontWeight: 700,
                                            color: badge.color,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}>
                                            {badge.text}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '16px' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: isDark ? '#E2E8F0' : '#1E293B', marginBottom: '8px', lineHeight: '1.4' }}>
                                        {task.objective}
                                    </h4>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: subTextColor }}>
                                                {task.userName?.charAt(0)}
                                            </div>
                                            <span style={{ fontSize: '12px', color: subTextColor, fontWeight: 500 }}>{task.userName?.split(' ')[0]}</span>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#D97706' }}>₹{task.stake}</span>
                                    </div>

                                    {/* Footer Timestamp */}
                                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: `1px solid ${isDark ? '#334155' : '#F8FAFC'}`, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: subTextColor }}>
                                        <Clock size={12} />
                                        {task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
            <style>{`
                .task-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
                    border-color: ${categoryColor}33 !important; /* low opacity color */
                }
            `}</style>
        </div>
    );
};

export default AdminTaskList;
