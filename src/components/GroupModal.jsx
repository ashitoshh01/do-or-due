import React, { useState } from 'react';
import { X, Users, RefreshCw } from 'lucide-react';
import { createGroup, joinGroup } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

const GroupModal = ({ onClose, onShowPopup }) => {
    const { currentUser } = useAuth();
    const [mode, setMode] = useState('join'); // 'join' or 'create'
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        setLoading(true);
        try {
            if (mode === 'create') {
                const group = await createGroup(currentUser.uid, inputValue);
                onShowPopup({
                    title: 'Squad Created!',
                    message: `Your squad "${group.name}" is ready. Invite code: ${group.inviteCode}`,
                    type: 'success'
                });
            } else {
                const group = await joinGroup(currentUser.uid, inputValue);
                onShowPopup({
                    title: 'Squad Joined!',
                    message: `Successfully joined "${group.name}". Let the games begin!`,
                    type: 'success'
                });
            }
            onClose(); // Close modal on success
        } catch (error) {
            onShowPopup({
                title: 'Error',
                message: error.message || 'Something went wrong.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div className="animate-in" style={{
                background: 'hsl(var(--color-bg-card))',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '420px',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid hsl(var(--color-border))'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 24px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid hsl(var(--color-border-light))'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'rgba(249, 115, 22, 0.1)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#F97316'
                        }}>
                            <Users size={20} />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Squads</h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none',
                            color: 'hsl(var(--color-text-secondary))',
                            cursor: 'pointer', padding: '8px',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-bg-input))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Toggle */}
                    <div style={{
                        display: 'flex',
                        backgroundColor: 'hsl(var(--color-bg-input))',
                        borderRadius: '12px',
                        padding: '6px',
                        marginBottom: '24px'
                    }}>
                        <button
                            onClick={() => { setMode('join'); setInputValue(''); }}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: mode === 'join' ? 'hsl(var(--color-bg-card))' : 'transparent',
                                color: mode === 'join' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))',
                                boxShadow: mode === 'join' ? 'var(--shadow-sm)' : 'none',
                                fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Join Squad
                        </button>
                        <button
                            onClick={() => { setMode('create'); setInputValue(''); }}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                                background: mode === 'create' ? 'hsl(var(--color-bg-card))' : 'transparent',
                                color: mode === 'create' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))',
                                boxShadow: mode === 'create' ? 'var(--shadow-sm)' : 'none',
                                fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            Create New
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                                {mode === 'create' ? 'Name your Squad' : 'Enter Invite Code'}
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder={mode === 'create' ? 'e.g., The Winners Circle' : 'e.g., AB12CD'}
                                value={inputValue}
                                onChange={e => {
                                    if (mode === 'join') {
                                        setInputValue(e.target.value.toUpperCase());
                                    } else {
                                        setInputValue(e.target.value);
                                    }
                                }}
                                style={{
                                    fontSize: '16px',
                                    padding: '14px 16px',
                                    fontWeight: mode === 'join' ? 600 : 400,
                                    letterSpacing: mode === 'join' ? '2px' : 'normal',
                                    textAlign: mode === 'join' ? 'center' : 'left'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!inputValue.trim() || loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                background: !inputValue.trim() || loading ? 'hsl(var(--color-bg-input))' : 'hsl(var(--color-primary))',
                                color: !inputValue.trim() || loading ? 'hsl(var(--color-text-secondary))' : 'white',
                            }}
                        >
                            {loading ? <RefreshCw size={20} className="rotating" /> : (mode === 'create' ? 'Create Squad' : 'Join Squad')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupModal;
