import React, { useEffect, useState } from 'react';
import { Crown, Trophy, Medal, Flame, Globe2, Users, Plus, ChevronLeft } from 'lucide-react';
import { subscribeToLeaderboard, subscribeToUserGroups, subscribeToGroupMembers } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import GroupModal from '../components/GroupModal';
import Popup from '../components/Popup';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [squads, setSquads] = useState([]);
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'squads'
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });

    // State for viewing a specific squad's sub-leaderboard
    const [selectedSquad, setSelectedSquad] = useState(null);
    const [squadMembers, setSquadMembers] = useState([]);
    const [squadName, setSquadName] = useState('');
    const [loadingSquad, setLoadingSquad] = useState(false);

    useEffect(() => {
        const unsub = subscribeToLeaderboard((data) => {
            setUsers(data);
            setLoading(false);
        });

        const unsubGroups = subscribeToUserGroups(currentUser?.uid, (groupsData) => {
            setSquads(groupsData);
        });

        return () => {
            unsub();
            unsubGroups();
        };
    }, [currentUser]);

    useEffect(() => {
        let unsubSquad = () => { };
        if (selectedSquad) {
            setLoadingSquad(true);
            unsubSquad = subscribeToGroupMembers(selectedSquad, ({ groupName, users }) => {
                setSquadName(groupName);
                setSquadMembers(users);
                setLoadingSquad(false);
            });
        }
        return () => unsubSquad();
    }, [selectedSquad]);

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    // If a squad is selected, show Sub-Leaderboard
    if (selectedSquad) {
        const sTop3 = squadMembers.slice(0, 3);
        const sRest = squadMembers.slice(3);

        return (
            <div className="leaderboard-container no-scrollbar animate-in">
                <div className="leaderboard-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button
                        onClick={() => setSelectedSquad(null)}
                        style={{
                            background: 'hsl(var(--color-bg-input))',
                            border: '1px solid hsl(var(--color-border))',
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'hsl(var(--color-text-main))'
                        }}
                        className="hover-scale"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--color-text-main))', margin: 0 }}>{squadName}</h1>
                        <p style={{ color: 'hsl(var(--color-text-secondary))', margin: 0 }}>Squad Leaderboard</p>
                    </div>
                </div>

                {loadingSquad ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading squad...</div>
                ) : (
                    <>
                        {sTop3.length > 0 && (
                            <div className="podium-grid">
                                {sTop3.length >= 2 && <PodiumCard user={sTop3[1]} rank={2} isCurrentUser={sTop3[1].id === currentUser?.uid} />}
                                {sTop3.length >= 1 && <PodiumCard user={sTop3[0]} rank={1} isCurrentUser={sTop3[0].id === currentUser?.uid} />}
                                {sTop3.length >= 3 && <PodiumCard user={sTop3[2]} rank={3} isCurrentUser={sTop3[2].id === currentUser?.uid} />}
                            </div>
                        )}

                        <div className="leaderboard-list">
                            {sRest.map((u, index) => (
                                <LeaderboardRow
                                    key={u.id}
                                    user={u}
                                    rank={index + 4}
                                    isCurrentUser={u.id === currentUser?.uid}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="leaderboard-container no-scrollbar">
            <div className="leaderboard-header">
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--color-text-main))', marginBottom: '8px' }}>Leaderboard</h1>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    backgroundColor: 'hsl(var(--color-bg-input))',
                    borderRadius: '16px',
                    padding: '6px',
                    marginTop: '16px',
                    marginBottom: '8px',
                    border: '1px solid hsl(var(--color-border))'
                }}>
                    <button
                        onClick={() => setActiveTab('global')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'global' ? 'hsl(var(--color-bg-card))' : 'transparent',
                            color: activeTab === 'global' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))',
                            boxShadow: activeTab === 'global' ? 'var(--shadow-sm)' : 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Globe2 size={18} /> Global
                    </button>
                    <button
                        onClick={() => setActiveTab('squads')}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'squads' ? 'hsl(var(--color-bg-card))' : 'transparent',
                            color: activeTab === 'squads' ? 'hsl(var(--color-text-main))' : 'hsl(var(--color-text-secondary))',
                            boxShadow: activeTab === 'squads' ? 'var(--shadow-sm)' : 'none',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <Users size={18} /> My Squads
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : activeTab === 'global' ? (
                <>
                    {/* Podium Section */}
                    {top3.length > 0 && (
                        <div className="podium-grid">
                            {/* Re-order for visual pyramid: 2, 1, 3 */}
                            {top3.length >= 2 && <PodiumCard user={top3[1]} rank={2} isCurrentUser={top3[1].id === currentUser?.uid} />}
                            {top3.length >= 1 && <PodiumCard user={top3[0]} rank={1} isCurrentUser={top3[0].id === currentUser?.uid} />}
                            {top3.length >= 3 && <PodiumCard user={top3[2]} rank={3} isCurrentUser={top3[2].id === currentUser?.uid} />}

                            {/* Handle edge case if fewer than 3 users but more than 0? 
                                The logic above safely renders 1, 2, or 3 based on length.
                            */}
                        </div>
                    )}

                    {/* List Section */}
                    <div className="leaderboard-list">
                        {rest.map((user, index) => (
                            <LeaderboardRow
                                key={user.id}
                                user={user}
                                rank={index + 4}
                                isCurrentUser={user.id === currentUser?.uid}
                            />
                        ))}
                    </div>

                    {users.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--color-text-secondary))' }}>
                            <Trophy size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p>No active users yet. Be the first to join the race!</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="squads-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>

                    {/* Squad List */}
                    {squads.length > 0 ? (
                        squads.map(squad => (
                            <div key={squad.id} onClick={() => setSelectedSquad(squad.id)} className="card hover-scale" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '12px',
                                        background: 'rgba(249, 115, 22, 0.1)', color: '#F97316',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: 'hsl(var(--color-text-main))' }}>
                                            {squad.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--color-text-secondary))' }}>
                                            Invite Code: <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))', letterSpacing: '1px' }}>{squad.inviteCode}</span> • {(squad.members || []).length} Members
                                        </p>
                                    </div>
                                </div>
                                <div style={{ color: 'hsl(var(--color-text-secondary))' }}>
                                    <Globe2 size={20} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--color-text-secondary))' }}>
                            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                            <p>You haven't joined any squads yet. Team up and climb the ranks together!</p>
                        </div>
                    )}

                    {/* Render a beautiful "+ Create or Join Group" card */}
                    <button
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '2px dashed #F97316',
                            background: 'rgba(249, 115, 22, 0.05)',
                            color: '#F97316',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontWeight: 700,
                            fontSize: '16px',
                            boxShadow: '0 4px 14px 0 rgba(249, 115, 22, 0.15)'
                        }}
                        className="hover-scale"
                        onClick={() => setShowGroupModal(true)}
                    >
                        <Plus size={24} /> Create or Join Group
                    </button>
                </div>
            )}

            {showGroupModal && (
                <GroupModal
                    onClose={() => setShowGroupModal(false)}
                    onShowPopup={(config) => setPopup({ isOpen: true, ...config })}
                />
            )}

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

