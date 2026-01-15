import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import axios from 'axios';

const RolesList = ({ user, isPeopleContext = false }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/roles', {
                withCredentials: true
            });
            const filteredRoles = response.data.filter(role => !['ROLE_GUEST', 'ROLE_USER'].includes(role.name));
            setRoles(filteredRoles);
            setError(null);
        } catch (err) {
            console.error('Error fetching roles:', err);
            setError(`Failed to load roles: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (roleName) => {
        const colorMap = {
            'ROLE_ADMIN': '#ef4444',
            'ROLE_HR': '#8b5cf6',
            'ROLE_MANAGER': '#3b82f6',
            'ROLE_EMPLOYEE': '#10b981',
            'ROLE_GUEST': '#64748b'
        };
        return colorMap[roleName] || '#6366f1';
    };

    if (loading) {
        return (
            <div className="main-content">
                <PageHeader title="Roles & Permissions" user={user} />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading roles...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <PageHeader title="Roles & Permissions" user={user} />
                <div style={{ padding: '2rem' }}>
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <PageHeader
                title={isPeopleContext ? "Directory Roles" : "Roles & Permissions"}
                subtitle="Manage system roles and their permissions"
                user={user}
            />

            <div style={{ padding: '2rem' }}>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Description</th>
                                <th>Permissions</th>
                                <th>Users</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map(role => (
                                <tr key={role.id}>
                                    <td>
                                        <span
                                            className="badge"
                                            style={{
                                                background: getRoleBadgeColor(role.name),
                                                color: '#ffffff',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {role.name.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td>{role.description}</td>
                                    <td>
                                        <span className="text-muted">
                                            {role.permissions?.size || 0} permissions
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-muted">
                                            {role.userCount || 0} users
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={isPeopleContext ? `/people/roles/${role.id}` : `/admin/roles/${role.id}`}
                                            className="btn-link"
                                            style={{
                                                color: '#6366f1',
                                                textDecoration: 'none',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            View Details →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {roles.length === 0 && (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        <p>No roles found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RolesList;
