import React, { useState } from 'react';
import { ArrowLeft, Lock, Calendar, Flag, Clock } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import CustomTimeInput from '../components/CustomTimeInput';

const CustomDateTrigger = React.forwardRef(({ value, onClick }, ref) => (
    <button
        type="button"
        onClick={onClick}
        ref={ref}
        style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', background: 'hsl(var(--color-bg-app))', flexShrink: 0, cursor: 'pointer', color: 'hsl(var(--color-text-main))' }}
    >
        <Calendar size={14} style={{ marginRight: '6px', color: 'green' }} />
        <span style={{ whiteSpace: 'nowrap' }}>
            {value || 'Set Deadline'}
        </span>
    </button>
));

const CreateTask = ({ onBack, onCommit }) => {
    const [objective, setObjective] = useState('');
    const [deadline, setDeadline] = useState(null);
    const [stake, setStake] = useState('10');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!objective || !deadline || !stake) return;
        onCommit({ objective, deadline, stake });
    };

    return (
        <div className="modal-overlay" onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) onBack();
        }}>
            <div className="modal-content">
                <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>

                    {/* Header for Mobile only (optional), but let's keep it clean */}

                    {/* Main Input */}
                    <input
                        type="text"
                        placeholder="Task name"
                        autoFocus
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        style={{
                            width: '100%',
                            border: 'none',
                            fontSize: '18px',
                            fontWeight: 600,
                            outline: 'none',
                            marginBottom: '12px',
                            color: 'hsl(var(--color-text-main))',
                            background: 'transparent'
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        style={{
                            width: '100%',
                            border: 'none',
                            fontSize: '14px',
                            outline: 'none',
                            marginBottom: '20px',
                            color: 'hsl(var(--color-text-secondary))',
                            background: 'transparent'
                        }}
                    />

                    {/* Quick Actions Bar - Scrollable on mobile if needed */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                        <DatePicker
                            selected={deadline}
                            onChange={(date) => setDeadline(date)}
                            showTimeInput
                            customTimeInput={<CustomTimeInput />}
                            dateFormat="MMM d, h:mm aa"
                            customInput={<CustomDateTrigger />}
                        />

                        <button type="button" style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '6px', padding: '6px 8px', fontSize: '13px', color: 'hsl(var(--color-text-secondary))', background: 'hsl(var(--color-bg-app))', cursor: 'pointer', flexShrink: 0 }}>
                            <Flag size={14} style={{ marginRight: '6px' }} />
                            Priority
                        </button>
                    </div>

                    <div style={{ borderTop: '1px solid var(--color-divider)', margin: '0 -20px 16px -20px' }} />

                    {/* Footer / Stake Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-text-secondary))' }}>Stake:</span>
                            {['5', '10', '20', '50'].map(amt => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => setStake(amt)}
                                    style={{
                                        background: stake === amt ? 'hsl(var(--color-primary))' : 'hsl(var(--color-bg-hover))',
                                        color: stake === amt ? 'white' : 'hsl(var(--color-text-main))',
                                        border: 'none',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '12px',
                                        transition: 'all 0.2s',
                                        minWidth: '32px'
                                    }}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="button"
                                onClick={onBack}
                                style={{
                                    background: 'hsl(var(--color-bg-hover))',
                                    border: 'none',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: 'hsl(var(--color-text-main))'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    opacity: (!objective || !deadline) ? 0.5 : 1,
                                    cursor: (!objective || !deadline) ? 'not-allowed' : 'pointer'
                                }}
                                disabled={!objective || !deadline}
                            >
                                Add task
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTask;
