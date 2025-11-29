import React from 'react';
import Skeleton from '../common/Skeleton';
import '../common/Skeleton.css'; // Ensure CSS is loaded

const ProjectDetailsSkeleton = () => {
    return (
        <div className="main-content project-details-page">
            {/* Back Navigation */}
            <div className="project-details-nav" style={{ marginBottom: '1rem' }}>
                <Skeleton width="120px" height="20px" />
            </div>

            {/* Hero Section */}
            <div className="project-hero-section">
                <div className="project-hero-header">
                    <div className="project-hero-title-section" style={{ width: '100%' }}>
                        <div style={{ width: '100%' }}>
                            <div className="project-hero-main-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                {/* Project Number */}
                                <Skeleton width="60px" height="28px" variant="rectangular" style={{ borderRadius: '8px' }} />

                                {/* Separator */}
                                <Skeleton width="2px" height="24px" />

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {/* Status Dot */}
                                        <Skeleton variant="circular" width="12px" height="12px" />
                                        {/* Status Text */}
                                        <Skeleton width="80px" height="20px" />
                                    </div>

                                    {/* Title */}
                                    <Skeleton width="300px" height="32px" />
                                </div>
                            </div>
                        </div>

                        <div className="project-hero-meta" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                            {/* Client */}
                            <div className="project-hero-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="150px" height="20px" />
                            </div>
                            {/* Location */}
                            <div className="project-hero-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="120px" height="20px" />
                            </div>
                        </div>
                    </div>

                    <div className="project-hero-actions" style={{ display: 'flex', gap: '1rem' }}>
                        <Skeleton variant="button" width="120px" />
                        <Skeleton variant="button" width="40px" />
                        <Skeleton variant="button" width="40px" />
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="project-tabs-container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <div className="project-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <Skeleton width="100px" height="40px" style={{ borderRadius: '8px 8px 0 0' }} />
                    <Skeleton width="140px" height="40px" style={{ borderRadius: '8px 8px 0 0' }} />
                    <Skeleton width="80px" height="40px" style={{ borderRadius: '8px 8px 0 0' }} />
                    <Skeleton width="100px" height="40px" style={{ borderRadius: '8px 8px 0 0' }} />
                </div>
            </div>

            {/* Tab Content - Overview Grid */}
            <div className="project-overview-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Lifecycle Card */}
                <div className="project-overview-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div className="project-overview-card-header" style={{ marginBottom: '1.5rem' }}>
                        <Skeleton width="180px" height="24px" />
                    </div>
                    <div className="project-overview-card-body">
                        {/* Simulate Chevron Steps */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Skeleton key={i} width="100%" height="60px" variant="rectangular" style={{ borderRadius: '4px' }} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="project-overview-card" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                    <div className="project-overview-card-header" style={{ marginBottom: '1.5rem' }}>
                        <Skeleton width="150px" height="24px" />
                    </div>
                    <div className="project-overview-card-body">
                        <div className="project-details-overview">
                            <div className="project-details-overview-section" style={{ marginBottom: '1.5rem' }}>
                                <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                                <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                                <Skeleton width="100%" height="20px" />
                            </div>
                            <div className="project-details-overview-section">
                                <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                                <Skeleton width="100%" height="20px" style={{ marginBottom: '0.5rem' }} />
                                <Skeleton width="100%" height="20px" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProjectDetailsSkeleton;
