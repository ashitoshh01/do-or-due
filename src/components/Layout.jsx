import React, { useState, useRef, useEffect } from 'react';
import { Shield, Coins, Moon, Sun, ChevronDown, Trophy, Calendar, Settings, LogOut, BarChart3, Zap, Home, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { defaultAvatars } from '../data/defaultAvatars';
import { requestNotificationPermission } from '../services/dbService';

const Layout = ({ children, onNavigate, balance, onAddFunds, onWithdrawFunds, userProfile = {} }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMore, setShowMobileMore] = useState(false);
    const [iconRotating, setIconRotating] = useState(false);
    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const dropdownRef = useRef(null);
    const mobileMoreRef = useRef(null);

    // Click outside detection for dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
            if (mobileMoreRef.current && !mobileMoreRef.current.contains(event.target)) {
                setShowMobileMore(false);
            }
        };

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                setShowUserMenu(false);
                setShowMobileMore(false);
            }
        };

        if (showUserMenu || showMobileMore) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showUserMenu, showMobileMore]);

    // Request permissions for Zomato-style behavioral nudges
    useEffect(() => {
        if (userProfile && userProfile.email && !userProfile.fcmToken) {
            // Wait 2 seconds so it isn't an immediate jump-scare on load
            const timer = setTimeout(() => {
                if ('Notification' in window && Notification.permission !== 'denied') {
                    // This asks the browser silently, only opens popup if they haven't explicitly blocked it
                    requestNotificationPermission(userProfile.id || userProfile.uid || currentUser?.uid);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [userProfile]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
            alert("Failed to log out");
        }
    };

    const handleToggleTheme = () => {
        setIconRotating(true);
        toggleTheme();
        setTimeout(() => setIconRotating(false), 400);
    };

    const handleNavAndClose = (page) => {
        onNavigate(page);
    };

    return (
        <div style={{ paddingBottom: '80px' }}> {/* Increased padding for bottom nav */}

            {/* --- DESKTOP / TABLET HEADER --- */}
            <div className="hidden-mobile" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <header style={{
                    width: '90%',
                    maxWidth: '1000px',
                    height: '64px',
                    backgroundColor: 'hsl(var(--color-bg-card))',
                    borderRadius: 'var(--radius-pill)',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    zIndex: 50,
                    position: 'relative',
                    border: `1px solid hsl(var(--color - border))`
                }}>
                    {/* Logo Area */}
                    <button onClick={() => onNavigate('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Shield fill="hsl(var(--color-text-main))" size={20} color="hsl(var(--color-text-main))" />
                        <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', color: 'hsl(var(--color-text-main))' }}>DoOrDue</span>
                    </button>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            className="icon-btn"
                            onClick={handleToggleTheme}
                            style={{
                                borderRadius: '50%',
                                padding: '8px',
                                cursor: 'pointer',
                                background: 'hsl(var(--color-bg-input))',
                                border: '1px solid hsl(var(--color-border))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div className={`theme - toggle - icon ${iconRotating ? 'rotating' : ''} `}>
                                {isDark ? <Sun size={18} color="hsl(var(--color-text-main))" /> : <Moon size={18} color="hsl(var(--color-text-main))" />}
                            </div>
                        </button>

                        {/* Streak Pill */}
                        <div style={{
                            backgroundColor: isDark ? 'hsl(var(--color-bg-input))' : '#FFF7ED',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-pill)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'hsl(var(--color-text-main))'
                        }}>
                            <Flame size={14} color="#F97316" fill="#F97316" />
                            {userProfile.streak || 0}
                        </div>

                        {/* Coins Pill */}
                        <div style={{
                            backgroundColor: isDark ? 'hsl(var(--color-bg-input))' : '#F1F5F9',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-pill)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'hsl(var(--color-text-main))'
                        }}>
                            <Coins size={14} color="hsl(var(--color-accent-gold))" fill="hsl(var(--color-accent-gold))" />
                            {balance}
                            <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                                <button
                                    onClick={onWithdrawFunds}
                                    style={{
                                        background: isDark ? 'hsl(var(--color-border))' : '#FEE2E2',
                                        border: '1px solid #FECACA',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        color: '#EF4444',
                                        padding: 0
                                    }}
                                    title="Withdraw Funds"
                                >
                                    -
                                </button>
                                <button
                                    onClick={onAddFunds}
                                    style={{
                                        background: isDark ? 'hsl(var(--color-border))' : '#DCFCE7',
                                        border: '1px solid #BBF7D0',
                                        borderRadius: '50%',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        color: '#16A34A',
                                        padding: 0
                                    }}
                                    title="Add Funds"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Avatar & Dropdown */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    backgroundColor: 'hsl(var(--color-bg-input))',
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontWeight: 600, fontSize: '13px',
                                    color: 'hsl(var(--color-text-main))',
                                    overflow: 'hidden',
                                    border: `1px solid hsl(var(--color - border))`
                                }}>
                                    {userProfile.avatar?.value ? (
                                        <img src={userProfile.avatar.value} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        (userProfile.name || userProfile.email || 'U').charAt(0).toUpperCase()
                                    )}
                                </div>
                                <ChevronDown size={14} color="hsl(var(--color-text-secondary))" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="animate-in" style={{
                                    position: 'absolute',
                                    top: '48px',
                                    right: 0,
                                    width: '220px',
                                    backgroundColor: 'hsl(var(--color-bg-card))',
                                    borderRadius: '16px',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: `1px solid hsl(var(--color - border - light))`,
                                    padding: '8px',
                                    zIndex: 100
                                }}>
                                    <div style={{ padding: '8px 12px', borderBottom: `1px solid hsl(var(--color - border - light))`, marginBottom: '4px' }}>
                                        <p style={{ fontWeight: 600, fontSize: '14px', color: 'hsl(var(--color-text-main))' }}>
                                            {userProfile.name || userProfile.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p style={{ fontSize: '12px', color: 'hsl(var(--color-text-secondary))' }}>
                                            {userProfile.plan ? userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1) + ' Member' : 'Member'}
                                        </p>
                                    </div>

                                    <DropdownItem onClick={() => { onNavigate('dashboard'); setShowUserMenu(false); }} icon={<Shield size={16} />} label="Dashboard" />
                                    <DropdownItem onClick={() => { onNavigate('leaderboard'); setShowUserMenu(false); }} icon={<Trophy size={16} />} label="Leaderboard" />
                                    <DropdownItem onClick={() => { onNavigate('analytics'); setShowUserMenu(false); }} icon={<BarChart3 size={16} />} label="Analytics" />
                                    <DropdownItem onClick={() => { onNavigate('plans'); setShowUserMenu(false); }} icon={<Zap size={16} />} label="Plans" />
                                    <DropdownItem onClick={() => { onNavigate('settings'); setShowUserMenu(false); }} icon={<Settings size={16} />} label="Settings" />

                                    <div style={{ borderTop: `1px solid hsl(var(--color - border - light))`, margin: '4px 0' }} />

                                    <button onClick={handleLogout} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        width: '100%', padding: '10px 12px', borderRadius: '8px',
                                        border: 'none', background: 'transparent', cursor: 'pointer',
                                        fontSize: '14px', color: '#EF4444', fontWeight: 500, textAlign: 'left'
                                    }}>
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
            </div>

            {/* --- MOBILE HEADER --- */}
            <div className="visible-mobile" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', backgroundColor: 'hsl(var(--color-bg-card))', position: 'sticky', top: 0, zIndex: 40, borderBottom: `1px solid hsl(var(--color - border - light))` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Hamburger Button Removed */}
                    <button onClick={() => onNavigate('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none' }}>
                        <Shield fill="hsl(var(--color-text-main))" size={20} color="hsl(var(--color-text-main))" />
                        <span style={{ fontWeight: 800, fontSize: '18px', color: 'hsl(var(--color-text-main))' }}>DoOrDue</span>
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={() => {
                            toggleTheme();
                            setIconRotating(true);
                            setTimeout(() => setIconRotating(false), 500);
                        }}
                        style={{
                            background: 'hsl(var(--color-bg-input))',
                            border: 'none',
                            borderRadius: '8px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.5s',
                            transform: iconRotating ? 'rotate(360deg)' : 'rotate(0deg)'
                        }}
                    >
                        {isDark ? <Sun size={16} color="hsl(var(--color-text-main))" /> : <Moon size={16} color="hsl(var(--color-text-main))" />}
                    </button>

                    <div style={{
                        backgroundColor: isDark ? 'hsl(var(--color-bg-input))' : '#FFF7ED',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'hsl(var(--color-text-main))'
                    }}>
                        <Flame size={12} color="#F97316" fill="#F97316" />
                        {userProfile.streak || 0}
                    </div>

                    <div style={{
                        backgroundColor: isDark ? 'hsl(var(--color-bg-input))' : '#F1F5F9',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'hsl(var(--color-text-main))'
                    }}>
                        <Coins size={12} fill="hsl(var(--color-accent-gold))" color="hsl(var(--color-accent-gold))" />
                        {balance}
                        <div style={{ display: 'flex', gap: '4px', marginLeft: '4px' }}>
                            <button
                                onClick={onWithdrawFunds}
                                style={{
                                    background: isDark ? 'hsl(var(--color-border))' : '#FEE2E2',
                                    border: '1px solid #FECACA',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    color: '#EF4444',
                                    padding: 0
                                }}
                                title="Withdraw Funds"
                            >
                                -
                            </button>
                            <button
                                onClick={onAddFunds}
                                style={{
                                    background: isDark ? 'hsl(var(--color-border))' : '#DCFCE7',
                                    border: '1px solid #BBF7D0',
                                    borderRadius: '50%',
                                    width: '16px',
                                    height: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    color: '#16A34A',
                                    padding: 0
                                }}
                                title="Add Funds"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MOBILE MENU SIDE DRAWER REMOVED --- */}


            {/* Main Content Container */}
            <main className="container animate-in">
                {children}
            </main>

            {/* --- MOBILE BOTTOM NAVIGATION --- */}
            <div className="visible-mobile" style={{
                position: 'fixed', bottom: 0, left: 0, width: '100%', height: '64px',
                backgroundColor: 'hsl(var(--color-bg-card))',
                borderTop: `1px solid hsl(var(--color - border - light))`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 1000
            }}>
                <button onClick={() => onNavigate('dashboard')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'hsl(var(--color-text-secondary))' }}>
                    <Shield size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Home</span>
                </button>
                <button onClick={() => onNavigate('leaderboard')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'hsl(var(--color-text-secondary))' }}>
                    <Trophy size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Ranks</span>
                </button>
                <button onClick={() => onNavigate('analytics')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'hsl(var(--color-text-secondary))' }}>
                    <BarChart3 size={20} />
                    <span style={{ fontSize: '10px', fontWeight: 600 }}>Stats</span>
                </button>
                {/* Kept "More" for quick access to plans/settings if user prefers bottom nav */}
                <div ref={mobileMoreRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowMobileMore(!showMobileMore)}
                        style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: 'hsl(var(--color-text-secondary))' }}
                    >
                        <div style={{ display: 'flex', gap: '2px', paddingTop: '2px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>More</span>
                    </button>

                    {/* Dropdown Menu */}
                    {showMobileMore && (
                        <div
                            className="animate-in"
                            style={{
                                position: 'absolute',
                                bottom: '70px',
                                right: 0,
                                background: 'hsl(var(--color-bg-card))',
                                border: `1px solid hsl(var(--color - border - light))`,
                                borderRadius: '12px',
                                boxShadow: 'var(--shadow-xl)',
                                minWidth: '180px',
                                padding: '8px',
                                zIndex: 10001
                            }}
                        >
                            <button
                                onClick={() => { onNavigate('settings'); setShowMobileMore(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'hsl(var(--color-text-main))',
                                    textAlign: 'left',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <Settings size={16} /> Settings
                            </button>
                            <button
                                onClick={() => { onNavigate('plans'); setShowMobileMore(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: 'hsl(var(--color-text-main))',
                                    textAlign: 'left',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <Zap size={16} /> Plans
                            </button>
                            <div style={{ height: '1px', background: 'hsl(var(--color-border-light))', margin: '4px 0' }} />
                            <button
                                onClick={() => { handleLogout(); setShowMobileMore(false); }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#EF4444',
                                    textAlign: 'left',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

const DropdownItem = ({ icon, label, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isHovered ? 'hsl(var(--color-bg-input))' : 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'hsl(var(--color-text-main))',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'background 0.2s'
            }}
        >
            {icon} {label}
        </button>
    );
};

export default Layout;
