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

import { subscribeToTasks, subscribeToUser, addTask, deleteTask, updateTaskStatus, updateUserBalance, completeTask, addFunds, failTask } from './services/dbService';
import { verifyProof } from './services/aiService';
import { initializePayment } from './services/paymentService';

function MainApp() {
  const { currentUser, loading } = useAuth();

  // State
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'
  const [appView, setAppView] = useState('dashboard'); // 'dashboard', 'leaderboard', etc.

  const [tasks, setTasks] = useState([]);
  const [userProfile, setUserProfile] = useState({ balance: 0 });
  const [verificationTask, setVerificationTask] = useState(null);
  const [currentTask, setCurrentTask] = useState(null);
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Flag to prevent double credit

  // 1. Data Subscriptions (Only run if logged in)
  useEffect(() => {
    if (!currentUser) return;

    // Reset app view to dashboard on fresh login
    setAppView('dashboard');

    const unsubUser = subscribeToUser(currentUser.uid, (data) => setUserProfile(prev => ({ ...prev, ...data })));
    const unsubTasks = subscribeToTasks(currentUser.uid, (data) => setTasks(data));

    return () => {
      unsubUser();
      unsubTasks();
    }
  }, [currentUser]);

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
        setAppView('result_success');
        await completeTask(currentUser.uid, verificationTask.id, verificationTask.stake);
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

  const handlePaymentProceed = async (amount) => {
    setShowFundsModal(false);

    // Set processing flag to prevent duplicate credits
    if (isProcessingPayment) {
      console.warn('Payment already processing, ignoring duplicate call');
      return;
    }
    setIsProcessingPayment(true);

    await initializePayment(amount, async (paymentId) => {
      try {
        // Add funds to database - this should only run ONCE
        await addFunds(currentUser.uid, amount);

        // Force local update for immediate feedback (prevents perceived lag)
        setUserProfile(prev => ({ ...prev, balance: (prev.balance || 0) + amount }));

        setPopup({
          isOpen: true,
          title: 'Payment Successful',
          message: `${amount} DueCoins have been added to your account. Payment ID: ${paymentId}`,
          type: 'success',
          onClose: () => {
            // Reset processing flag only when popup is closed
            setIsProcessingPayment(false);
          }
        });
      } catch (error) {
        console.error("Payment sync failed:", error);
        setPopup({
          isOpen: true,
          title: 'Sync Error',
          message: 'Payment processed but balance update failed. Please refresh the page.',
          type: 'warning',
          onClose: () => {
            setIsProcessingPayment(false);
          }
        });
      }
    }, currentUser.email);
  };

  // 3. Render Logic



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

