import React from 'react';

const ProjectFinancialsTab = ({ project, financialData = {} }) => {
    const { contractAmount = 0, billedAmount = 0, receivedAmount = 0 } = financialData;
    const outstandingAmount = billedAmount - receivedAmount;
    const unbilledRevenue = contractAmount - billedAmount;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };


    // Calculate percentages for visual representation
    const receivedPercentage = billedAmount > 0 ? (receivedAmount / billedAmount) * 100 : 0;
    const outstandingPercentage = billedAmount > 0 ? (outstandingAmount / billedAmount) * 100 : 0;

    return (
        <div className="project-financials-tab">
            {/* Financial Overview with Graphs */}
            <div className="financial-overview-section">
                <div className="tab-header-standard">
                    <h2 className="tab-header-title">Financial Overview</h2>
                </div>

                <div className="financial-stats-grid">
                    {/* Received vs Outstanding */}
                    <div className="financial-stat-card large">
                        <h3 className="financial-stat-title">Payment Status</h3>
                        <div className="financial-chart-container">
                            <div className="financial-donut-chart">
                                <svg viewBox="0 0 200 200" className="donut-svg">
                                    {/* Background circle */}
                                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="40" />
                                    {/* Received amount (green) */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#10b981"
                                        strokeWidth="40"
                                        strokeDasharray={`${receivedPercentage * 5.03} 502`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 100 100)"
                                    />
                                    {/* Outstanding amount (orange) */}
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="40"
                                        strokeDasharray={`${outstandingPercentage * 5.03} 502`}
                                        strokeDashoffset={`-${receivedPercentage * 5.03}`}
                                        transform="rotate(-90 100 100)"
                                    />
                                    <text x="100" y="95" textAnchor="middle" className="donut-center-text">
                                        {receivedPercentage.toFixed(0)}%
                                    </text>
                                    <text x="100" y="115" textAnchor="middle" className="donut-center-subtext">
                                        Received
                                    </text>
                                </svg>
                            </div>
                            <div className="financial-legend">
                                <div className="legend-item">
                                    <span className="legend-color received"></span>
                                    <div className="legend-details">
                                        <span className="legend-label">Received</span>
                                        <span className="legend-value">{formatCurrency(receivedAmount)}</span>
                                    </div>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-color outstanding"></span>
                                    <div className="legend-details">
                                        <span className="legend-label">Outstanding</span>
                                        <span className="legend-value">{formatCurrency(outstandingAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="financial-metrics">
                        <div className="metric-card">
                            <div className="metric-icon contract">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 3h12M6 8h12M6 13l8.5 10M6 13h3M9 13c6.667 0 6.667-10 0-10" />
                                </svg>
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Total Contract</span>
                                <span className="metric-value">{formatCurrency(contractAmount)}</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon billed">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Total Billed</span>
                                <span className="metric-value">{formatCurrency(billedAmount)}</span>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon unbilled">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Unbilled Work</span>
                                <span className="metric-value">{formatCurrency(unbilledRevenue)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectFinancialsTab;
