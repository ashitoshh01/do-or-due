import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, Clock, TrendingUp, Calendar, Upload, MessageSquare, Trash2, ChevronRight } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Countdown from "react-countdown";

import CustomTimeInput from '../components/CustomTimeInput';
import CountdownTimer from '../components/CountdownTimer';
import CharityModal from '../components/CharityModal';
import { subscribeToUser } from '../services/dbService';
import { CHARITIES } from '../constants/charities';

// Custom Trigger Component for DatePicker to look "Cool" and have pointer cursor
const CustomDateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <div
        onClick={onClick}
        ref={ref}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px', // Matches var(--radius-md)
            border: '1px solid hsl(var(--color-border))',
            backgroundColor: 'hsl(var(--color-bg-input))',
            color: value ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        className="custom-date-trigger"
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '24px', height: '24px',
                borderRadius: '6px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Blue tint
                color: '#3B82F6'
            }}>
                <Calendar size={14} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
                {value || placeholder || "Select Deadline"}
            </span>
        </div>
        <Clock size={14} color="hsl(var(--color-text-secondary))" style={{ opacity: 0.7 }} />

        {/* Hover effect handled via CSS class 'custom-date-trigger' in index.css or style tag */}
        <style>{`
    .custom - date - trigger:hover {
    border - color: hsl(var(--color - primary));
    transform: translateY(-1px);
    box - shadow: 0 4px 6px - 1px rgba(0, 0, 0, 0.1), 0 2px 4px - 1px rgba(0, 0, 0, 0.06);
}
            .custom - date - trigger:active {
    transform: translateY(0);
}
`}</style>
    </div>
));
import TaskChatAssistant from '../components/TaskChatAssistant';
import TaskCard from '../components/TaskCard';

