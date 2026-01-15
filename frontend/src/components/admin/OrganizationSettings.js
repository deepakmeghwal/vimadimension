import React, { useState, useEffect } from 'react';
import { apiGet, apiPut, apiUploadFileWithProgress, getApiUrl } from '../../utils/api';
import { getOrganizationLogoProps } from '../../utils/organizationLogo';

// Modern SVG Icons
const BuildingIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
        <line x1="9" y1="22" x2="9" y2="22.01"></line>
        <line x1="15" y1="22" x2="15" y2="22.01"></line>
        <line x1="12" y1="22" x2="12" y2="22.01"></line>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="4" y1="10" x2="20" y2="10"></line>
        <line x1="4" y1="16" x2="20" y2="16"></line>
    </svg>
);

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

const MailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
);

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);

const MapPinIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const SaveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const OrganizationSettings = () => {
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoUploadProgress, setLogoUploadProgress] = useState(0);
    const [headerLogoError, setHeaderLogoError] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        website: '',
        // Indian Invoice Details
        logoUrl: '',
        gstin: '',
        pan: '',
        coaRegNumber: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        // Bank Details
        bankName: '',
        bankAccountNumber: '',
        bankIfsc: '',
        bankBranch: '',
        bankAccountName: ''
    });

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            const response = await apiGet('/api/organization/me');
            if (response.ok) {
                const data = await response.json();
                setOrganization(data);
                setHeaderLogoError(false); // Reset logo error when organization data is refreshed
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    contactEmail: data.contactEmail || '',
                    contactPhone: data.contactPhone || '',
                    address: data.address || '',
                    website: data.website || '',
                    logoUrl: data.logoUrl || '',
                    gstin: data.gstin || '',
                    pan: data.pan || '',
                    coaRegNumber: data.coaRegNumber || '',
                    addressLine1: data.addressLine1 || '',
                    addressLine2: data.addressLine2 || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    bankName: data.bankName || '',
                    bankAccountNumber: data.bankAccountNumber || '',
                    bankIfsc: data.bankIfsc || '',
                    bankBranch: data.bankBranch || '',
                    bankAccountName: data.bankAccountName || ''
                });
            } else {
                throw new Error('Failed to fetch organization details');
            }
        } catch (err) {
            setError('Failed to load organization details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (file) => {
        setError('');
        setLogoUploading(true);
        setLogoUploadProgress(0);

        try {
            const response = await apiUploadFileWithProgress(
                '/api/organization/upload-logo',
                file,
                (progress) => setLogoUploadProgress(progress)
            );

            if (response.success) {
                setSuccessMessage('Logo uploaded successfully.');
                // Update organization state with new logo URL
                setOrganization(prev => ({ ...prev, logoUrl: response.imageUrl }));
                setFormData(prev => ({ ...prev, logoUrl: response.imageUrl }));
                setHeaderLogoError(false); // Reset error when new logo is uploaded
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(response.error || 'Upload failed');
            }
        } catch (err) {
            const errorMsg = err.error || err.message || 'Failed to upload logo';
            setError(errorMsg);
        } finally {
            setLogoUploading(false);
            setLogoUploadProgress(0);
        }
    };

    const handleLogoDelete = async () => {
        if (!window.confirm('Are you sure you want to remove the organization logo?')) {
            return;
        }

        try {
            const response = await fetch(getApiUrl('/api/organization/delete-logo'), {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Logo deleted successfully.');
                setOrganization(prev => ({ ...prev, logoUrl: null }));
                setFormData(prev => ({ ...prev, logoUrl: '' }));
                setHeaderLogoError(false); // Reset error when logo is deleted
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(data.error || 'Failed to delete logo');
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to delete logo';
            setError(errorMsg);
        }
    };

    const handleLogoFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
                return;
            }
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('File too large. Maximum size is 2MB.');
                return;
            }
            handleLogoUpload(file);
        }
        // Reset input
        e.target.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Exclude logoUrl from form submission - it's handled via separate upload endpoint
            const { logoUrl, ...formDataWithoutLogo } = formData;
            const response = await apiPut('/api/organization/me', formDataWithoutLogo);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSuccessMessage('Organization details updated successfully.');
                    setOrganization(data.organization);
                    setIsEditing(false);
                    // Clear success message after 3 seconds
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    setError(data.message || 'Failed to update organization.');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update organization.');
            }
        } catch (err) {
            setError('An error occurred while updating.');
            console.error(err);
        }
    };

    // Styles
    const styles = {
        container: {
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        header: {
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '3rem',
            color: 'white',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)',
        },
        headerContent: {
            position: 'relative',
            zIndex: 2,
        },
        headerTitle: {
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            letterSpacing: '-0.025em',
            background: 'linear-gradient(to right, #ffffff, #e2e8f0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        headerSubtitle: {
            color: '#94a3b8',
            fontSize: '1.1rem',
            maxWidth: '600px',
        },
        headerDecoration: {
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(84, 110, 122, 0.15) 0%, rgba(84, 110, 122, 0) 70%)',
            borderRadius: '50%',
            zIndex: 1,
        },
        card: {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
        },
        cardHeader: {
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
        },
        cardTitle: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        cardBody: {
            padding: '2rem',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
        },
        formGroup: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#64748b',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        value: {
            fontSize: '1rem',
            color: '#0f172a',
            fontWeight: '500',
            padding: '0.75rem 0',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
        },
        input: {
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '1rem',
            color: '#0f172a',
            transition: 'all 0.2s',
            outline: 'none',
            backgroundColor: '#f8fafc',
        },
        textarea: {
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '1rem',
            color: '#0f172a',
            transition: 'all 0.2s',
            outline: 'none',
            backgroundColor: '#f8fafc',
            minHeight: '120px',
            resize: 'vertical',
        },
        button: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: 'none',
        },
        primaryButton: {
            background: '#546E7A',
            color: 'white',
            boxShadow: '0 4px 6px -1px rgba(84, 110, 122, 0.2)',
        },
        secondaryButton: {
            background: 'white',
            color: '#64748b',
            border: '1px solid #e2e8f0',
        },
        iconWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#f1f5f9',
            color: '#64748b',
        },
        alert: {
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
        },
        errorAlert: {
            background: '#fef2f2',
            color: '#991b1b',
            border: '1px solid #fecaca',
        },
        successAlert: {
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: '#64748b' }}>
                <div className="loading-spinner"></div>
                <span style={{ marginLeft: '1rem' }}>Loading organization details...</span>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header Section */}
            <div style={styles.header}>
                <div style={styles.headerDecoration}></div>
                <div style={styles.headerContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {organization?.logoUrl && !headerLogoError ? (
                            <div
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                <img
                                    src={organization.logoUrl}
                                    alt="Organization Logo"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '8px'
                                    }}
                                    onError={() => setHeaderLogoError(true)}
                                />
                            </div>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    color: '#546E7A',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    flexShrink: 0,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                {organization?.name ? getOrganizationLogoProps(null, organization.name).initials : '??'}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <h1 style={styles.headerTitle}>{organization?.name || 'Organization Settings'}</h1>
                            <p style={styles.headerSubtitle}>
                                Manage your organization's profile, contact information, and public presence.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div style={{ ...styles.alert, ...styles.errorAlert }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            {successMessage && (
                <div style={{ ...styles.alert, ...styles.successAlert }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {successMessage}
                </div>
            )}

            {/* Main Content Card */}
            <div style={styles.card}>
                <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>
                        <div style={{ ...styles.iconWrapper, background: '#eff6ff', color: '#546E7A' }}>
                            <BuildingIcon />
                        </div>
                        General Information
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{ ...styles.button, ...styles.primaryButton }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#455A64'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#546E7A'}
                        >
                            <EditIcon />
                            Edit Details
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} style={styles.cardBody}>
                    <div style={styles.grid}>
                        {/* Organization Name */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Organization Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                    placeholder="e.g. Acme Corp"
                                />
                            ) : (
                                <div style={styles.value}>{organization.name}</div>
                            )}
                        </div>

                        {/* Website */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Website</label>
                            {isEditing ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        style={{ ...styles.input, paddingLeft: '2.5rem' }}
                                        placeholder="https://example.com"
                                    />
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <GlobeIcon />
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.value}>
                                    <span style={{ color: '#94a3b8' }}><GlobeIcon /></span>
                                    {organization.website ? (
                                        <a href={organization.website} target="_blank" rel="noopener noreferrer" style={{ color: '#546E7A', textDecoration: 'none' }}>
                                            {organization.website}
                                        </a>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Contact Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Contact Email</label>
                            {isEditing ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        style={{ ...styles.input, paddingLeft: '2.5rem' }}
                                        required
                                        placeholder="contact@example.com"
                                    />
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <MailIcon />
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.value}>
                                    <span style={{ color: '#94a3b8' }}><MailIcon /></span>
                                    {organization.contactEmail}
                                </div>
                            )}
                        </div>

                        {/* Contact Phone */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Contact Phone</label>
                            {isEditing ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        style={{ ...styles.input, paddingLeft: '2.5rem' }}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                        <PhoneIcon />
                                    </div>
                                </div>
                            ) : (
                                <div style={styles.value}>
                                    <span style={{ color: '#94a3b8' }}><PhoneIcon /></span>
                                    {organization.contactPhone || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Address - Full Width */}
                    <div style={{ ...styles.formGroup, marginTop: '1rem' }}>
                        <label style={styles.label}>Address</label>
                        {isEditing ? (
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    style={{ ...styles.textarea, paddingLeft: '2.5rem' }}
                                    rows="3"
                                    placeholder="123 Business Ave, Suite 100&#10;City, State, Zip"
                                />
                                <div style={{ position: 'absolute', left: '0.75rem', top: '1rem', color: '#94a3b8' }}>
                                    <MapPinIcon />
                                </div>
                            </div>
                        ) : (
                            <div style={{ ...styles.value, alignItems: 'flex-start' }}>
                                <span style={{ color: '#94a3b8', marginTop: '0.25rem' }}><MapPinIcon /></span>
                                <span style={{ whiteSpace: 'pre-wrap' }}>
                                    {organization.address || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description - Full Width */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                style={styles.textarea}
                                rows="4"
                                placeholder="Tell us about your organization..."
                            />
                        ) : (
                            <div style={{ ...styles.value, borderBottom: 'none', lineHeight: '1.6' }}>
                                {organization.description || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No description available</span>}
                            </div>
                        )}
                    </div>

                    {/* Indian Invoice Details Section */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>
                            Indian Invoice Details
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Organization Logo</label>
                                {isEditing ? (
                                    <div>
                                        {organization.logoUrl && (
                                            <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                                                <img
                                                    src={organization.logoUrl}
                                                    alt="Current Logo"
                                                    style={{
                                                        maxHeight: '100px',
                                                        maxWidth: '200px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #e2e8f0'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleLogoDelete}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}
                                                    title="Delete logo"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                        <div style={{
                                            border: '2px dashed #e2e8f0',
                                            borderRadius: '8px',
                                            padding: '1.5rem',
                                            textAlign: 'center',
                                            cursor: logoUploading ? 'not-allowed' : 'pointer',
                                            backgroundColor: logoUploading ? '#f8fafc' : '#ffffff',
                                            transition: 'all 0.2s'
                                        }}
                                            onClick={() => !logoUploading && document.getElementById('logo-upload-input')?.click()}
                                            onMouseOver={(e) => !logoUploading && (e.currentTarget.style.borderColor = '#546E7A')}
                                            onMouseOut={(e) => !logoUploading && (e.currentTarget.style.borderColor = '#e2e8f0')}
                                        >
                                            <input
                                                id="logo-upload-input"
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleLogoFileSelect}
                                                style={{ display: 'none' }}
                                                disabled={logoUploading}
                                            />
                                            {logoUploading ? (
                                                <div>
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{
                                                            width: '100%',
                                                            height: '8px',
                                                            backgroundColor: '#e2e8f0',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${logoUploadProgress}%`,
                                                                height: '100%',
                                                                backgroundColor: '#546E7A',
                                                                transition: 'width 0.3s'
                                                            }}></div>
                                                        </div>
                                                    </div>
                                                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                        Uploading... {logoUploadProgress}%
                                                    </span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}>
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                        <polyline points="17 8 12 3 7 8" />
                                                        <line x1="12" y1="3" x2="12" y2="15" />
                                                    </svg>
                                                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                                        Click to upload logo
                                                    </div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                        JPEG, PNG, GIF, WebP • Max 2MB
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={styles.value}>
                                        {organization.logoUrl ? (
                                            <img src={organization.logoUrl} alt="Logo" style={{ maxHeight: '50px' }} />
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No logo uploaded</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>GSTIN (15 digits)</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        style={styles.input}
                                        maxLength="15"
                                        placeholder="15-digit GSTIN"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.gstin || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>PAN</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleChange}
                                        style={styles.input}
                                        maxLength="10"
                                        placeholder="10-character PAN"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.pan || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>COA Registration Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="coaRegNumber"
                                        value={formData.coaRegNumber}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="COA Registration Number"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.coaRegNumber || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#475569' }}>Address Details</h4>
                            <div style={styles.grid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Address Line 1</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="addressLine1"
                                            value={formData.addressLine1}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="Street address"
                                        />
                                    ) : (
                                        <div style={styles.value}>{organization.addressLine1 || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Address Line 2</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="addressLine2"
                                            value={formData.addressLine2}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="Apartment, suite, etc."
                                        />
                                    ) : (
                                        <div style={styles.value}>{organization.addressLine2 || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>City</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="City"
                                        />
                                    ) : (
                                        <div style={styles.value}>{organization.city || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>State</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            style={styles.input}
                                            placeholder="State"
                                        />
                                    ) : (
                                        <div style={styles.value}>{organization.state || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Pincode</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            style={styles.input}
                                            maxLength="10"
                                            placeholder="Pincode"
                                        />
                                    ) : (
                                        <div style={styles.value}>{organization.pincode || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>
                            Bank Details
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Bank Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Bank Name"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.bankName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Account Number</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Account Number"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.bankAccountNumber || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>IFSC Code</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="bankIfsc"
                                        value={formData.bankIfsc}
                                        onChange={handleChange}
                                        style={styles.input}
                                        maxLength="11"
                                        placeholder="11-character IFSC"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.bankIfsc || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Branch</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="bankBranch"
                                        value={formData.bankBranch}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Branch Name"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.bankBranch || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Account Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="bankAccountName"
                                        value={formData.bankAccountName}
                                        onChange={handleChange}
                                        style={styles.input}
                                        placeholder="Account Holder Name"
                                    />
                                ) : (
                                    <div style={styles.value}>{organization.bankAccountName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        name: organization.name || '',
                                        description: organization.description || '',
                                        contactEmail: organization.contactEmail || '',
                                        contactPhone: organization.contactPhone || '',
                                        address: organization.address || '',
                                        website: organization.website || ''
                                    });
                                    setError('');
                                }}
                                style={{ ...styles.button, ...styles.secondaryButton }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >
                                <XIcon />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ ...styles.button, ...styles.primaryButton }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#455A64'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#546E7A'}
                            >
                                <SaveIcon />
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default OrganizationSettings;
