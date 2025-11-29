import React from 'react';

const FinancialScorecard = ({ financialData, userRole }) => {
    // Permission check: Only ADMIN and PROJECT_MANAGER can view financials
    const canViewFinancials = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_PROJECT_MANAGER'].some(role =>
        userRole && (Array.isArray(userRole) ? userRole.includes(role) : userRole === role)
    );

    if (!canViewFinancials) return null;

    const { contractAmount = 0, billedAmount = 0 } = financialData || {};
    const balanceDue = contractAmount - billedAmount;

    // Helper to format currency in Indian system (Lakhs/Crores)
    const formatCurrency = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    };

    const billedPercentage = contractAmount > 0 ? (billedAmount / contractAmount) * 100 : 0;

    return (
        <div className="financial-scorecard">
            <div className="financial-card">
                <div className="financial-card-header">
                    <span className="financial-label">Total Contract Value</span>
                    <div className="financial-icon contract">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 3h12M6 8h12M6 13l8.5 10M6 13h3M9 13c6.667 0 6.667-10 0-10" />
                        </svg>
                    </div>
                </div>
                <div className="financial-value">{formatCurrency(contractAmount)}</div>
            </div>

            <div className="financial-card">
                <div className="financial-card-header">
                    <span className="financial-label">Total Billed</span>
                    <div className="financial-icon billed">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="12" y1="18" x2="12" y2="12"></line>
                            <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                    </div>
                </div>
                <div className="financial-value">{formatCurrency(billedAmount)}</div>
                <div className="financial-progress">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${Math.min(billedPercentage, 100)}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">{billedPercentage.toFixed(1)}% of Contract</span>
                </div>
            </div>

            <div className="financial-card">
                <div className="financial-card-header">
                    <span className="financial-label">Balance Due</span>
                    <div className="financial-icon balance">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                </div>
                <div className="financial-value">{formatCurrency(balanceDue)}</div>
            </div>
        </div>
    );
};

export default FinancialScorecard;
