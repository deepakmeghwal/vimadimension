import React from 'react';

const SmartFinancialCard = ({ stage, financialData, userRole }) => {
    // Permission check: Only ADMIN and PROJECT_MANAGER can view financials
    const canViewFinancials = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PROJECT_MANAGER'].some(role =>
        userRole && (Array.isArray(userRole) ? userRole.includes(role) : userRole === role)
    );

    if (!canViewFinancials) return null;

    // Helper to format currency in Indian system (Lakhs/Crores)
    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)} L`;
        }
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    // Determine stage group
    const getStageGroup = (stage) => {
        const pursuitStages = ['LEAD', 'PROPOSAL'];
        const executionStages = ['CONCEPT', 'STATUTORY', 'TENDER', 'GFC', 'CONSTRUCTION'];
        const closeoutStages = ['COMPLETION', 'ARCHIVED'];

        if (pursuitStages.includes(stage)) return 'pursuit';
        if (executionStages.includes(stage)) return 'execution';
        if (closeoutStages.includes(stage)) return 'closeout';
        return 'execution'; // default
    };

    const stageGroup = getStageGroup(stage);

    // Pursuit View Component
    const PursuitView = () => {
        const { estimatedFee = 0, winProbability = 0 } = financialData;
        const weightedRevenue = estimatedFee * (winProbability / 100);

        return (
            <div className="smart-financial-card pursuit-mode">
                <div className="smart-card-header">
                    <h3 className="smart-card-title">Opportunity Pipeline</h3>
                    <span className="stage-badge pursuit">Pursuit</span>
                </div>
                <div className="smart-card-body">
                    <div className="metric-primary">
                        <span className="metric-label">Estimated Fee</span>
                        <span className="metric-value pursuit">{formatCurrency(estimatedFee)}</span>
                    </div>
                    <div className="metrics-grid-2">
                        <div className="metric-secondary">
                            <span className="metric-label">Win Probability</span>
                            <div className="probability-display">
                                <span className="metric-value-medium">{winProbability}%</span>
                                <div className="probability-bar">
                                    <div className="probability-fill" style={{ width: `${winProbability}%` }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="metric-secondary">
                            <span className="metric-label">Weighted Revenue</span>
                            <span className="metric-value-medium">{formatCurrency(weightedRevenue)}</span>
                            <span className="metric-hint">Expected value if won</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Execution View Component
    const ExecutionView = () => {
        const {
            contractAmount = 0,
            revenueRecognized = 0,
            totalInvoiced = 0,
            totalReceived = 0,
            hoursLogged = 0,
            budgetedHours = 0
        } = financialData;

        const revenueProgress = contractAmount > 0 ? (revenueRecognized / contractAmount) * 100 : 0;
        const collectionRate = totalInvoiced > 0 ? (totalReceived / totalInvoiced) * 100 : 0;
        const showCashFlowAlert = collectionRate < 80 && totalInvoiced > 0;
        const hoursProgress = budgetedHours > 0 ? (hoursLogged / budgetedHours) * 100 : 0;

        return (
            <div className="smart-financial-card execution-mode">
                <div className="smart-card-header">
                    <h3 className="smart-card-title">Project Control Panel</h3>
                    <span className="stage-badge execution">Active</span>
                </div>
                <div className="smart-card-body">
                    {/* Revenue Progress */}
                    <div className="metric-section">
                        <div className="metric-header">
                            <span className="metric-label">Revenue Recognition</span>
                            <span className="metric-percentage">{revenueProgress.toFixed(0)}%</span>
                        </div>
                        <div className="progress-bar-large">
                            <div className="progress-fill execution" style={{ width: `${revenueProgress}%` }}></div>
                        </div>
                        <div className="metric-subtext">
                            {formatCurrency(revenueRecognized)} of {formatCurrency(contractAmount)}
                        </div>
                    </div>

                    {/* Billing Stats */}
                    <div className="metrics-grid-2">
                        <div className="metric-card execution">
                            <div className="metric-icon-small">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                            </div>
                            <div>
                                <span className="metric-label">Total Invoiced</span>
                                <span className="metric-value-small">{formatCurrency(totalInvoiced)}</span>
                            </div>
                        </div>
                        <div className="metric-card execution">
                            <div className="metric-icon-small">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                            <div>
                                <span className="metric-label">Received</span>
                                <span className="metric-value-small">{formatCurrency(totalReceived)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Cash Flow Alert */}
                    {showCashFlowAlert && (
                        <div className="alert-box cash-flow">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                            <span>Cash Flow Alert: Collection rate at {collectionRate.toFixed(0)}%</span>
                        </div>
                    )}

                    {/* Budget Burn */}
                    {budgetedHours > 0 && (
                        <div className="metric-section">
                            <div className="metric-header">
                                <span className="metric-label">Budget Burn</span>
                                <span className="metric-percentage">{hoursProgress.toFixed(0)}%</span>
                            </div>
                            <div className="progress-bar-small">
                                <div className="progress-fill budget" style={{ width: `${Math.min(hoursProgress, 100)}%` }}></div>
                            </div>
                            <div className="metric-subtext">
                                {hoursLogged.toLocaleString()} of {budgetedHours.toLocaleString()} hours logged
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Closeout View Component
    const CloseoutView = () => {
        const {
            totalRevenue = 0,
            totalCost = 0,
            outstandingBalance = 0
        } = financialData;

        const profit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
        const isFullyPaid = outstandingBalance === 0;

        return (
            <div className="smart-financial-card closeout-mode">
                <div className="smart-card-header">
                    <h3 className="smart-card-title">Project Summary</h3>
                    <span className="stage-badge closeout">Complete</span>
                </div>
                <div className="smart-card-body">
                    {/* Profit Margin */}
                    <div className="metric-primary">
                        <span className="metric-label">Final Profit Margin</span>
                        <span className={`metric-value closeout ${profitMargin < 0 ? 'negative' : ''}`}>
                            {profitMargin.toFixed(1)}%
                        </span>
                    </div>

                    {/* Revenue vs Cost */}
                    <div className="comparison-section">
                        <div className="comparison-item">
                            <span className="comparison-label">Total Revenue</span>
                            <span className="comparison-value revenue">{formatCurrency(totalRevenue)}</span>
                        </div>
                        <div className="comparison-divider">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </div>
                        <div className="comparison-item">
                            <span className="comparison-label">Total Cost</span>
                            <span className="comparison-value cost">{formatCurrency(totalCost)}</span>
                        </div>
                    </div>

                    {/* Collection Status */}
                    <div className={`collection-status ${isFullyPaid ? 'paid' : 'outstanding'}`}>
                        {isFullyPaid ? (
                            <>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>Fully Paid</span>
                            </>
                        ) : (
                            <>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                <span>Outstanding Balance: {formatCurrency(outstandingBalance)}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render appropriate view based on stage group
    switch (stageGroup) {
        case 'pursuit':
            return <PursuitView />;
        case 'execution':
            return <ExecutionView />;
        case 'closeout':
            return <CloseoutView />;
        default:
            return <ExecutionView />;
    }
};

export default SmartFinancialCard;
