import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Maximize2, Calendar, User, DollarSign, AlertTriangle, ZoomIn, ZoomOut, FileText, Video, Music, File, ExternalLink, Download } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

// Helper to detect file type from URL or data URL
const getFileType = (url) => {
    if (!url) return 'unknown';

    try {
        // Check if it's a Base64 data URL (most common case for this app)
        // Format: data:mime/type;base64,... 
        if (url.startsWith('data:')) {
            const mimeMatch = url.match(/^data:([^;,]+)/);
            if (mimeMatch) {
                const mimeType = mimeMatch[1].toLowerCase();

                if (mimeType.startsWith('image/')) return 'image';
                if (mimeType.startsWith('video/')) return 'video';
                if (mimeType.startsWith('audio/')) return 'audio';
                if (mimeType === 'application/pdf') return 'pdf';
                if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
                if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'other';
                if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'other';

                // Default for unknown MIME types in data URLs
                return 'other';
            }
        }

        // Handle regular URLs (Firebase Storage, etc.)
        // Decode URL to handle Firebase Storage encoded paths
        const decodedUrl = decodeURIComponent(url).toLowerCase();

        // Extract file path - handle Firebase Storage URLs
        // Firebase URLs look like: .../o/proofs%2FuserId%2Ffile.pdf?...
        const urlWithoutQuery = decodedUrl.split('?')[0];

        // Check decoded URL for extensions
        if (urlWithoutQuery.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|heic|heif)$/)) {
            return 'image';
        }
        if (urlWithoutQuery.match(/\.(mp4|webm|mov|avi|mkv|m4v|3gp|wmv)$/)) {
            return 'video';
        }
        if (urlWithoutQuery.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/)) {
            return 'audio';
        }
        if (urlWithoutQuery.match(/\.pdf$/)) {
            return 'pdf';
        }
        if (urlWithoutQuery.match(/\.(doc|docx)$/)) {
            return 'document';
        }
        if (urlWithoutQuery.match(/\.(xls|xlsx|ppt|pptx|txt|rtf|csv)$/)) {
            return 'other';
        }
        if (urlWithoutQuery.match(/\.(zip|rar|7z|tar|gz)$/)) {
            return 'other';
        }

        // Also check content type hints in the URL
        if (decodedUrl.includes('image/') || decodedUrl.includes('image%2f')) {
            return 'image';
        }
        if (decodedUrl.includes('video/') || decodedUrl.includes('video%2f')) {
            return 'video';
        }
        if (decodedUrl.includes('audio/') || decodedUrl.includes('audio%2f')) {
            return 'audio';
        }
        if (decodedUrl.includes('application/pdf') || decodedUrl.includes('application%2fpdf')) {
            return 'pdf';
        }

    } catch (e) {
        console.error('Error parsing proof URL:', e);
    }

    // Default to 'other' instead of image to force download buttons when unknown
    return 'other';
};

const AdminTaskDetail = ({ task, onBack, onApprove, onReject, processing }) => {
    const { isDark } = useTheme();
    const [rejectMode, setRejectMode] = useState(false);
    const [reason, setReason] = useState('');
    const [imageModal, setImageModal] = useState(false);
    const [zoom, setZoom] = useState(1);

    // Detect file type
    const fileType = useMemo(() => {
        const type = getFileType(task?.proofUrl);
        console.log('Proof URL:', task?.proofUrl);
        console.log('Detected file type:', type);
        return type;
    }, [task?.proofUrl]);

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
                {/* LEFT: Proof Viewer - Handles multiple file types */}
                <div style={{ flex: '1.2', background: '#0F172A', borderRadius: '24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    {task.proofUrl ? (
                        <>
                            {/* Image */}
                            {fileType === 'image' && (
                                <img
                                    src={task.proofUrl}
                                    alt="Full Proof"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                                    onClick={() => setImageModal(true)}
                                />
                            )}

                            {/* PDF - Embedded viewer */}
                            {fileType === 'pdf' && (
                                <iframe
                                    src={task.proofUrl}
                                    title="PDF Proof"
                                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                                />
                            )}

                            {/* Video */}
                            {fileType === 'video' && (
                                <video
                                    src={task.proofUrl}
                                    controls
                                    style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px' }}
                                >
                                    Your browser does not support video playback.
                                </video>
                            )}

                            {/* Audio */}
                            {fileType === 'audio' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                                    <Music size={80} color="#94A3B8" />
                                    <p style={{ color: '#94A3B8', fontSize: '16px', fontWeight: 600 }}>Audio Proof</p>
                                    <audio src={task.proofUrl} controls style={{ width: '300px' }}>
                                        Your browser does not support audio playback.
                                    </audio>
                                </div>
                            )}

                            {/* Document (Word, etc.) or Other files */}
                            {(fileType === 'document' || fileType === 'other') && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '40px' }}>
                                    <FileText size={80} color="#94A3B8" />
                                    <p style={{ color: 'white', fontSize: '18px', fontWeight: 600 }}>
                                        {fileType === 'document' ? 'Document File' : 'File Attachment'}
                                    </p>
                                    <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center' }}>
                                        This file type cannot be previewed directly.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <a
                                            href={task.proofUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '12px 24px', borderRadius: '12px',
                                                background: '#3B82F6', color: 'white',
                                                textDecoration: 'none', fontWeight: 600, fontSize: '14px'
                                            }}
                                        >
                                            <ExternalLink size={18} /> Open in New Tab
                                        </a>
                                        <a
                                            href={task.proofUrl}
                                            download
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '12px 24px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.1)', color: 'white',
                                                textDecoration: 'none', fontWeight: 600, fontSize: '14px',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}
                                        >
                                            <Download size={18} /> Download
                                        </a>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ color: 'white' }}>No Proof Data</div>
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

                    {/* View Full / Open Tab buttons - show appropriately */}
                    {task.proofUrl && (
                        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px' }}>
                            {fileType === 'image' && (
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
                            )}
                            {fileType !== 'image' && (
                                <a
                                    href={task.proofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                        border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <ExternalLink size={18} /> Open in Tab
                                </a>
                            )}
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

            {/* Image Zoom Modal - Only for images */}
            <AnimatePresence>
                {imageModal && task.proofUrl && fileType === 'image' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.95)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            overflow: 'hidden'
                        }}
                        onClick={() => { setImageModal(false); setZoom(1); }}
                    >
                        {/* Zoom Controls */}
                        <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '12px', zIndex: 10000 }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(z + 0.5, 4)); }}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
                                    border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <ZoomIn size={20} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(z - 0.5, 1)); }}
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

                        {/* Zoomed Image Container with Panning */}
                        <div
                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                src={task.proofUrl}
                                alt="Zoomed Proof"
                                drag={zoom > 1}
                                dragConstraints={{
                                    left: -300 * zoom,
                                    right: 300 * zoom,
                                    top: -300 * zoom,
                                    bottom: 300 * zoom
                                }}
                                dragElastic={0.1}
                                animate={{ scale: zoom }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                style={{
                                    maxWidth: '90vw',
                                    maxHeight: '90vh',
                                    objectFit: 'contain',
                                    cursor: zoom > 1 ? 'grab' : 'default',
                                }}
                                whileTap={{ cursor: zoom > 1 ? 'grabbing' : 'default' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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
