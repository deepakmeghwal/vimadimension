import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoPage.css';

const DemoPage = () => {
    const navigate = useNavigate();
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        city: '',
        companyName: '',
        role: '',
        message: ''
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formError, setFormError] = useState('');

    const handleContactChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleSelect = (role) => {
        setContactForm({
            ...contactForm,
            role: role
        });
    };

    // Check if all fields are filled
    const isFormValid = () => {
        return (
            contactForm.name.trim() !== '' &&
            contactForm.email.trim() !== '' &&
            contactForm.phone.trim() !== '' &&
            contactForm.city.trim() !== '' &&
            contactForm.companyName.trim() !== '' &&
            contactForm.role !== '' &&
            contactForm.message.trim() !== ''
        );
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) return;

        setFormError('');
        setFormSubmitting(true);

        try {
            console.log('Demo form submitted:', contactForm);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setFormSubmitted(true);
            setContactForm({
                name: '',
                email: '',
                phone: '',
                city: '',
                companyName: '',
                role: '',
                message: ''
            });
        } catch (error) {
            setFormError('Something went wrong. Please try again.');
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="demo-page">
            {/* Navigation Bar */}
            <nav className="demo-nav">
                <div className="demo-nav-container">
                    <div className="demo-logo" onClick={() => navigate('/')}>
                        <h2>ARCHIEASE</h2>
                    </div>
                    <div className="demo-nav-links">
                        <button onClick={() => navigate('/pricing')} className="nav-link-btn">Pricing</button>
                        <button onClick={() => navigate('/login')} className="nav-link-btn">Login</button>
                    </div>
                </div>
            </nav>

            {/* Demo Form Section */}
            <section className="demo-section">
                <div className="demo-container">
                    <div className="demo-content">
                        {formSubmitted ? (
                            <div className="demo-success">
                                <div className="success-icon">✓</div>
                                <h3>Thank you for reaching out!</h3>
                                <p>We'll get back to you within 24 hours to schedule your demo.</p>
                                <button onClick={() => navigate('/')} className="btn-back-home">
                                    Back to Home
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="demo-header">
                                    <h1 className="demo-title">Book a Demo</h1>
                                    <p className="demo-subtitle">Tell us about your business and we'll get back to you within 24 hours.</p>
                                </div>

                                <form onSubmit={handleContactSubmit} className="demo-form-element">
                                    {formError && <div className="form-error">{formError}</div>}

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="name">Name *</label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={contactForm.name}
                                                onChange={handleContactChange}
                                                required
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={contactForm.email}
                                                onChange={handleContactChange}
                                                required
                                                placeholder="john@company.com"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="phone">Phone *</label>
                                            <div className="phone-input-wrapper">
                                                <span className="phone-prefix">+91</span>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    name="phone"
                                                    value={contactForm.phone}
                                                    onChange={handleContactChange}
                                                    required
                                                    placeholder="9876543210"
                                                    pattern="[0-9]{10}"
                                                    maxLength="10"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="city">City *</label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={contactForm.city}
                                                onChange={handleContactChange}
                                                required
                                                placeholder="Mumbai"
                                            />
                                        </div>
                                        <div className="form-group span-2">
                                            <label htmlFor="companyName">Company Name *</label>
                                            <input
                                                type="text"
                                                id="companyName"
                                                name="companyName"
                                                value={contactForm.companyName}
                                                onChange={handleContactChange}
                                                required
                                                placeholder="Your company name"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>What defines you? *</label>
                                        <div className="role-selector">
                                            {['Architect', 'Interior Designer', 'Builder', 'Vendor'].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    className={`role-option ${contactForm.role === role ? 'selected' : ''}`}
                                                    onClick={() => handleRoleSelect(role)}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="message">Message *</label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={contactForm.message}
                                            onChange={handleContactChange}
                                            required
                                            placeholder="Tell us about your project or business needs..."
                                            rows="2"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn-demo-submit"
                                        disabled={formSubmitting || !isFormValid()}
                                    >
                                        {formSubmitting ? 'Submitting...' : 'Book a Demo'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DemoPage;
