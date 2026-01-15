import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RoleDetails = ({ user, isPeopleContext = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoleDetails();
    }, [id]);

    const fetchRoleDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/admin/roles/${id}`, {
                withCredentials: true
            });
            setRole(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching role details:', err);
            setError('Failed to load role details');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (roleName) => {
        const colorMap = {
            'ROLE_ADMIN': 'badge-danger',
            'ROLE_HR': 'badge-purple',
            'ROLE_MANAGER': 'badge-primary',
            'ROLE_EMPLOYEE': 'badge-success',
            'ROLE_GUEST': 'badge-secondary'
        };
        return colorMap[roleName] || 'badge-primary';
    };

    const groupPermissionsByResource = (permissions) => {
        const grouped = {};
        if (!permissions) return grouped;

        Array.from(permissions).forEach(perm => {
            const [resource, action] = perm.split('.');
            if (!grouped[resource]) {
                grouped[resource] = [];
            }
            grouped[resource].push(action);
        });

        return grouped;
    };

    const backPath = isPeopleContext ? '/people/roles' : '/admin/roles';

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-spinner-container">
                    <div className="loading-spinner"></div>
                    <p>Loading role details...</p>
                </div>
            </div>
        );
    }

    if (error || !role) {
        return (
            <div className="main-content">
                <div className="page-header-modern">
                    <div>
                        <h1 className="page-title-modern">Role Details</h1>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-outline-modern"
                    >
                        <i className="fas fa-arrow-left"></i> Back
                    </button>
                </div>
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-circle"></i> {error || 'Role not found'}
                </div>
            </div>
        );
    }

    const groupedPermissions = groupPermissionsByResource(role.permissions);

    return (
        <div className="main-content">
            <div className="page-header-modern">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <h1 className="page-title-modern">{role.name.replace('ROLE_', '').replace(/_/g, ' ')}</h1>
                        <span className={`badge ${getRoleBadgeColor(role.name)}`}>
                            {role.name}
                        </span>
                    </div>
                    <p className="page-subtitle">{role.description || 'No description provided'}</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="btn-outline-modern"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
            </div>

            <div className="project-details-grid">
                {/* Role Stats */}
                <div className="project-card">
                    <div className="project-card-header">
                        <h3 className="project-card-title">Overview</h3>
                    </div>
                    <div className="project-card-body">
                        <div className="stats-grid-modern">
                            <div className="stat-card-modern">
                                <div className="stat-icon-modern primary">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                </div>
                                <div className="stat-content-modern">
                                    <span className="stat-value-modern">{role.permissions?.size || 0}</span>
                                    <span className="stat-label-modern">Permissions</span>
                                </div>
                            </div>
                            <div className="stat-card-modern">
                                <div className="stat-icon-modern success">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div className="stat-content-modern">
                                    <span className="stat-value-modern">{role.userCount || 0}</span>
                                    <span className="stat-label-modern">Users Assigned</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="project-card">
                    <div className="project-card-header">
                        <h3 className="project-card-title">Permissions</h3>
                    </div>
                    <div className="project-card-body">
                        {Object.keys(groupedPermissions).length === 0 ? (
                            <div className="empty-state-modern">
                                <p>No permissions assigned to this role</p>
                            </div>
                        ) : (
                            <div className="permissions-grid-modern">
                                {Object.entries(groupedPermissions).map(([resource, actions]) => (
                                    <div key={resource} className="permission-group-card">
                                        <h4 className="permission-group-title">
                                            {resource.charAt(0).toUpperCase() + resource.slice(1)}
                                        </h4>
                                        <div className="permission-tags">
                                            {actions.map(action => (
                                                <span key={action} className="permission-tag">
                                                    {action}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleDetails;
