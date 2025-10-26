import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      console.log('Attempting login for user:', formData.username);
      
      // Use the API endpoint for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
        credentials: 'include'
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      if (response.ok) {
        const loginData = await response.json();
        console.log('Login successful:', loginData);
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get user info and call onLogin
        console.log('Fetching user status...');
        const userResponse = await fetch('/api/auth/status', {
          credentials: 'include'
        });
        
        console.log('User status response status:', userResponse.status);
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User data received:', userData);
          onLogin(userData);
        } else {
          console.error('Failed to get user status:', userResponse.status);
          setError('Login successful but failed to get user information. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="glassmorphism-login-page">
      {/* Meteor showers */}
      <div className="glassmorphism-meteor1"></div>
      <div className="glassmorphism-meteor2"></div>
      <div className="glassmorphism-meteor3"></div>
      <div className="glassmorphism-meteor4"></div>
      <div className="glassmorphism-meteor5"></div>
      
      <div className="glassmorphism-login-container">
        {/* Company Logo */}
        <div className="glassmorphism-logo-container">
          <img 
            src="/images/firm-logo.jpg" 
            alt="VIMA - The Dimension Logo" 
            className="glassmorphism-logo-img"
          />
          <h2 className="glassmorphism-brand-name">VIMA - THE DIMENSION</h2>
        </div>

        {(error || searchParams.get('error')) && (
          <div className="glassmorphism-error">
            {error || 'Invalid username or password.'}
          </div>
        )}

        {searchParams.get('logout') && (
          <div className="glassmorphism-success">
            You have been logged out.
          </div>
        )}

        <form onSubmit={handleSubmit} className="glassmorphism-form">
          {/* Username Field */}
          <div className="glassmorphism-input-group">
            <i className="fas fa-user glassmorphism-input-icon"></i>
            <label htmlFor="username" className="glassmorphism-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              className="glassmorphism-input"
            />
          </div>

          {/* Password Field */}
          <div className="glassmorphism-input-group">
            <i className="fas fa-lock glassmorphism-input-icon"></i>
            <label htmlFor="password" className="glassmorphism-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="glassmorphism-input"
            />
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="glassmorphism-options">
            <label className="glassmorphism-remember">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="glassmorphism-forgot">Forgot Password?</a>
          </div>

          {/* Login Button */}
          <button type="submit" className="glassmorphism-button">LOGIN</button>
        </form>
      </div>
    </div>
  );
};

export default Login;