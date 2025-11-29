import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

// --- Icons ---
const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const ProjectIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
    </svg>
);

const TaskIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
);

const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { isAdmin } = usePermissions(user);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        activeProjects: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/projects');
            return;
        }

        if (!isAdmin()) {
            navigate('/projects');
            return;
        }

        fetchDashboardStats();
    }, [user, navigate, isAdmin]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('/api/admin/dashboard', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.stats) {
                    setStats(data.stats);
                }
            } else {
                console.error('Failed to fetch dashboard stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !isAdmin()) {
        return null;
    }

    // --- Styles ---
    const styles = {
        container: {
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#1e293b',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        },
        header: {
            marginBottom: '3rem',
            position: 'relative',
        },
        greeting: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em',
        },
        subGreeting: {
            fontSize: '1.1rem',
            color: '#64748b',
            fontWeight: '500',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
        },
        card: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '200px',
        },
        cardHover: {
            transform: 'translateY(-5px)',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        },
        iconWrapper: {
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        statValue: {
            fontSize: '3rem',
            fontWeight: '800',
            color: '#0f172a',
            lineHeight: '1',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
        },
        statLabel: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        activityCard: {
            background: 'white',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f1f5f9',
        },
        placeholderChart: {
            height: '200px',
            background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 100%)',
            borderRadius: '16px',
            border: '2px dashed #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            fontSize: '0.9rem',
            fontWeight: '500',
        }
    };

    // Card Component
    const StatCard = ({ title, value, icon, color }) => {
        const [isHovered, setIsHovered] = useState(false);

        return (
            <div
                style={{ ...styles.card, ...(isHovered ? styles.cardHover : {}) }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ ...styles.iconWrapper, background: color }}>
                    {icon}
                </div>
                <div>
                    <div style={styles.statValue}>{loading ? '-' : value}</div>
                    <div style={styles.statLabel}>{title}</div>
                </div>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.greeting}>
                    Welcome back, {user.name.split(' ')[0]}
                </h1>
                <p style={styles.subGreeting}>
                    Here's what's happening in your organization today.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={styles.grid}>
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={<UsersIcon />}
                    color="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                />
                <StatCard
                    title="Active Projects"
                    value={stats.activeProjects}
                    icon={<ProjectIcon />}
                    color="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                />
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    icon={<TaskIcon />}
                    color="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                />
                <StatCard
                    title="System Health"
                    value="100%"
                    icon={<ActivityIcon />}
                    color="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                />
            </div>

        </div>
    );
};

export default AdminDashboard;