import React from 'react';
import Skeleton from '../common/Skeleton';
import '../common/Skeleton.css';

const ProjectsListSkeleton = () => {
    return (
        <div className="main-content">
            {/* Header */}
            <div className="projects-header-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="projects-header-left">
                    <Skeleton width="200px" height="32px" />
                </div>
                <div className="projects-header-right" style={{ display: 'flex', gap: '1rem' }}>
                    <Skeleton width="100px" height="36px" variant="button" />
                    <Skeleton width="80px" height="36px" variant="button" />
                    <Skeleton width="140px" height="36px" variant="button" />
                </div>
            </div>

            {/* Grid View Skeleton */}
            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="project-card-modern" style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Card Header */}
                        <div className="project-card-modern-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Skeleton width="40px" height="20px" />
                                <Skeleton width="80px" height="20px" />
                            </div>
                            <Skeleton width="70%" height="24px" />
                        </div>

                        {/* Description */}
                        <Skeleton width="100%" height="16px" />
                        <Skeleton width="90%" height="16px" />

                        {/* Meta */}
                        <div className="project-card-modern-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="80px" height="16px" />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="60px" height="16px" />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="90px" height="16px" />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Skeleton variant="circular" width="16px" height="16px" />
                                <Skeleton width="70px" height="16px" />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="project-card-modern-footer" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <Skeleton width="40px" height="12px" />
                                <Skeleton width="80px" height="16px" />
                            </div>
                            <Skeleton variant="circular" width="24px" height="24px" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsListSkeleton;
