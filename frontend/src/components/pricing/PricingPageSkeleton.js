import React from 'react';
import Skeleton from '../common/Skeleton';
import '../common/Skeleton.css';

const PricingPageSkeleton = () => {
    return (
        <div className="pricing-page">
            {/* Header */}
            <div className="pricing-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
                <Skeleton width="60%" height="48px" style={{ marginBottom: '1rem' }} />
                <Skeleton width="40%" height="24px" style={{ marginBottom: '2rem' }} />
                <Skeleton width="300px" height="40px" style={{ borderRadius: '20px' }} />
            </div>

            {/* Pricing Cards */}
            <div className="pricing-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="pricing-card" style={{ background: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Skeleton width="100px" height="32px" style={{ marginBottom: '1rem' }} />
                        <Skeleton width="80%" height="20px" style={{ marginBottom: '2rem' }} />

                        <Skeleton width="120px" height="48px" style={{ marginBottom: '0.5rem' }} />
                        <Skeleton width="100px" height="16px" style={{ marginBottom: '2rem' }} />

                        <div style={{ width: '100%', marginBottom: '2rem' }}>
                            <Skeleton width="100%" height="24px" style={{ marginBottom: '1rem' }} />
                            <Skeleton width="100%" height="24px" style={{ marginBottom: '1rem' }} />
                            <Skeleton width="100%" height="24px" />
                        </div>

                        <Skeleton variant="button" width="100%" height="48px" />
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <div className="faq-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Skeleton width="300px" height="32px" style={{ margin: '0 auto 2rem auto' }} />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ marginBottom: '1rem' }}>
                        <Skeleton width="100%" height="60px" style={{ borderRadius: '8px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingPageSkeleton;
