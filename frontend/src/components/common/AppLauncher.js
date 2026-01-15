import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';

const AppLauncher = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const drawerRef = useRef(null);
    const { hasAnyPermission, isAdmin, isManager } = usePermissions(user);

    // App definitions with categories
    const allApps = [
        {
            id: 'projects',
            name: 'Projects',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                </svg>
            ),
            path: '/projects',
            description: 'Plan, track, and deliver projects on time.',
            color: '#6366f1', // Indigo
            category: 'PROJECTS MANAGEMENT APPS',
            featured: true,
            requiredPermissions: ['projects.view']
        },
        {
            id: 'tasks',
            name: 'My Tasks',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                </svg>
            ),
            path: '/my-tasks',
            description: 'Track your daily tasks and to-dos.',
            color: '#8b5cf6', // Violet
            category: 'PROJECTS MANAGEMENT APPS',
            requiredPermissions: ['tasks.view']
        },
        {
            id: 'people',
            name: 'People',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            path: '/people',
            description: 'Centralized employee directory and HR management.',
            color: '#10b981', // Emerald
            category: 'HR & PEOPLE',
            requiredPermissions: ['users.view'],
            comingSoon: true
        },
        {
            id: 'payroll',
            name: 'Payroll',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
            ),
            path: '/people/payroll',
            description: 'Manage employee salaries and payslips.',
            color: '#059669', // Green 600
            category: 'HR & PEOPLE',
            requiredPermissions: ['payroll.view'],
            comingSoon: true
        },
        {
            id: 'admin',
            name: 'Admin Center',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
            ),
            path: '/admin/organization',
            description: 'Manage users, roles, and system settings.',
            color: '#ef4444', // Red
            category: 'ADMINISTRATION',
            requiredPermissions: ['users.view', 'organization.view'],
            adminOnly: true
        },
        {
            id: 'financial-health',
            name: 'Financial Health',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
            ),
            path: '/finance/dashboard',
            description: 'Comprehensive financial health dashboard with revenue insights.',
            color: '#10b981', // Emerald
            category: 'FINANCE',
            adminOrManager: true
        },
        {
            id: 'invoices',
            name: 'Invoices',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
            path: '/invoices',
            description: 'Create and manage client invoices.',
            color: '#f59e0b', // Amber
            category: 'FINANCE'
        }
    ];

    // Filter apps based on permissions and search
    const getFilteredApps = () => {
        return allApps.filter(app => {
            // Permission check
            if (app.adminOnly && !isAdmin()) return false;
            if (app.adminOrManager && !isAdmin() && !isManager()) return false;
            if (app.requiredPermissions && !hasAnyPermission(...app.requiredPermissions) && !isAdmin()) return false;

            // Search check
            if (searchTerm && !app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !app.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }

            return true;
        });
    };

    const filteredApps = getFilteredApps();
    const featuredApp = filteredApps.find(app => app.featured);

    // Group by category for the list
    const groupedApps = filteredApps.reduce((acc, app) => {
        if (!acc[app.category]) acc[app.category] = [];
        acc[app.category].push(app);
        return acc;
    }, {});

    // Define category display order
    const categoryOrder = [
        'PROJECTS MANAGEMENT APPS',
        'FINANCE',
        'ADMINISTRATION',
        'HR & PEOPLE'
    ];

    // Sort categories according to the defined order
    const sortedCategories = Object.entries(groupedApps).sort(([catA], [catB]) => {
        const indexA = categoryOrder.indexOf(catA);
        const indexB = categoryOrder.indexOf(catB);
        // If category not in order list, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    // Close on Esc key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleAppClick = (app) => {
        if (app.comingSoon) {
            return;
        }
        navigate(app.path);
        setIsOpen(false);
    };

    return (
        <div className="app-launcher">
            <button
                className="app-launcher-trigger"
                onClick={() => setIsOpen(true)}
                title="ArchiEase Apps"
                aria-label="App launcher"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                </svg>
            </button>

            {/* Overlay */}
            <div
                className={`app-drawer-overlay ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className={`app-drawer ${isOpen ? 'open' : ''}`} ref={drawerRef}>
                <div className="app-drawer-search-container">
                    <div className="app-drawer-search-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search applications"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="app-drawer-search-input"
                            autoFocus={isOpen}
                        />
                    </div>
                </div>

                <div className="app-drawer-content">
                    {/* Featured App Section */}
                    {!searchTerm && featuredApp && (
                        <div className="app-drawer-section">
                            <h3 className="app-drawer-section-title">FEATURED APP</h3>
                            <div
                                className="featured-app-card"
                                onClick={() => handleAppClick(featuredApp)}
                                style={{ '--app-color': featuredApp.color }}
                            >
                                <div className="featured-app-icon-wrapper">
                                    <span className="featured-app-icon">{featuredApp.icon}</span>
                                </div>
                                <div className="featured-app-info">
                                    <h4>{featuredApp.name}</h4>
                                    <p>{featuredApp.description}</p>
                                    <span className="learn-more-link">Launch App &rarr;</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories */}
                    {sortedCategories.map(([category, apps]) => (
                        <div key={category} className="app-drawer-section">
                            <h3 className="app-drawer-section-title">{category}</h3>
                            <div className="app-drawer-grid">
                                {apps.map(app => (
                                    <button
                                        key={app.id}
                                        className={`app-drawer-item ${app.comingSoon ? 'coming-soon' : ''}`}
                                        onClick={() => handleAppClick(app)}
                                    >
                                        <div className="app-drawer-item-icon" style={{ color: app.color }}>
                                            {app.icon}
                                        </div>
                                        <span className="app-drawer-item-name">{app.name}</span>
                                        {app.comingSoon && <span className="badge-soon">SOON</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {filteredApps.length === 0 && (
                        <div className="no-apps-found">
                            <p>No apps found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppLauncher;
