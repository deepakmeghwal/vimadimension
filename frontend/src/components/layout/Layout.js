import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppLauncher from '../common/AppLauncher';
import { getOrganizationLogoProps } from '../../utils/organizationLogo';

const Layout = ({ user, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [logoError, setLogoError] = useState(false);
    const navigate = useNavigate();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    // Get organization name and logo
    const getOrganizationName = () => {
        if (user?.organizationName) {
            return user.organizationName;
        }
        return user?.username || 'User';
    };

    const logoProps = getOrganizationLogoProps(
        user?.organizationLogoUrl,
        getOrganizationName()
    );

    // Reset logo error when logo URL changes
    useEffect(() => {
        setLogoError(false);
    }, [user?.organizationLogoUrl]);

    return (
        <div className="app-layout">
            <Sidebar
                user={user}
                onLogout={onLogout}
                isCollapsed={isCollapsed}
                toggleSidebar={toggleSidebar}
            />
            <main className="main-content-area">
                <header className="content-header">
                    <div className="content-header-logo">
                        {logoProps.hasLogo && !logoError ? (
                            <img
                                src={logoProps.logoUrl}
                                alt="Logo"
                                className="header-logo"
                                style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
                                onError={() => setLogoError(true)}
                            />
                        ) : (
                            <div
                                className="header-logo header-logo-initials"
                                style={{
                                    display: 'flex',
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    flexShrink: 0
                                }}
                            >
                                {logoProps.initials}
                            </div>
                        )}
                        <span className="header-organization-name" style={{ marginLeft: '12px', fontWeight: '600', fontSize: '1.1rem', color: '#1e293b' }}>
                            {getOrganizationName()}
                        </span>
                    </div>
                    <div className="content-header-actions">
                        {/* User Profile */}
                        <div
                            className="header-user-profile"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginRight: '0.5rem',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate('/profile')}
                        >
                            {user?.profileImageUrl || user?.avatarUrl ? (
                                <img
                                    src={user.profileImageUrl || user.avatarUrl}
                                    alt="User"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6366f1',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                                </div>
                            )}
                        </div>
                        <AppLauncher user={user} />
                    </div>
                </header>
                <div className="content-wrapper">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
