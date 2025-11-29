import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDetailsModal from './UserDetailsModal';

const UsersList = ({ isPeopleContext = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    itemsPerPage: 20,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (authorized) {
      fetchUsers();
    }
  }, [authorized, pagination.currentPage, searchQuery]);

  const checkAccess = async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        // Check for admin role OR specific permission if in people context
        const isAdmin = userData.authorities?.some(auth => auth.authority === 'ROLE_ADMIN');
        const hasViewPermission = userData.authorities?.some(auth => auth.authority === 'users.view' || auth.authority === 'ROLE_ADMIN');

        if (isPeopleContext ? hasViewPermission : isAdmin) {
          setAuthorized(true);
        } else {
          setError('Access denied. Insufficient privileges.');
          setTimeout(() => navigate('/projects'), 3000);
        }
      } else {
        setError('Please login to access this page.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed.');
      setTimeout(() => navigate('/login'), 3000);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.itemsPerPage.toString()
      });

      if (searchQuery) {
        params.append('query', searchQuery);
      }

      const response = await fetch(`/api/admin/users/paginated?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 0,
          totalItems: data.totalElements || 0,
          hasNext: !data.last,
          hasPrevious: !data.first
        }));
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || errorData.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleToggleUserStatus = async (userId, currentStatus, e) => {
    e.stopPropagation();
    if (togglingStatus) return;

    setTogglingStatus(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !currentStatus }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update the user in the local state
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, enabled: !currentStatus }
            : user
        ));
      } else {
        setError(data.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status');
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUserId(null);
  };

  if (checkingAuth) {
    return (
      <div className="main-content">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      </div>
    );
  }

  const basePath = isPeopleContext ? '/people/directory' : '/admin/users';

  return (
    <div className="main-content">
      <div className="page-header">
        <div className="page-header-top">
          <div className="page-header-title-section">
            <h1 className="page-title">{isPeopleContext ? 'People Directory' : 'All Users'}</h1>
            <p className="page-subtitle">Manage your organization's users and roles</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  padding: '0.625rem 1rem 0.625rem 2.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  minWidth: '250px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  pointerEvents: 'none'
                }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>

            {/* View Mode Toggles */}
            <div className="view-toggles" style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="List View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'white' : 'transparent',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Grid View"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>

            <button
              onClick={() => navigate(isPeopleContext ? '/people/invitations' : '/admin/invitations')}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Invite People
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="project-card">
        <div className="project-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="project-card-title">User List ({pagination.totalItems})</h3>
        </div>
        <div className="project-card-body" style={{ padding: 0 }}>
          <div className="data-table-container">
            {loading ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="empty-state-modern">
                <div className="empty-state-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>No users found</h3>
                <p>{searchQuery ? 'Try adjusting your search terms.' : 'Invite your first user to get started.'}</p>
                {!searchQuery && (
                  <button
                    className="btn-primary"
                    onClick={() => navigate(isPeopleContext ? '/people/invitations' : '/admin/invitations')}
                    style={{ marginTop: '0.75rem' }}
                  >
                    Invite People
                  </button>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'list' ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} onClick={() => handleUserClick(user.id)} style={{ cursor: 'pointer' }}>
                          <td>
                            <div className="font-weight-medium text-dark">
                              {user.name || user.username}
                            </div>
                          </td>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${(Array.isArray(user.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.name || r.authority) === 'ROLE_ADMIN')) || (Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')) ? 'badge-priority high' : 'badge-priority low'}`}>
                              {Array.isArray(user.roles) ? user.roles.map(r => {
                                const roleName = typeof r === 'string' ? r : (r.name || r.authority || '');
                                return roleName.replace('ROLE_', '');
                              }).join(', ') : 'No role'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.enabled ? 'badge-status completed' : 'badge-status blocked'}`}>
                              {user.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`${basePath}/${user.id}/edit`);
                                }}
                                className="btn-icon-modern"
                                title="Edit"
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </button>
                              <button
                                onClick={(e) => handleToggleUserStatus(user.id, user.enabled, e)}
                                className={`btn-icon-modern ${user.enabled ? 'text-danger' : 'text-success'}`}
                                title={user.enabled ? 'Deactivate' : 'Activate'}
                                disabled={togglingStatus}
                              >
                                <i className={`fas ${user.enabled ? 'fa-ban' : 'fa-check-circle'}`}></i>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(isPeopleContext ? `/people/roles` : `/admin/users/${user.id}/roles`);
                                }}
                                className="btn-icon-modern"
                                title="Manage Roles"
                              >
                                <i className="fas fa-user-shield"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="users-grid" style={{ padding: '1rem' }}>
                    {users.map(user => (
                      <div key={user.id} className="user-card" onClick={() => handleUserClick(user.id)} style={{ cursor: 'pointer' }}>
                        <div className="user-header">
                          <h3>{user.name || user.username}</h3>
                          <span className={`badge ${(Array.isArray(user.roles) && user.roles.some(r => (typeof r === 'string' ? r : r.name || r.authority) === 'ROLE_ADMIN')) || (Array.isArray(user.roles) && user.roles.includes('ROLE_ADMIN')) ? 'badge-priority high' : 'badge-priority low'}`}>
                            {Array.isArray(user.roles) ? user.roles.map(r => {
                              const roleName = typeof r === 'string' ? r : (r.name || r.authority || '');
                              return roleName.replace('ROLE_', '');
                            }).join(', ') : 'No role'}
                          </span>
                        </div>

                        <div className="user-details">
                          <p><strong>Username:</strong> {user.username}</p>
                          {user.email && <p><strong>Email:</strong> {user.email}</p>}
                          {user.designation && <p><strong>Designation:</strong> {user.designation}</p>}
                          <p><strong>Status:</strong>
                            <span className={`badge ${user.enabled ? 'badge-status completed' : 'badge-status blocked'}`} style={{ marginLeft: '0.5rem' }}>
                              {user.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>

                        <div className="user-actions" style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`${basePath}/${user.id}/edit`);
                            }}
                            className="btn-outline"
                            style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleToggleUserStatus(user.id, user.enabled, e)}
                            className="btn-outline"
                            style={{ flex: 1, fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                            disabled={togglingStatus}
                          >
                            {togglingStatus ? '...' : user.enabled ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pagination.totalPages > 1 && (
                  <div className="pagination-controls" style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div className="pagination-info" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Showing {pagination.currentPage * pagination.itemsPerPage + 1} to {Math.min((pagination.currentPage + 1) * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                        className="btn-outline"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="btn-outline"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={handleCloseModal}
        userId={selectedUserId}
        isPeopleContext={isPeopleContext}
      />
    </div>
  );
};

export default UsersList;
