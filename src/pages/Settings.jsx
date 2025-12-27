import React, { useState } from 'react';
import { User, Save, Mail, Moon, Sun, Bell, Shield, Trash2, Camera, LogOut, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { updateUserProfile } from '../services/dbService';
import AvatarWithEdit from '../components/AvatarWithEdit';
import { CHARITIES } from '../constants/charities';

const Settings = ({ userProfile, onProfileUpdate, onShowPopup }) => {
    const { currentUser, logout, updateUserPassword, deleteUserAccount } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    const [name, setName] = useState(userProfile.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar || null);
    const [saving, setSaving] = useState(false);

    // Password State
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Mock States for toggles
    const [notifications, setNotifications] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);

    const handleAvatarChange = async (newAvatar) => {
        setSelectedAvatar(newAvatar);
        try {
            await updateUserProfile(currentUser.uid, { avatar: newAvatar });
            if (onProfileUpdate) onProfileUpdate({ ...userProfile, avatar: newAvatar });
        } catch (error) {
            console.error('Error updating avatar:', error);
            onShowPopup?.({ title: 'Error', message: 'Failed to update avatar', type: 'error' });
        }
    };

    const handleDefaultCharityChange = async (charityId) => {
        try {
            await updateUserProfile(currentUser.uid, { defaultCharity: charityId });
            if (onProfileUpdate) onProfileUpdate({ ...userProfile, defaultCharity: charityId });
            onShowPopup?.({ title: 'Success', message: 'Default charity preference updated.', type: 'success' });
        } catch (error) {
            console.error('Error updating default charity:', error);
            onShowPopup?.({ title: 'Error', message: 'Failed to update preference', type: 'error' });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile(currentUser.uid, { name });
            if (onProfileUpdate) onProfileUpdate({ ...userProfile, name });
            onShowPopup?.({ title: 'Saved', message: 'Profile updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error updating profile:', error);
            onShowPopup?.({ title: 'Error', message: 'Failed to update profile', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            onShowPopup?.({ title: 'Weak Password', message: 'Password must be at least 6 characters.', type: 'warning' });
            return;
        }
        if (newPassword !== confirmPassword) {
            onShowPopup?.({ title: 'Mismatch', message: 'Passwords do not match.', type: 'warning' });
            return;
        }

        setPasswordLoading(true);
        try {
            await updateUserPassword(newPassword);
            onShowPopup?.({ title: 'Success', message: 'Password updated successfully!', type: 'success' });
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordExpanded(false);
        } catch (error) {
            console.error("Password update error", error);
            const msg = error.code === 'auth/requires-recent-login'
                ? 'Security Check: Please log out and log in again to change your password.'
                : (error.message || 'Failed to update password.');
            onShowPopup?.({ title: 'Update Failed', message: msg, type: 'error' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        onShowPopup?.({
            title: 'Delete Account?',
            message: 'This will permanently delete your account and all data. This action cannot be undone.',
            type: 'warning',
            confirmButton: {
                label: 'Delete Forever',
                onClick: async () => {
                    try {
                        await deleteUserAccount();
                        // Auth listener will handle redirect
                    } catch (error) {
                        console.error("Delete account error", error);
                        const msg = error.code === 'auth/requires-recent-login'
                            ? 'Security Check: Please log out and log in again to delete your account.'
                            : (error.message || 'Failed to delete account.');
                        onShowPopup?.({ title: 'Delete Failed', message: msg, type: 'error' });
                    }
                }
            },
            cancelButton: {
                label: 'Cancel',
                onClick: () => { } // Popup handles close
            }
        });
    };

    const [activeTab, setActiveTab] = useState('profile');
    const [mobileShowContent, setMobileShowContent] = useState(false);

    // Animation variants
    const contentVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    const handleTabClick = (id) => {
        setActiveTab(id);
        setMobileShowContent(true);
    };

    const handleBackToMenu = () => {
        setMobileShowContent(false);
    };

    const renderContent = () => {
        // Content wrapper with back button for mobile
        const ContentWrapper = ({ children, title }) => (
            <div className="content-wrapper">
                <div className="mobile-header">
                    <button onClick={handleBackToMenu} className="back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>{title}</h2>
                </div>
                {children}
            </div>
        );

        let content = null;
        let title = '';

        switch (activeTab) {
            case 'profile':
                title = 'Profile';
                content = (
                    <div className="settings-card profile-card">
                        <div className="profile-cover"></div>
                        <div className="profile-content">
                            <div className="profile-avatar-wrapper">
                                <AvatarWithEdit
                                    currentAvatar={selectedAvatar}
                                    onAvatarChange={handleAvatarChange}
                                    size={100}
                                    editable={true}
                                />
                            </div>
                            <div className="profile-fields">
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <div className="input-wrapper">
                                        <User size={16} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper disabled">
                                        <Mail size={16} />
                                        <input
                                            type="email"
                                            value={currentUser?.email || ''}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <button
                                    className="btn btn-primary save-btn"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <><div className="spinner-sm"></div> Saving...</> : <><Save size={16} /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    </div>
                );
                break;
            case 'preferences':
                title = 'Preferences';
                content = (
                    <div className="settings-card">
                        <div className="card-header">
                            <Bell size={20} className="card-icon" />
                            <h3>{title}</h3>
                        </div>
                        <div className="card-body">
                            <div className="setting-row">
                                <div className="setting-info">
                                    <span className="setting-label">Dark Mode</span>
                                    <span className="setting-desc">Switch between light and dark themes</span>
                                </div>
                                <button className={`toggle-btn ${isDark ? 'active' : ''}`} onClick={toggleTheme}>
                                    <div className="toggle-handle">
                                        {isDark ? <Moon size={12} /> : <Sun size={12} />}
                                    </div>
                                </button>
                            </div>
                            <div className="divider"></div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <span className="setting-label">Notifications</span>
                                    <span className="setting-desc">Receive updates about your tasks</span>
                                </div>
                                <button
                                    className={`toggle-btn ${notifications ? 'active' : ''}`}
                                    onClick={() => setNotifications(!notifications)}
                                >
                                    <div className="toggle-handle"></div>
                                </button>
                            </div>
                            <div className="divider"></div>
                            <div className="setting-row">
                                <div className="setting-info">
                                    <span className="setting-label">Email Updates</span>
                                    <span className="setting-desc">Get occasional product emails</span>
                                </div>
                                <button
                                    className={`toggle-btn ${emailUpdates ? 'active' : ''}`}
                                    onClick={() => setEmailUpdates(!emailUpdates)}
                                >
                                    <div className="toggle-handle"></div>
                                </button>
                            </div>
                        </div>
                    </div>
                );
                break;
            case 'charity':
                title = 'Default Charity';
                content = (
                    <div className="settings-card">
                        <div className="card-header">
                            <Heart size={20} className="card-icon" color="#EF4444" />
                            <h3>{title}</h3>
                        </div>
                        <div className="card-body">
                            <p style={{ fontSize: '14px', color: 'hsl(var(--color-text-secondary))', marginBottom: '16px' }}>
                                Select a charity to automatically donate your stake to when a task fails.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button
                                    onClick={() => handleDefaultCharityChange(null)}
                                    style={{
                                        textAlign: 'left', padding: '10px', borderRadius: '8px',
                                        border: `1px solid ${!userProfile.defaultCharity ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
                                        background: !userProfile.defaultCharity ? 'rgba(var(--color-primary), 0.05)' : 'hsl(var(--color-bg-input))',
                                        cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-text-main))'
                                    }}
                                >
                                    No Default (Ask me every time)
                                </button>
                                {CHARITIES.map(charity => (
                                    <button
                                        key={charity.id}
                                        onClick={() => handleDefaultCharityChange(charity.id)}
                                        style={{
                                            textAlign: 'left', padding: '10px', borderRadius: '8px',
                                            border: `1px solid ${userProfile.defaultCharity === charity.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
                                            background: userProfile.defaultCharity === charity.id ? 'rgba(var(--color-primary), 0.05)' : 'hsl(var(--color-bg-input))',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>{charity.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
                break;
            case 'security':
                title = 'Security';
                content = (
                    <div className="settings-card">
                        <div className="card-header">
                            <Shield size={20} className="card-icon" />
                            <h3>{title}</h3>
                        </div>
                        <div className="card-body">
                            <button
                                className="btn btn-outline full-width"
                                style={{ marginBottom: '16px' }}
                                onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                            >
                                {isPasswordExpanded ? 'Cancel Change Password' : 'Change Password'}
                            </button>

                            {isPasswordExpanded && (
                                <div className="animate-in" style={{ marginBottom: '24px', background: 'hsl(var(--color-bg-input))', padding: '16px', borderRadius: '8px' }}>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input
                                            type="password"
                                            className="input-field"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Re-enter password"
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary full-width"
                                        onClick={handleChangePassword}
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            )}

                            <div className="danger-zone">
                                <h4 className="danger-title">Danger Zone</h4>
                                <p className="danger-desc">Once you delete your account, there is no going back. Please be certain.</p>
                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteAccount}
                                >
                                    <Trash2 size={16} />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                );
                break;
            default:
                content = null;
        }

        return (
            <ContentWrapper title={title}>
                <div key={activeTab} className="animate-in">
                    {content}
                </div>
            </ContentWrapper>
        );
    };

    const TabButton = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => handleTabClick(id)}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                width: '100%', padding: '12px 16px',
                background: activeTab === id
                    ? (isDark ? 'rgba(255,255,255,0.1)' : 'hsl(var(--color-bg-card))') // Dark mode visibility fix
                    : 'transparent',
                border: 'none', borderRadius: '12px',
                color: activeTab === id
                    ? (isDark ? '#F8FAFC' : 'hsl(var(--color-primary))') // Dark mode text visibility fix
                    : 'hsl(var(--color-text-secondary))',
                fontWeight: activeTab === id ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s',
                marginBottom: '4px',
                boxShadow: activeTab === id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="settings-container">
            {/* Header - Only visible on Desktop or when in Menu view on Mobile */}
            <div className={`settings-header ${mobileShowContent ? 'mobile-hidden' : ''}`}>
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account and preferences</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={handleLogout}
                    style={{ color: 'hsl(var(--color-accent-red))', borderColor: 'rgba(var(--color-accent-red), 0.2)' }}
                >
                    <LogOut size={16} />
                    Log Out
                </button>
            </div>

            <div className="settings-layout">
                {/* Sidebar Navigation */}
                <div className={`settings-sidebar ${mobileShowContent ? 'mobile-hidden' : ''}`}>
                    <div className="sidebar-menu">
                        <TabButton id="profile" icon={User} label="Profile" />
                        <TabButton id="preferences" icon={Bell} label="Preferences" />
                        <TabButton id="charity" icon={Heart} label="Charity" />
                        <TabButton id="security" icon={Shield} label="Security" />
                    </div>
                </div>

                {/* Content Area */}
                <div className={`settings-content ${!mobileShowContent ? 'mobile-hidden' : 'mobile-visible'}`}>
                    {renderContent()}
                </div>
            </div>

            <style>{`
                .settings-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 32px;
                    margin-top: 24px;
                }
                .sidebar-menu {
                    background: hsl(var(--color-bg-subtle));
                    padding: 16px;
                    border-radius: 16px;
                }
                .mobile-header {
                    display: none;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .mobile-header h2 {
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0;
                    color: hsl(var(--color-text-main));
                }
                .back-btn {
                    background: hsl(var(--color-bg-input));
                    border: none;
                    width: 40px; 
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: hsl(var(--color-text-main));
                    cursor: pointer;
                }
                .back-btn:hover {
                    background: hsl(var(--color-border));
                }
                .animate-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .settings-container {
                        display: flex;
                        flex-direction: column;
                        min-height: calc(100vh - 160px);
                        justify-content: center;
                        padding-top: 20px;
                        padding-bottom: 100px;
                    }
                    .settings-layout {
                        display: block;
                    }
                    .mobile-hidden {
                        display: none;
                    }
                    .mobile-visible {
                        display: block;
                    }
                    .mobile-header {
                        display: flex;
                    }
                    /* Ensure content takes proper width */
                    .settings-column {
                        width: 100%;
                    }
                    .sidebar-menu {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Settings;
