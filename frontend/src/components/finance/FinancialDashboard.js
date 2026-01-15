import React, { useState } from 'react';
import {
    TrendingUp,
    AlertCircle,
    FileText,
    ArrowUpRight,
    Wallet,
    Building,
    Calendar,
    Download
} from 'lucide-react';
import './FinancialDashboard.css';

// --- MOCK DATA ---

const FINANCIAL_SUMMARY = {
    totalRevenueYTD: 14500000, // 1.45 Cr
    totalExpensesYTD: 9800000, // 98 Lakhs
    netProfitMargin: 32.4, // %
    pendingCollections: 2400000, // 24 Lakhs
    wipRevenue: 850000, // Work done but not billed
    cashInHand: 1200000,
    tdsCredit: 145000, // TDS Deducted by clients
};

const PROJECT_PROFITABILITY = [
    { id: 1, name: "Sharma Residence", fee: 1500000, costConsumed: 900000, progress: 75, status: "Healthy" },
    { id: 2, name: "Tech Park Lobby", fee: 500000, costConsumed: 480000, progress: 80, status: "Critical" }, // High burn
    { id: 3, name: "Kulkarni Farmhouse", fee: 2500000, costConsumed: 1200000, progress: 40, status: "Healthy" },
    { id: 4, name: "City Mall Facade", fee: 800000, costConsumed: 850000, progress: 90, status: "Loss" },
];

const AGED_RECEIVABLES = [
    { id: "INV-102", client: "Mehta Developers", project: "City Mall", amount: 450000, days: 92, status: "Critical" },
    { id: "INV-108", client: "Mr. Sharma", project: "Sharma Res", amount: 120000, days: 45, status: "Warning" },
    { id: "INV-112", client: "Apex Tech", project: "Office Interior", amount: 800000, days: 12, status: "Current" },
];

const EXPENSE_BREAKDOWN = [
    { category: "Payroll (Architects)", amount: 6500000, percentage: 66 },
    { category: "Office Rent & Utilities", amount: 1200000, percentage: 12 },
    { category: "Software Licenses", amount: 800000, percentage: 8 },
    { category: "Site Travel & Stay", amount: 500000, percentage: 5 },
    { category: "Marketing / BD", amount: 300000, percentage: 3 },
    { category: "Others", amount: 500000, percentage: 6 },
];

// --- HELPER COMPONENTS ---

const Card = ({ children, className = "" }) => (
    <div className={`dashboard-card ${className}`}>
        {children}
    </div>
);

const Badge = ({ status }) => {
    // Map status to CSS classes from our file
    return (
        <span className={`status-badge ${status.toLowerCase()}`}>
            {status}
        </span>
    );
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumSignificantDigits: 3
    }).format(amount);
};

// --- MAIN DASHBOARD ---

