import React, { useEffect, useState } from 'react';
import { fetchAllAdminTasks, approveProof, rejectProof, adminLogout } from '../../services/adminService';
import { Check, X, LogOut, RefreshCw, ZoomIn, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import Popup from '../../components/Popup';

const ProofVerification = ({ onLogout }) => {
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [rejectModal, setRejectModal] = useState({ isOpen: false, taskId: null, userId: null });
    const [viewProof, setViewProof] = useState(null); // PROOF VIEWING STATE
    const [reason, setReason] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Load Proofs
    const loadProofs = async () => {
        setLoading(true);
        try {
            const data = await fetchAllAdminTasks();
            setProofs(data);
        } catch (error) {
            console.error(error);
            showPopup('Error', 'Failed to fetch proofs.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProofs();
    }, []);

    const showPopup = (title, message, type = 'info') => {
        setPopup({ isOpen: true, title, message, type });
    };

    // Actions
    const handleApprove = async (proof) => {
        if (processingId) return;
        setProcessingId(proof.taskId);
        // Close viewer if open
        if (viewProof?.taskId === proof.taskId) setViewProof(null);

        try {
            await approveProof(proof.userId, proof.taskId, parseInt(proof.stake));
            setProofs(prev => prev.map(p => p.taskId === proof.taskId ? { ...p, status: 'success' } : p));
            showPopup('Success', `Proof approved for ${proof.userName}.`, 'success');
        } catch (error) {
            showPopup('Error', 'Approval failed: ' + error.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const openRejectModal = (proof) => {
        setRejectModal({ isOpen: true, taskId: proof.taskId, userId: proof.userId });
        setReason('');
        // Close viewer if open
        if (viewProof?.taskId === proof.taskId) setViewProof(null);
    };

    const handleReject = async () => {
        if (!reason.trim()) {
            alert("Please provide a rejection reason.");
            return;
        }

        const { userId, taskId } = rejectModal;
        setRejectModal({ isOpen: false, taskId: null, userId: null });
        setProcessingId(taskId);

        try {
            await rejectProof(userId, taskId, reason);
            setProofs(prev => prev.map(p => p.taskId === taskId ? { ...p, status: 'failed', rejectionReason: reason } : p));
            showPopup('Rejected', 'Proof has been rejected.', 'success');
        } catch (error) {
            showPopup('Error', 'Rejection failed: ' + error.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        adminLogout();
        if (onLogout) onLogout();
    };


    // Helper to render a card
    const renderCard = (proof, showActions) => (
        <div key={proof.taskId} className="admin-card" style={{
            background: 'white', borderRadius: '16px', overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex', flexDirection: 'column',
            border: '1px solid #F1F5F9',
            opacity: processingId === proof.taskId ? 0.6 : 1,
            marginBottom: '20px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
        }}>
            {/* Image Preview */}
            <div
                style={{ height: '160px', background: '#F8FAFC', position: 'relative', cursor: 'zoom-in', overflow: 'hidden' }}
                onClick={() => setViewProof(proof)}
            >
                {proof.proofUrl ? (
                    <>
                        <img src={proof.proofUrl} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} className="card-img" />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)' }}></div>
                        <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', color: '#0F172A', padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ZoomIn size={14} /> View
                        </div>
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '13px', flexDirection: 'column', gap: '8px' }}>
                        <AlertTriangle size={24} opacity={0.5} />
                        No Proof Image
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: '#F0F9FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5E9', fontWeight: 700, fontSize: '10px' }}>
                            {proof.userName.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                            {proof.userName}
                        </span>
                    </div>
                    <span style={{ fontWeight: 800, color: '#D97706', fontSize: '14px', background: '#FFF7ED', padding: '4px 10px', borderRadius: '12px' }}>
                        ₹{proof.stake}
                    </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '16px', lineHeight: '1.5' }}>
                    {proof.objective}
                </h3>

                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', width: 'fit-content' }}>
                    <Clock size={12} />
                    <span>Submitted: {proof.createdAt?.seconds ? new Date(proof.createdAt.seconds * 1000).toLocaleString() : 'Just now'}</span>
                </div>

                {proof.rejectionReason && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#FEF2F2', borderRadius: '8px', fontSize: '13px', color: '#B91C1C', border: '1px solid #FECACA' }}>
                        <strong>Rejection Reason:</strong>
                        <div style={{ marginTop: '4px' }}>{proof.rejectionReason}</div>
                    </div>
                )}
            </div>

            {/* Actions (Only for Pending) */}
            {showActions && (
                <div style={{ padding: '16px', display: 'flex', gap: '12px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(proof); }}
                        disabled={!!processingId}
                        style={{
                            flex: 1, background: 'hsl(var(--color-primary))', color: 'white', border: 'none', borderRadius: '12px',
                            padding: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                        }}
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); openRejectModal(proof); }}
                        disabled={!!processingId}
                        style={{
                            flex: 1, background: 'white', color: '#EF4444', border: '1px solid #FED7D7', borderRadius: '12px',
                            padding: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <X size={16} /> Reject
                    </button>
                </div>
            )}
        </div>
    );

    // Filtering
    const pendingProofs = proofs.filter(p => p.status === 'pending_review');
    const doneProofs = proofs.filter(p => p.status === 'success');
    const failedProofs = proofs.filter(p => p.status === 'failed');

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Outfit, sans-serif' }}>
            {/* Top Bar */}
            <header style={{
                background: 'white', color: '#0F172A', padding: '0 32px', height: '72px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                position: 'sticky', top: 0, zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>D</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: '#0F172A' }}>Admin Portal</div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>Global Verification Center</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Stats Widget */}
                    <div style={{ display: 'flex', gap: '24px', marginRight: '24px', paddingRight: '24px', borderRight: '1px solid #E2E8F0' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ textTransform: 'uppercase', fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>Pending</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#D97706' }}>{pendingProofs.length}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ textTransform: 'uppercase', fontSize: '10px', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>Approved</div>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#22C55E' }}>{doneProofs.length}</div>
                        </div>
                    </div>

                    <button onClick={loadProofs} disabled={loading} style={{ background: '#F1F5F9', border: 'none', color: '#475569', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, transition: 'background 0.2s' }}>
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button onClick={handleLogout} style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content: 3 Columns */}
            <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '32px', height: 'calc(100vh - 72px)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.2fr) minmax(300px, 1fr)', gap: '32px', height: '100%' }}>

                    {/* Column 1: NOT DONE (Failed) */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: '#FFF1F2', borderRadius: '12px', border: '1px solid #FECDD3' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertCircle size={18} color="#E11D48" />
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#9F1239', textTransform: 'uppercase' }}>Failed</h2>
                            </div>
                            <span style={{ background: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#E11D48', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {failedProofs.length}
                            </span>
                        </div>
                        <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                            {failedProofs.map(proof => renderCard(proof, false))}
                            {failedProofs.length === 0 && <div style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>No failed tasks</div>}
                        </div>
                    </div>

                    {/* Column 2: MOST IMP (Pending) */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fffff', borderRadius: '24px', position: 'relative' }}>
                        {/* Highlight Element */}
                        <div style={{ position: 'absolute', top: -10, left: 20, right: 20, height: '10px', background: '#3B82F6', filter: 'blur(20px)', opacity: 0.2, borderRadius: '50%' }}></div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', padding: '16px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: '16px', border: '1px solid #BFDBFE', boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ padding: '6px', background: 'white', borderRadius: '8px', color: '#2563EB' }}>
                                    <Clock size={20} />
                                </div>
                                <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1E3A8A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Review</h2>
                            </div>
                            <span style={{ background: '#2563EB', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 800, color: 'white', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}>
                                {pendingProofs.length}
                            </span>
                        </div>
                        <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', paddingLeft: '4px' }}>
                            {pendingProofs.map(proof => renderCard(proof, true))}
                            {pendingProofs.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '100px', padding: '32px' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#F0F9FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <Check size={40} color="#0EA5E9" style={{ opacity: 0.8 }} />
                                    </div>
                                    <p style={{ fontWeight: 700, color: '#334155', fontSize: '18px' }}>All Pending Tasks Cleared!</p>
                                    <p style={{ fontSize: '14px', color: '#64748B', marginTop: '8px' }}>Good job keeping up with the queue.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 3: DONE (Success) */}
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Check size={18} color="#16A34A" />
                                <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#14532D', textTransform: 'uppercase' }}>Approved</h2>
                            </div>
                            <span style={{ background: 'white', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, color: '#16A34A', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                {doneProofs.length}
                            </span>
                        </div>
                        <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                            {doneProofs.map(proof => renderCard(proof, false))}
                            {doneProofs.length === 0 && <div style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: '14px', textAlign: 'center', marginTop: '60px' }}>No completed tasks yet</div>}
                        </div>
                    </div>
                </div>
            </main>

            {/* LIGHTBOX OVERLAY */}
            {viewProof && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)',
                    display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setViewProof(null)}>

                    {/* Toolbar */}
                    <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Proof Inspection</h3>
                            <p style={{ fontSize: '14px', opacity: 0.7 }}>User: {viewProof.userName}</p>
                        </div>
                        <button onClick={() => setViewProof(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Image */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflow: 'hidden' }}>
                        {viewProof.proofUrl ? (
                            <img
                                src={viewProof.proofUrl}
                                alt="Full Proof"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    maxWidth: '100%', maxHeight: '100%',
                                    objectFit: 'contain', borderRadius: '8px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
                                }}
                            />
                        ) : (
                            <div style={{ color: 'white' }}>No image data available</div>
                        )}
                    </div>

                    {/* Footer Actions (if pending) */}
                    {viewProof.status === 'pending_review' && (
                        <div style={{ padding: '24px', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', gap: '20px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => handleApprove(viewProof)}
                                style={{
                                    background: '#22C55E', color: 'white', border: 'none', borderRadius: '12px',
                                    padding: '12px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                                }}
                            >
                                <Check size={20} /> Approve Proof
                            </button>
                            <button
                                onClick={() => openRejectModal(viewProof)}
                                style={{
                                    background: '#EF4444', color: 'white', border: 'none', borderRadius: '12px',
                                    padding: '12px 32px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                                }}
                            >
                                <X size={20} /> Reject Proof
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Rejection Modal */}
            {rejectModal.isOpen && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
                }}>
                    <div className="animate-in" style={{
                        background: 'white', width: '90%', maxWidth: '440px', borderRadius: '20px',
                        padding: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{ width: '48px', height: '48px', background: '#FEF2F2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <AlertTriangle size={24} color="#EF4444" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Reject Proof</h3>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure? This will mark the task as failed. Please provide a clear reason for the user.
                        </p>

                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>Rejection Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Image is blurry, doesn't match the goal..."
                            style={{
                                width: '100%', height: '100px', padding: '16px', borderRadius: '12px',
                                border: '1px solid #E2E8F0', fontSize: '14px', marginBottom: '24px',
                                outline: 'none', resize: 'none', background: '#F8FAFC'
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setRejectModal({ isOpen: false, taskId: null, userId: null })}
                                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)', transition: 'all 0.2s' }}
                            >
                                Reject Task
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Popup
                isOpen={popup.isOpen}
                onClose={() => setPopup({ ...popup, isOpen: false })}
                title={popup.title}
                message={popup.message}
                type={popup.type}
            />

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .scroll-container::-webkit-scrollbar { width: 6px; }
                .scroll-container::-webkit-scrollbar-track { background: transparent; }
                .scroll-container::-webkit-scrollbar-thumb { background: #CBD5E1; borderRadius: 10px; }
                .admin-card:hover .card-img { transform: scale(1.05); }
            `}</style>
        </div>
    );
};

export default ProofVerification;
