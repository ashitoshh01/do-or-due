import React, { useState } from 'react';
import { ArrowLeft, Check, X, Maximize2, Calendar, User, DollarSign, AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AdminTaskDetail = ({ task, onBack, onApprove, onReject, processing }) => {
    const { isDark } = useTheme();
    const [rejectMode, setRejectMode] = useState(false);
    const [reason, setReason] = useState('');
    const [imageModal, setImageModal] = useState(false);
    const [zoom, setZoom] = useState(1);

    const handleSubmitReject = () => {
        if (!reason.trim()) return alert("Reason required");
        onReject(task, reason);
    };

    const cardBg = isDark ? '#1E293B' : 'white';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    const inputBg = isDark ? '#0F172A' : '#F8FAFC';

    return (
        <>
            <div className="animate-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', gap: '32px' }}>
                {/* LEFT: Image Viewer */}
                <div style={{ flex: '1.2', background: '#0F172A', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {task.proofUrl ? (
                        <img
                            src={task.proofUrl}
                            alt="Full Proof"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                            onClick={() => setImageModal(true)}
                        />
                    ) : (
                        <div style={{ color: 'white' }}>No Image Data</div>
                    )}

                    <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                        <button
                            onClick={onBack}
                            style={{
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600
                            }}
                        >
                            <ArrowLeft size={18} /> Back
                        </button>
                    </div>

                    {task.proofUrl && (
                        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                            <button
                                onClick={() => setImageModal(true)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                    border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600
                                }}
                            >
                                <Maximize2 size={18} /> View Full
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT: Details & Actions */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                    <div style={{ background: cardBg, borderRadius: '24px', padding: '32px', height: '100%', display: 'flex', flexDirection: 'column' }}>

                        {/* Header Info */}
                        <div style={{ marginBottom: 'auto' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', background: isDark ? '#334155' : '#F1F5F9', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: subTextColor }}>
                                    {task.userName?.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: textColor }}>{task.userName}</h2>
                                    <p style={{ fontSize: '13px', color: subTextColor }}>Task ID: {task.taskId.slice(0, 8)}...</p>
                                </div>
                                <div style={{ marginLeft: 'auto', background: isDark ? 'rgba(217, 119, 6, 0.2)' : '#FFF7ED', padding: '8px 16px', borderRadius: '12px', border: isDark ? '1px solid rgba(217, 119, 6, 0.4)' : '1px solid #FFEDD5' }}>
                                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#D97706', fontWeight: 700 }}>Stake Amount</div>
                                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309' }}>₹{task.stake}</div>
                                </div>
                            </div>

                            <h1 style={{ fontSize: '24px', fontWeight: 800, color: textColor, marginBottom: '16px', lineHeight: '1.4' }}>
                                {task.objective}
                            </h1>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ padding: '16px', background: inputBg, borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: subTextColor }}>
                                        <Calendar size={14} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Created At</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>
                                        {task.createdAt?.seconds ? new Date(task.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}
                                    </div>
                                </div>
                                <div style={{ padding: '16px', background: inputBg, borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: subTextColor }}>
                                        <DollarSign size={14} /> <span style={{ fontSize: '12px', fontWeight: 600 }}>Potential Reward</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 600, color: textColor }}>
                                        {/* Assuming 2x logic or similar */}
                                        ₹{parseInt(task.stake) * 2}
                                    </div>
                                </div>
                            </div>

                            {/* Status Message if not pending */}
                            {task.status !== 'pending_review' && (
                                <div style={{ padding: '24px', borderRadius: '16px', background: task.status === 'success' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${task.status === 'success' ? '#BBF7D0' : '#FECACA'}`, marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: task.status === 'success' ? '#16A34A' : '#DC2626', marginBottom: '8px' }}>
                                        Task {task.status === 'success' ? 'Approved' : 'Rejected'}
                                    </h3>
                                    {task.rejectionReason && (
                                        <p style={{ fontSize: '14px', color: '#991B1B' }}>Reason: {task.rejectionReason}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ACTIONS (Fixed to bottom) */}
                        {task.status === 'pending_review' && !rejectMode && (
                            <div style={{ paddingTop: '24px', borderTop: `1px solid ${borderColor}`, display: 'flex', gap: '16px' }}>
                                <button
                                    onClick={() => setRejectMode(true)}
                                    disabled={processing}
                                    style={{ flex: 1, padding: '16px', border: `1px solid ${borderColor}`, background: cardBg, borderRadius: '14px', color: '#EF4444', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                                    className="action-btn"
                                >
                                    <X size={20} /> Reject
                                </button>
                                <button
                                    onClick={() => onApprove(task)}
                                    disabled={processing}
                                    style={{ flex: 2, padding: '16px', border: 'none', background: '#22C55E', borderRadius: '14px', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)', transition: 'all 0.2s' }}
                                    className="action-btn"
                                >
                                    <Check size={20} /> Approve Proof
                                </button>
                            </div>
                        )}

                        {/* REJECT FORM */}
                        {rejectMode && (
                            <div style={{ paddingTop: '24px', borderTop: `1px solid ${borderColor}` }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertTriangle size={18} /> Rejection Reason
                                </h3>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Why is this proof invalid?"
                                    autoFocus
                                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${borderColor}`, fontSize: '14px', minHeight: '100px', marginBottom: '16px', outline: 'none', background: inputBg, color: textColor }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setRejectMode(false)}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', background: cardBg, border: `1px solid ${borderColor}`, color: subTextColor, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmitReject}
                                        style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#EF4444', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Confirm Rejection
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Image Zoom Modal */}
            {imageModal && task.proofUrl && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.95)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}
                    onClick={() => { setImageModal(false); setZoom(1); }}
                >
                    {/* Zoom Controls */}
                    <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 10000 }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 3)); }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <ZoomIn size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 0.5)); }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <ZoomOut size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setImageModal(false); setZoom(1); }}
                            style={{
                                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Zoomed Image */}
                    <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <img
                            src={task.proofUrl}
                            alt="Zoomed Proof"
                            style={{
                                transform: `scale(${zoom})`,
                                transformOrigin: 'center',
                                transition: 'transform 0.2s',
                                maxWidth: 'none',
                                cursor: zoom > 1 ? 'grab' : 'default'
                            }}
                        />
                    </div>
                </div>
            )}

            <style>{`
                .action-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    filter: brightness(105%);
                }
                .action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </>
    );
};

export default AdminTaskDetail;
