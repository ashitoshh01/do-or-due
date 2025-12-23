import React, { useEffect, useState } from 'react';
import { fetchPendingProofs, approveProof, rejectProof, adminLogout } from '../../services/adminService';
import { Check, X, LogOut, RefreshCw, ZoomIn, Clock, AlertTriangle } from 'lucide-react';
import Popup from '../../components/Popup';

const ProofVerification = ({ onLogout }) => {
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [rejectModal, setRejectModal] = useState({ isOpen: false, taskId: null, userId: null });
    const [reason, setReason] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Load Proofs
    const loadProofs = async () => {
        setLoading(true);
        try {
            const data = await fetchPendingProofs();
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

        try {
            await approveProof(proof.userId, proof.taskId, parseInt(proof.stake));
            setProofs(prev => prev.filter(p => p.taskId !== proof.taskId));
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
            setProofs(prev => prev.filter(p => p.taskId !== taskId));
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

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9', fontFamily: 'Outfit, sans-serif' }}>
            {/* Top Bar */}
            <header style={{
                background: '#0F172A', color: 'white', padding: '0 24px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em', color: '#F59E0B' }}>DoOrDue</div>
                    <div style={{ height: '24px', width: '1px', background: '#334155' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>ADMIN PORTAL</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={loadProofs}
                        disabled={loading}
                        style={{
                            background: '#1E293B', border: '1px solid #334155', color: 'white',
                            padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
                        }}
                    >
                        <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Proof Verification</h1>
                    <p style={{ color: '#64748B' }}>Review submitted proofs to release staked coins.</p>
                </div>

                {loading && proofs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>Loading proofs...</div>
                ) : proofs.length === 0 ? (
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            width: '64px', height: '64px', background: '#F0FDF4', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                            color: '#166534'
                        }}>
                            <Check size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>All caught up!</h3>
                        <p style={{ color: '#64748B' }}>No pending proofs to review.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {proofs.map(proof => (
                            <div key={proof.taskId} style={{
                                background: 'white', borderRadius: '12px', overflow: 'hidden',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex',
                                border: '1px solid #E2E8F0',
                                opacity: processingId === proof.taskId ? 0.5 : 1,
                                transition: 'opacity 0.2s'
                            }}>
                                {/* Image Preview (Left) */}
                                <div style={{ width: '200px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #E2E8F0', position: 'relative' }}>
                                    {proof.proofUrl ? (
                                        <a href={proof.proofUrl} target="_blank" rel="noopener noreferrer" style={{ width: '100%', height: '100%', display: 'flex' }}>
                                            <img src={proof.proofUrl} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px', borderRadius: '4px' }}>
                                                <ZoomIn size={14} />
                                            </div>
                                        </a>
                                    ) : (
                                        <div style={{ color: '#94A3B8', fontSize: '13px' }}>No Image</div>
                                    )}
                                </div>

                                {/* Content (Middle) */}
                                <div style={{ flex: 1, padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                TASK
                                            </span>
                                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                                                {proof.objective}
                                            </h3>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: '#64748B' }}>Staked</div>
                                            <div style={{ fontWeight: 700, color: '#D97706' }}>{proof.stake} Coins</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>USER</span>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>{proof.userName}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>SUBMITTED</span>
                                            <div style={{ fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                                                {proof.createdAt?.seconds ? new Date(proof.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions (Right) */}
                                <div style={{
                                    width: '140px', background: '#F8FAFC', borderLeft: '1px solid #E2E8F0',
                                    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                                    justifyContent: 'center'
                                }}>
                                    <button
                                        onClick={() => handleApprove(proof)}
                                        disabled={!!processingId}
                                        style={{
                                            background: '#22C55E', color: 'white', border: 'none', borderRadius: '8px',
                                            padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                    <button
                                        onClick={() => openRejectModal(proof)}
                                        disabled={!!processingId}
                                        style={{
                                            background: 'white', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px',
                                            padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                        }}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Rejection Modal */}
            {rejectModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="animate-in" style={{
                        background: 'white', width: '90%', maxWidth: '400px', borderRadius: '16px',
                        padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>Reject Proof</h3>
                        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>Provide a reason so the user knows what to fix.</p>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Image is too blurry, Does not match task description..."
                            style={{
                                width: '100%', height: '100px', padding: '12px', borderRadius: '8px',
                                border: '1px solid #E2E8F0', fontSize: '14px', marginBottom: '20px',
                                outline: 'none', resize: 'none'
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setRejectModal({ isOpen: false, taskId: null, userId: null })}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', color: '#334155', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Reject
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
            `}</style>
        </div>
    );
};

export default ProofVerification;
