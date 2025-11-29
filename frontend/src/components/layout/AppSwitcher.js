import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppSwitcher = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);

    const apps = [
        {
            id: 'projects',
            name: 'Projects',
            icon: '📊',
            path: '/my-tasks',
            description: 'Manage projects and tasks',
            color: '#6366f1'
        },
        {
            id: 'people',
            name: 'People',
            icon: '👥',
            path: '/people',
            description: 'HR and employee management',
            color: '#8b5cf6',
            comingSoon: true
        },
        {
            id: 'admin',
            name: 'Admin',
            icon: '⚙️',
            path: '/admin/dashboard',
            description: 'System administration',
            color: '#64748b',
            adminOnly: true
        }
    ];

    // Determine current app based on route
    const getCurrentApp = () => {
        const path = location.pathname;
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/people')) return 'people';
        return 'projects'; // Default
    };

    const currentApp = getCurrentApp();
    const currentAppData = apps.find(app => app.id === currentApp);

    // Filter apps based on user role
    const isAdmin = user?.authorities?.some(a => a.authority === 'ROLE_ADMIN');
    const availableApps = apps.filter(app => !app.adminOnly || isAdmin);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAppClick = (app) => {
        if (app.comingSoon) {
            alert('Coming soon!');
            return;
        }
        navigate(app.path);
        setIsOpen(false);
    };

    return (
        <div className="app-switcher" ref={dropdownRef}>
            <button
                className="app-switcher-trigger"
                onClick={() => setIsOpen(!isOpen)}
                title="Switch app"
            >
                <span className="app-switcher-icon">{currentAppData?.icon || '📊'}</span>
                <span className="app-switcher-name">{currentAppData?.name || 'Projects'}</span>
                <svg
                    className={`app-switcher-arrow ${isOpen ? 'open' : ''}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="app-switcher-dropdown">
                    <div className="app-switcher-header">
                        <span className="app-switcher-title">Switch App</span>
                    </div>
                    <div className="app-switcher-grid">
                        {availableApps.map(app => (
                            <button
                                key={app.id}
                                className={`app-card ${app.id === currentApp ? 'active' : ''} ${app.comingSoon ? 'coming-soon' : ''}`}
                                onClick={() => handleAppClick(app)}
                                style={{ '--app-color': app.color }}
                            >
                                <div className="app-card-icon">{app.icon}</div>
                                <div className="app-card-content">
                                    <div className="app-card-name">{app.name}</div>
                                    <div className="app-card-desc">{app.description}</div>
                                    {app.comingSoon && (
                                        <span className="app-card-badge">Coming Soon</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppSwitcher;
