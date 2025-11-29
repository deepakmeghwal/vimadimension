import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiPost, getApiUrl } from '../../utils/api';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setIsLoading(true);

    try {
      console.log('Attempting login for user:', formData.username);

      const response = await apiPost('/api/auth/login', {
        username: formData.username,
        password: formData.password
      });

      if (response.ok) {
        const loginData = await response.json();
        console.log('Login successful:', loginData);

        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 100));

        const statusUrl = getApiUrl('/api/auth/status');
        const userResponse = await fetch(statusUrl, {
          credentials: 'include'
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          onLogin(userData);
        } else {
          setError('Login successful but failed to get user information. Please try again.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles matching register page
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif",
      backgroundColor: 'white'
    },
    leftPanel: {
      flex: 1,
      backgroundColor: 'white',
      color: '#0f172a',
      padding: '4rem 6rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '50%'
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '0',
      paddingLeft: '2rem',
      backgroundColor: 'white',
      position: 'relative'
    },
    brand: {
      fontSize: '1.5rem',
      fontWeight: '700',
      marginBottom: '2rem',
      letterSpacing: '-0.025em',
      background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    },
    heading: {
      fontSize: '2.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      marginBottom: '1rem',
      color: '#0f172a'
    },
    subtitle: {
      fontSize: '1rem',
      color: '#64748b',
      marginBottom: '3rem',
      lineHeight: '1.6'
    },
    inputGroup: {
      marginBottom: '1.5rem'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#334155',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #cbd5e1',
      fontSize: '1rem',
      transition: 'border-color 0.2s',
      outline: 'none'
    },
    button: {
      width: '100%',
      padding: '0.875rem',
      backgroundColor: '#6366f1',
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      marginTop: '1rem'
    },
    imageContainer: {
      width: '100%',
      maxWidth: '100%',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start'
    },
    image: {
      width: '90%',
      maxWidth: '750px',
      height: 'auto',
      borderRadius: '0',
      boxShadow: 'none',
      border: 'none',
      opacity: 1,
      display: 'block'
    },
    errorBox: {
      padding: '0.75rem',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      color: '#ef4444',
      fontSize: '0.875rem',
      textAlign: 'center',
      marginBottom: '1.5rem'
    },
    successBox: {
      padding: '0.75rem',
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
      color: '#22c55e',
      fontSize: '0.875rem',
      textAlign: 'center',
      marginBottom: '1.5rem'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    checkbox: {
      marginRight: '0.5rem'
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#64748b'
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Login Form */}
      <div style={styles.leftPanel}>
        <div>
          <h1 style={styles.brand}>KOMOREBI</h1>
          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.subtitle}>
            Sign in to your account to continue managing your projects and team.
          </p>

          {(error || searchParams.get('error')) && (
            <div style={styles.errorBox}>
              {error || 'Invalid username or password.'}
            </div>
          )}

          {searchParams.get('logout') && (
            <div style={styles.successBox}>
              You have been logged out.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>Work Email</label>
              <input
                type="email"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                autoFocus
                style={styles.input}
                placeholder="Enter your work email"
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter your password"
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id="remember"
                  defaultChecked
                  style={styles.checkbox}
                />
                <label htmlFor="remember" style={styles.checkboxLabel}>
                  Remember me
                </label>
              </div>
              <span
                onClick={() => navigate('/forgot-password')}
                style={{ color: '#6366f1', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#4f46e5')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#6366f1')}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}>Sign up</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden-mobile" style={styles.rightPanel}>
        <div style={styles.imageContainer}>
          <img
            src="/images/login.png"
            alt="Login illustration"
            style={styles.image}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
