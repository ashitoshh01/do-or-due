import React, { useEffect, useState } from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { subscribeToLeaderboard } from '../services/dbService';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        const unsub = subscribeToLeaderboard((data) => {
            setUsers(data);
        });
        return () => unsub();
    }, []);

    return (
        <div className="animate-in" style={{ paddingBottom: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'hsl(var(--color-text-main))' }}>Leaderboard</h1>
                <p style={{ color: 'hsl(var(--color-text-secondary))' }}>Top performers this week</p>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '0' }}>
                {users.map((user, index) => {
                    // Determine background color
                    let bgColor = 'transparent';
                    if (index === 0) bgColor = '#EFBF04';      // Gold
                    else if (index === 1) bgColor = '#666666'; // Silver
                    else if (index === 2) bgColor = '#CE8946'; // Bronze
                    else if (user.id === currentUser?.uid) bgColor = 'hsl(217, 91%, 95%)'; // Current User

                    // Determine text color (Top 3 get dark text, others default)
                    const isTop3 = index < 3;
                    const textColor = isTop3 ? '#0F172A' : 'hsl(var(--color-text-main))';
                    const subTextColor = isTop3 ? 'rgba(15, 23, 42, 0.7)' : 'hsl(var(--color-text-secondary))';

                    return (
                        <div key={user.id || index} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px',
                            borderBottom: index !== users.length - 1 ? '1px solid hsl(var(--color-border-light))' : 'none',
                            backgroundColor: bgColor
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, color: isTop3 ? '#0F172A' : 'hsl(var(--color-text-secondary))'
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: isTop3 ? 'rgba(255, 255, 255, 0.8)' : 'hsl(var(--color-bg-input))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                    color: isTop3 ? '#0F172A' : 'hsl(var(--color-text-main))'
                                }}>
                                    {user.email?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: textColor }}>
                                        {user.name || user.email.split('@')[0]}
                                        {user.id === currentUser?.uid && <span style={{ fontSize: '10px', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                                    </div>
                                    <div style={{ fontSize: '12px', color: subTextColor }}>{user.streak || 0} day streak</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: textColor }}>{user.xp || 0} XP</div>
                                {/* Change logic would require tracking previous rank, skipping for now as it needs more DB structure */}
                            </div>
                        </div>
                    );
                })}
            </div>
            {users.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'hsl(var(--color-text-secondary))' }}>No active users yet. Be the first!</div>}
        </div>
    );
};

export default Leaderboard;
