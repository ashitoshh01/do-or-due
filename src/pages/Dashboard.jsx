import React, { useState } from 'react';
import { Plus, Check, Clock, TrendingUp, Calendar, Upload, MessageSquare, Trash2 } from 'lucide-react';
import TaskChatAssistant from '../components/TaskChatAssistant';

const Dashboard = ({ onCreate, onUploadProof, onDelete, history, balance, onShowPopup }) => {
    const [filter, setFilter] = useState('all');
    const [chatTask, setChatTask] = useState(null); // Track which task has chat open

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

    const [newTask, setNewTask] = useState({ title: '', desc: '', deadline: '', stake: '' });

    const filteredHistory = history.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'pending') return item.status === 'pending';
        if (filter === 'done') return item.status === 'success';
        return true;
    });

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
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '12px',
                            backgroundColor: stat.color === 'orange' ? '#FFF7ED' : stat.color === 'blue' ? '#EFF6FF' : stat.color === 'green' ? '#F0FDF4' : '#FEF2F2',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {/* Simple Icon Logic */}
                            {stat.icon === 'coins' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid orange' }} />}
                            {stat.icon === 'list' && <div style={{ width: '20px', height: '14px', border: '2px solid #3B82F6', borderTop: 'none' }} />}
                            {stat.icon === 'check' && <Check size={20} color="#22C55E" />}
                            {stat.icon === 'trend' && <TrendingUp size={20} color="#EF4444" />}
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))', fontWeight: 500 }}>{stat.label}</div>
                            <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                    <Calendar size={16} color="hsl(var(--color-text-secondary))" />
                                    <input
                                        type="date"
                                        style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: 'hsl(var(--color-text-main))' }}
                                        value={newTask.deadline ? newTask.deadline.split('T')[0] : ''}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={e => {
                                            const date = e.target.value;
                                            const time = newTask.deadline ? newTask.deadline.split('T')[1] : '23:59';
                                            setNewTask({ ...newTask, deadline: `${date}T${time}` });
                                        }}
                                    />
                                </div>
                                <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                                    <Clock size={16} color="hsl(var(--color-text-secondary))" />
                                    <input
                                        type="time"
                                        style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: 'hsl(var(--color-text-main))' }}
                                        value={newTask.deadline ? newTask.deadline.split('T')[1] : '23:59'}
                                        onChange={e => {
                                            const time = e.target.value;
                                            const date = newTask.deadline ? newTask.deadline.split('T')[0] : new Date().toISOString().split('T')[0];
                                            setNewTask({ ...newTask, deadline: `${date}T${time}` });
                                        }}
                                    />
                                </div>
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
                        <div style={{ backgroundColor: 'hsl(var(--color-bg-input))', padding: '4px', borderRadius: '8px', display: 'flex', border: '1px solid hsl(var(--color-border))' }}>
                            <button onClick={() => setFilter('all')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'all' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: filter === 'all' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', transition: 'all 0.2s' }}>All</button>
                            <button onClick={() => setFilter('pending')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'pending' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'pending' ? 'var(--shadow-sm)' : 'none', fontSize: '13px', fontWeight: 600, color: filter === 'pending' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>Pending</button>
                            <button onClick={() => setFilter('done')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: filter === 'done' ? 'hsl(var(--color-bg-card))' : 'transparent', boxShadow: filter === 'done' ? 'var(--shadow-sm)' : 'none', fontSize: '13px', fontWeight: 600, color: filter === 'done' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))', cursor: 'pointer', transition: 'all 0.2s' }}>Done</button>
                        </div>
                    </div>

                    <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '24px', background: 'transparent', boxShadow: 'none', border: 'none' }}>
                        {filteredHistory && filteredHistory.length > 0 ? (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Updated List Item per screenshot */}
                                {filteredHistory.map(item => (
                                    <div key={item.id} style={{
                                        padding: '20px',
                                        backgroundColor: 'hsl(var(--color-bg-card))',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-sm)',
                                        border: '1px solid hsl(var(--color-border))',
                                        position: 'relative'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <div style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    backgroundColor: item.status === 'success' ? '#F0FDF4' : '#FFF7ED',
                                                    color: item.status === 'success' ? '#166534' : '#B45309',
                                                    fontSize: '11px', fontWeight: 700, padding: '4px 8px', borderRadius: '6px', marginBottom: '8px'
                                                }}>
                                                    {item.status === 'success' ? <Check size={12} /> : <Clock size={12} />} {item.status.toUpperCase()}
                                                </div>
                                                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--color-text-main))' }}>{item.objective}</h3>
                                                <p style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))', marginTop: '4px' }}>EARLY</p>
                                            </div>

                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                backgroundColor: 'hsl(var(--color-bg-input))', padding: '6px 10px', borderRadius: '8px',
                                                fontWeight: 700, fontSize: '14px', color: 'hsl(var(--color-text-main))'
                                            }}>
                                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid orange' }} />
                                                {item.stake}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                                            <Calendar size={14} color="#64748B" />
                                            <span style={{ fontSize: '13px', color: '#64748B' }}>
                                                {item.deadline ? `Due: ${new Date(item.deadline).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'No Deadline'}
                                            </span>
                                        </div>

                                        {item.status === 'pending' && (
                                            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                                                <button
                                                    onClick={() => onUploadProof(item)}
                                                    style={{
                                                        flex: 1, backgroundColor: 'hsl(var(--color-text-main))', color: 'hsl(var(--color-bg-card))',
                                                        padding: '12px', borderRadius: '8px', border: 'none',
                                                        fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'
                                                    }}
                                                >
                                                    <Upload size={16} /> Upload Proof
                                                </button>
                                                <button
                                                    onClick={() => setChatTask(item)}
                                                    style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#6366F1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                                                    <MessageSquare size={20} color="white" />
                                                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', backgroundColor: '#22C55E', borderRadius: '50%', border: '2px solid white' }} />
                                                </button>
                                                <button onClick={() => onDelete(item.id)} style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <Trash2 size={20} color="hsl(var(--color-text-secondary))" />
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                ))}
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
        </div>
    );
};

export default Dashboard;
