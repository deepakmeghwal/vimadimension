import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PricingPage.css';

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.6666 5L7.49992 14.1667L3.33325 10" stroke="#38A169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronIcon = ({ isOpen }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
    >
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PricingPage = () => {
    const navigate = useNavigate();
    const [isAnnual, setIsAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    // Pricing
    const monthlyPrice = 499;
    const annualPrice = 4999;
    const savings = (monthlyPrice * 12) - annualPrice;
    const displayPrice = isAnnual ? Math.round(annualPrice / 12) : monthlyPrice;

    // Benefits - each under 4 words
    const benefits = [
        'Unlimited Projects',
        'Unlimited Team Members',
        'Invoice Generation & PDF',
        'Financial Dashboard',
        'Task Management',
        'Time Tracking',
        'Client Management',
        'Phase & Deliverables',
        'Resource Planning',
        'Email Support',
    ];

    const faqs = [
        {
            question: "Can I get a GST Invoice?",
            answer: "Yes, absolutely. Once you subscribe, you can enter your GSTIN in the billing settings, and we will generate a GST-compliant tax invoice for every payment."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major Credit and Debit cards (Visa, Mastercard, Rupay). For annual plans, we also support UPI and Netbanking."
        },
        {
            question: "Is my data safe?",
            answer: "Your data is stored securely on AWS servers located in Mumbai, India, ensuring data sovereignty and low latency. We use industry-standard encryption for data at rest and in transit."
        },
        {
            question: "Can I cancel anytime?",
            answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period."
        }
    ];

    return (
        <div className="pricing-page">
            {/* Navigation Bar */}
            <nav className="pricing-nav">
                <div className="pricing-nav-container">
                    <div className="pricing-logo" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="/images/logo_final.svg" alt="ArchiEase Logo" style={{ height: '32px', width: 'auto' }} />
                        <h2>ARCHIEASE</h2>
                    </div>
                    <div className="pricing-nav-links">
                        <button onClick={() => navigate('/login')} className="nav-link-btn">Login</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pricing-hero">
                <h1 className="pricing-title">
                    Simple, Transparent Pricing
                </h1>

                {/* Billing Toggle */}
                <div className="billing-toggle">
                    <button
                        className={`toggle-btn ${!isAnnual ? 'active' : ''}`}
                        onClick={() => setIsAnnual(false)}
                    >
                        Monthly
                    </button>
                    <button
                        className={`toggle-btn ${isAnnual ? 'active' : ''}`}
                        onClick={() => setIsAnnual(true)}
                    >
                        Yearly
                        <span className="save-badge">Save ₹{savings.toLocaleString('en-IN')}</span>
                    </button>
                </div>
            </section>

            {/* Pricing Card Section */}
            <section className="pricing-card-section">
                <div className="pricing-card">
                    <div className="card-layout">
                        {/* Left Side - Benefits */}
                        <div className="benefits-section">
                            <h4 className="benefits-title">Everything included:</h4>
                            <ul className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="benefit-item">
                                        <CheckIcon />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Side - Price and CTA */}
                        <div className="price-section">
                            <div className="card-header">
                                <h2 className="plan-name">ArchiEase</h2>
                                <p className="plan-description">Everything you need to run your firm</p>
                            </div>

                            <div className="price-block">
                                <div className="price-display">
                                    <span className="currency">₹</span>
                                    <span className="price-amount">{displayPrice}</span>
                                    <div className="price-suffix">
                                        <span>/user</span>
                                        <span>/month</span>
                                    </div>
                                </div>
                                {isAnnual && (
                                    <p className="annual-price">₹{annualPrice.toLocaleString('en-IN')} billed annually per user</p>
                                )}
                                <p className="tax-note">Inclusive of Taxes, Installation and Support.</p>
                            </div>

                            <button onClick={() => window.open('https://calendly.com/kejriwal9576/30min', '_blank')} className="cta-button">
                                Get Started
                            </button>

                            <div className="trust-row">
                                <div className="trust-item">
                                    <CheckIcon />
                                    <span>No hidden fees</span>
                                </div>
                                <div className="trust-item">
                                    <CheckIcon />
                                    <span>Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="faq-container">
                    <h2 className="faq-title">Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>
                                    <ChevronIcon isOpen={openFaq === index} />
                                </button>
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="pricing-footer">
                <div className="footer-content">
                    <p>© {new Date().getFullYear()} ArchiEase Inc. All rights reserved.</p>
                    <div className="footer-links">
                        <button className="footer-link">Privacy Policy</button>
                        <button className="footer-link">Terms of Service</button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PricingPage;