const Dashboard = ({ onCreate, onUploadProof, onDelete, onExpire, history, balance, onShowPopup }) => {
    const [filter, setFilter] = useState('all');
    const [chatTask, setChatTask] = useState(null); // Track which task has chat open
    const [charityModalTask, setCharityModalTask] = useState(null); // Track which task to donate for

    const [userProfile, setUserProfile] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            const unsub = subscribeToUser(currentUser.uid, (data) => setUserProfile(data));
            return () => unsub();
        }
    }, [currentUser]);

    const pendingCount = history.filter(h => h.status === 'pending').length;
    const completedCount = history.filter(h => h.status === 'success').length;
    const atStake = history.filter(h => h.status === 'pending').reduce((acc, curr) => acc + parseInt(curr.stake || 0), 0);

    // Stats Data
    const stats = [
        { label: 'Balance', value: balance, icon: 'coins', color: 'orange' },
        { label: 'Pending', value: pendingCount, icon: 'list', color: 'blue' },
        { label: 'Completed', value: completedCount, icon: 'check', color: 'green' },
        { label: 'At Stake', value: atStake, icon: 'trend', color: 'red' },
    ];

    const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: null, stake: '' });

    const filteredHistory = history.filter(item => {
        const isFailed = item.status === 'failed' || (item.status === 'pending' && item.deadline && (new Date(item.deadline.toDate ? item.deadline.toDate() : item.deadline) <= new Date()));

        if (filter === 'all') return true;
        if (filter === 'active') return item.status === 'pending' && !isFailed;
        if (filter === 'review') return item.status === 'pending_review';
        if (filter === 'done') return item.status === 'success';
        if (filter === 'failed') return isFailed;
        return true;
    });

    // Sort locally to ensure latest is always on top (handling potential latency)
    const sortedHistory = [...filteredHistory].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
    });

    const [showAllTasks, setShowAllTasks] = useState(false);

    // Logic: Always show ALL pending/active tasks. Only limit the "Done/Failed" history.
    const activeTasks = sortedHistory.filter(t => t.status === 'pending' || t.status === 'pending_review');
    const pastTasks = sortedHistory.filter(t => t.status !== 'pending' && t.status !== 'pending_review');

    // If filter is 'all', show all active + limited past. If filter is specific, show all matching.
    let displayedTasks;
    if (filter === 'all') {
        displayedTasks = [...activeTasks, ...(showAllTasks ? pastTasks : pastTasks.slice(0, 5))];
    } else {
        displayedTasks = showAllTasks ? sortedHistory : sortedHistory.slice(0, 10);
    }

    const handleDonateClick = (task) => {
        if (userProfile?.defaultCharity) {
            // Auto-donate
            const charity = CHARITIES.find(c => c.id === userProfile.defaultCharity);
            const charityName = charity ? charity.name : 'Unknown Charity';

            handleDonate(userProfile.defaultCharity);

            if (onShowPopup) onShowPopup({
                title: 'Auto-Donation Successful',
                message: `Your stake has been donated to your default charity: ${charityName}`,
                type: 'success'
            });
        } else {
            // Open Modal
            setCharityModalTask(task);
        }
    };

    const handleDonate = async (charityId) => {
        // Here we would record the donation
        if (!userProfile?.defaultCharity && onShowPopup) onShowPopup({
            title: 'Donation Successful',
            message: 'Your stake has been donated to the selected charity. Thank you for your generosity!',
            type: 'success'
        });
        setCharityModalTask(null);
    };

    return (
        <div style={{ paddingBottom: '40px' }}>

            {/* Header */}
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Dashboard</h1>
            <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '32px' }}>
                Stake your coins, complete your tasks, earn rewards.
            </p>

            {/* Stats Row - Responsive Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            backgroundColor: stat.color === 'orange' ? '#FFF7ED' : stat.color === 'blue' ? '#EFF6FF' : stat.color === 'green' ? '#F0FDF4' : '#FEF2F2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            {/* Simple Icon Logic */}
                            {stat.icon === 'coins' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid orange' }} />}
                            {stat.icon === 'list' && <div style={{ width: '20px', height: '14px', border: '2px solid #3B82F6', borderTop: 'none' }} />}
                            {stat.icon === 'check' && <Check size={20} color="#22C55E" />}
                            {stat.icon === 'trend' && <TrendingUp size={20} color="#EF4444" />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))', fontWeight: 500 }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="dashboard-split" style={{ display: 'grid', gap: '32px', alignItems: 'start' }}>

                {/* Left Column: Create Task Form */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--color-text-main))' }}>
                        <Plus size={20} color="hsl(var(--color-text-main))" /> Create New Task
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Task Title *</label>
                            <input
                                className="input-field"
                                placeholder="What do you need to do?"
                                value={newTask.title}
                                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Description</label>
                            <textarea
                                className="input-field"
                                placeholder="Add details about your task..."
                                rows={3}
                                style={{ resize: 'vertical' }}
                                value={newTask.desc}
                                onChange={e => setNewTask({ ...newTask, desc: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Deadline *</label>
                            <div style={{ position: 'relative' }}>
                                <DatePicker
                                    selected={newTask.deadline}
                                    onChange={(date) => setNewTask({ ...newTask, deadline: date })}
                                    showTimeInput
                                    customTimeInput={<CustomTimeInput />}
                                    dateFormat="MMM d, yyyy h:mm aa"
                                    placeholderText="Pick a date & time"
                                    minDate={new Date()}
                                    customInput={<CustomDateInput />}
                                    wrapperClassName="react-datepicker-wrapper"
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Stake Amount (DueCoins) *</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Minimum 20 coins"
                                min="20"
                                step="10"
                                value={newTask.stake}
                                onChange={e => setNewTask({ ...newTask, stake: e.target.value })}
                                style={{
                                    paddingLeft: '40px',
                                    backgroundImage: 'radial-gradient(circle at 16px center, transparent 6px, orange 7px, orange 8px, transparent 9px)',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: '12px center'
                                }}
                            />
                            <div style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', marginTop: '6px' }}>
                                Your balance: {balance} DueCoins • Minimum stake: 20 coins
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', borderRadius: '8px' }}
                            onClick={() => {
                                if (!newTask.title || !newTask.stake) {
                                    if (onShowPopup) {
                                        onShowPopup({
                                            title: 'Missing Information',
                                            message: 'Please fill in both title and stake amount.',
                                            type: 'warning'
                                        });
                                    }
                                    return;
                                }

                                // Validate minimum stake
                                if (parseInt(newTask.stake) < 20) {
                                    if (onShowPopup) {
                                        onShowPopup({
                                            title: 'Insufficient Stake',
                                            message: 'Minimum stake amount is 20 DueCoins. Please increase your stake.',
                                            type: 'warning'
                                        });
                                    }
                                    return;
                                }

                                // Validate deadline is not in the past
                                if (newTask.deadline) {
                                    const deadlineDate = new Date(newTask.deadline);
                                    const now = new Date();
                                    if (deadlineDate <= now) {
                                        if (onShowPopup) {
                                            onShowPopup({
                                                title: 'Invalid Deadline',
                                                message: 'Deadline must be in the future. Please select a valid date and time.',
                                                type: 'warning'
                                            });
                                        }
                                        return;
                                    }
                                }

                                onCreate({ objective: newTask.title, deadline: newTask.deadline, stake: newTask.stake });
                                setNewTask({ title: '', desc: '', deadline: '', stake: '' }); // Reset
                            }}
                        >
                            Stake {newTask.stake || '0'} DueCoins
                        </button>
                    </div>
                </div>

                {/* Right Column: Your Tasks (New Design) */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--color-text-main))' }}>Your Tasks</h2>
                        <div style={{ backgroundColor: 'hsl(var(--color-bg-input))', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', border: '1px solid hsl(var(--color-border))', overflowX: 'auto', maxWidth: '100%', scrollbarWidth: 'none' }}>
                            <button onClick={() => setFilter('all')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'all' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: filter === 'all' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', transition: 'all 0.2s' }}>All</button>
                            <button onClick={() => setFilter('active')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'active' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'active' ? 'var(--shadow-sm)' : 'none', fontSize: '12px', fontWeight: 600, color: filter === 'active' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>Active</button>
                            <button onClick={() => setFilter('review')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'review' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'review' ? 'var(--shadow-sm)' : 'none', fontSize: '12px', fontWeight: 600, color: filter === 'review' ? '#3B82F6' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>In Review</button>
                            <button onClick={() => setFilter('done')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'done' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'done' ? 'var(--shadow-sm)' : 'none', fontSize: '12px', fontWeight: 600, color: filter === 'done' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>Done</button>
                            <button onClick={() => setFilter('failed')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'failed' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'failed' ? 'var(--shadow-sm)' : 'none', fontSize: '12px', fontWeight: 600, color: filter === 'failed' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>Failed</button>
                        </div>
                    </div>


                    <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '24px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                        {displayedTasks && displayedTasks.length > 0 ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Updated List Item per screenshot */}
                                {displayedTasks.map(item => {
                                    const defaultCharity = CHARITIES.find(c => c.id === userProfile?.defaultCharity);

                                    return (
                                        <TaskCard
                                            key={item.id}
                                            task={{ ...item, charityName: defaultCharity?.name }}
                                            onUploadProof={onUploadProof}
                                            onDelete={onDelete}
                                            onChat={setChatTask}
                                            onExpire={onExpire}
                                            onDonate={handleDonateClick}
                                        />
                                    );
                                })}

                                {filteredHistory.length > 5 && (
                                    <button
                                        onClick={() => setShowAllTasks(!showAllTasks)}
                                        style={{
                                            margin: '16px auto 0',
                                            padding: '10px 20px',
                                            background: 'hsl(var(--color-bg-subtle))',
                                            border: '1px solid hsl(var(--color-border))',
                                            borderRadius: '20px',
                                            color: 'hsl(var(--color-text-secondary))',
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-scale"
                                    >
                                        {showAllTasks ? (
                                            <>Show Less <ChevronRight size={14} style={{ transform: 'rotate(-90deg)' }} /></>
                                        ) : (
                                            <>Show More <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', backgroundColor: 'hsl(var(--color-bg-card))', padding: '40px', borderRadius: '16px', width: '100%', border: '1px solid hsl(var(--color-border))' }}>
                                <div style={{ width: '48px', height: '48px', backgroundColor: 'hsl(var(--color-bg-input))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', margin: '0 auto' }}>
                                    <div style={{ width: '24px', height: '4px', backgroundColor: 'hsl(var(--color-border))', borderRadius: '2px', boxShadow: '0 8px 0 hsl(var(--color-border))' }} />
                                </div>
                                <p style={{ color: 'hsl(var(--color-text-secondary))', fontSize: '14px' }}>No tasks found for "{filter}".</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Task Chat Assistant Modal */}
            {chatTask && (
                <TaskChatAssistant
                    task={chatTask}
                    onClose={() => setChatTask(null)}
                />
            )}

            {/* Charity Modal */}
            {charityModalTask && (
                <CharityModal
                    task={charityModalTask}
                    onClose={() => setCharityModalTask(null)}
                    onDonate={handleDonate}
                />
            )}
        </div>
    );
};

export default Dashboard;