const PodiumCard = ({ user, rank, isCurrentUser }) => {
    return (
        <div className={`podium-card rank-${rank} ${isCurrentUser ? 'is-current-user-podium' : ''}`}>
            {rank === 1 && (
                <div className="podium-crown">
                    <Crown size={32} fill="#F59E0B" />
                </div>
            )}

            <div className="podium-avatar-container">
                <div className="podium-avatar">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="podium-rank-badge">
                    #{rank}
                </div>
            </div>

            <div className="podium-name">
                {user.name || user.email.split('@')[0]}
                {isCurrentUser && <span className="you-tag" style={{ marginLeft: '6px' }}>YOU</span>}
            </div>

            <div className="podium-xp">
                {user.xp || 0} XP
            </div>
        </div>
    );
};

const LeaderboardRow = ({ user, rank, isCurrentUser }) => {
    return (
        <div className={`leaderboard-row ${isCurrentUser ? 'is-current-user' : ''}`} style={{ animationDelay: `${(rank - 3) * 0.05}s` }}>
            <div className="row-rank">
                {rank}
            </div>

            <div className="row-avatar">
                {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="row-info" style={{ minWidth: 0 }}>
                <div className="row-name">
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.name || user.email.split('@')[0]}
                    </span>
                    {isCurrentUser && <span className="you-tag" style={{ flexShrink: 0 }}>YOU</span>}
                </div>
                <div className="row-streak">
                    <Flame size={12} fill="currentColor" className="text-orange-500" />
                    {user.streak || 0} day streak
                </div>
            </div>

            <div className="row-xp">
                {user.xp || 0} XP
            </div>
        </div>
    );
};

export default Leaderboard;
