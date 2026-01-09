import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Popup = ({ isOpen, onClose, title, message, type = 'info', confirmButton, cancelButton }) => {
    const [shake, setShake] = useState(false);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            // Trigger shake animation
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={24} color="#22C55E" />;
            case 'error':
                return <AlertCircle size={24} color="#EF4444" />;
            case 'warning':
                return <AlertTriangle size={24} color="#F59E0B" />;
            default:
                return <Info size={24} color="#3B82F6" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'rgba(34, 197, 94, 0.1)'; // Green tint
            case 'error':
                return 'rgba(239, 68, 68, 0.1)'; // Red tint
            case 'warning':
                return 'rgba(245, 158, 11, 0.1)'; // Amber tint
            default:
                return 'rgba(59, 130, 246, 0.1)'; // Blue tint
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="popup-backdrop"
                onClick={handleBackdropClick}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    animation: 'fadeIn 0.2s ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                {/* Popup Container */}
                <div
                    className={shake ? 'popup-shake' : ''}
                    style={{
                        background: 'hsl(var(--color-bg-card))',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-xl)',
                        width: '100%',
                        maxWidth: '400px',
                        overflow: 'hidden',
                        animation: shake ? 'shake 0.4s ease-in-out' : 'slideUp 0.3s ease-out'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: `1px solid hsl(var(--color-border-light))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: getBackgroundColor()
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {getIcon()}
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 700,
                                color: 'hsl(var(--color-text-main))',
                                margin: 0
                            }}>
                                {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Info')}
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'hsl(var(--color-bg-input))',
                                border: 'none',
                                borderRadius: '8px',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            aria-label="Close"
                        >
                            <X size={18} color="hsl(var(--color-text-secondary))" />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '24px',
                        color: 'hsl(var(--color-text-main))',
                        fontSize: '14px',
                        lineHeight: '1.6'
                    }}>
                        {message}
                    </div>

                    {/* Footer with buttons */}
                    {(confirmButton || cancelButton) && (
                        <div style={{
                            padding: '16px 24px',
                            borderTop: `1px solid hsl(var(--color-border-light))`,
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                        }}>
                            {cancelButton && (
                                <button
                                    onClick={cancelButton.onClick}
                                    style={{
                                        padding: '10px 20px',
                                        background: 'hsl(var(--color-bg-input))',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: 'hsl(var(--color-text-main))',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {cancelButton.label || 'Cancel'}
                                </button>
                            )}
                            {confirmButton && (
                                <button
                                    onClick={confirmButton.onClick}
                                    className="btn btn-primary"
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '14px'
                                    }}
                                >
                                    {confirmButton.label || 'OK'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Simple OK button if no custom buttons */}
                    {!confirmButton && !cancelButton && (
                        <div style={{
                            padding: '16px 24px',
                            borderTop: `1px solid hsl(var(--color-border-light))`,
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <button
                                onClick={onClose}
                                className="btn btn-primary"
                                style={{
                                    padding: '10px 24px',
                                    fontSize: '14px'
                                }}
                            >
                                OK
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add shake animation styles */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: scale(1); }
                    25% { transform: scale(1.02); }
                    50% { transform: scale(0.98); }
                    75% { transform: scale(1.01); }
                }
            `}</style>
        </>
    );
};

export default Popup;
