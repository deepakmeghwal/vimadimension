import React from 'react';
import { Link } from 'react-router-dom';

const PhaseList = ({ phases, projectId, isAdmin }) => {
    if (!phases || phases.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📑</span>
                <h3>No phases yet</h3>
                <p>This project doesn't have any phases. Create the first phase to get started.</p>
                {isAdmin && (
                    <Link to={`/projects/${projectId}/phases/new`} className="btn-primary">
                        + Add New Phase
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className="phases-list">
            <div className="phases-header">
                <h3>Project Phases</h3>
                {isAdmin && (
                    <Link to={`/projects/${projectId}/phases/new`} className="btn-small-primary">
                        + Add Phase
                    </Link>
                )}
            </div>
            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Phase Number</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Contract Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phases.map(phase => (
                            <tr key={phase.id}>
                                <td>{phase.phaseNumber}</td>
                                <td>{phase.name}</td>
                                <td>
                                    <span className={`badge badge-status ${phase.status?.toLowerCase()}`}>
                                        {phase.status}
                                    </span>
                                </td>
                                <td>
                                    {phase.contractAmount ? `₹${parseFloat(phase.contractAmount).toLocaleString('en-IN')}` : '-'}
                                </td>
                                <td>
                                    <Link to={`/projects/${projectId}/phases/${phase.id}/edit`} className="btn-small btn-outline">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PhaseList;
