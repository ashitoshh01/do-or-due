import React, { useState } from 'react';
import { User, Camera, Save, Mail } from 'lucide-react';
import { defaultAvatars } from '../data/defaultAvatars';
import { updateUserProfile } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

const Settings = ({ userProfile, onProfileUpdate }) => {
    const { currentUser } = useAuth();
    const [name, setName] = useState(userProfile.name || '');
    const [selectedAvatar, setSelectedAvatar] = useState(userProfile.avatar || defaultAvatars[0]);
    const [customImage, setCustomImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImage(reader.result);
                setSelectedAvatar({ type: 'custom', value: reader.result, bg: '#E2E8F0' });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUserProfile(currentUser.uid, {
                name,
                avatar: selectedAvatar
            });
            alert('✅ Profile updated successfully!');
            if (onProfileUpdate) {
                onProfileUpdate({ name, avatar: selectedAvatar });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('❌ Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ paddingBottom: '40px', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>Settings</h1>
            <p style={{ color: 'hsl(var(--color-text-secondary))', marginBottom: '32px' }}>
                Manage your profile and account settings
            </p>

            {/* Profile Picture Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'hsl(var(--color-text-main))' }}>
                    Profile Picture
                </h2>

                {/* Current Avatar Preview */}
                <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: selectedAvatar.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        margin: '0 auto 16px',
                        boxShadow: 'var(--shadow-md)',
                        border: `3px solid hsl(var(--color-border))`
                    }}>
                        {selectedAvatar.type === 'emoji' ? selectedAvatar.value : <img src={selectedAvatar.value} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />}
                    </div>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--color-text-secondary))' }}>Current Avatar</p>
                </div>

                {/* Default Avatars Grid */}
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'hsl(var(--color-text-main))' }}>Choose from defaults</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        {defaultAvatars.map(avatar => (
                            <button
                                key={avatar.id}
                                onClick={() => setSelectedAvatar(avatar)}
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    backgroundColor: avatar.bg,
                                    border: selectedAvatar.id === avatar.id ? '3px solid hsl(var(--color-text-main))' : `2px solid hsl(var(--color-border))`,
                                    cursor: 'pointer',
                                    fontSize: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    transform: selectedAvatar.id === avatar.id ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                {avatar.value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Upload */}
                <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'hsl(var(--color-text-main))' }}>Or upload custom image</h3>
                    <label style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: 'hsl(var(--color-bg-input))',
                        border: `2px dashed hsl(var(--color-border))`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: 'hsl(var(--color-text-main))',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={(e) => e.target.style.borderColor = 'hsl(var(--color-text-secondary))'}
                        onMouseLeave={(e) => e.target.style.borderColor = 'hsl(var(--color-border))'}
                    >
                        <Camera size={18} />
                        Upload Image
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'hsl(var(--color-text-main))' }}>
                    Personal Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                            <User size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Display Name
                        </label>
                        <input
                            className="input-field"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'hsl(var(--color-text-main))' }}>
                            <Mail size={14} style={{ display: 'inline', marginRight: '6px' }} />
                            Email Address
                        </label>
                        <input
                            className="input-field"
                            type="email"
                            value={currentUser?.email || ''}
                            disabled
                            style={{ opacity: 0.6, cursor: 'not-allowed' }}
                        />
                        <p style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))', marginTop: '6px' }}>
                            Email cannot be changed
                        </p>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    opacity: saving ? 0.6 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer'
                }}
            >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
};

export default Settings;
