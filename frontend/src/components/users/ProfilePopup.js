import React, { useState, useEffect, useRef } from 'react';
import ProfileImageUpload from './ProfileImageUpload';

// Get API base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper to build full API URL
const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE_URL) {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${cleanEndpoint}`;
  }
  return cleanEndpoint;
};

const ProfilePopup = ({ user, isOpen, onClose, onUserUpdate, triggerRef }) => {
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef(null);

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Editing State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    designation: '',
    specialization: '',
    licenseNumber: '',
    portfolioLink: ''
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Fetch fresh user data when popup opens
  useEffect(() => {
    if (isOpen) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          const statusUrl = getApiUrl('/api/auth/status');
          const response = await fetch(statusUrl, {
            credentials: 'include'
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
            setProfileData({
              name: userData.name || '',
              email: userData.email || '',
              bio: userData.bio || '',
              designation: userData.designation || '',
              specialization: userData.specialization || '',
              licenseNumber: userData.licenseNumber || '',
              portfolioLink: userData.portfolioLink || ''
            });
            setProfileImageUrl(userData.profileImageUrl || null);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    } else {
      setIsEditing(false);
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if image upload modal is open
      if (showImageUploadModal) return;
      
      // Check if click is on the image upload modal
      if (event.target.closest('.password-modal-overlay') || event.target.closest('.password-modal')) {
        return;
      }
      
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target) &&
          triggerRef?.current && !triggerRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      // Only close with Escape if image upload modal is not open
      if (e.key === 'Escape' && !showImageUploadModal) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef, showImageUploadModal]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage('');

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || !profileData.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Name and Email are required' });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileMessage('');

    try {
      const response = await fetch('/api/profile/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          bio: profileData.bio,
          designation: profileData.designation,
          specialization: profileData.specialization,
          licenseNumber: profileData.licenseNumber,
          portfolioLink: profileData.portfolioLink
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        const statusUrl = getApiUrl('/api/auth/status');
        const refreshResponse = await fetch(statusUrl, {
          credentials: 'include'
        });
        if (refreshResponse.ok) {
          const userData = await refreshResponse.json();
          setCurrentUser(userData);
        }
        if (onUserUpdate) onUserUpdate();
        setIsEditing(false);
      } else {
        setProfileMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="profile-popup-overlay" 
        onClick={(e) => {
          // Don't close if image upload modal is open
          if (!showImageUploadModal) {
            onClose();
          }
        }}
      ></div>
      <div className="profile-popup" ref={popupRef}>
        <div className="profile-popup-header">
          <h2>Profile</h2>
          <button onClick={onClose} className="profile-popup-close">×</button>
        </div>

        <div className="profile-popup-content">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="profile-popup-header-section">
                <div
                  className="profile-popup-avatar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageUploadModal(true);
                  }}
                  title="Click to change profile picture"
                >
                  {profileImageUrl || currentUser?.profileImageUrl || currentUser?.avatarUrl ? (
                    <img
                      src={profileImageUrl || currentUser.profileImageUrl || currentUser.avatarUrl}
                      alt="Profile"
                    />
                  ) : (
                    <div className="profile-popup-avatar-placeholder">
                      {(currentUser?.firstName?.[0] || currentUser?.username?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-popup-info">
                  <h3>{currentUser?.name || 'User Name'}</h3>
                  <p>{currentUser?.designation || 'Team Member'}</p>
                  {currentUser?.specialization && (
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{currentUser.specialization}</p>
                  )}
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Joined {formatDate(currentUser?.createdAt)}
                  </p>
                </div>
                {!isEditing && (
                  <button
                    className="btn-primary"
                    onClick={() => setIsEditing(true)}
                    style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {!isEditing ? (
                <>
                  {/* Profile Details */}
                  <div className="profile-popup-section">
                    <h4>About</h4>
                    <p style={{ color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {currentUser?.bio || "No bio information provided. Click 'Edit' to add a summary about yourself."}
                    </p>
                  </div>

                  {currentUser?.email && (
                    <div className="profile-popup-section">
                      <h4>Email</h4>
                      <p style={{ color: '#64748b' }}>{currentUser.email}</p>
                    </div>
                  )}

                  {currentUser?.licenseNumber && (
                    <div className="profile-popup-section">
                      <h4>License Number</h4>
                      <p style={{ color: '#64748b' }}>{currentUser.licenseNumber}</p>
                    </div>
                  )}

                  {currentUser?.portfolioLink && (
                    <div className="profile-popup-section">
                      <h4>Portfolio</h4>
                      <a href={currentUser.portfolioLink} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                        {currentUser.portfolioLink}
                      </a>
                    </div>
                  )}

                  <div className="profile-popup-section">
                    <h4>Role</h4>
                    <p style={{ color: '#64748b' }}>
                      {currentUser?.authorities?.map(a => a.authority.replace('ROLE_', '')).join(', ') || 'Member'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="profile-popup-edit-section">
                  <div className="profile-popup-edit-header">
                    <h3>Edit Profile</h3>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleProfileUpdate} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        required
                        disabled={currentUser?.email && currentUser.email.trim() !== ''}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Designation</label>
                      <input
                        type="text"
                        value={profileData.designation}
                        onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                        className="form-input"
                        placeholder="e.g., Principal Architect"
                      />
                    </div>

                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                        className="form-input"
                        placeholder="e.g., Sustainable Design"
                      />
                    </div>

                    <div className="form-group">
                      <label>License Number</label>
                      <input
                        type="text"
                        value={profileData.licenseNumber}
                        onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Portfolio Link</label>
                      <input
                        type="url"
                        value={profileData.portfolioLink}
                        onChange={(e) => setProfileData({ ...profileData, portfolioLink: e.target.value })}
                        className="form-input"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows="4"
                        className="form-textarea"
                        placeholder="Tell us a bit about yourself..."
                      />
                    </div>

                    {profileMessage && (
                      <div className={`alert ${profileMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: '1rem' }}>
                        {profileMessage.text}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button type="submit" className="btn-primary" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>

                  {/* Password Section */}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                    <h4 style={{ marginBottom: '1rem' }}>Change Password</h4>
                    <form onSubmit={handlePasswordChange}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength="6"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          minLength="6"
                          className="form-input"
                        />
                      </div>

                      {passwordMessage && (
                        <div className={`alert ${passwordMessage.type === 'error' ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: '1rem' }}>
                          {passwordMessage.text}
                        </div>
                      )}

                      <button type="submit" className="btn-primary" disabled={isChangingPassword} style={{ marginTop: '1rem' }}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Image Upload Modal */}
      {showImageUploadModal && (
        <div 
          className="password-modal-overlay"
          onClick={(e) => {
            // Only close modal if clicking directly on overlay, not on modal content
            if (e.target === e.currentTarget) {
              setShowImageUploadModal(false);
            }
          }}
        >
          <div 
            className="password-modal image-upload-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="password-modal-header">
              <h3>Update Profile Picture</h3>
              <button onClick={() => setShowImageUploadModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <ProfileImageUpload
                currentImageUrl={profileImageUrl || currentUser?.profileImageUrl}
                onUploadSuccess={(newImageUrl) => {
                  setProfileImageUrl(newImageUrl);
                  const fetchUserData = async () => {
                    try {
                      const statusUrl = getApiUrl('/api/auth/status');
                      const response = await fetch(statusUrl, {
                        credentials: 'include'
                      });
                      if (response.ok) {
                        const userData = await response.json();
                        setCurrentUser(userData);
                      }
                    } catch (error) {
                      console.error('Failed to refresh user data:', error);
                    }
                  };
                  fetchUserData();
                  if (onUserUpdate) onUserUpdate();
                  setTimeout(() => setShowImageUploadModal(false), 500);
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
                onDelete={() => {
                  setProfileImageUrl(null);
                  const fetchUserData = async () => {
                    try {
                      const statusUrl = getApiUrl('/api/auth/status');
                      const response = await fetch(statusUrl, {
                        credentials: 'include'
                      });
                      if (response.ok) {
                        const userData = await response.json();
                        setCurrentUser(userData);
                      }
                    } catch (error) {
                      console.error('Failed to refresh user data:', error);
                    }
                  };
                  fetchUserData();
                  if (onUserUpdate) onUserUpdate();
                }}
                maxSizeMB={2}
              />
              <p className="upload-tip">
                Your profile picture will be visible to other members of your organization.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePopup;