export default function FinancialDashboardDemo() {
    const [timeRange, setTimeRange] = useState('FY 2024-25');
    const [showDemoToast, setShowDemoToast] = useState(true);

    return (
        <div className="financial-dashboard">

            {/* DEMO TOASTER */}
            {showDemoToast && (
                <div className="demo-toast">
                    <div className="toast-icon">
                        <AlertCircle className="w-5 h-5 text-yellow" />
                    </div>
                    <div className="toast-body">
                        <p className="toast-title">Demo Preview</p>
                        <p className="toast-text">This is a demo page showcasing the upcoming financial dashboard. Real data integration is coming soon!</p>
                    </div>
                    <button onClick={() => setShowDemoToast(false)} className="toast-close">
                        ✕
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Financial Overview</h1>
                    <p className="dashboard-subtitle">Track profitability, cash flow, and firm health.</p>
                </div>
                <div className="dashboard-controls">
                    <div className="control-group">
                        <Calendar className="w-4 h-4 text-slate-500 mr-2" style={{ color: '#64748b' }} />
                        <select
                            className="control-select"
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                        >
                            <option>This Month</option>
                            <option>Q3 (Oct-Dec)</option>
                            <option>FY 2024-25</option>
                        </select>
                    </div>
                    <button className="btn-primary">
                        <Download className="w-4 h-4 mr-2" /> Export Report
                    </button>
                </div>
            </header>

            {/* KPI Row - Top Level Metrics */}
            <div className="kpi-grid">
                <Card className="kpi-card blue">
                    <div className="kpi-header">
                        <div>
                            <p className="kpi-label">Total Revenue (YTD)</p>
                            <h3 className="kpi-value">{formatCurrency(FINANCIAL_SUMMARY.totalRevenueYTD)}</h3>
                        </div>
                        <div className="kpi-icon-wrapper blue">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="kpi-trend">
                        <span className="trend-badge positive">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                        </span>
                        <span style={{ color: '#94a3b8' }}>vs last year</span>
                    </div>
                </Card>

                <Card className="kpi-card green">
                    <div className="kpi-header">
                        <div>
                            <p className="kpi-label">Net Profit Margin</p>
                            <h3 className="kpi-value">{FINANCIAL_SUMMARY.netProfitMargin}%</h3>
                        </div>
                        <div className="kpi-icon-wrapper green">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="kpi-trend">
                        <span style={{ color: '#64748b', marginRight: '4px' }}>Industry Avg: </span>
                        <span style={{ fontWeight: 600, color: '#334155', marginRight: 'auto' }}> 25-30%</span>
                        <span className="text-green font-bold text-xs" style={{ fontSize: '0.75rem' }}>Healthy</span>
                    </div>
                </Card>

                <Card className="kpi-card orange">
                    <div className="kpi-header">
                        <div>
                            <p className="kpi-label">Pending Collections</p>
                            <h3 className="kpi-value">{formatCurrency(FINANCIAL_SUMMARY.pendingCollections)}</h3>
                        </div>
                        <div className="kpi-icon-wrapper orange">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="kpi-trend">
                        <span className="trend-badge negative">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> 5%
                        </span>
                        <span style={{ color: '#94a3b8' }}>increase in overdue</span>
                    </div>
                </Card>

                <Card className="kpi-card purple">
                    <div className="kpi-header">
                        <div>
                            <p className="kpi-label">WIP Revenue (Unbilled)</p>
                            <h3 className="kpi-value">{formatCurrency(FINANCIAL_SUMMARY.wipRevenue)}</h3>
                        </div>
                        <div className="kpi-icon-wrapper purple">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="kpi-trend" style={{ color: '#64748b' }}>
                        Work completed but milestone invoice not yet raised.
                    </div>
                </Card>
            </div>

            <div className="main-grid">

                {/* Main Chart Section - Project Profitability */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    <Card>
                        <div className="section-header">
                            <h3 className="section-title">Project Profitability Analysis</h3>
                            <button className="text-link">View All Projects</button>
                        </div>

                        <div className="table-container">
                            <table className="dashboard-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th className="text-right">Total Fee</th>
                                        <th className="text-right">Burn Cost (Salaries)</th>
                                        <th className="text-right">Margin</th>
                                        <th className="text-center">Health</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PROJECT_PROFITABILITY.map((proj) => {
                                        const margin = proj.fee - proj.costConsumed;
                                        const marginPercent = ((margin / proj.fee) * 100).toFixed(1);
                                        return (
                                            <tr key={proj.id}>
                                                <td className="font-bold">{proj.name}</td>
                                                <td className="text-right">{formatCurrency(proj.fee)}</td>
                                                <td className="text-right" style={{ color: '#475569' }}>{formatCurrency(proj.costConsumed)}</td>
                                                <td className={`text-right font-bold ${margin > 0 ? 'text-green' : 'text-red'}`}>
                                                    {marginPercent}%
                                                </td>
                                                <td className="text-center">
                                                    <Badge status={proj.status} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Aged Receivables Section */}
                    <Card>
                        <div className="section-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <h3 className="section-title">Aged Receivables (Unpaid Invoices)</h3>
                                <span className="status-badge critical">Critical</span>
                            </div>
                        </div>

                        <div>
                            {AGED_RECEIVABLES.map((inv) => (
                                <div key={inv.id} className="list-item">
                                    <div className="list-item-left">
                                        <div className={`circle-avatar ${inv.days > 90 ? 'red' :
                                            inv.days > 30 ? 'orange' : 'green'
                                            }`}>
                                            {inv.days}d
                                        </div>
                                        <div>
                                            <h4 className="list-item-title">{inv.client}</h4>
                                            <p className="list-item-sub">{inv.project} • Inv #{inv.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="list-item-title">{formatCurrency(inv.amount)}</h4>
                                        <button className="text-link" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Send Reminder</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* Sidebar Column */}
                <div className="sidebar-col">

                    {/* Expense Breakdown */}
                    <Card>
                        <h3 className="section-title">Where is money going?</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {EXPENSE_BREAKDOWN.map((exp, idx) => (
                                <div key={idx} className="progress-item">
                                    <div className="progress-label">
                                        <span style={{ color: '#475569' }}>{exp.category}</span>
                                        <span className="font-bold">{exp.percentage}%</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${exp.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>Observation:</p>
                            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.4' }}>
                                <strong>Payroll is 66% of revenue.</strong> Industry standard is 55-60%. Consider optimizing resource allocation or increasing fees.
                            </p>
                        </div>
                    </Card>

                    {/* Tax Compliance */}
                    <Card className="tax-card">
                        <h3 className="section-title tax-title" style={{ marginBottom: '1.5rem' }}>
                            <Building className="w-5 h-5 text-yellow" />
                            Tax Compliance
                        </h3>

                        <div className="tax-grid">
                            <div className="tax-box">
                                <p className="tax-label">GST Liability</p>
                                <p className="tax-value">₹ 1.2 L</p>
                                <p className="tax-sub text-yellow">Due in 5 days</p>
                            </div>
                            <div className="tax-box">
                                <p className="tax-label">TDS Credit</p>
                                <p className="tax-value">₹ 1.45 L</p>
                                <p className="tax-sub text-green-light">Available Claim</p>
                            </div>
                        </div>

                        <button className="btn-block">
                            Generate CA Report
                        </button>
                    </Card>

                    {/* Cash Flow Forecast */}
                    <Card>
                        <h3 className="section-title">Cash Flow Forecast</h3>
                        <div className="chart-container">
                            {/* Simulated Chart Bars */}
                            {[40, 60, 45, 80, 30, 65].map((h, i) => (
                                <div key={i} className="chart-bar-wrapper group">
                                    <div
                                        className={`chart-bar ${h < 40 ? 'red' : 'green'}`}
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <span className="chart-label">M{i + 1}</span>
                                    {/* Tooltip */}
                                    <div className="chart-tooltip">
                                        {h < 40 ? 'Deficit Warning' : 'Surplus'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem', textAlign: 'center' }}>
                            Projected cash flow for next 6 months
                        </p>
                    </Card>

                </div>
            </div>
        </div>
    );
}
