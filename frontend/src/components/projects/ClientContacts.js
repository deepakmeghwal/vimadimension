import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Phone, Mail, User, Trash2 } from 'lucide-react';

const ClientContacts = ({ clientId, clientName }) => {
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

    // Custom grid style for contacts
    const gridStyle = {
        gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr'
    };

    if (!clientId) {
        return (
            <div className="project-tasks-tab">
                <div className="empty-state-modern">
                    <div className="empty-state-icon" style={{ color: '#cbd5e1' }}>
                        <User size={64} strokeWidth={1.5} />
                    </div>
                    <h3>No Client Assigned</h3>
                    <p>This project is not currently associated with a client.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="project-tasks-tab">
            <div style={{ padding: '0.5rem 1rem 0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {clientName}
                    <span className="board-column-count">{contacts.length}</span>
                </h2>
            </div>

            <div className="asana-task-list">
                <div className="asana-list-header" style={gridStyle}>
                    <div>Name</div>
                    <div>Role</div>
                    <div>Email</div>
                    <div>Phone</div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        {contacts.map(contact => (
                            <div key={contact.id} className="asana-task-row" style={gridStyle}>
                                <div className="asana-task-name-cell">
                                    <div className="asana-avatar-small" style={{ marginRight: '0.75rem' }}>
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="task-name-display">{contact.name}</span>
                                </div>
                                <div className="asana-task-date" style={{ color: '#334155' }}>
                                    {contact.role || '—'}
                                </div>
                                <div className="asana-task-date">
                                    {contact.email ? (
                                        <a href={`mailto:${contact.email}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Mail size={12} />
                                            {contact.email}
                                        </a>
                                    ) : '—'}
                                </div>
                                <div className="asana-task-date">
                                    {contact.phone ? (
                                        <a href={`tel:${contact.phone}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Phone size={12} />
                                            {contact.phone}
                                        </a>
                                    ) : '—'}
                                </div>
                            </div>
                        ))}

                        {showForm ? (
                            <div className="asana-task-row form-mode" style={{ ...gridStyle, alignItems: 'start', padding: '1rem' }}>
                                <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Name *"
                                            value={newContact.name}
                                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Role"
                                            value={newContact.role}
                                            onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="Email *"
                                            value={newContact.email}
                                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="Phone"
                                            value={newContact.phone}
                                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                            <button type="submit" className="btn-primary-modern" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }} disabled={submitting}>
                                                {submitting ? 'Adding...' : 'Add'}
                                            </button>
                                            <button type="button" onClick={handleCancel} className="btn-outline-modern" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="asana-add-task-row" onClick={() => setShowForm(true)}>
                                <Plus size={14} style={{ marginRight: '0.5rem' }} />
                                Add contact...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ClientContacts;
