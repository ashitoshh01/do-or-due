import { X, Landmark, Lock, CheckCircle2 } from 'lucide-react';

const WithdrawModal = ({ onClose, userEmail, userName, currentBalance, userStats = {} }) => {
    const [amount, setAmount] = useState('');
    const [upiId, setUpiId] = useState('');

    const completedTasks = userStats.success || 0;
    const tasksRequired = 3;
    const isLocked = completedTasks < tasksRequired;

    // ESC key listener
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [onClose]);

    const handleWhatsAppRedirect = () => {
        if (!amount || parseInt(amount) < 100) {
            alert("Minimum withdrawal is ₹100");
            return;
        }
        if (parseInt(amount) > currentBalance) {
            alert("Insufficient balance!");
            return;
        }
        if (!upiId.trim() || !upiId.includes('@')) {
            alert("Please enter a valid UPI ID");
            return;
        }

        const message = `WITHDRAWAL REQUEST\n\nName: ${userName || 'User'}\nEmail: ${userEmail}\nAmount: ₹${amount}\n\nTransfer to UPI ID: ${upiId}\n\nPlease process this withdrawal.`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919518352166?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
            <div className="modal-content modal-sm animate-in" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'hsl(var(--color-text-main))', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Landmark size={24} color="hsl(var(--color-text-main))" /> Withdraw Funds
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="hsl(var(--color-text-secondary))" />
                    </button>
                </div>

                {isLocked ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', marginBottom: '16px' }}>
                            <Lock size={32} color="#EF4444" />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--color-text-main))', marginBottom: '8px' }}>Withdrawals Locked</h3>
                        <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))', lineHeight: '1.5', marginBottom: '24px' }}>
                            Prove your discipline first! You must complete at least <b>{tasksRequired} successful tasks</b> to unlock the bank.
                        </p>

                        <div style={{ background: 'hsl(var(--color-bg-input))', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--color-text-secondary))' }}>Progress</span>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: 'hsl(var(--color-text-main))' }}>{completedTasks} / {tasksRequired}</span>
                            </div>
                            <div style={{ height: '8px', background: 'hsl(var(--color-border))', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#F97316', width: `${Math.min((completedTasks / tasksRequired) * 100, 100)}%`, transition: 'width 0.3s' }}></div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px' }}
                            onClick={onClose}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', padding: '12px', background: 'rgba(249, 115, 22, 0.1)', borderRadius: '12px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                            <span style={{ color: '#C2410C', fontWeight: 600, fontSize: '14px' }}>Available Balance:</span>
                            <span style={{ color: '#9A3412', fontWeight: 800, fontSize: '14px' }}>₹{currentBalance}</span>
                        </div>

                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                            Withdrawal Amount (Min ₹100)
                        </label>
                        <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', padding: '14px 16px', marginBottom: '20px' }}>
                            <span style={{ fontWeight: 700, color: 'hsl(var(--color-text-secondary))' }}>₹</span>
                            <input
                                type="number"
                                autoFocus
                                min="100"
                                max={currentBalance}
                                placeholder="Enter amount"
                                style={{ border: 'none', outline: 'none', width: '100%', fontWeight: 700, fontSize: '18px', background: 'transparent', color: 'hsl(var(--color-text-main))' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                            Your UPI ID
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g., number@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            style={{ width: '100%', padding: '14px 16px', marginBottom: '24px', fontSize: '16px' }}
                        />

                        <div style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', marginBottom: '20px', lineHeight: '1.5', background: 'hsl(var(--color-bg-input))', padding: '10px', borderRadius: '8px' }}>
                            <strong>Note:</strong> Since payouts are handled manually to ensure security, it may take 1-6 hours to reflect in your account. Click below to submit your request to Admin.
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '15px', marginTop: '8px',
                                background: '#25D366', // WhatsApp Green
                                border: 'none',
                                opacity: (!amount || parseInt(amount) < 100 || !upiId.trim()) ? 0.6 : 1,
                                cursor: (!amount || parseInt(amount) < 100 || !upiId.trim()) ? 'not-allowed' : 'pointer'
                            }}
                            onClick={handleWhatsAppRedirect}
                            disabled={!amount || parseInt(amount) < 100 || !upiId.trim()}
                        >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" width="20" height="20" alt="WA" />
                            Send Request on WhatsApp
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WithdrawModal;
