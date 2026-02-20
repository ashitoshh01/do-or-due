import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Heart, ArrowRight, Loader } from 'lucide-react';

const TaskResult = ({ result, task, onHome }) => {
    const [verifying, setVerifying] = useState(result === 'success');

    useEffect(() => {
        if (result === 'success') {
            const timer = setTimeout(() => {
                setVerifying(false);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [result]);

    if (result === 'success') {
        if (verifying) {
            return (
                <div className="animate-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--color-bg-app))' }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '60px 40px' }}>
                        <div style={{
                            width: '60px', height: '60px', margin: '0 auto 24px',
                            border: '4px solid #E2E8F0', borderTopColor: '#3B82F6', borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Verifying Evidence</h2>
                        <p style={{ color: 'hsl(var(--color-text-secondary))' }}>Our AI is checking your submission...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="animate-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4' }}>
                <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '60px 40px', boxShadow: 'var(--shadow-float)', border: '1px solid #BBF7D0' }}>
                    <div style={{
                        width: '80px', height: '80px', backgroundColor: '#DCFCE7', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                    }}>
                        <CheckCircle size={40} color="#16A34A" />
                    </div>

                    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: '#14532D' }}>Mission Accomplished</h1>
                    <p style={{ color: '#15803D', marginBottom: '32px', fontSize: '16px' }}>
                        You stayed true to your word. Your stake is safe.
                    </p>

                    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #BBF7D0' }}>
                        <p style={{ fontSize: '14px', color: '#15803D', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reward Unlocked</p>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#FBBF24', margin: '8px 0' }}>+{Math.floor(task.stake * 0.05)} Coins</div>
                        <p style={{ fontSize: '14px', color: '#4ADE80' }}><span style={{ color: '#16A34A' }}>+50 XP</span> • Streak: 5 Days</p>
                    </div>

                    <button className="btn" onClick={onHome} style={{ width: '100%', backgroundColor: '#16A34A', color: 'white', padding: '16px', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.4)' }}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2' }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '60px 40px', boxShadow: 'var(--shadow-float)' }}>
                <div style={{
                    width: '80px', height: '80px', backgroundColor: '#FEF2F2', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
                }}>
                    <XCircle size={40} color="#EF4444" />
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: '#991B1B' }}>Commitment Broken</h1>
                <p style={{ color: '#7F1D1D', marginBottom: '32px' }}>
                    Consequences have been enforced.
                </p>

                <div style={{ backgroundColor: '#FFF7ED', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #FED7AA' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Heart size={20} color="#EA580C" fill="#EA580C" />
                        <p style={{ fontSize: '16px', color: '#9A3412', fontWeight: 700 }}>Donation Sent</p>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#C2410C' }}>${task.stake}</div>
                    <p style={{ fontSize: '12px', color: '#9A3412', marginTop: '8px', opacity: 0.8 }}>Recipient: Charity::Water</p>
                </div>

                <button className="btn" onClick={onHome} style={{ width: '100%', backgroundColor: '#FFF', color: '#EF4444', border: '1px solid #FECACA' }}>
                    Accept & Continue
                </button>
            </div>
        </div>
    );
};

export default TaskResult;
