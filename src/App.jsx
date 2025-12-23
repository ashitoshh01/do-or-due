import { useState, useEffect } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadModal from './components/UploadModal';
import TaskResult from './pages/TaskResult';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Plans from './pages/Plans';
import AddFundsModal from './components/AddFundsModal';
import Popup from './components/Popup';
import LoadingSpinner from './components/LoadingSpinner';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import ProofVerification from './pages/admin/ProofVerification';
import { isAdminAuthenticated } from './services/adminService';

import { subscribeToTasks, subscribeToUser, addTask, deleteTask, updateTaskStatus, updateUserBalance, completeTask, addFunds, failTask } from './services/dbService';
import { verifyProof } from './services/aiService';
import { verifyUTR, recordManualPayment } from './services/paymentService';

function MainApp() {
  const { currentUser, loading } = useAuth();

  // State
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [appView, setAppView] = useState('dashboard'); // 'dashboard', 'leaderboard', etc.

  // Admin State
  const [isAdmin, setIsAdmin] = useState(isAdminAuthenticated());

  const [tasks, setTasks] = useState([]);
  const [userProfile, setUserProfile] = useState({ balance: 0 });
  const [verificationTask, setVerificationTask] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Flag to prevent double credit

  // Check admin status on load
  useEffect(() => {
    setIsAdmin(isAdminAuthenticated());
  }, []);

  // 1. Data Subscriptions (only if normal user logged in AND not in admin mode)
  useEffect(() => {
    if (!currentUser || isAdmin) return;

    // Reset app view to dashboard on fresh login
    setAppView('dashboard');

    const unsubUser = subscribeToUser(currentUser.uid, (data) => setUserProfile(prev => ({ ...prev, ...data })));
    const unsubTasks = subscribeToTasks(currentUser.uid, (data) => setTasks(data));

    return () => {
      unsubUser();
      unsubTasks();
    }
  }, [currentUser, isAdmin]);

  // 2. Handlers
  const handleCommit = async (taskData) => {
    const stakeAmount = parseInt(taskData.stake);
    if (stakeAmount > userProfile.balance) {
      setPopup({
        isOpen: true,
        title: 'Insufficient Balance',
        message: 'You don\'t have enough DueCoins! Add funds first.',
        type: 'error'
      });
      return;
    }
    await updateUserBalance(currentUser.uid, userProfile.balance - stakeAmount);
    await addTask(currentUser.uid, taskData);
  };

  const handleUploadClick = (task) => setVerificationTask(task);
  const handleCloseModal = () => setVerificationTask(null);

  const handleVerify = async (file) => {
    if (!verificationTask) return;

    setVerificationTask(null);
    setIsUploading(true);

    try {
      const result = await verifyProof(file, verificationTask.objective);

      setCurrentTask(verificationTask);
      setIsUploading(false);

      if (result.verified) {
        // AI Verified locally - For this prototype, we mark as 'success' immediately
        // BUT we also want to support Admin Review. 
        // If we want Admin to review EVERYTHING, we should set status to 'pending_review' here instead.
        // However, user requested "Proof Checks" page for admin.
        // Let's modify logic: Mark as 'pending_review' so it shows up in Admin Portal.
        // Wait, the prompt says "Admin Portal – Proof Verification Page... This page will list all proofs submitted by users."
        // And "On approval: Mark the task as completed."
        // This implies the AI check is just a preliminary filter or purely client side, 
        // OR the 'success' state currently bypasses admin.

        // DECISION: To properly demonstrate Admin Portal, I will set status to 'pending_review' 
        // so the Admin HAS to approve it for the user to get money.
        // BUT to keep the user experience smooth for the demo (if admin is offline), 
        // maybe we can double-write? 
        // No, let's go with "pending_review".

        // Actually, for the sake of the 'TaskResult' screen showing "Success", 
        // I will keep the local show as success but DB status as 'pending_review'.

        // UPDATE: Changed dbService flow. I will manually update status here to 'pending_review' w/ proofUrl.
        // We need to upload the image to storage (or simulate it). 
        // For local prototype without storage, I'll use a data URL (not scalable but works for demo).

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result;

          // Set to pending_review for Admin to pick up
          await updateTaskStatus(currentUser.uid, verificationTask.id, 'pending_review', base64data);

          // Show "Under Review" screen instead of instant success? 
          // Or show Success screen with a note "Sent for verification".
          setAppView('result_review');
        };

      } else {
        setAppView('result_fail');
        await failTask(currentUser.uid, verificationTask.id);
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setPopup({
        isOpen: true,
        title: 'Verification Error',
        message: err.message || 'Failed to verify proof. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDelete = async (taskId) => {
    setPopup({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      type: 'warning',
      confirmButton: {
        label: 'Delete',
        onClick: async () => {
          await deleteTask(currentUser.uid, taskId);
          setPopup({ ...popup, isOpen: false });
        }
      },
      cancelButton: {
        label: 'Cancel',
        onClick: () => setPopup({ ...popup, isOpen: false })
      }
    });
  };

  const handleAddFunds = () => {
    setShowFundsModal(true);
  };

  const handlePaymentProceed = async (amount, utr) => {
    setShowFundsModal(false);

    // Set processing flag to prevent duplicate credits
    if (isProcessingPayment) {
      console.warn('Payment already processing, ignoring duplicate call');
      return;
    }
    setIsProcessingPayment(true);

    try {
      // 1. Verify UTR (Format & Uniqueness)
      await verifyUTR(utr);

      // 2. Record Transaction
      await recordManualPayment(currentUser.uid, amount, utr);

      // 3. Add Funds to User Wallet
      await addFunds(currentUser.uid, amount);

      // 4. Update UI -> Optimistic update for instant feedback
      setUserProfile(prev => ({ ...prev, balance: (prev.balance || 0) + amount }));

      setPopup({
        isOpen: true,
        title: 'Payment Successful',
        message: `₹${amount} added successfully! Reference: ${utr}`,
        type: 'success',
        onClose: () => {
          setIsProcessingPayment(false);
        }
      });
    } catch (error) {
      console.error("Payment failed:", error);
      setPopup({
        isOpen: true,
        title: 'Verification Failed',
        message: error.message || 'Could not verify transaction. Please try again.',
        type: 'error',
        onClose: () => {
          setIsProcessingPayment(false);
        }
      });
    }
  };

  // 3. Render Logic

  // ADMIN PORTAL ROUTING
  if (isAdmin) {
    return <ProofVerification onLogout={() => { setIsAdmin(false); setAppView('login'); }} />;
  }

  // ADMIN LOGIN PAGE (Special Route)
  if (authView === 'admin_login') {
    return <AdminLogin onLogin={() => setIsAdmin(true)} />;
  }

  // LOADING STATE
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <div className="animate-in" style={{ fontWeight: 600, color: '#64748B' }}>Loading DoOrDue...</div>
      </div>
    );
  }

  // AUTH STACK
  if (!currentUser) {
    if (authView === 'signup') return <Signup onNavigate={setAuthView} />;
    // Check if user clicked "Admin Login" from Login page (we'll add a link)
    return <Login onNavigate={setAuthView} />;
  }

  // APP STACK
  const renderContent = () => {
    switch (appView) {
      case 'dashboard':
        return <Dashboard
          onCreate={handleCommit}
          onUploadProof={handleUploadClick}
          onDelete={handleDelete}
          history={tasks}
          balance={userProfile.balance}
          onShowPopup={(config) => setPopup({ isOpen: true, ...config })}
        />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'settings':
        return <Settings
          userProfile={userProfile}
          onProfileUpdate={(updates) => setUserProfile(prev => ({ ...prev, ...updates }))}
          onShowPopup={(config) => setPopup({ isOpen: true, ...config })}
        />;
      case 'analytics':
        return <Analytics history={tasks} />;
      case 'plans':
        return <Plans onShowPopup={(config) => setPopup({ isOpen: true, ...config })} />;
      case 'result_success':
        return <TaskResult result="success" task={currentTask || { stake: 0 }} onHome={() => setAppView('dashboard')} />;
      case 'result_fail':
        return <TaskResult result="failure" task={currentTask || { stake: 0 }} onHome={() => setAppView('dashboard')} />;
      case 'result_review':
        // New State for "Sent to Admin"
        return (
          <div className="animate-in" style={{ textAlign: 'center', padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ width: '80px', height: '80px', background: '#F0F9FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#0284C7' }}>
              <LoadingSpinner size="md" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--color-text-main))', marginBottom: '16px' }}>Under Review</h2>
            <p style={{ color: 'hsl(var(--color-text-secondary))', lineHeight: '1.6', marginBottom: '32px' }}>
              Great job! Your proof has been verified by our AI and sent to an admin for final approval. Your rewards will be credited once approved.
            </p>
            <button
              onClick={() => setAppView('dashboard')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '16px' }}
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return <Dashboard onCreate={handleCommit} onUploadProof={handleUploadClick} onDelete={handleDelete} history={tasks} balance={userProfile.balance} />;
    }
  };

  return (
    <>
      <Layout onNavigate={setAppView} balance={userProfile.balance} onAddFunds={handleAddFunds} userProfile={userProfile}>
        {renderContent()}
      </Layout>

      {showFundsModal && (
        <AddFundsModal
          onClose={() => setShowFundsModal(false)}
          onProceed={handlePaymentProceed}
          balance={userProfile.balance}
        />
      )}

      {verificationTask && (
        <UploadModal
          task={verificationTask}
          onClose={handleCloseModal}
          onUpload={handleVerify}
        />
      )}

      {/* Loading State for Proof Upload */}
      {isUploading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'hsl(var(--color-bg-card))',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <LoadingSpinner message="Uploading and verifying proof..." size="lg" />
          </div>
        </div>
      )}

      {/* Custom Popup */}
      <Popup
        isOpen={popup.isOpen}
        onClose={() => {
          // Call custom onClose if provided (for payment processing flag reset)
          if (popup.onClose) {
            popup.onClose();
          }
          setPopup({ ...popup, isOpen: false });
        }}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        confirmButton={popup.confirmButton}
        cancelButton={popup.cancelButton}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

