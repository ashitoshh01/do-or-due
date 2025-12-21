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
import Planner from './pages/Planner';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AddFundsModal from './components/AddFundsModal';

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
      alert("Insufficient DueCoins! Add funds first.");
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

    try {
      const result = await verifyProof(file, verificationTask.objective);

      setCurrentTask(verificationTask);

      if (result.verified) {
        setAppView('result_success');
        await completeTask(currentUser.uid, verificationTask.id, verificationTask.stake);
      } else {
        setAppView('result_fail');
        await failTask(currentUser.uid, verificationTask.id);
      }
    } catch (err) {
      console.error(err);
      alert("Verification Error: " + err.message);
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(currentUser.uid, taskId);
    }
  };

  const handleAddFunds = () => {
    setShowFundsModal(true);
  };

  const handlePaymentProceed = async (amount) => {
    setShowFundsModal(false);

    await initializePayment(amount, async (paymentId) => {
      try {
        await addFunds(currentUser.uid, amount);

        // Force local update for immediate feedback (prevents perceived lag)
        setUserProfile(prev => ({ ...prev, balance: (prev.balance || 0) + amount }));

        alert(`Payment Successful! ID: ${paymentId}. ${amount} DueCoins added.`);
      } catch (error) {
        console.error("Payment sync failed:", error);
        alert("Payment processed but balance update failed. Please refresh.");
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
        return <Dashboard onCreate={handleCommit} onUploadProof={handleUploadClick} onDelete={handleDelete} history={tasks} balance={userProfile.balance} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'planner':
        return <Planner stats={userProfile.stats} history={tasks} balance={userProfile.balance} />;
      case 'settings':
        return <Settings userProfile={userProfile} onProfileUpdate={(updates) => setUserProfile(prev => ({ ...prev, ...updates }))} />;
      case 'analytics':
        return <Analytics history={tasks} />;
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

