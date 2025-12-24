import React, { useState } from 'react';
import { X, Heart, ExternalLink } from 'lucide-react';
import { CHARITIES } from '../constants/charities';

const CharityModal = ({ task, onClose, onDonate }) => {
    const [selected, setSelected] = useState(null);

    return (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Heart size={24} color="#EF4444" fill="#EF4444" /> Donate Stake
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={20} color="hsl(var(--color-text-secondary))" />
                    </button>
                </div>

                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '8px' }}>
                        You missed the deadline for:
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: 'hsl(var(--color-text-main))' }}>
                        "{task.objective}"
                    </p>
                    <div style={{ marginTop: '16px', background: '#FFF7ED', padding: '12px', borderRadius: '8px', border: '1px solid #FFEDD5', color: '#C2410C', fontWeight: 600 }}>
                        Stake Lost: {task.stake} DueCoins
                    </div>
                </div>

                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'hsl(var(--color-text-secondary))' }}>
                    Select a Charity:
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {CHARITIES.map(charity => (
                        <button
                            key={charity.id}
                            onClick={() => setSelected(charity.id)}
                            style={{
                                textAlign: 'left',
                                padding: '12px',
                                borderRadius: '8px',
                                border: `1px solid ${selected === charity.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
                                background: selected === charity.id ? 'rgba(var(--color-primary), 0.05)' : 'hsl(var(--color-bg-input))',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>{charity.name}</div>
                            <div style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))' }}>{charity.desc}</div>
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary"
                    disabled={!selected}
                    style={{
                        width: '100%',
                        opacity: selected ? 1 : 0.5,
                        cursor: selected ? 'pointer' : 'not-allowed',
                        padding: '14px'
                    }}
                    onClick={() => onDonate(selected)}
                >
                    Confirm Donation
                </button>
            </div>
        </div>
    );
};

export default CharityModal;
