import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsOfService.css';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="terms-wrapper">
            {/* Navigation */}
            <header className="terms-header">
                <div className="terms-header-content">
                    <div className="terms-logo" onClick={() => navigate('/')}>
                        <img src="/images/logo_final.svg" alt="ArchiEase Logo" />
                        <span>ARCHIEASE</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="terms-main">
                <article className="terms-article">
                    <h1>Terms of Service</h1>
                    <p className="effective-date">Effective Date: 1st January, 2025</p>

                    <p className="intro">
                        Welcome to ArchiEase. By using our website or services, you agree to these Terms of Use ("Terms").
                        If you don't agree, please don't use our services.
                    </p>

                    <section>
                        <h2>1. Services</h2>
                        <p>
                            ArchiEase provides project management, team collaboration, and business management tools for
                            architecture and design firms. We may update or improve our services at any time.
                        </p>
                    </section>

                    <section>
                        <h2>2. Eligibility</h2>
                        <p>
                            You must be at least 18 years old and legally able to enter into contracts to use our services.
                        </p>
                    </section>

                    <section>
                        <h2>3. Accounts</h2>
                        <p>To access certain features, you may need to create an account. You're responsible for:</p>
                        <ul>
                            <li>Providing accurate information.</li>
                            <li>Keeping your login details secure.</li>
                            <li>All activity that happens under your account.</li>
                        </ul>
                        <p>We may suspend or close accounts if they're misused.</p>
                    </section>

                    <section>
                        <h2>4. Acceptable Use</h2>
                        <p>You agree not to:</p>
                        <ul>
                            <li>Break the law or infringe others' rights.</li>
                            <li>Copy, modify, or reverse engineer our software.</li>
                            <li>Upload harmful code or interfere with our systems.</li>
                            <li>Use our services to build a competing product.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Intellectual Property</h2>
                        <p>
                            All rights in ArchiEase's software, content, and technology belong to us. You keep ownership
                            of the data you provide but give us permission to process it as needed to deliver the service.
                        </p>
                    </section>

                    <section>
                        <h2>6. Privacy</h2>
                        <p>
                            Your use of the services is subject to our <a href="/privacy-policy">Privacy Policy</a>.
                            Please review it to understand how we handle your information.
                        </p>
                    </section>

                    <section>
                        <h2>7. Payments</h2>
                        <p>
                            Some services require payment. Details (pricing, billing, cancellations) are provided in
                            separate subscription or order forms. You're responsible for taxes and fees.
                        </p>
                    </section>

                    <section>
                        <h2>8. Disclaimers</h2>
                        <p>
                            Our services are provided "as is." We don't guarantee they'll be error-free, uninterrupted,
                            or fit for a particular purpose.
                        </p>
                    </section>

                    <section>
                        <h2>9. Limitation of Liability</h2>
                        <p>
                            We're not liable for indirect or consequential damages. Our total liability is capped at
                            the amount you've paid us in the last 12 months (if any).
                        </p>
                    </section>

                    <section>
                        <h2>10. Termination</h2>
                        <p>
                            You may stop using the services anytime. We may suspend or end your access if you breach these Terms.
                        </p>
                    </section>

                    <section>
                        <h2>11. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of India. Disputes will be handled in the courts of India.
                        </p>
                    </section>

                    <section>
                        <h2>12. Changes</h2>
                        <p>
                            We may update these Terms from time to time. We'll post changes here, and continued use
                            means you accept the updates.
                        </p>
                    </section>

                    <div className="last-updated">
                        <p>Last updated: January 2025</p>
                        <p>Questions? Contact us at <a href="mailto:support@archiease.in">support@archiease.in</a></p>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="terms-footer">
                <p>© {new Date().getFullYear()} ArchiEase Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default TermsOfService;
