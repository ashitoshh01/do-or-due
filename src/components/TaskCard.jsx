import React from 'react';
import Countdown from "react-countdown";
import { Check, Clock, Calendar, Upload, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import Tilt from 'react-parallax-tilt';
import { motion } from 'framer-motion';

const TaskCard = ({ task, onUploadProof, onDelete, onChat, onExpire, onDonate }) => {

    // Determine status color/icon
    const isSuccess = task.status === 'success';
    const isFailed = task.status === 'failed' || (task.status === 'pending' && task.deadline && new Date(task.deadline?.toDate ? task.deadline.toDate() : task.deadline) <= new Date());
    const isPending = task.status === 'pending' && !isFailed;
    const isUnderReview = task.status === 'pending_review';

    let statusColor = 'orange';
    let statusBg = '#FFF7ED';
    let statusLabel = 'PENDING';
    let StatusIcon = Clock;

    if (isSuccess) {
        statusColor = '#22C55E';
        statusBg = '#F0FDF4';
        statusLabel = 'COMPLETED';
        StatusIcon = Check;
    } else if (isFailed) {
        statusColor = '#EF4444';
        statusBg = '#FEF2F2';
        statusLabel = 'FAILED';
        StatusIcon = AlertCircle;
    } else if (isUnderReview) {
        statusColor = '#3B82F6';
        statusBg = '#EFF6FF';
        statusLabel = 'IN REVIEW';
        StatusIcon = Clock;
    }

    return (
        <Tilt
            tiltMaxAngleX={3}
            tiltMaxAngleY={3}
            perspective={1000}
            scale={1.02}
            transitionSpeed={1500}
            className="task-card-tilt"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="card"
                style={{
                    padding: '24px',
                    position: 'relative',
                    background: 'hsl(var(--color-bg-card))',
                    border: `1px solid ${isFailed ? '#FCA5A5' : 'hsl(var(--color-border))'}`,
                    borderRadius: '16px',
                    boxShadow: 'var(--shadow-md)', // Base shadow
                }}
            >

                {/* Header: Status and Stake */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        backgroundColor: statusBg,
                        color: statusColor,
                        fontSize: '11px', fontWeight: 700, padding: '6px 10px', borderRadius: '8px',
                        letterSpacing: '0.5px'
                    }}>
                        <StatusIcon size={14} /> {statusLabel}
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: 'hsl(var(--color-bg-input))', padding: '6px 12px', borderRadius: '20px',
                        fontWeight: 700, fontSize: '14px', color: 'hsl(var(--color-text-main))',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'hsl(var(--color-accent-gold))', boxShadow: '0 0 0 2px rgba(251, 191, 36, 0.3)' }} />
                        {task.stake}
                    </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--color-text-main))', marginBottom: '8px', lineHeight: '1.4' }}>
                    {task.objective}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Calendar size={14} color="hsl(var(--color-text-secondary))" />
                    <span style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))', fontWeight: 500 }}>
                        {task.deadline ? `Due: ${new Date(task.deadline?.toDate ? task.deadline.toDate() : task.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No Deadline'}
                    </span>
                </div>

                {/* Countdown (Centered & Enhanced) */}
                {isPending && task.deadline && (
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'hsl(var(--color-bg-app))',
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--color-text-secondary))', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Remaining</p>
                        <Countdown
                            date={task.deadline?.toDate ? task.deadline.toDate() : task.deadline}
                            renderer={({ days, hours, minutes, seconds, completed }) => (
                                <CountdownTimer
                                    days={days}
                                    hours={hours}
                                    minutes={minutes}
                                    seconds={seconds}
                                    completed={completed}
                                />
                            )}
                            onComplete={() => onExpire(task.id)}
                        />
                    </div>
                )}

                {/* Actions */}
                <div style={{ marginTop: 'auto' }}>
                    {isFailed && (
                        <div style={{ padding: '16px', background: '#FEF2F2', borderRadius: '12px', border: '1px dashed #FCA5A5', textAlign: 'center' }}>
                            <p style={{ color: '#EF4444', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
                                Donated {task.stake} coins to {task.charityName || 'Charity'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', fontStyle: 'italic' }}>
                                Tip: You can change your default charity in Settings.
                            </p>
                        </div>
                    )}

                    {isPending && !isUnderReview && (
                        <>
                            {/* Rejection Message Alert */}
                            {task.rejectionReason && (
                                <div style={{
                                    marginBottom: '16px',
                                    padding: '16px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                        <AlertCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <p style={{ color: '#EF4444', fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
                                                Proof Rejected
                                            </p>
                                            <p style={{ color: '#991B1B', fontSize: '13px', lineHeight: '1.5', marginBottom: '8px' }}>
                                                Your proof lacks: <strong>"{task.rejectionReason}"</strong>
                                            </p>
                                            <p style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                                                Please try again with a better proof!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onUploadProof(task)}
                                    style={{
                                        flex: 1, backgroundColor: 'hsl(var(--color-text-main))', color: 'hsl(var(--color-bg-card))',
                                        padding: '12px', borderRadius: '10px', border: 'none',
                                        fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <Upload size={18} /> Upload Proof
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onChat(task)}
                                    style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#6366F1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)' }}>
                                    <MessageSquare size={20} color="white" />
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onDelete(task.id)}
                                    style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'hsl(var(--color-bg-input))', border: '1px solid hsl(var(--color-border))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <Trash2 size={20} color="hsl(var(--color-text-secondary))" />
                                </motion.button>
                            </div>
                        </>
                    )}

                    {/* Pending Review State */}
                    {isUnderReview && (
                        <>
                            <div style={{ padding: '14px', background: '#EFF6FF', borderRadius: '10px', color: '#1E40AF', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                                <div className="spin" style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #93C5FD', borderTopColor: '#1E40AF', flexShrink: 0, marginTop: '2px' }}></div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, marginBottom: '4px' }}>AI is verifying your proof</p>
                                    <p style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 500 }}>
                                        Due to high traffic, this may take some time. You'll be notified once it's ready.
                                    </p>
                                </div>
                            </div>

                            {/* Replace Proof Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onUploadProof(task)}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'hsl(var(--color-bg-input))',
                                    color: 'hsl(var(--color-text-main))',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: '1px solid hsl(var(--color-border))',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                <Upload size={16} /> Replace Proof
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>
        </Tilt>
    );
};

export default TaskCard;
