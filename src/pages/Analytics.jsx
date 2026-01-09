import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Analytics = ({ history }) => {
    const { isDark } = useTheme();
    const [activeLayer, setActiveLayer] = useState('all');

    // Color schemes
    const chartColors = {
        primary: '#3B82F6', // Blue for Created
        success: '#22C55E', // Green for Completed
        danger: '#EF4444',  // Red for Failed
        warning: '#F59E0B',
        info: '#8B5CF6'
    };

    // Task Distribution Data for Pie Chart
    const taskDistribution = useMemo(() => {
        const total = history.length;
        const pending = history.filter(t => t.status === 'pending' || t.status === 'pending_review').length;
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

    // Productivity Analysis (Aggregated 24-Hour Pattern)
    const productivityData = useMemo(() => {
        const hourCounts = Array(24).fill(0).map((_, i) => ({ hour: i, created: 0, completed: 0, failed: 0 }));

        history.forEach(task => {
            // Count all completed tasks by hour
            if (task.status === 'success') {
                // Fallback to createdAt if completedAt is missing to ensuring it shows on graph
                const dateRaw = task.completedAt || task.createdAt;
                if (dateRaw) {
                    const date = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                    const hour = date.getHours();
                    hourCounts[hour].completed++;
                }
            }

            // Count all failed tasks by hour
            if (task.status === 'failed') {
                const dateRaw = task.completedAt || task.createdAt;
                if (dateRaw) {
                    const date = dateRaw.toDate ? dateRaw.toDate() : new Date(dateRaw);
                    const hour = date.getHours();
                    hourCounts[hour].failed++;
                }
            }

            // Count all created tasks by hour
            if (task.createdAt) {
                const createdDate = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
                const hour = createdDate.getHours();
                hourCounts[hour].created++;
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
        if (maxCompleted === 0) return 'No data';
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
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis
                                dataKey="day"
                                stroke={secondaryColor}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={20}
                            />
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
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>
                            Productivity Pattern (24-Hour)
                        </h2>
                        <p style={{ fontSize: '14px', color: secondaryColor, marginTop: '4px' }}>
                            Activity by hour of day (All time)
                        </p>
                    </div>

                    {/* Activity Filter Controls */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {[
                            { id: 'all', label: 'All Layers' },
                            { id: 'created', label: 'Created', color: chartColors.primary },
                            { id: 'completed', label: 'Completed', color: chartColors.success },
                            { id: 'failed', label: 'Failed', color: chartColors.danger }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setActiveLayer(opt.id)}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    border: `1px solid ${activeLayer === opt.id ? (opt.color || textColor) : gridColor}`,
                                    backgroundColor: activeLayer === opt.id ? (opt.color || textColor) : 'transparent',
                                    color: activeLayer === opt.id ? '#FFF' : secondaryColor,
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {opt.color && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeLayer === opt.id ? '#FFF' : opt.color }} />}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

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
                            <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartColors.danger} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={chartColors.danger} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                        <XAxis
                            dataKey="label"
                            stroke={secondaryColor}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30} // Prevent overlap
                        />
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

                        {(activeLayer === 'all' || activeLayer === 'created') && (
                            <Area
                                type="monotone"
                                dataKey="created"
                                stroke={chartColors.primary}
                                fillOpacity={1}
                                fill="url(#colorCreated)"
                                name="Created"
                            />
                        )}
                        {(activeLayer === 'all' || activeLayer === 'completed') && (
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke={chartColors.success}
                                fillOpacity={1}
                                fill="url(#colorCompleted)"
                                name="Completed"
                            />
                        )}
                        {(activeLayer === 'all' || activeLayer === 'failed') && (
                            <Area
                                type="monotone"
                                dataKey="failed"
                                stroke={chartColors.danger}
                                fillOpacity={1}
                                fill="url(#colorFailed)"
                                name="Failed"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Analytics;
