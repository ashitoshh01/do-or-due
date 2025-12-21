import React, { useState, useEffect } from 'react';
import { X, CreditCard, Coins } from 'lucide-react';

const AddFundsModal = ({ onClose, onProceed, balance }) => {
    const [amount, setAmount] = useState('100'); // Default to 100

    // ESC key listener to close modal
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-in" style={{ maxWidth: '420px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px', color: 'hsl(var(--color-text-main))' }}>
                        <div style={{ background: '#EFF6FF', padding: '10px', borderRadius: '10px' }}>
                            <CreditCard size={22} color="#2563EB" />
                        </div>
                        Add Funds
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = 'hsl(var(--color-bg-input))'}
                        onMouseLeave={(e) => e.target.style.background = 'none'}>
                        <X size={24} color="hsl(var(--color-text-secondary))" />
                    </button>
                </div>

                {/* Body */}
                <div style={{ marginBottom: '28px' }}>
                    <p style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                        Buy DueCoins to stake on your tasks. <br />
                        <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>Rate: 1 INR = 1 DueCoin</span>
                    </p>

                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'hsl(var(--color-text-main))' }}>Amount (INR)</label>
                    <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', padding: '18px 16px' }}>
                        <span style={{ fontWeight: 700, color: 'hsl(var(--color-text-secondary))' }}>₹</span>
                        <input
                            type="number"
                            autoFocus
                            min="10"
                            step="10"
                            style={{ border: 'none', outline: 'none', width: '100%', fontWeight: 700, fontSize: '18px', background: 'transparent', color: 'hsl(var(--color-text-main))' }}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', color: '#C2410C', fontWeight: 700 }}>
                            <Coins size={14} /> {amount || 0} Coins
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        {[100, 500, 1000].map(val => (
                            <button key={val}
                                onClick={() => setAmount(val.toString())}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', border: `1px solid hsl(var(--color-border))`,
                                    background: 'hsl(var(--color-bg-card))',
                                    fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-text-main))', cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'hsl(var(--color-bg-input))';
                                    e.target.style.borderColor = 'hsl(var(--color-text-secondary))';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'hsl(var(--color-bg-card))';
                                    e.target.style.borderColor = 'hsl(var(--color-border))';
                                }}
                            >
                                ₹{val}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                        if (parseInt(amount) > 0) {
                            onProceed(parseInt(amount));
                        } else {
                            alert("Please enter a valid amount");
                        }
                    }}
                >
                    Pay ₹{amount || 0}
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '11px', color: 'hsl(var(--color-text-secondary))' }}>
                    🔒 Secured Payment via Razorpay
                </div>

            </div>
        </div>
    );
};

export default AddFundsModal;
