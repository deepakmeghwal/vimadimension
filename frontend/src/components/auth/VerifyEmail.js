import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/api';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const [organizationName, setOrganizationName] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('No verification token provided');
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await apiGet(`/api/organization/verify?token=${token}`);
            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setOrganizationName(data.organizationName || 'Your organization');
                setMessage('Your email has been verified successfully!');
            } else {
                setStatus('error');
                setMessage(data.message || 'Verification failed');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f8fafc',
            padding: '2rem'
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
        heading: {
            fontSize: '1.75rem',
            fontWeight: '700',
            marginBottom: '1rem'
        },
        successHeading: {
            color: '#059669'
        },
        errorHeading: {
            color: '#dc2626'
        },
        loadingHeading: {
            color: '#6366f1'
        },
        message: {
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: '1.6'
        },
        button: {
            padding: '0.875rem 2rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
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

    const renderContent = () => {
        if (status === 'verifying') {
            return (
                <>
                    <div style={{ ...styles.iconCircle, ...styles.loadingIcon }}>
                        <div style={styles.spinner}></div>
                    </div>
                    <h2 style={{ ...styles.heading, ...styles.loadingHeading }}>
                        Verifying Your Email
                    </h2>
                    <p style={styles.message}>
                        Please wait while we verify your email address...
                    </p>
                </>
            );
        }

        if (status === 'success') {
            return (
                <>
                    <div style={{ ...styles.iconCircle, ...styles.successIcon }}>
                        ✓
                    </div>
                    <h2 style={{ ...styles.heading, ...styles.successHeading }}>
                        Email Verified!
                    </h2>
                    <p style={styles.message}>
                        <strong>{organizationName}</strong> has been activated successfully.
                        <br /><br />
                        You can now log in and start using your workspace.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.button}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                    >
                        Go to Login
                    </button>
                </>
            );
        }

        return (
            <>
                <div style={{ ...styles.iconCircle, ...styles.errorIcon }}>
                    ✕
                </div>
                <h2 style={{ ...styles.heading, ...styles.errorHeading }}>
                    Verification Failed
                </h2>
                <p style={styles.message}>
                    {message}
                    <br /><br />
                    The link may have expired or already been used.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.button}
                    >
                        Go to Login
                    </button>
                </div>
            </>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {renderContent()}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;








