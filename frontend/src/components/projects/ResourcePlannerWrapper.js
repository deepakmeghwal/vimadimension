import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResourcePlanner from './ResourcePlanner';

const ResourcePlannerWrapper = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Resource Planner</h1>
                <div className="page-actions">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-outline"
                    >
                        Back
                    </button>
                </div>
            </div>

            <ResourcePlanner projectId={projectId} isFullView={true} />
        </div>
    );
};

export default ResourcePlannerWrapper;
