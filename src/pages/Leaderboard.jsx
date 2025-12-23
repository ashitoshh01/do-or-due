import React, { useEffect, useState } from 'react';
import { Crown, Trophy, Medal, Flame } from 'lucide-react';
import { subscribeToLeaderboard } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = subscribeToLeaderboard((data) => {
            setUsers(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

    return (
        <div className="leaderboard-container no-scrollbar">
            <div className="leaderboard-header">
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--color-text-main))', marginBottom: '8px' }}>Leaderboard</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))' }}>Top performers this week</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
            ) : (
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
            )}
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

            <div className="row-info">
                <div className="row-name">
                    {user.name || user.email.split('@')[0]}
                    {isCurrentUser && <span className="you-tag">YOU</span>}
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
