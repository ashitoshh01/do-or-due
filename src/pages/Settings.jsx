import React, { useState } from 'react';
import { User, Save, Mail, Moon, Sun, Bell, Shield, Trash2, Camera, LogOut, Heart } from 'lucide-react';
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

    return (
        <div className="settings-container animate-in">
            <div className="settings-header">
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

            <div className="settings-grid">
                {/* Visual Profile Card */}
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

                {/* Preferences Section */}
                <div className="settings-column">
                    <div className="settings-card">
                        <div className="card-header">
                            <Bell size={20} className="card-icon" />
                            <h3>Preferences</h3>
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

                    {/* Default Charity Section */}
                    <div className="settings-card" style={{ marginTop: '24px' }}>
                        <div className="card-header">
                            <Heart size={20} className="card-icon" color="#EF4444" />
                            <h3>Default Charity</h3>
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

                    {/* Security & Danger Zone */}
                    <div className="settings-card">
                        <div className="card-header">
                            <Shield size={20} className="card-icon" />
                            <h3>Security</h3>
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
                </div>
            </div>
        </div>
    );
};

export default Settings;
