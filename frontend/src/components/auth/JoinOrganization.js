import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';

const JoinOrganization = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [status, setStatus] = useState('validating'); // 'validating', 'valid', 'invalid', 'success'
    const [invitationDetails, setInvitationDetails] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (token) {
            validateInvitation();
        } else {
            setStatus('invalid');
            setErrorMessage('No invitation token provided');
        }
    }, [token]);

    const validateInvitation = async () => {
        try {
            const response = await apiGet(`/api/invitations/validate?token=${token}`);
            const data = await response.json();

            if (data.valid) {
                setStatus('valid');
                setInvitationDetails({
                    email: data.email,
                    organizationName: data.organizationName,
                    organizationId: data.organizationId,
                    roleName: data.roleName
                });
            } else {
                setStatus('invalid');
                setErrorMessage(data.message || 'Invalid or expired invitation');
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
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
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
            // Use email as username
            const response = await apiPost('/api/invitations/accept', {
                token,
                name: formData.name,
                username: invitationDetails.email, // Email is the username
                password: formData.password
            });
            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                setErrors({ submit: data.message || 'Failed to accept invitation' });
            }
        } catch (error) {
            setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const formatRole = (roleName) => {
        if (!roleName) return 'Member';
        return roleName.replace('ROLE_', '').replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f8fafc'
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
            padding: '4rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        rightPanel: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem',
            backgroundColor: 'white',
            maxWidth: '800px'
        },
        brand: {
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '2rem',
            letterSpacing: '-0.025em'
        },
        heading: {
            fontSize: '2.5rem',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '1rem',
            background: 'linear-gradient(to right, #10b981, #059669)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        subtitle: {
            fontSize: '1rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: '1.6'
        },
        inviteInfo: {
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid #bbf7d0'
        },
        orgBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            fontWeight: '600',
            color: '#059669'
        },
        roleBadge: {
            display: 'inline-block',
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500'
        },
        formCard: {
            width: '100%',
            maxWidth: '480px',
            margin: '0 auto'
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
        disabledInput: {
            backgroundColor: '#f1f5f9',
            color: '#64748b',
            cursor: 'not-allowed'
        },
        button: {
            width: '100%',
            padding: '0.875rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
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

    // Validating invitation
    if (status === 'validating') {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconCircle, ...styles.loadingIcon }}>
                        <div style={styles.spinner}></div>
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669', marginBottom: '1rem' }}>
                        Validating Invitation
                    </h2>
                    <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                        Please wait while we verify your invitation...
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

    // Invalid invitation
    if (status === 'invalid') {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconCircle, ...styles.errorIcon }}>
                        ✕
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>
                        Invalid Invitation
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                        {errorMessage}
                        <br /><br />
                        The invitation may have expired or already been used.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{ ...styles.button, backgroundColor: '#6366f1' }}
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
                        🎉
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#059669', marginBottom: '1rem' }}>
                        Welcome to the Team!
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
                        Your account has been created successfully.
                        <br /><br />
                        You've joined <strong>{invitationDetails?.organizationName}</strong> as a{' '}
                        <span style={styles.roleBadge}>{formatRole(invitationDetails?.roleName)}</span>
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.button}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                        Sign In to Your Account
                    </button>
                </div>
            </div>
        );
    }

    // Valid invitation - show registration form
    return (
        <div style={styles.container}>
            {/* Left Panel - Value Prop */}
            <div className="hidden-mobile" style={styles.leftPanel}>
                <div style={styles.brand}>ARCHIEASE</div>
                <h1 style={styles.heading}>
                    You're Invited! 🎉
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: '1.6', marginBottom: '2rem' }}>
                    Join your team and start collaborating on projects, tracking tasks, and more.
                </p>

                <div style={styles.inviteInfo}>
                    <div style={styles.orgBadge}>
                        🏢 {invitationDetails?.organizationName}
                    </div>
                    <p style={{ color: '#059669', margin: 0 }}>
                        You've been invited to join as a <span style={styles.roleBadge}>{formatRole(invitationDetails?.roleName)}</span>
                    </p>
                </div>

                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    <p style={{ marginBottom: '0.5rem' }}>✓ Access projects and tasks</p>
                    <p style={{ marginBottom: '0.5rem' }}>✓ Track time and attendance</p>
                    <p style={{ marginBottom: '0.5rem' }}>✓ Collaborate with your team</p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={styles.rightPanel}>
                <div style={styles.formCard}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                            Create Your Account
                        </h2>
                        <p style={{ color: '#64748b' }}>
                            Complete your profile to join {invitationDetails?.organizationName}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email (This will be your login username)</label>
                            <input
                                type="email"
                                value={invitationDetails?.email || ''}
                                disabled
                                style={{ ...styles.input, ...styles.disabledInput }}
                            />
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                                You'll use this email to sign in
                            </p>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{ ...styles.input, borderColor: errors.name ? '#ef4444' : '#cbd5e1' }}
                                placeholder="e.g. Jane Doe"
                            />
                            {errors.name && <div style={styles.error}>{errors.name}</div>}
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{ ...styles.input, borderColor: errors.password ? '#ef4444' : '#cbd5e1' }}
                                    placeholder="Min. 8 characters"
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
                            {errors.password && <div style={styles.error}>{errors.password}</div>}
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
                            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#059669')}
                            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#10b981')}
                        >
                            {loading ? 'Creating Account...' : 'Join Organization'}
                        </button>

                        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                            Already have an account?{' '}
                            <span
                                onClick={() => navigate('/login')}
                                style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Sign in
                            </span>
                        </div>
                    </form>
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

export default JoinOrganization;

