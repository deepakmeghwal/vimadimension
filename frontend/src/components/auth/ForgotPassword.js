import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiPost('/api/auth/forgot-password', { email });
            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
            } else {
                // Still show success to prevent email enumeration
                setSubmitted(true);
            }
        } catch (error) {
            // Still show success to prevent email enumeration
            setSubmitted(true);
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
        successCard: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '450px'
        },
        emailIcon: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2.5rem'
        }
    };

    if (submitted) {
        return (
            <div style={{ ...styles.container, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div style={styles.successCard}>
                    <div style={styles.emailIcon}>✉️</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
                        Check Your Email
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                        If an account exists for:
                    </p>
                    <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                        {email}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
                        You will receive a password reset link shortly.
                        <br /><br />
                        The link will expire in 1 hour for security.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        style={styles.button}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                    >
                        Back
                    </button>
                    <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        Didn't receive the email? Check your spam folder.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Left Panel - Form */}
            <div style={styles.leftPanel}>
                <div>
                    <h1 style={styles.brand}>ARCHIEASE</h1>
                    <h2 style={styles.heading}>Forgot Password?</h2>
                    <p style={styles.subtitle}>
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {error && (
                        <div style={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="email" style={styles.label}>Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoFocus
                                style={styles.input}
                                placeholder="Enter your email"
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                            />
                        </div>

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
                            {loading ? 'Sending...' : 'Send Reset Link'}
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
                        src="/images/forgot_password.png"
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
            `}</style>
        </div>
    );
};

export default ForgotPassword;

