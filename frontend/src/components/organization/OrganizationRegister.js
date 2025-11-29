import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';

const OrganizationRegister = () => {
    const navigate = useNavigate();

    // State Management
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal Identity
        fullName: '',
        workEmail: '',
        password: '',
        confirmPassword: '',

        // Step 2: Company Context
        companyName: '',
        teamSize: '1-10',
        phoneNumber: ''
    });

    const [errors, setErrors] = useState({});

    // Password validation function with stricter rules
    const validatePassword = (password) => {
        if (!password) {
            return 'Password is required';
        }

        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }

        if (password.length > 128) {
            return 'Password must be less than 128 characters';
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }

        // Check for at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/? etc.)';
        }

        // Check for common weak patterns - no more than 2 consecutive identical characters
        if (/(.)\1{2,}/.test(password)) {
            return 'Password cannot contain more than 2 consecutive identical characters';
        }

        // Check for common sequences
        if (/123|abc|qwe|asd|zxc/i.test(password)) {
            return 'Password cannot contain common sequences like 123, abc, qwe, etc.';
        }

        return null; // Password is valid
    };

    // Handlers
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Also clear confirmPassword error if password changes
        if (name === 'password' && errors.confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
        // Re-validate confirmPassword if it's being changed
        if (name === 'confirmPassword' && formData.password) {
            if (formData.password === value) {
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.workEmail.trim()) newErrors.workEmail = 'Work email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) newErrors.workEmail = 'Invalid email address';

        // Validate password with stricter rules
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            newErrors.password = passwordError;
        }

        // Validate password confirmation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        try {
            const response = await apiPost('/api/organization/resend-verification', { email: registeredEmail });
            const data = await response.json();
            if (data.success) {
                setResendSuccess(true);
            }
        } catch (error) {
            console.error('Failed to resend verification:', error);
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setLoading(true);

        try {
            // Map new form structure to API expected format
            const apiPayload = {
                organizationName: formData.companyName,
                organizationEmail: formData.workEmail,
                organizationPhone: formData.phoneNumber,
                adminName: formData.fullName,
                adminEmail: formData.workEmail,
                adminPassword: formData.password,
                adminUsername: formData.workEmail,
                organizationDescription: `Team size: ${formData.teamSize}`
            };

            const response = await apiPost('/api/organization/register', apiPayload);
            const data = await response.json();

            if (data.success) {
                setRegisteredEmail(formData.workEmail);
                setIsSuccess(true);
            } else {
                setErrors({ submit: data.message || 'Registration failed' });
            }
        } catch (error) {
            setErrors({ submit: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            backgroundColor: '#f8fafc'
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
            marginBottom: '3rem',
            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        imageContainer: {
            marginTop: 'auto',
            width: '100%',
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden'
        },
        dashboardImage: {
            width: '70%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            borderRadius: '0.5rem'
        },
        formCard: {
            width: '100%',
            maxWidth: '480px',
            margin: '0 auto'
        },
        progressBar: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem'
        },
        progressStep: (active) => ({
            height: '4px',
            flex: 1,
            backgroundColor: active ? '#6366f1' : '#e2e8f0',
            borderRadius: '2px',
            transition: 'background-color 0.3s ease'
        }),
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
            transition: 'background-color 0.2s'
        },
        error: {
            color: '#ef4444',
            fontSize: '0.875rem',
            marginTop: '0.25rem'
        },
        successCard: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px'
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

    // Success state - Show verification email sent message
    if (isSuccess) {
        return (
            <div style={{ ...styles.container, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
                <div style={styles.successCard}>
                    <div style={styles.emailIcon}>✉️</div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
                        Check Your Email
                    </h2>
                    <p style={{ color: '#64748b', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                        We've sent a verification link to:
                    </p>
                    <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
                        {registeredEmail}
                    </p>
                    <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.875rem' }}>
                        Click the link in the email to verify your account and activate your workspace
                        <strong> {formData.companyName}</strong>.
                        <br /><br />
                        The link will expire in 24 hours.
                    </p>

                    {resendSuccess && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '8px',
                            color: '#166534',
                            marginBottom: '1rem',
                            fontSize: '0.875rem'
                        }}>
                            Verification email resent successfully!
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleResendVerification}
                            disabled={resendLoading}
                            style={{
                                ...styles.button,
                                backgroundColor: 'transparent',
                                color: '#6366f1',
                                border: '1px solid #6366f1',
                                width: 'auto',
                                padding: '0.75rem 1.5rem',
                                opacity: resendLoading ? 0.7 : 1
                            }}
                        >
                            {resendLoading ? 'Sending...' : 'Resend Email'}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{ ...styles.button, width: 'auto', padding: '0.75rem 1.5rem' }}
                        >
                            Go to Login
                        </button>
                    </div>

                    <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                        Didn't receive the email? Check your spam folder or try resending.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Left Panel - Value Prop */}
            <div className="hidden-mobile" style={styles.leftPanel}>
                <div style={styles.brand}>KOMOREBI</div>
                <h1 style={styles.heading}>
                    Manage projects, track tasks, handle payroll, and connect your team—all in one unified platform.
                </h1>

                {/* Dashboard Image */}
                <div style={styles.imageContainer}>
                    <img
                        src="/images/register.png?v=3"
                        alt="Komorebi Dashboard"
                        style={styles.dashboardImage}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={styles.rightPanel}>
                <div style={styles.formCard}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                            {step === 1 ? 'Create your account' : 'Setup your workspace'}
                        </h2>
                        <p style={{ color: '#64748b' }}>
                            {step === 1 ? 'Get started with Komorebi today.' : 'Tell us a bit about your company.'}
                        </p>
                    </div>

                    <div style={styles.progressBar}>
                        <div style={styles.progressStep(step >= 1)}></div>
                        <div style={styles.progressStep(step >= 2)}></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        style={{ ...styles.input, borderColor: errors.fullName ? '#ef4444' : '#cbd5e1' }}
                                        placeholder="e.g. Jane Doe"
                                    />
                                    {errors.fullName && <div style={styles.error}>{errors.fullName}</div>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Work Email</label>
                                    <input
                                        type="email"
                                        name="workEmail"
                                        value={formData.workEmail}
                                        onChange={handleChange}
                                        style={{ ...styles.input, borderColor: errors.workEmail ? '#ef4444' : '#cbd5e1' }}
                                        placeholder="name@company.com"
                                    />
                                    {errors.workEmail && <div style={styles.error}>{errors.workEmail}</div>}
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
                                            placeholder="8+ chars, uppercase, lowercase, number, special char"
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
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Must contain: 8+ characters, uppercase, lowercase, number, and special character
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Confirm Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            style={{ ...styles.input, borderColor: errors.confirmPassword ? '#ef4444' : '#cbd5e1' }}
                                            placeholder="Re-enter your password"
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

                                <button
                                    type="button"
                                    onClick={handleNext}
                                    style={styles.button}
                                >
                                    Continue
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Company Name</label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        style={{ ...styles.input, borderColor: errors.companyName ? '#ef4444' : '#cbd5e1' }}
                                        placeholder="e.g. Acme Inc."
                                    />
                                    {errors.companyName && <div style={styles.error}>{errors.companyName}</div>}
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Team Size</label>
                                    <select
                                        name="teamSize"
                                        value={formData.teamSize}
                                        onChange={handleChange}
                                        style={styles.input}
                                    >
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="200+">200+ employees</option>
                                    </select>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Phone Number <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</span></label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>

                                {errors.submit && (
                                    <div style={{ ...styles.error, marginBottom: '1rem', textAlign: 'center' }}>
                                        {errors.submit}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        style={{ ...styles.button, backgroundColor: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        style={styles.button}
                                        disabled={loading}
                                    >
                                        {loading ? 'Creating Workspace...' : 'Create Workspace'}
                                    </button>
                                </div>
                            </>
                        )}

                        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
                            Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#6366f1', cursor: 'pointer', fontWeight: '600' }}>Log in</span>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Responsive Styles */}
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

export default OrganizationRegister;
