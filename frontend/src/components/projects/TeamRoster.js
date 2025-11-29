import React, { useState, useEffect } from 'react';

const TeamRoster = ({ tasks, project }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addingUser, setAddingUser] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const projectId = project?.id;

    useEffect(() => {
        if (projectId) {
            fetchTeamMembers();
        }
    }, [projectId]);

    const fetchTeamMembers = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/projects/${projectId}/team`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.team) {
                    setTeamMembers(data.team);
                }
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            setError('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        if (!projectId) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/team/available`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.users) {
                    setAvailableUsers(data.users);
                    setFilteredUsers(data.users);
                }
            }
        } catch (error) {
            console.error('Error fetching available users:', error);
        }
    };

    // Filter users based on search query
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(availableUsers);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = availableUsers.filter(user => {
                const name = (user.name || user.username || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                const designation = (user.designation || '').toLowerCase();
                return name.includes(query) || email.includes(query) || designation.includes(query);
            });
            setFilteredUsers(filtered);
        }
    }, [searchQuery, availableUsers]);

    const handleAddUser = async (userId) => {
        if (!projectId) return;

        try {
            setAddingUser(true);
            setError('');
            setSuccess('');

            const response = await fetch(`/api/projects/${projectId}/team/${userId}`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuccess('User added to project successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                    setShowAddModal(false);
                    // Refresh team members and available users
                    fetchTeamMembers();
                    fetchAvailableUsers();
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to add user' }));
                setError(errorData.error || 'Failed to add user to project');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Failed to add user to project');
        } finally {
            setAddingUser(false);
        }
    };

    const handleRemoveUser = async (userId, userName) => {
        if (!projectId) return;

        if (!window.confirm(`Are you sure you want to remove ${userName} from this project?`)) {
            return;
        }

        try {
            setRemovingUserId(userId);
            setError('');
            setSuccess('');

            const response = await fetch(`/api/projects/${projectId}/team/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuccess('User removed from project successfully!');
                    setTimeout(() => setSuccess(''), 3000);
                    // Refresh team members and available users
                    fetchTeamMembers();
                    fetchAvailableUsers();
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to remove user' }));
                setError(errorData.error || 'Failed to remove user from project');
            }
        } catch (error) {
            console.error('Error removing user:', error);
            setError('Failed to remove user from project');
        } finally {
            setRemovingUserId(null);
        }
    };

    const handleOpenAddModal = () => {
        setShowAddModal(true);
        fetchAvailableUsers();
        setError('');
        setSuccess('');
        setSearchQuery('');
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setError('');
        setSuccess('');
        setSearchQuery('');
    };

    if (!projectId) return null;

    return (
        <div className="team-roster-section">
            <div className="tab-header-standard">
                <h3 className="tab-header-title">Team Members</h3>
                <button
                    className="btn-primary-modern"
                    onClick={handleOpenAddModal}
                >
                    Add Member
                </button>
            </div>

            {success && (
                <div className="modern-alert success" style={{ marginBottom: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {success}
                </div>
            )}

            {error && (
                <div className="modern-alert error" style={{ marginBottom: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading team members...</p>
                </div>
            ) : teamMembers.length === 0 ? (
                <div className="empty-state-modern">
                    <div className="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <h3>No team members assigned</h3>
                    <p>Start by adding team members to this project</p>
                    <button
                        className="btn-primary-modern"
                        onClick={handleOpenAddModal}
                        style={{ marginTop: '1rem' }}
                    >
                        Add First Team Member
                    </button>
                </div>
            ) : (
                <div className="team-grid-modern">
                    {teamMembers.map(member => (
                        <div key={member.id} className="team-member-card-modern">
                            <div className="team-member-card-header">
                                <div className="team-member-avatar">
                                    {member.name ? member.name.charAt(0).toUpperCase() : member.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="team-member-info">
                                    <h4 className="team-member-name">{member.name || member.username}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {member.designation && (
                                            <span className="team-member-designation">{member.designation}</span>
                                        )}
                                        {member.designation && <span style={{ color: '#cbd5e1' }}>•</span>}
                                        <span className="team-member-email">{member.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="team-member-actions">
                                <button
                                    className="btn-icon-modern btn-icon-danger"
                                    onClick={() => handleRemoveUser(member.id, member.name || member.username)}
                                    disabled={removingUserId === member.id}
                                    title="Remove from project"
                                    style={{ width: '32px', height: '32px' }}
                                >
                                    {removingUserId === member.id ? (
                                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Team Member Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={handleCloseAddModal}>
                    <div className="modal-container-modern" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <div className="modal-header-content">
                                <div className="modal-icon-wrapper">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="modal-title">Add Team Member</h2>
                                    <p className="modal-subtitle">Select a user to add to this project</p>
                                </div>
                            </div>
                            <button className="modal-close-button" onClick={handleCloseAddModal}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body-modern">
                            {/* Search Input */}
                            <div className="search-input-container" style={{ marginBottom: '1.5rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                    type="text"
                                    className="search-input-modern"
                                    placeholder="Search by name, email, or designation..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 3rem',
                                        border: '1.5px solid #e5e7eb',
                                        borderRadius: '10px',
                                        fontSize: '0.9375rem',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div className="empty-state-modern" style={{ padding: '2rem 0' }}>
                                    {searchQuery ? (
                                        <>
                                            <div className="empty-state-icon" style={{ width: '64px', height: '64px', margin: '0 auto 1rem', color: '#cbd5e1' }}>
                                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                </svg>
                                            </div>
                                            <p style={{ color: '#64748b', margin: 0 }}>No users found matching "{searchQuery}"</p>
                                        </>
                                    ) : (
                                        <p style={{ color: '#64748b', margin: 0 }}>All available users are already assigned to this project.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="available-users-list">
                                    {filteredUsers.map(user => (
                                        <div key={user.id} className="available-user-item">
                                            <div className="available-user-info">
                                                <div className="available-user-avatar">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div className="available-user-name">{user.name || user.username}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                                        {user.designation && (
                                                            <span>{user.designation}</span>
                                                        )}
                                                        {user.designation && <span>•</span>}
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-primary-modern"
                                                onClick={() => handleAddUser(user.id)}
                                                disabled={addingUser}
                                                style={{ minWidth: '100px' }}
                                            >
                                                {addingUser ? 'Adding...' : 'Add'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamRoster;