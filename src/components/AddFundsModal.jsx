import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy } from 'lucide-react';
import QRCode from "react-qr-code";

const AddFundsModal = ({ onClose, onProceed, balance }) => {
    const [amount, setAmount] = useState('100');
    const [utr, setUtr] = useState('');
    const [step, setStep] = useState(1); // 1: Select Amount, 2: Scan & Verify

    // Clean up Amount on step 1 change
    useEffect(() => {
        if (step === 1) setUtr('');
    }, [step]);

    // ESC key listener
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [onClose]);

    const upiId = "rajshinde153909n@okicici";
    const payeeName = "Do Or Due";
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

    const [isVerifying, setIsVerifying] = useState(false);

    const handleVerifyAndProceed = async () => {
        if (utr.length !== 12) {
            alert("Please enter a valid 12-digit UTR.");
            return;
        }

        setIsVerifying(true);

        // Simulate "Banking Network" delay
        setTimeout(() => {
            onProceed(parseInt(amount), utr);
            // Note: We don't set verifying false here because the parent closes the modal
        }, 1000);
    };

    return (
        <div className="modal-overlay" onClick={isVerifying ? null : onClose}>
            <div className="modal-content modal-sm animate-in" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--color-text-main))' }}>
                        {step === 1 ? 'Add Funds' : 'Scan & Pay'}
                    </h2>
                    {!isVerifying && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <X size={24} color="hsl(var(--color-text-secondary))" />
                        </button>
                    )}
                </div>

                {step === 1 ? (
                    // STEP 1: SELECT AMOUNT
                    <div>
                        <p style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '14px', marginBottom: '20px' }}>
                            Select amount to add to your wallet.
                        </p>

                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', padding: '18px 16px', marginBottom: '16px' }}>
                            <span style={{ fontWeight: 700, color: 'hsl(var(--color-text-secondary))' }}>₹</span>
                            <input
                                type="number"
                                autoFocus
                                min="1"
                                style={{ border: 'none', outline: 'none', width: '100%', fontWeight: 700, fontSize: '20px', background: 'transparent', color: 'hsl(var(--color-text-main))' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                            {[100, 500, 1000].map(val => (
                                <button key={val}
                                    onClick={() => setAmount(val.toString())}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid hsl(var(--color-border))`,
                                        background: 'hsl(var(--color-bg-card))', fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-text-main))', cursor: 'pointer'
                                    }}
                                >
                                    ₹{val}
                                </button>
                            ))}
                        </div>

                        <button className="btn btn-primary" style={{ width: '100%', padding: '14px' }}
                            onClick={() => {
                                if (parseInt(amount) > 0) setStep(2);
                                else alert("Enter valid amount");
                            }}
                        >
                            Proceed to Pay ₹{amount}
                        </button>
                    </div>
                ) : (
                    // STEP 2: SCAN & ENTER UTR
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'white', padding: '20px', borderRadius: '16px',
                            display: 'inline-block', marginBottom: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #E2E8F0'
                        }}>
                            <QRCode value={upiLink} size={180} />
                            <div style={{ marginTop: '12px', fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px' }}>
                                SCAN WITH ANY UPI APP
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px', background: 'hsl(var(--color-bg-input))', padding: '12px', borderRadius: '12px', border: '1px solid hsl(var(--color-border))' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'hsl(var(--color-text-secondary))', fontWeight: 700, marginBottom: '4px', letterSpacing: '0.5px' }}>
                                UPI ID
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>
                                    {upiId}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(upiId);
                                        // Visual feedback could be added here if we had a toast system, for now the icon click is enough
                                    }}
                                    style={{
                                        border: 'none', background: 'hsl(var(--color-primary))', color: 'white',
                                        padding: '6px', borderRadius: '6px', cursor: 'pointer', display: 'flex'
                                    }}
                                    title="Copy UPI ID"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'block', color: 'hsl(var(--color-text-main))' }}>
                                Enter Payment Reference ID (UTR)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. 3089xxxxxxxx"
                                maxLength={12}
                                value={utr}
                                onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))} // Only numbers
                                disabled={isVerifying}
                                className="input-field"
                                style={{
                                    width: '100%', padding: '14px', fontSize: '16px', letterSpacing: '1px',
                                    textAlign: 'center', fontWeight: 600,
                                    opacity: isVerifying ? 0.5 : 1
                                }}
                            />
                            <div style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', marginTop: '6px', lineHeight: '1.4' }}>
                                Check your GPay/PhonePe history for the 12-digit <strong>UTR</strong> or <strong>UPI Ref ID</strong>.
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                opacity: utr.length === 12 && !isVerifying ? 1 : 0.6,
                                cursor: utr.length === 12 && !isVerifying ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '15px', marginTop: '8px'
                            }}
                            disabled={utr.length !== 12 || isVerifying}
                            onClick={handleVerifyAndProceed}
                        >
                            {isVerifying ? (
                                <>
                                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
                                    Verifying Payment...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    Verify & Add ₹{amount}
                                </>
                            )}
                        </button>

                        {!isVerifying && (
                            <button onClick={() => setStep(1)} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'hsl(var(--color-text-secondary))', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                                ← Change Amount
                            </button>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default AddFundsModal;
