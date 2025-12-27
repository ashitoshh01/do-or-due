import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Analytics = ({ history }) => {
    const { isDark } = useTheme();

    // Color schemes
    const chartColors = {
        primary: '#3B82F6',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#8B5CF6'
    };

    // Task Distribution Data for Pie Chart
    const taskDistribution = useMemo(() => {
        const total = history.length;
        const pending = history.filter(t => t.status === 'pending').length;
        const completed = history.filter(t => t.status === 'success').length;
        const failed = history.filter(t => t.status === 'failed').length;

        return [
            { name: 'Pending', value: pending, color: chartColors.warning },
            { name: 'Completed', value: completed, color: chartColors.success },
            { name: 'Failed', value: failed, color: chartColors.danger }
        ];
    }, [history]);

    // Tasks per Day of Week for Bar Chart
    const tasksPerDay = useMemo(() => {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const counts = Array(7).fill(0);

        history.forEach(task => {
            if (task.createdAt) {
                const date = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                const dayIndex = date.getDay();
                counts[dayIndex]++;
            }
        });

        return daysOfWeek.map((day, index) => ({
            day: day.substring(0, 3), // Mon, Tue, etc.
            tasks: counts[index]
        }));
    }, [history]);

    // Productivity Analysis (tasks created and completed TODAY only)
    const productivityData = useMemo(() => {
        const hourCounts = Array(24).fill(0).map((_, i) => ({ hour: i, created: 0, completed: 0 }));
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const todayEnd = todayStart + 24 * 60 * 60 * 1000;

        history.forEach(task => {
            // Count tasks COMPLETED today (not created)
            if (task.completedAt && task.status === 'success') {
                const completedDate = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
                const completedTime = completedDate.getTime();

                // Only include if completed today
                if (completedTime >= todayStart && completedTime < todayEnd) {
                    const hour = completedDate.getHours();
                    hourCounts[hour].completed++;
                }
            }

            // Also track tasks created today for context
            if (task.createdAt) {
                const createdDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                const createdTime = createdDate.getTime();

                if (createdTime >= todayStart && createdTime < todayEnd) {
                    const hour = createdDate.getHours();
                    hourCounts[hour].created++;
                }
            }
        });

        // Format hours as readable labels
        return hourCounts.map(item => ({
            ...item,
            label: `${item.hour}:00`
        }));
    }, [history]);

    // Find peak productivity hour
    const peakHour = useMemo(() => {
        const maxCompleted = Math.max(...productivityData.map(d => d.completed));
        const peak = productivityData.find(d => d.completed === maxCompleted);
        return peak ? `${peak.hour}:00 - ${peak.hour + 1}:00` : 'N/A';
    }, [productivityData]);

    // Theme-aware text color
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const secondaryColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? '#334155' : '#E2E8F0';

    return (
        <div style={{ paddingBottom: '40px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: textColor }}>Analytics</h1>
            <p style={{ color: secondaryColor, marginBottom: '32px' }}>
                Insights into your productivity and task completion patterns
            </p>

            {/* Stats Overview - Responsive Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '32px'
            }}>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <Award size={32} color={chartColors.success} style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
                        {history.filter(t => t.status === 'success').length}
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryColor }}>Completed</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <TrendingUp size={32} color={chartColors.primary} style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '28px', fontWeight: 700, color: textColor }}>
                        {history.length > 0 ? Math.round((history.filter(t => t.status === 'success').length / history.length) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '13px', color: secondaryColor }}>Success Rate</div>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
                    <Calendar size={32} color={chartColors.warning} style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '20px', fontWeight: 700, color: textColor }}>{peakHour}</div>
                    <div style={{ fontSize: '13px', color: secondaryColor }}>Peak Productivity</div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '24px' }}>
                {/* Pie Chart - Task Distribution */}
                <div className="card">
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: textColor }}>
                        Task Distribution
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={taskDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={(entry) => {
                                    // Prevent overlap by checking if value is 0
                                    if (entry.value === 0) return '';
                                    return `${entry.name}: ${entry.value}`;
                                }}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {taskDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                    color: textColor
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar Chart - Tasks per Day */}
                <div className="card">
                    <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: textColor }}>
                        Tasks Created per Day
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={tasksPerDay}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="day" stroke={secondaryColor} />
                            <YAxis stroke={secondaryColor} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                    border: `1px solid ${gridColor}`,
                                    borderRadius: '8px',
                                    color: textColor
                                }}
                            />
                            <Bar dataKey="tasks" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Productivity Analysis - Full Width */}
            <div className="card" style={{ marginTop: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: textColor }}>
                    Today's Productivity (24-Hour Pattern)
                </h2>
                <p style={{ fontSize: '14px', color: secondaryColor, marginBottom: '16px' }}>
                    Tasks created and completed today - identify your peak productivity hours
                </p>
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={productivityData}>
                        <defs>
                            <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.success} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartColors.success} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="label" stroke={secondaryColor} interval={3} />
                        <YAxis stroke={secondaryColor} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                border: `1px solid ${gridColor}`,
                                borderRadius: '8px',
                                color: textColor
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="created"
                            stroke={chartColors.primary}
                            fillOpacity={1}
                            fill="url(#colorCreated)"
                            name="Tasks Created"
                        />
                        <Area
                            type="monotone"
                            dataKey="completed"
                            stroke={chartColors.success}
                            fillOpacity={1}
                            fill="url(#colorCompleted)"
                            name="Tasks Completed"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Analytics;
