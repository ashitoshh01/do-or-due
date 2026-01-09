import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Copy } from 'lucide-react';
// Directly using the image path from public folder
const PAYMENT_QR_PATH = '/payment-qr.png';


const AddFundsModal = ({ onClose, userEmail, userName, amount: initialAmount }) => {
    const [amount, setAmount] = useState('100');
    const [step, setStep] = useState(1); // 1: Select Amount, 2: Scan & Verify



    // ESC key listener
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [onClose]);

    const handleWhatsAppRedirect = () => {
        const message = `Hello, I am ${userName || 'User'} .
I want to add due coins ${amount} in my account email : ${userEmail} .

NOTE : Please attach the screenshot of the payment done.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919518352166?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-sm animate-in" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--color-text-main))' }}>
                        {step === 1 ? 'Add Funds' : 'Scan & Verify'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="hsl(var(--color-text-secondary))" />
                    </button>
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
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            background: 'white', padding: '20px', borderRadius: '16px',
                            display: 'inline-block', marginBottom: '24px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid #E2E8F0'
                        }}>
                            <img
                                src={PAYMENT_QR_PATH}
                                alt="Payment QR Code"
                                style={{ width: '180px', height: '180px', objectFit: 'contain' }}
                            />
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
                                    9518352166@axl
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('9518352166@axl');
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

                        <div style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', marginBottom: '20px', lineHeight: '1.5', background: 'hsl(var(--color-bg-input))', padding: '10px', borderRadius: '8px' }}>
                            <strong>Step 1:</strong> Scan QR and pay <strong>₹{amount}</strong>.<br />
                            <strong>Step 2:</strong> Click below to verify on WhatsApp (Attach Screenshot).
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '15px', marginTop: '8px',
                                background: '#25D366', // WhatsApp Green
                                border: 'none'
                            }}
                            onClick={handleWhatsAppRedirect}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" height="20" alt="WA" />
                            Verify Payment on WhatsApp
                        </button>

                        <button onClick={() => setStep(1)} style={{ marginTop: '16px', background: 'none', border: 'none', color: 'hsl(var(--color-text-secondary))', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                            ← Change Amount
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AddFundsModal;
