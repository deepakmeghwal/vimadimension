import React, { useState } from 'react';

const CreateClientModal = ({ isOpen, onClose, onClientCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        email: '',
        billingAddress: '',
        paymentTerms: 'NET30'
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                const newClient = await response.json();
                onClientCreated(newClient);
                onClose();
                // Reset form
                setFormData({
                    name: '',
                    code: '',
                    email: '',
                    billingAddress: '',
                    paymentTerms: 'NET30'
                });
            } else {
                const errorData = await response.text();
                setError(errorData || 'Failed to create client');
            }
        } catch (error) {
            console.error('Error creating client:', error);
            setError('Failed to create client');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-modern">
                    <div className="modal-header-content">
                        <div className="modal-icon-wrapper">
                            <i className="fas fa-building"></i>
                        </div>
                        <div>
                            <h2 className="modal-title">Create New Client</h2>
                            <p className="modal-subtitle">Add a new client to your organization</p>
                        </div>
                    </div>
                    <button className="modal-close-button" onClick={onClose} aria-label="Close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body-modern">
                    {error && (
                        <div className="alert alert-danger-modern">
                            <i className="fas fa-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="client-form-modern">
                        <div className="form-group-modern">
                            <label htmlFor="clientName">
                                Client Name <span className="required-asterisk">*</span>
                            </label>
                            <div className="input-wrapper">
                                <i className="fas fa-building input-icon"></i>
                                <input
                                    type="text"
                                    id="clientName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Acme Corporation"
                                    className="form-input-modern"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="clientCode">Client Code</label>
                            <div className="input-wrapper">
                                <i className="fas fa-hashtag input-icon"></i>
                                <input
                                    type="text"
                                    id="clientCode"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g., ACME (optional)"
                                    className="form-input-modern"
                                />
                            </div>
                            <small className="form-help-text">
                                <i className="fas fa-info-circle"></i> Leave blank to auto-generate
                            </small>
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="clientEmail">Email</label>
                            <div className="input-wrapper">
                                <i className="fas fa-envelope input-icon"></i>
                                <input
                                    type="email"
                                    id="clientEmail"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g., contact@client.com (optional)"
                                    className="form-input-modern"
                                />
                            </div>
                            <small className="form-help-text">
                                <i className="fas fa-info-circle"></i> Optional: Client contact email
                            </small>
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="billingAddress">Billing Address</label>
                            <div className="input-wrapper">
                                <i className="fas fa-map-marker-alt input-icon input-icon-top"></i>
                                <textarea
                                    id="billingAddress"
                                    name="billingAddress"
                                    value={formData.billingAddress}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter complete billing address..."
                                    className="form-textarea-modern"
                                />
                            </div>
                        </div>

                        <div className="form-group-modern">
                            <label htmlFor="paymentTerms">Payment Terms</label>
                            <div className="input-wrapper">
                                <i className="fas fa-calendar-alt input-icon"></i>
                                <select
                                    id="paymentTerms"
                                    name="paymentTerms"
                                    value={formData.paymentTerms}
                                    onChange={handleChange}
                                    className="form-input-modern"
                                >
                                    <option value="NET30">Net 30</option>
                                    <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                                    <option value="NET15">Net 15</option>
                                    <option value="NET60">Net 60</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-actions-modern">
                            <button
                                type="button"
                                className="btn-outline-modern"
                                onClick={onClose}
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
                                        <i className="fas fa-spinner fa-spin"></i> Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i> Create Client
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateClientModal;
