import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser = ({ isPeopleContext = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    specialization: '',
    bio: '',
    role: 'ROLE_USER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = [
    { value: 'ROLE_USER', label: 'User' },
    { value: 'ROLE_MANAGER', label: 'Manager' },
    { value: 'ROLE_ADMIN', label: 'Admin' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          designation: formData.designation,
          specialization: formData.specialization,
          bio: formData.bio,
          role: formData.role
        })
      });

      if (response.ok) {
        setSuccess('User created successfully!');
        setFormData({
          username: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          designation: '',
          specialization: '',
          bio: '',
          role: 'ROLE_USER'
        });
        // Optional: redirect after success?
        // setTimeout(() => navigate(isPeopleContext ? '/people/directory' : '/admin/users'), 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const backPath = isPeopleContext ? '/people/directory' : '/admin/dashboard';
  const backLabel = isPeopleContext ? 'Back to Directory' : 'Back to Admin Dashboard';

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">Create New Person</h1>
        <div className="page-actions">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            {backLabel}
          </button>
        </div>
      </div>

      <div className="project-card">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Name *:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation:</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="specialization">Specialization:</label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Enter specialization"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *:</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Enter user bio (optional)"
            />
          </div>

          <div className="project-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Person'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
