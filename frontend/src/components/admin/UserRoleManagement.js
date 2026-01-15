import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import axios from 'axios';

const UserRoleManagement = ({ user }) => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [targetUser, setTargetUser] = useState(null);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch user's current roles
            const userRolesResponse = await axios.get(
                `/api/admin/users/${userId}/roles`,
                { withCredentials: true }
            );

            // Fetch all available roles
            const rolesResponse = await axios.get(
                '/api/admin/roles',
                { withCredentials: true }
            );

            setTargetUser(userRolesResponse.data);
            setAvailableRoles(rolesResponse.data);
            setSelectedRoles(Array.from(userRolesResponse.data.roleNames || []));
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load user role data');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleToggle = (roleName) => {
        setSelectedRoles(prev => {
            if (prev.includes(roleName)) {
                return prev.filter(r => r !== roleName);
            } else {
                return [...prev, roleName];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await axios.put(
                `/api/admin/users/${userId}/roles`,
                selectedRoles,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert('User roles updated successfully!');
            navigate('/admin/users');
        } catch (err) {
            console.error('Error updating roles:', err);
            alert('Failed to update user roles');
        } finally {
            setSaving(false);
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
                <PageHeader title="Manage User Roles" user={user} />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error || !targetUser) {
        return (
            <div className="main-content">
                <PageHeader title="Manage User Roles" user={user} />
                <div style={{ padding: '2rem' }}>
                    <div className="error-message">{error || 'User not found'}</div>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-secondary"
                        style={{ marginTop: '1rem' }}
                    >
                        ← Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <PageHeader
                title="Manage User Roles"
                subtitle={`Assign roles to ${targetUser.username}`}
                user={user}
                actions={
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            />

            <div style={{ padding: '2rem', maxWidth: '800px' }}>
                {/* User Info Card */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            {targetUser.username}
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            {targetUser.email}
                        </p>
                    </div>
                </div>

                {/* Role Selection */}
                <div className="card">
                    <div style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                            Assign Roles
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {availableRoles.map(role => {
                                const isSelected = selectedRoles.includes(role.name);
                                return (
                                    <label
                                        key={role.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '1rem',
                                            background: isSelected ? '#f8fafc' : 'transparent',
                                            border: `2px solid ${isSelected ? getRoleBadgeColor(role.name) : '#e2e8f0'}`,
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleRoleToggle(role.name)}
                                            style={{
                                                marginRight: '1rem',
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
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
                                            </div>
                                            <p style={{
                                                color: '#64748b',
                                                fontSize: '0.875rem',
                                                margin: '0.5rem 0 0 0'
                                            }}>
                                                {role.description}
                                            </p>
                                            <p style={{
                                                color: '#94a3b8',
                                                fontSize: '0.75rem',
                                                margin: '0.25rem 0 0 0'
                                            }}>
                                                {role.permissions?.size || 0} permissions
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {selectedRoles.length === 0 && (
                            <div style={{
                                padding: '2rem',
                                textAlign: 'center',
                                color: '#ef4444',
                                background: '#fef2f2',
                                borderRadius: '8px',
                                marginTop: '1rem'
                            }}>
                                ⚠️ Warning: User must have at least one role
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Permissions Preview */}
                {selectedRoles.length > 0 && targetUser.permissions && (
                    <div className="card" style={{ marginTop: '1.5rem' }}>
                        <div style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                                Resulting Permissions
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                {Array.from(targetUser.permissions).slice(0, 10).map(perm => (
                                    <span
                                        key={perm}
                                        style={{
                                            padding: '0.25rem 0.5rem',
                                            background: '#f1f5f9',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            color: '#475569'
                                        }}
                                    >
                                        {perm}
                                    </span>
                                ))}
                                {targetUser.permissions.size > 10 && (
                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                        +{targetUser.permissions.size - 10} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserRoleManagement;
