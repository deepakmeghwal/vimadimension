import React from 'react';
import { SkeletonLoader, SkeletonTaskRow } from '../common/SkeletonLoader';
import './ProjectDetails.css';

const ProjectDetailsSkeleton = ({ activeTab }) => {

    // Overview skeleton
    if (activeTab === 'overview') {
        return (
            <div className="project-details-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>
                    <div className="project-main">
                        <div className="project-card">
                            <div className="section-header" style={{ marginBottom: '1.5rem' }}>
                                <SkeletonLoader type="text" width="150px" height="1.4rem" />
                            </div>
                            <div style={{ padding: '0 1rem' }}>
                                <SkeletonLoader type="text" width="100%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                <SkeletonLoader type="text" width="90%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                <SkeletonLoader type="text" width="95%" height="1rem" style={{ marginBottom: '1.5rem' }} />

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                                            <SkeletonLoader type="text" width="80px" height="0.9rem" style={{ marginBottom: '0.5rem' }} />
                                            <SkeletonLoader type="text" width="60%" height="1.2rem" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="project-sidebar">
                        <div className="sidebar-card">
                            <SkeletonLoader type="text" width="100px" height="1.2rem" style={{ marginBottom: '1rem' }} />
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <SkeletonLoader type="text" width="80px" height="1rem" />
                                    <SkeletonLoader type="text" width="100px" height="1rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Tasks skeleton (List View)
    if (activeTab === 'tasks') {
        return (
            <div className="project-details-content">
                <div className="asana-list-view">
                    <div className="asana-list-header" style={{ display: 'grid', gridTemplateColumns: '1.5fr 150px 120px 100px 120px 100px', gap: '1rem', padding: '0 1rem', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5, 6].map(i => <SkeletonLoader key={i} type="text" width="80%" height="1rem" />)}
                    </div>
                    <div className="asana-list-body">
                        <div className="asana-section">
                            <div className="asana-section-header">
                                <SkeletonLoader type="rect" width="120px" height="24px" style={{ borderRadius: '4px' }} />
                            </div>
                            <div className="asana-section-body">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <SkeletonTaskRow key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Deliverables skeleton
    if (activeTab === 'deliverables') {
        return (
            <div className="project-details-content">
                <div style={{ padding: '1rem' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ marginBottom: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <SkeletonLoader type="circle" width="32px" height="32px" />
                                    <div>
                                        <SkeletonLoader type="text" width="200px" height="1.2rem" style={{ marginBottom: '0.25rem' }} />
                                        <SkeletonLoader type="text" width="150px" height="0.9rem" />
                                    </div>
                                </div>
                                <SkeletonLoader type="rect" width="120px" height="32px" style={{ borderRadius: '6px' }} />
                            </div>
                            {[1, 2].map(j => (
                                <div key={j} style={{ marginLeft: '3rem', padding: '1rem', borderLeft: '2px solid #e2e8f0', marginBottom: '1rem' }}>
                                    <SkeletonLoader type="text" width="40%" height="1rem" style={{ marginBottom: '0.5rem' }} />
                                    <SkeletonLoader type="text" width="20%" height="0.8rem" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Drawings skeleton (Grid View)
    if (activeTab === 'drawings') {
        return (
            <div className="project-details-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} style={{ aspectRatio: '1/1', background: '#f8fafc', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <SkeletonLoader type="rect" width="100%" height="60%" style={{ borderRadius: '8px' }} />
                            <SkeletonLoader type="text" width="90%" height="1rem" />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <SkeletonLoader type="text" width="40%" height="0.8rem" />
                                <SkeletonLoader type="text" width="30%" height="0.8rem" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Team skeleton
    if (activeTab === 'team') {
        const gridStyle = { gridTemplateColumns: '1.5fr 1fr 1.5fr' };
        return (
            <div className="project-details-content">
                <div className="project-tasks-tab">
                    <div className="asana-list-view">
                        <div className="asana-list-header" style={gridStyle}>
                            <SkeletonLoader type="text" width="60px" height="1rem" />
                            <SkeletonLoader type="text" width="80px" height="1rem" />
                            <SkeletonLoader type="text" width="60px" height="1rem" />
                        </div>
                        <div className="asana-list-body">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="asana-task-row skeleton-row" style={gridStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <SkeletonLoader type="circle" width="24px" height="24px" style={{ marginRight: '0.75rem' }} />
                                        <SkeletonLoader type="text" width="120px" height="1rem" />
                                    </div>
                                    <SkeletonLoader type="text" width="100px" height="1rem" />
                                    <SkeletonLoader type="text" width="150px" height="1rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Client Contacts skeleton
    if (activeTab === 'contacts') {
        const gridStyle = { gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr' };
        return (
            <div className="project-details-content">
                <div className="project-tasks-tab">
                    <div className="asana-list-view">
                        <div className="asana-list-header" style={gridStyle}>
                            <SkeletonLoader type="text" width="60px" height="1rem" />
                            <SkeletonLoader type="text" width="40px" height="1rem" />
                            <SkeletonLoader type="text" width="60px" height="1rem" />
                            <SkeletonLoader type="text" width="50px" height="1rem" />
                        </div>
                        <div className="asana-list-body">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="asana-task-row skeleton-row" style={gridStyle}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <SkeletonLoader type="circle" width="24px" height="24px" style={{ marginRight: '0.75rem' }} />
                                        <SkeletonLoader type="text" width="120px" height="1rem" />
                                    </div>
                                    <SkeletonLoader type="text" width="80px" height="1rem" />
                                    <SkeletonLoader type="text" width="150px" height="1rem" />
                                    <SkeletonLoader type="text" width="100px" height="1rem" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default / Financials skeleton
    return (
        <div className="project-details-content">
            <div style={{ padding: '2rem' }}>
                <SkeletonLoader type="rect" width="100%" height="200px" style={{ borderRadius: '12px', marginBottom: '2rem' }} />
                <SkeletonLoader type="rect" width="100%" height="300px" style={{ borderRadius: '12px' }} />
            </div>
        </div>
    );
};

export default ProjectDetailsSkeleton;
