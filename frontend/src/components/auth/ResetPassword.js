import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('validating'); // 'validating', 'valid', 'invalid', 'success'
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (token) {
            validateToken();
        } else {
            setStatus('invalid');
            setErrorMessage('No reset token provided');
        }
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await apiGet(`/api/auth/validate-reset-token?token=${token}`);
            const data = await response.json();

            if (data.valid) {
                setStatus('valid');
                setEmail(data.email || '');
            } else {
                setStatus('invalid');
                setErrorMessage(data.message || 'Invalid or expired reset link');
            }
        } catch (error) {
            setStatus('invalid');
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await apiPost('/api/auth/reset-password', {
                token,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setErrors({ submit: data.message || 'Failed to reset password' });
            }
        } catch (error) {
            setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: 'white'
        },
        centerContainer: {
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f8fafc',
            padding: '2rem'
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
            width: '110%',
            maxWidth: '900px',
            height: 'auto',
            borderRadius: '0',
            boxShadow: 'none',
            border: 'none',
            opacity: 1,
            display: 'block'
        },
        error: {
            color: '#ef4444',
            fontSize: '0.875rem',
            marginTop: '0.25rem'
        },
        card: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '450px',
            width: '100%'
        },
        iconCircle: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem'
        },
        successIcon: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
        errorIcon: {
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        },
        loadingIcon: {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        },
        spinner: {
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    // Validating token
    if (status === 'validating') {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconCircle, ...styles.loadingIcon }}>
                        <div style={styles.spinner}></div>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#6366f1', marginBottom: '1rem' }}>
                        Validating Link
                    </h2>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                        Please wait while we verify your reset link...
                    </p>
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // Invalid token
    if (status === 'invalid') {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconCircle, ...styles.errorIcon }}>
                        ✕
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                        Invalid Reset Link
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                        {errorMessage}
                        <br /><br />
                        The link may have expired or already been used.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            style={{
                                ...styles.button,
                                backgroundColor: 'transparent',
                                color: '#6366f1',
                                border: '1px solid #6366f1',
                                width: 'auto',
                                padding: '0.75rem 1.5rem'
                            }}
                        >
                            Request New Link
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{ ...styles.button, width: 'auto', padding: '0.75rem 1.5rem' }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success
    if (status === 'success') {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconCircle, ...styles.successIcon }}>
                        ✓
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669', marginBottom: '1rem' }}>
                        Password Reset Successful!
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your password has been updated successfully.
                        <br /><br />
                        You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.button}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Valid token - show reset form
    return (
        <div style={styles.container}>
            {/* Left Panel - Form */}
            <div style={styles.leftPanel}>
                <div>
                    <h1 style={styles.brand}>ARCHIEASE</h1>
                    <h2 style={styles.heading}>Reset Password</h2>
                    <p style={styles.subtitle}>
                        Create a new password for <strong>{email}</strong>
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="newPassword" style={styles.label}>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.newPassword ? '#ef4444' : '#cbd5e1'
                                    }}
                                    placeholder="Min. 8 characters"
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    onBlur={(e) => e.target.style.borderColor = errors.newPassword ? '#ef4444' : '#cbd5e1'}
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
                            {errors.newPassword && <div style={styles.error}>{errors.newPassword}</div>}
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.input,
                                        borderColor: errors.confirmPassword ? '#ef4444' : '#cbd5e1'
                                    }}
                                    placeholder="Confirm your password"
                                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                    onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#cbd5e1'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                            {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}
                        </div>

                        {errors.submit && (
                            <div style={{
                                padding: '0.75rem',
                                background: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '8px',
                                color: '#ef4444',
                                fontSize: '0.875rem',
                                textAlign: 'center',
                                marginBottom: '1rem'
                            }}>
                                {errors.submit}
                            </div>
                        )}

                        <button
                            type="submit"
                            style={{
                                ...styles.button,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                            disabled={loading}
                            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#4f46e5')}
                            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#6366f1')}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                        Remember your password?{' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Sign in
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Image */}
            <div className="hidden-mobile" style={styles.rightPanel}>
                <div style={styles.imageContainer}>
                    <img
                        src="/images/login.png"
                        alt="Password reset illustration"
                        style={styles.image}
                    />
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile {
                        display: none !important;
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;








