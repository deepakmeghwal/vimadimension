import React, { useState, useEffect } from 'react';

const ClientContacts = ({ clientId }) => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (clientId) {
            fetchContacts();
        }
    }, [clientId]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/clients/${clientId}/contacts`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setError('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/clients/${clientId}/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newContact),
                credentials: 'include'
            });

            if (response.ok) {
                setNewContact({ name: '', email: '', phone: '', role: '' });
                setShowForm(false);
                setSuccess('Contact added successfully!');
                setTimeout(() => setSuccess(''), 3000);
                // Refresh contacts list
                fetchContacts();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to add contact' }));
                setError(errorData.error || errorData.message || 'Failed to add contact');
            }
        } catch (error) {
            console.error('Error creating contact:', error);
            setError('Failed to add contact. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setNewContact({ name: '', email: '', phone: '', role: '' });
        setError('');
        setSuccess('');
    };

    if (!clientId) {
        return (
            <div className="client-contacts-section">
                <div className="empty-state-modern">
                    <div className="empty-state-icon" style={{ color: '#cbd5e1' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="8.5" cy="7" r="4"></circle>
                            <line x1="20" y1="8" x2="20" y2="14"></line>
                            <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                    </div>
                    <h3>No Client Assigned</h3>
                    <p>This project is not currently associated with a client.</p>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                        Edit project details to assign a client and manage contacts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="client-contacts-section">
            <div className="tab-header-standard">
                <h3 className="tab-header-title">Client Contacts</h3>
                {!showForm && (
                    <button
                        className="btn-primary-modern"
                        onClick={() => setShowForm(true)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Contact
                    </button>
                )}
            </div>

            {success && (
                <div className="modern-alert success" style={{ marginBottom: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {success}
                </div>
            )}

            {showForm && (
                <div className="contact-form-container">
                    <div className="contact-form-header">
                        <h4>Add New Contact</h4>
                        <button
                            type="button"
                            className="modal-close-button"
                            onClick={handleCancel}
                            aria-label="Close form"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {error && (
                        <div className="modern-alert error" style={{ marginBottom: '1rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="edit-form-modern">
                        <div className="form-group-modern">
                            <label htmlFor="contact-name">
                                Name <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                className="form-input-modern"
                                placeholder="e.g., Rahul Verma"
                                value={newContact.name}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="contact-email">
                                Email <span className="required-asterisk">*</span>
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                className="form-input-modern"
                                placeholder="e.g., rahul.verma@company.com"
                                value={newContact.email}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="contact-phone">
                                Phone Number
                            </label>
                            <input
                                id="contact-phone"
                                type="tel"
                                className="form-input-modern"
                                placeholder="e.g., +91 98765 43210"
                                value={newContact.phone}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                disabled={submitting}
                            />
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="contact-designation">
                                Designation
                            </label>
                            <input
                                id="contact-designation"
                                type="text"
                                className="form-input-modern"
                                placeholder="e.g., VP of Projects, Project Manager, CEO"
                                value={newContact.role}
                                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                disabled={submitting}
                            />
                            <div className="form-help-text">
                                Job title or role within the client organization
                            </div>
                        </div>

                        <div className="form-actions-modern">
                            <button
                                type="button"
                                className="btn-outline-modern"
                                onClick={handleCancel}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary-modern"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                        </svg>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                            <polyline points="7 3 7 8 15 8"></polyline>
                                        </svg>
                                        Add Contact
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="contacts-list">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading contacts...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="empty-state-modern">
                        <div className="empty-state-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <h3>No contacts added yet</h3>
                        <p>Start by adding a contact for this client</p>
                        {!showForm && (
                            <button
                                className="btn-primary-modern"
                                onClick={() => setShowForm(true)}
                                style={{ marginTop: '1rem' }}
                            >
                                Add First Contact
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="contacts-grid-modern">
                        {contacts.map(contact => (
                            <div key={contact.id} className="contact-card-modern">
                                <div className="contact-card-header">
                                    <div className="contact-avatar">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="contact-info">
                                        <h4 className="contact-name-modern">{contact.name}</h4>
                                        {contact.role && (
                                            <p className="contact-designation-modern">{contact.role}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="contact-details-modern">
                                    {contact.email && (
                                        <a href={`mailto:${contact.email}`} className="contact-detail-link">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                            <span>{contact.email}</span>
                                        </a>
                                    )}
                                    {contact.phone && (
                                        <a href={`tel:${contact.phone}`} className="contact-detail-link">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                            </svg>
                                            <span>{contact.phone}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientContacts;
