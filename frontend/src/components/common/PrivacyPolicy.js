import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="privacy-wrapper">
            {/* Simple Navigation */}
            <header className="privacy-header">
                <div className="privacy-header-content">
                    <div className="privacy-logo" onClick={() => navigate('/')}>
                        <img src="/images/logo_final.svg" alt="ArchiEase Logo" />
                        <span>ARCHIEASE</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="privacy-main">
                <article className="privacy-article">
                    <h1>Privacy Policy</h1>
                    <p className="subtitle">ArchiEase - Business Management Platform</p>

                    <p className="intro">
                        We are committed to protecting your privacy and ensuring the security of your personal information.
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
                        use our software and services. Please read this privacy policy carefully to understand our practices
                        regarding your personal data.
                    </p>

                    <section>
                        <h2>User Data Collection and Usage</h2>
                        <p>
                            We may collect personal identification information from Users in various ways, including but not
                            limited to, when Users visit our site, register on the site, fill out a form, and in connection
                            with other activities, services, features, or resources we make available on our software. Users
                            may be asked for, as appropriate, name, email address, phone number, and other relevant details.
                        </p>
                    </section>

                    <section>
                        <h2>Non-Personal Identification Information</h2>
                        <p>
                            We may collect non-personal identification information about Users whenever they interact with our
                            software. Non-personal identification information may include the browser name, the type of computer,
                            and technical information about Users' means of connection to our software, such as the operating
                            system and the Internet service providers utilized.
                        </p>
                    </section>

                    <section>
                        <h2>How We Use Collected Information</h2>
                        <p>ArchiEase may collect and use Users' personal information for the following purposes:</p>
                        <ul>
                            <li><strong>To improve customer service:</strong> Information provided helps us respond to customer service requests and support needs more efficiently.</li>
                            <li><strong>To personalize user experience:</strong> We may use information in the aggregate to understand how our Users as a group use the services and resources provided on our software.</li>
                            <li><strong>To improve our software:</strong> We may use feedback provided to enhance our products and services.</li>
                            <li><strong>To send periodic emails:</strong> We may use the email address to respond to inquiries, questions, and/or other requests.</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Data Security</h2>
                        <p>
                            We adopt appropriate data collection, storage, and processing practices and security measures to
                            protect against unauthorized access, alteration, disclosure, or destruction of Users' personal
                            information and data stored on our software. We protect your information using industry-standard
                            security measures including:
                        </p>
                        <ul>
                            <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                            <li><strong>Access Controls:</strong> Limited access based on job requirements</li>
                            <li><strong>Regular Backups:</strong> Daily automated backups of all data</li>
                            <li><strong>Security Monitoring:</strong> 24/7 system monitoring and threat detection</li>
                            <li><strong>Regular Updates:</strong> Continuous security patches and improvements</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Information Sharing</h2>
                        <p>
                            We do not sell, trade, or rent Users' personal identification information to others. We may share
                            generic aggregated demographic information not linked to any personal identification information
                            regarding visitors and users with our business partners, trusted affiliates, and advertisers.
                        </p>
                        <p>We do not sell your personal information. We may share information only in these cases:</p>
                        <ul>
                            <li>Project data shared with authorized team members</li>
                            <li>With trusted partners who help operate our platform</li>
                            <li>When required by law or court order</li>
                            <li>In case of merger, acquisition, or sale</li>
                            <li>When you give explicit permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Data Retention</h2>
                        <p>
                            We retain your personal information for as long as necessary to fulfill the purposes outlined in
                            this privacy policy, unless a longer retention period is required by law. Our data retention
                            practices include:
                        </p>
                        <ul>
                            <li><strong>Active Accounts:</strong> Data retained while account is active</li>
                            <li><strong>Closed Accounts:</strong> Data deleted within 90 days of account closure</li>
                            <li><strong>Legal Requirements:</strong> Some data kept longer for compliance (up to 7 years)</li>
                            <li><strong>Backup Systems:</strong> Data removed from backups within 6 months</li>
                        </ul>
                    </section>

                    <div className="last-updated">
                        <p>Last updated: January 2026</p>
                        <p>Questions? Contact us at <a href="mailto:support@archiease.in">support@archiease.in</a></p>
                    </div>
                </article>
            </main>

            {/* Simple Footer */}
            <footer className="privacy-footer">
                <p>© {new Date().getFullYear()} ArchiEase Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
