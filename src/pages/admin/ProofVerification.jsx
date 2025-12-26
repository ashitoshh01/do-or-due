import React, { useEffect, useState } from 'react';
import { subscribeToAdminTasks, approveProof, rejectProof, adminLogout } from '../../services/adminService';
import { LogOut, RefreshCw, Moon, Sun } from 'lucide-react';
import Popup from '../../components/Popup';
import AdminDashboardHome from './components/AdminDashboardHome';
import AdminTaskList from './components/AdminTaskList';
import AdminTaskDetail from './components/AdminTaskDetail';
import { useTheme } from '../../context/ThemeContext';

const ProofVerification = ({ onLogout }) => {
    // Theme Hook
    const { isDark, toggleTheme } = useTheme();

    // Data State
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);

    // View State
    const [viewMode, setViewMode] = useState('home'); // 'home', 'list', 'detail'
    const [selectedCategory, setSelectedCategory] = useState(null); // 'pending', 'approved', 'failed'
    const [selectedTask, setSelectedTask] = useState(null);

    // Processing State
    const [processingId, setProcessingId] = useState(null);
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // Load Proofs (REAL-TIME)
    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToAdminTasks((data) => {
            setProofs(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const showPopup = (title, message, type = 'info') => {
        setPopup({ isOpen: true, title, message, type });
    };

    // --- Actions ---

    const handleApprove = async (proof) => {
        if (processingId) return;
        setProcessingId(proof.taskId);

        try {
            await approveProof(proof.userId, proof.taskId, parseInt(proof.stake));
            setProofs(prev => prev.map(p => p.taskId === proof.taskId ? { ...p, status: 'success' } : p));
            showPopup('Success', `Proof approved for ${proof.userName}.`, 'success');

            // Go back to list on success
            setViewMode('list');
            setSelectedTask(null);
        } catch (error) {
            showPopup('Error', 'Approval failed: ' + error.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (proof, reason) => {
        if (processingId) return;
        setProcessingId(proof.taskId);

        try {
            await rejectProof(proof.userId, proof.taskId, reason);
            setProofs(prev => prev.map(p => p.taskId === proof.taskId ? { ...p, status: 'failed', rejectionReason: reason } : p));
            showPopup('Rejected', 'Proof has been rejected.', 'success');

            // Go back to list on success
            setViewMode('list');
            setSelectedTask(null);
        } catch (error) {
            showPopup('Error', 'Rejection failed: ' + error.message, 'error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleLogout = () => {
        adminLogout();
        if (onLogout) onLogout();
    };


    // --- Navigation Helpers ---

    const handleNavigateToCategory = (category) => {
        setSelectedCategory(category);
        setViewMode('list');
    };

    const handleBackToHome = () => {
        setViewMode('home');
        setSelectedCategory(null);
        setSelectedTask(null);
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedTask(null);
    };

    const handleSelectTask = (task) => {
        setSelectedTask(task);
        setViewMode('detail');
    };

    // --- Rendering ---

    // Derived Categorized Lists
    const pendingProofs = proofs.filter(p => p.status === 'pending_review');
    const doneProofs = proofs.filter(p => p.status === 'success');
    const failedProofs = proofs.filter(p => p.status === 'failed');

    const getTasksByCategory = () => {
        switch (selectedCategory) {
            case 'pending': return pendingProofs;
            case 'approved': return doneProofs;
            case 'failed': return failedProofs;
            default: return [];
        }
    };

    const stats = {
        pending: pendingProofs.length,
        approved: doneProofs.length,
        failed: failedProofs.length
    };

    // View Content
    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: isDark ? '#94A3B8' : '#64748B' }}>
                    <RefreshCw className="spin" size={24} style={{ marginRight: '10px' }} /> Loading Data...
                </div>
            );
        }

        switch (viewMode) {
            case 'home':
                return <AdminDashboardHome stats={stats} onNavigate={handleNavigateToCategory} />;
            case 'list':
                return <AdminTaskList
                    tasks={getTasksByCategory()}
                    category={selectedCategory}
                    onBack={handleBackToHome}
                    onSelectTask={handleSelectTask}
                />;
            case 'detail':
                return <AdminTaskDetail
                    task={selectedTask}
                    onBack={handleBackToList}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    processing={!!processingId}
                />;
            default:
                return <div>Unknown View</div>;
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: isDark ? '#0F172A' : '#F8FAFC', fontFamily: 'Outfit, sans-serif', color: isDark ? '#F8FAFC' : '#1E293B', transition: 'background-color 0.3s, color 0.3s' }}>
            {/* Top Bar */}
            <header style={{
                background: isDark ? '#1E293B' : 'white', color: isDark ? '#F8FAFC' : '#0F172A', padding: '0 32px', height: '80px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.2)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                position: 'sticky', top: 0, zIndex: 50, transition: 'background-color 0.3s'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>D</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em', color: isDark ? '#F8FAFC' : '#0F172A' }}>Admin Portal</div>
                        <div style={{ fontSize: '12px', color: isDark ? '#94A3B8' : '#64748B', fontWeight: 500 }}>Global Verification Center</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: isDark ? '#334155' : '#F1F5F9',
                            border: 'none',
                            color: isDark ? '#FCD34D' : '#64748B',
                            padding: '10px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} style={{ background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #FEE2E2', color: '#EF4444', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, transition: 'all 0.2s' }}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            {/* Main Area */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
                {renderContent()}
            </main>

            <Popup
                isOpen={popup.isOpen}
                onClose={() => setPopup({ ...popup, isOpen: false })}
                title={popup.title}
                message={popup.message}
                type={popup.type}
            />

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: fadeIn 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ProofVerification;

