import React, { useState, useEffect } from 'react';
import { subscribeToAllUsers, deleteUserProfile } from '../../../services/adminService';
import { addFunds, removeFunds, updateUserProfile } from '../../../services/dbService';
import { useTheme } from '../../../context/ThemeContext';
import { Search, Plus, Coins, User, ArrowLeft, X, Check, Calendar, ChevronDown, Award, Trash2, AlertTriangle, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Popup from '../../../components/Popup';

const AdminUserList = ({ onBack }) => {
    const { isDark } = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // States for Modals
    const [selectedUserForCoins, setSelectedUserForCoins] = useState(null);
    const [selectedUserForSubtract, setSelectedUserForSubtract] = useState(null);
    const [selectedUserForPlan, setSelectedUserForPlan] = useState(null);
    const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);

    // Form States
    const [coinAmount, setCoinAmount] = useState('');
    const [subtractAmount, setSubtractAmount] = useState('');
    const [newPlan, setNewPlan] = useState('base');
    const [planExpiry, setPlanExpiry] = useState('');
    const [processing, setProcessing] = useState(false);

    // Popup state
    const [popup, setPopup] = useState({ isOpen: false, type: 'info', title: '', message: '' });

    // Fetch Users
    useEffect(() => {
        const unsubscribe = subscribeToAllUsers((data) => {
            setUsers(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Filter Users
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    // --- Helpers ---

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = dateValue.seconds ? new Date(dateValue.seconds * 1000) : new Date(dateValue);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'pro': return { bg: 'rgba(245, 158, 11, 0.2)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' };
            case 'elite': return { bg: 'rgba(168, 85, 247, 0.2)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)' };
            default: return { bg: isDark ? 'rgba(148, 163, 184, 0.2)' : '#F1F5F9', text: isDark ? '#94A3B8' : '#64748B', border: 'transparent' };
        }
    };

    // --- Handlers ---

    const handleAddCoins = async () => {
        if (!coinAmount || isNaN(coinAmount) || parseInt(coinAmount) <= 0) {
            setPopup({ isOpen: true, type: 'warning', title: 'Invalid Amount', message: 'Please enter a valid positive number.' });
            return;
        }

        setProcessing(true);
        try {
            await addFunds(selectedUserForCoins.userId, parseInt(coinAmount));
            setProcessing(false);
            setPopup({ isOpen: true, type: 'success', title: 'Coins Sent!', message: `Successfully added ${coinAmount} coins to ${selectedUserForCoins.name}.` });
            setSelectedUserForCoins(null);
            setCoinAmount('');
        } catch (error) {
            console.error(error);
            setProcessing(false);
            setPopup({ isOpen: true, type: 'error', title: 'Transfer Failed', message: 'Failed to add funds.' });
        }
    };

    const handleSubtractCoins = async () => {
        if (!subtractAmount || isNaN(subtractAmount) || parseInt(subtractAmount) <= 0) {
            setPopup({ isOpen: true, type: 'warning', title: 'Invalid Amount', message: 'Please enter a valid positive number.' });
            return;
        }

        setProcessing(true);
        try {
            await removeFunds(selectedUserForSubtract.userId, parseInt(subtractAmount));
            setProcessing(false);
            setPopup({ isOpen: true, type: 'success', title: 'Coins Removed!', message: `Successfully deducted ${subtractAmount} coins from ${selectedUserForSubtract.name}.` });
            setSelectedUserForSubtract(null);
            setSubtractAmount('');
        } catch (error) {
            console.error(error);
            setProcessing(false);
            setPopup({ isOpen: true, type: 'error', title: 'Deduction Failed', message: 'Failed to remove funds.' });
        }
    };

    const openPlanModal = (user) => {
        setSelectedUserForPlan(user);
        setNewPlan(user.plan || 'base');

        // Format expiry date for datetime-local input (YYYY-MM-DDThh:mm)
        if (user.planExpiresAt && user.planExpiresAt.seconds) {
            const date = new Date(user.planExpiresAt.seconds * 1000);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            setPlanExpiry(date.toISOString().slice(0, 16));
        } else {
            // Default to 1 month from now
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
            setPlanExpiry(date.toISOString().slice(0, 16));
        }
    };

    const handleUpdatePlan = async () => {
        setProcessing(true);
        try {
            const updates = {
                plan: newPlan,
                planExpiresAt: newPlan === 'base' ? null : new Date(planExpiry)
            };

            await updateUserProfile(selectedUserForPlan.userId, updates);

            setProcessing(false);
            setPopup({ isOpen: true, type: 'success', title: 'Plan Updated', message: `User plan set to ${newPlan.toUpperCase()}.` });
            setSelectedUserForPlan(null);
        } catch (error) {
            console.error(error);
            setProcessing(false);
            setPopup({ isOpen: true, type: 'error', title: 'Update Failed', message: 'Failed to update user plan.' });
        }
    };

    const handleDeleteUser = async () => {
        setProcessing(true);
        try {
            await deleteUserProfile(selectedUserForDelete.userId);
            setProcessing(false);
            setPopup({ isOpen: true, type: 'success', title: 'User Deleted', message: 'User has been permanently removed.' });
            setSelectedUserForDelete(null);
        } catch (error) {
            console.error(error);
            setProcessing(false);
            setPopup({ isOpen: true, type: 'error', title: 'Delete Failed', message: 'Failed to delete user.' });
        }
    };

    // Styles
    const cardBg = isDark ? '#1E293B' : 'white';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const borderColor = isDark ? '#334155' : '#E2E8F0';
    const inputBg = isDark ? '#0F172A' : '#F8FAFC';

    return (
        <div className="animate-in" style={{ paddingBottom: '40px' }}>
            {/* Header */}
            <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={onBack}
                        style={{ background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '10px', color: subTextColor, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: textColor, marginBottom: '4px' }}>User Management</h1>
                        <p style={{ color: subTextColor, fontSize: '14px' }}>Manage users, plans, and funds</p>
                    </div>
                </div>

                {/* Search */}
                <div className="admin-search-input" style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', background: cardBg, border: `1px solid ${borderColor}`, color: textColor, fontSize: '14px', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: cardBg, borderRadius: '24px', overflow: 'hidden', border: `1px solid ${borderColor}`, overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: subTextColor }}>Loading Users...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr style={{ borderBottom: `1px solid ${borderColor}`, textAlign: 'left' }}>
                                <th style={{ padding: '20px', color: subTextColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>User</th>
                                <th style={{ padding: '20px', color: subTextColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Email</th>
                                {/* Changed Column: Joined Date -> Current Plan */}
                                <th style={{ padding: '20px', color: subTextColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Current Plan</th>
                                <th style={{ padding: '20px', color: subTextColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Balance</th>
                                <th style={{ padding: '20px', color: subTextColor, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const planStyle = getPlanColor(user.plan || 'base');
                                return (
                                    <tr key={user.userId} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isDark ? '#334155' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: subTextColor, fontWeight: 700 }}>
                                                    {user.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                                                </div>
                                                <span style={{ fontWeight: 600, color: textColor }}>{user.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', color: subTextColor, fontSize: '14px' }}>{user.email}</td>

                                        {/* Plan Cell */}
                                        <td style={{ padding: '20px' }}>
                                            <div
                                                onClick={() => openPlanModal(user)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    padding: '6px 12px', borderRadius: '20px',
                                                    background: planStyle.bg, color: planStyle.text, border: `1px solid ${planStyle.border}`,
                                                    fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer',
                                                    transition: 'filter 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(110%)'}
                                                onMouseOut={(e) => e.currentTarget.style.filter = 'none'}
                                            >
                                                {user.plan || 'BASE'} <ChevronDown size={12} />
                                            </div>
                                            {user.plan !== 'base' && user.planExpiresAt && (
                                                <div style={{ fontSize: '11px', color: subTextColor, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Calendar size={10} /> Exp: {formatDate(user.planExpiresAt).split(' ')[0]}
                                                </div>
                                            )}
                                        </td>

                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B', fontWeight: 700 }}>
                                                <Coins size={16} /> {user.balance || 0}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedUserForCoins(user)}
                                                style={{
                                                    background: '#22C55E', color: 'white', border: 'none',
                                                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                                    fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px'
                                                }}
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserForSubtract(user)}
                                                style={{
                                                    background: '#EF4444', color: 'white', border: 'none',
                                                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                                    fontWeight: 600, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                    marginLeft: '8px'
                                                }}
                                            >
                                                <Minus size={14} /> Remove
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserForDelete(user)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: 'none',
                                                    padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                                    marginLeft: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: subTextColor }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL: ADD COINS */}
            <AnimatePresence>
                {selectedUserForCoins && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        onClick={() => setSelectedUserForCoins(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: cardBg, padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: textColor }}>Add Coins</h2>
                                <button onClick={() => setSelectedUserForCoins(null)} style={{ background: 'none', border: 'none', color: subTextColor, cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>{selectedUserForCoins.name}</div>
                                <div style={{ fontSize: '13px', color: subTextColor }}>Current Balance: {selectedUserForCoins.balance || 0}</div>
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', color: subTextColor, fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Amount to Add</label>
                                <div style={{ position: 'relative' }}>
                                    <Coins size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }} />
                                    <input
                                        type="number" placeholder="Enter amount..." value={coinAmount} onChange={(e) => setCoinAmount(e.target.value)} autoFocus
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '12px', color: textColor, fontSize: '16px', fontWeight: 600, outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setSelectedUserForCoins(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: 'transparent', color: subTextColor, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleAddCoins} disabled={processing} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: processing ? '#94A3B8' : '#F59E0B', color: 'white', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{processing ? 'Processing...' : <><Check size={18} /> Confirm</>}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL: REMOVE COINS */}
            <AnimatePresence>
                {selectedUserForSubtract && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        onClick={() => setSelectedUserForSubtract(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: cardBg, padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: textColor }}>Remove Coins</h2>
                                <button onClick={() => setSelectedUserForSubtract(null)} style={{ background: 'none', border: 'none', color: subTextColor, cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>{selectedUserForSubtract.name}</div>
                                <div style={{ fontSize: '13px', color: subTextColor }}>Current Balance: {selectedUserForSubtract.balance || 0}</div>
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', color: subTextColor, fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Amount to Deduct</label>
                                <div style={{ position: 'relative' }}>
                                    <Minus size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#EF4444' }} />
                                    <input
                                        type="number" placeholder="Enter amount..." value={subtractAmount} onChange={(e) => setSubtractAmount(e.target.value)} autoFocus
                                        style={{ width: '100%', padding: '16px 16px 16px 48px', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '12px', color: textColor, fontSize: '16px', fontWeight: 600, outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setSelectedUserForSubtract(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: 'transparent', color: subTextColor, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSubtractCoins} disabled={processing} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: processing ? '#94A3B8' : '#EF4444', color: 'white', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{processing ? 'Processing...' : <><Check size={18} /> Deduct</>}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL: EDIT PLAN */}
            <AnimatePresence>
                {selectedUserForPlan && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        onClick={() => setSelectedUserForPlan(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: cardBg, padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: textColor }}>Manage Plan</h2>
                                <button onClick={() => setSelectedUserForPlan(null)} style={{ background: 'none', border: 'none', color: subTextColor, cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>{selectedUserForPlan.name}</div>
                                <div style={{ fontSize: '13px', color: subTextColor }}>Current Plan: <b>{selectedUserForPlan.plan || 'BASE'}</b></div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', color: subTextColor, fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Select Plan</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {['base', 'pro', 'elite'].map((planOptions) => (
                                        <button
                                            key={planOptions}
                                            onClick={() => setNewPlan(planOptions)}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: newPlan === planOptions ? `2px solid ${isDark ? '#3B82F6' : '#2563EB'}` : `1px solid ${borderColor}`,
                                                background: newPlan === planOptions ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF') : 'transparent',
                                                color: newPlan === planOptions ? (isDark ? '#60A5FA' : '#1D4ED8') : subTextColor,
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {planOptions}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence>
                                {newPlan !== 'base' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: 'hidden', marginBottom: '32px' }}
                                    >
                                        <label style={{ display: 'block', color: subTextColor, fontSize: '14px', marginBottom: '8px', fontWeight: 600 }}>Plan Expiration</label>
                                        <p style={{ fontSize: '12px', color: subTextColor, marginBottom: '8px', lineHeight: '1.4' }}>
                                            The plan will automatically revert to BASE after this date.
                                        </p>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: subTextColor }} />
                                            <input
                                                type="datetime-local"
                                                value={planExpiry}
                                                onChange={(e) => setPlanExpiry(e.target.value)}
                                                style={{ width: '100%', padding: '16px 16px 16px 48px', background: inputBg, border: `1px solid ${borderColor}`, borderRadius: '12px', color: textColor, fontSize: '14px', fontWeight: 500, outline: 'none' }}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setSelectedUserForPlan(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: 'transparent', color: subTextColor, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleUpdatePlan} disabled={processing} style={{ flex: 2, padding: '14px', borderRadius: '12px', border: 'none', background: processing ? '#94A3B8' : '#3B82F6', color: 'white', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>{processing ? 'Saving...' : 'Save Plan'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL: DELETE USER */}
            <AnimatePresence>
                {selectedUserForDelete && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
                        onClick={() => setSelectedUserForDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: cardBg, padding: '32px', borderRadius: '24px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <AlertTriangle size={32} color="#EF4444" />
                                </div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: textColor, marginBottom: '8px' }}>Delete User?</h2>
                                <p style={{ fontSize: '14px', color: subTextColor, lineHeight: '1.5' }}>
                                    Are you sure you want to delete <b>{selectedUserForDelete.name}</b>? This action cannot be undone and will remove them from the leaderboard.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setSelectedUserForDelete(null)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${borderColor}`, background: 'transparent', color: subTextColor, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleDeleteUser} disabled={processing} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#EF4444', color: 'white', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer' }}>
                                    {processing ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Popup
                isOpen={popup.isOpen}
                onClose={() => setPopup({ ...popup, isOpen: false })}
                title={popup.title}
                message={popup.message}
                type={popup.type}
            />
        </div>
    );
};

export default AdminUserList;
