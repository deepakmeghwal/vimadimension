import React from 'react';

import { SkeletonLoader, SkeletonProjectRow } from '../common/SkeletonLoader';
import '../projects/ProjectDetails.css';

const ProjectsListSkeleton = () => {
    return (
        <div className="main-content">
            {/* Header */}
            <div className="projects-header-compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div className="projects-header-left">
                    <SkeletonLoader width="200px" height="32px" />
                </div>
                <div className="projects-header-right" style={{ display: 'flex', gap: '1rem' }}>
                    <SkeletonLoader width="100px" height="36px" />
                    <SkeletonLoader width="80px" height="36px" />
                    <SkeletonLoader width="140px" height="36px" />
                </div>
            </div>

            {/* List View Skeleton */}
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Client</th>
                            <th>Charge Type</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Location</th>
                            <th>Start Date</th>
                            <th>Budget</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <SkeletonProjectRow key={i} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProjectsListSkeleton;
