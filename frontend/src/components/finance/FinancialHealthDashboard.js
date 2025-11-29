import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { apiGet } from '../../utils/api';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Format currency
const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(num);
};

// Format percentage
const formatPercentage = (value) => {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(1)}%`;
};

// Icons
const RupeeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12M6 8h12M6 13l8.5 10M6 13h3M9 13c6.667 0 6.667-10 0-10" />
    </svg>
);

const TrendingUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const FileTextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const AlertCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);

const FinancialHealthDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { isAdmin, isManager } = usePermissions(user);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('overall'); // overall, chargeType, projectStage, invoiceStatus

    useEffect(() => {
        if (!user) {
            navigate('/projects');
            return;
        }

        if (!isAdmin() && !isManager()) {
            navigate('/projects');
            return;
        }

        fetchFinancialHealthData();
    }, [user, navigate, isAdmin, isManager]);

    const fetchFinancialHealthData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGet('/api/financial-health/dashboard');

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setDashboardData(data.data);
                } else {
                    setError(data.error || 'Failed to load financial health data');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch financial health data');
            }
        } catch (err) {
            console.error('Error fetching financial health data:', err);
            setError('An error occurred while fetching financial health data');
        } finally {
            setLoading(false);
        }
    };

    if (!user || (!isAdmin() && !isManager())) {
        return null;
    }

    // Styles
    const styles = {
        container: {
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#1e293b',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        },
        header: {
            marginBottom: '2rem',
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            fontWeight: '500',
        },
        tabContainer: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
        },
        tab: {
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: 'none',
            background: 'white',
            color: '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        tabActive: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
        },
        card: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        },
        cardTitle: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
        },
        cardValue: {
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0f172a',
            marginBottom: '0.25rem',
        },
        metricRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'white',
            borderRadius: '12px',
            marginBottom: '0.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
        metricLabel: {
            fontWeight: '600',
            color: '#475569',
        },
        metricValue: {
            fontWeight: '700',
            color: '#0f172a',
        },
        progressBar: {
            height: '8px',
            borderRadius: '4px',
            background: '#e2e8f0',
            overflow: 'hidden',
            marginTop: '0.5rem',
        },
        progressFill: {
            height: '100%',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
        },
        errorMessage: {
            padding: '1.5rem',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '12px',
            border: '1px solid #fecaca',
        },
        loadingMessage: {
            padding: '2rem',
            textAlign: 'center',
            color: '#64748b',
        },
        chartCard: {
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
            marginBottom: '1.5rem',
        },
        chartTitle: {
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#0f172a',
            marginBottom: '1.5rem',
        },
        chartContainer: {
            height: '400px',
            width: '100%',
        },
        pieChartContainer: {
            height: '350px',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        twoColumnGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem',
        },
    };

    const StatCard = ({ title, value, subtitle, color = '#3b82f6' }) => (
        <div style={styles.card}>
            <div style={styles.cardTitle}>{title}</div>
            <div style={styles.cardValue}>{value}</div>
            {subtitle && <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{subtitle}</div>}
        </div>
    );

    const MetricRow = ({ label, value, percentage, color = '#3b82f6' }) => (
        <div style={styles.metricRow}>
            <div>
                <div style={styles.metricLabel}>{label}</div>
                {percentage !== undefined && (
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${Math.min(percentage, 100)}%`,
                                background: color,
                            }}
                        />
                    </div>
                )}
            </div>
            <div style={styles.metricValue}>{value}</div>
        </div>
    );

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingMessage}>Loading financial health data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorMessage}>
                    <strong>Error:</strong> {error}
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingMessage}>No financial data available</div>
            </div>
        );
    }

    const { overall, byChargeType = [], byProjectStage = [], byInvoiceStatus = [] } = dashboardData;

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Financial Health Dashboard</h1>
                <p style={styles.subtitle}>Comprehensive overview of your organization's financial status</p>
            </div>

            {/* Tabs */}
            <div style={styles.tabContainer}>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'overall' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('overall')}
                >
                    Overall
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'chargeType' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('chargeType')}
                >
                    By Charge Type
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'projectStage' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('projectStage')}
                >
                    By Project Stage
                </button>
                <button
                    style={{ ...styles.tab, ...(activeTab === 'invoiceStatus' ? styles.tabActive : {}) }}
                    onClick={() => setActiveTab('invoiceStatus')}
                >
                    By Invoice Status
                </button>
            </div>

            {/* Overall Tab */}
            {activeTab === 'overall' && overall && (
                <>
                    <div style={styles.grid}>
                        <StatCard
                            title="Total Invoiced"
                            value={formatCurrency(overall.totalInvoiced)}
                            subtitle={`${overall.totalInvoices || 0} invoices`}
                        />
                        <StatCard
                            title="Total Paid"
                            value={formatCurrency(overall.totalPaid)}
                            subtitle={`${formatPercentage(overall.collectionRate)} collection rate`}
                        />
                        <StatCard
                            title="Outstanding"
                            value={formatCurrency(overall.totalOutstanding)}
                            subtitle="Unpaid invoices"
                        />
                        <StatCard
                            title="Active Projects"
                            value={overall.totalActiveProjects || 0}
                            subtitle="Currently active"
                        />
                    </div>

                    {/* Financial Overview Histogram */}
                    <div style={styles.chartCard}>
                        <h3 style={styles.chartTitle}>Financial Overview</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                                data={[
                                    {
                                        name: 'Total Invoiced',
                                        value: parseFloat(overall.totalInvoiced || 0),
                                        fill: '#3b82f6'
                                    },
                                    {
                                        name: 'Total Paid',
                                        value: parseFloat(overall.totalPaid || 0),
                                        fill: '#10b981'
                                    },
                                    {
                                        name: 'Outstanding',
                                        value: parseFloat(overall.totalOutstanding || 0),
                                        fill: '#ef4444'
                                    }
                                ]}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                                <YAxis
                                    tick={{ fill: '#64748b' }}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                                        return `₹${value}`;
                                    }}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '10px'
                                    }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={styles.card}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
                            Financial Metrics
                        </h3>
                        <MetricRow
                            label="Collection Rate"
                            value={formatPercentage(overall.collectionRate)}
                            percentage={overall.collectionRate}
                            color={overall.collectionRate >= 80 ? '#10b981' : overall.collectionRate >= 60 ? '#f59e0b' : '#ef4444'}
                        />
                        {overall.totalBudget && (
                            <MetricRow
                                label="Total Budget"
                                value={formatCurrency(overall.totalBudget)}
                            />
                        )}
                        {overall.totalActualCost && (
                            <MetricRow
                                label="Actual Cost"
                                value={formatCurrency(overall.totalActualCost)}
                            />
                        )}
                    </div>
                </>
            )}

            {/* By Charge Type Tab */}
            {activeTab === 'chargeType' && (
                <div>
                    {byChargeType.length === 0 ? (
                        <div style={styles.card}>
                            <p style={{ color: '#64748b' }}>No charge type data available</p>
                        </div>
                    ) : (
                        <>
                            {/* Histogram for Charge Type */}
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Revenue by Charge Type</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={byChargeType.map(item => ({
                                            name: item.chargeTypeDisplay || item.chargeType,
                                            invoiced: parseFloat(item.totalInvoiced || 0),
                                            paid: parseFloat(item.totalPaid || 0),
                                            outstanding: parseFloat(item.totalOutstanding || 0)
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                                        <YAxis
                                            tick={{ fill: '#64748b' }}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                                                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                                                return `₹${value}`;
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '10px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="invoiced" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Invoiced" />
                                        <Bar dataKey="paid" fill="#10b981" radius={[8, 8, 0, 0]} name="Paid" />
                                        <Bar dataKey="outstanding" fill="#ef4444" radius={[8, 8, 0, 0]} name="Outstanding" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Chart for Charge Type Distribution */}
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Charge Type Distribution</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={byChargeType.map(item => ({
                                                name: item.chargeTypeDisplay || item.chargeType,
                                                value: parseFloat(item.totalInvoiced || 0)
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {byChargeType.map((entry, index) => {
                                                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '10px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Metrics */}
                            {byChargeType.map((item, idx) => (
                                <div key={idx} style={{ ...styles.card, marginBottom: '1rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
                                        {item.chargeTypeDisplay || item.chargeType}
                                    </h3>
                                    <MetricRow
                                        label="Projects"
                                        value={item.projectCount || 0}
                                    />
                                    <MetricRow
                                        label="Invoices"
                                        value={item.invoiceCount || 0}
                                    />
                                    <MetricRow
                                        label="Total Invoiced"
                                        value={formatCurrency(item.totalInvoiced)}
                                    />
                                    <MetricRow
                                        label="Total Paid"
                                        value={formatCurrency(item.totalPaid)}
                                    />
                                    <MetricRow
                                        label="Outstanding"
                                        value={formatCurrency(item.totalOutstanding)}
                                    />
                                    <MetricRow
                                        label="Collection Rate"
                                        value={formatPercentage(item.collectionRate)}
                                        percentage={item.collectionRate}
                                        color={item.collectionRate >= 80 ? '#10b981' : item.collectionRate >= 60 ? '#f59e0b' : '#ef4444'}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* By Project Stage Tab */}
            {activeTab === 'projectStage' && (
                <div>
                    {byProjectStage.length === 0 ? (
                        <div style={styles.card}>
                            <p style={{ color: '#64748b' }}>No project stage data available</p>
                        </div>
                    ) : (
                        <>
                            {/* Histogram for Project Stage */}
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Revenue by Project Stage</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={byProjectStage.map(item => ({
                                            name: item.stageDisplay || item.stage,
                                            invoiced: parseFloat(item.totalInvoiced || 0),
                                            paid: parseFloat(item.totalPaid || 0),
                                            outstanding: parseFloat(item.totalOutstanding || 0)
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            angle={-45}
                                            textAnchor="end"
                                            height={100}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                        />
                                        <YAxis
                                            tick={{ fill: '#64748b' }}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                                                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                                                return `₹${value}`;
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '10px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="invoiced" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Invoiced" />
                                        <Bar dataKey="paid" fill="#10b981" radius={[8, 8, 0, 0]} name="Paid" />
                                        <Bar dataKey="outstanding" fill="#ef4444" radius={[8, 8, 0, 0]} name="Outstanding" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Chart for Project Stage Distribution */}
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Project Stage Distribution</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie
                                            data={byProjectStage.map(item => ({
                                                name: item.stageDisplay || item.stage,
                                                value: parseFloat(item.totalInvoiced || 0)
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={120}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {byProjectStage.map((entry, index) => {
                                                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '10px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Metrics */}
                            {byProjectStage.map((item, idx) => (
                                <div key={idx} style={{ ...styles.card, marginBottom: '1rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
                                        {item.stageDisplay || item.stage}
                                    </h3>
                                    <MetricRow
                                        label="Projects"
                                        value={item.projectCount || 0}
                                    />
                                    <MetricRow
                                        label="Invoices"
                                        value={item.invoiceCount || 0}
                                    />
                                    <MetricRow
                                        label="Total Invoiced"
                                        value={formatCurrency(item.totalInvoiced)}
                                    />
                                    <MetricRow
                                        label="Total Paid"
                                        value={formatCurrency(item.totalPaid)}
                                    />
                                    <MetricRow
                                        label="Outstanding"
                                        value={formatCurrency(item.totalOutstanding)}
                                    />
                                    <MetricRow
                                        label="Collection Rate"
                                        value={formatPercentage(item.collectionRate)}
                                        percentage={item.collectionRate}
                                        color={item.collectionRate >= 80 ? '#10b981' : item.collectionRate >= 60 ? '#f59e0b' : '#ef4444'}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}

            {/* By Invoice Status Tab */}
            {activeTab === 'invoiceStatus' && (
                <div>
                    {byInvoiceStatus.length === 0 ? (
                        <div style={styles.card}>
                            <p style={{ color: '#64748b' }}>No invoice status data available</p>
                        </div>
                    ) : (
                        <>
                            {/* Two Column Layout for Charts */}
                            <div style={styles.twoColumnGrid}>
                                {/* Pie Chart for Invoice Count Distribution */}
                                <div style={styles.chartCard}>
                                    <h3 style={styles.chartTitle}>Invoice Count by Status</h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={byInvoiceStatus.map(item => ({
                                                    name: item.statusDisplay || item.status,
                                                    value: item.count || 0
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {byInvoiceStatus.map((entry, index) => {
                                                    const statusColors = {
                                                        'DRAFT': '#94a3b8',
                                                        'SENT': '#3b82f6',
                                                        'VIEWED': '#8b5cf6',
                                                        'PAID': '#10b981',
                                                        'OVERDUE': '#ef4444',
                                                        'CANCELLED': '#64748b'
                                                    };
                                                    const status = entry.status?.toUpperCase();
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={statusColors[status] || '#94a3b8'}
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Pie Chart for Invoice Amount Distribution */}
                                <div style={styles.chartCard}>
                                    <h3 style={styles.chartTitle}>Invoice Amount by Status</h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <PieChart>
                                            <Pie
                                                data={byInvoiceStatus.map(item => ({
                                                    name: item.statusDisplay || item.status,
                                                    value: parseFloat(item.totalAmount || 0)
                                                }))}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {byInvoiceStatus.map((entry, index) => {
                                                    const statusColors = {
                                                        'DRAFT': '#94a3b8',
                                                        'SENT': '#3b82f6',
                                                        'VIEWED': '#8b5cf6',
                                                        'PAID': '#10b981',
                                                        'OVERDUE': '#ef4444',
                                                        'CANCELLED': '#64748b'
                                                    };
                                                    const status = entry.status?.toUpperCase();
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={statusColors[status] || '#94a3b8'}
                                                        />
                                                    );
                                                })}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatCurrency(value)}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    padding: '10px'
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Histogram for Invoice Status */}
                            <div style={styles.chartCard}>
                                <h3 style={styles.chartTitle}>Invoice Status Overview</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart
                                        data={byInvoiceStatus.map(item => ({
                                            name: item.statusDisplay || item.status,
                                            count: item.count || 0,
                                            totalAmount: parseFloat(item.totalAmount || 0),
                                            paidAmount: parseFloat(item.paidAmount || 0),
                                            outstanding: parseFloat(item.outstandingAmount || 0)
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
                                        <YAxis
                                            tick={{ fill: '#64748b' }}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
                                                if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
                                                return value;
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value, name) => {
                                                if (name === 'count') return value;
                                                return formatCurrency(value);
                                            }}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px',
                                                padding: '10px'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Invoice Count" />
                                        <Bar dataKey="totalAmount" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total Amount" />
                                        <Bar dataKey="paidAmount" fill="#10b981" radius={[8, 8, 0, 0]} name="Paid Amount" />
                                        <Bar dataKey="outstanding" fill="#ef4444" radius={[8, 8, 0, 0]} name="Outstanding" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Detailed Metrics */}
                            {byInvoiceStatus.map((item, idx) => (
                                <div key={idx} style={{ ...styles.card, marginBottom: '1rem' }}>
                                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '700' }}>
                                        {item.statusDisplay || item.status}
                                    </h3>
                                    <MetricRow
                                        label="Count"
                                        value={item.count || 0}
                                    />
                                    <MetricRow
                                        label="Total Amount"
                                        value={formatCurrency(item.totalAmount)}
                                    />
                                    <MetricRow
                                        label="Paid Amount"
                                        value={formatCurrency(item.paidAmount)}
                                    />
                                    <MetricRow
                                        label="Outstanding"
                                        value={formatCurrency(item.outstandingAmount)}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default FinancialHealthDashboard;

