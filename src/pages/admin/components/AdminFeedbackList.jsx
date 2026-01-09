import React, { useEffect, useState } from 'react';
import { subscribeToFeedbacks } from '../../../services/dbService';
import { MessageSquare, ArrowLeft, Loader2, Calendar } from 'lucide-react';

const AdminFeedbackList = ({ onBack }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToFeedbacks((data) => {
            setFeedbacks(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))',
                        padding: '10px', borderRadius: '12px', cursor: 'pointer',
                        color: 'hsl(var(--color-text-main))', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'hsl(var(--color-text-main))' }}>
                        User Feedback
                    </h2>
                    <p style={{ margin: 0, color: 'hsl(var(--color-text-secondary))', fontSize: '14px' }}>
                        Issues and suggestions from users
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'hsl(var(--color-text-secondary))' }}>
                    <Loader2 className="spin" size={24} style={{ marginRight: '8px' }} /> Loading Feedbacks...
                </div>
            ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'hsl(var(--color-bg-card))', borderRadius: '16px', border: '1px solid hsl(var(--color-border))' }}>
                    <MessageSquare size={48} color="hsl(var(--color-text-muted))" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'hsl(var(--color-text-main))', marginBottom: '8px' }}>No Feedback Yet</h3>
                    <p style={{ color: 'hsl(var(--color-text-secondary))' }}>When users submit feedback, it will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {feedbacks.map(feedback => (
                        <div key={feedback.id} style={{
                            background: 'hsl(var(--color-bg-card))',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid hsl(var(--color-border))',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'hsl(var(--color-text-main))' }}>
                                    {feedback.title}
                                </h3>
                                <span style={{
                                    fontSize: '12px', padding: '4px 8px', borderRadius: '6px',
                                    background: feedback.status === 'unread' ? 'rgba(59, 130, 246, 0.1)' : 'hsl(var(--color-bg-input))',
                                    color: feedback.status === 'unread' ? '#3B82F6' : 'hsl(var(--color-text-secondary))',
                                    fontWeight: 600, textTransform: 'uppercase'
                                }}>
                                    {feedback.status}
                                </span>
                            </div>

                            <p style={{
                                fontSize: '15px', lineHeight: '1.6', color: 'hsl(var(--color-text-secondary))',
                                background: 'hsl(var(--color-bg-input))', padding: '16px', borderRadius: '8px',
                                marginTop: '0', marginBottom: '16px', whiteSpace: 'pre-wrap'
                            }}>
                                {feedback.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid hsl(var(--color-border))', paddingTop: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px' }}>
                                        {feedback.userEmail?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>
                                            {feedback.userEmail}
                                        </div>
                                        <div style={{ fontSize: '11px', color: 'hsl(var(--color-text-secondary))' }}>
                                            User ID: {feedback.userId}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'hsl(var(--color-text-secondary))' }}>
                                    <Calendar size={14} />
                                    {formatDate(feedback.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminFeedbackList;
