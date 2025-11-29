import React from 'react';

const PageHeader = ({ title, subtitle, actions, children }) => {
    return (
        <div className="page-header">
            <div className="page-header-top">
                <div className="page-header-title-section">
                    <h1 className="page-title">{title}</h1>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="page-header-actions">{actions}</div>}
            </div>
            {children && <div className="page-header-content">{children}</div>}
        </div>
    );
};

export default PageHeader;
