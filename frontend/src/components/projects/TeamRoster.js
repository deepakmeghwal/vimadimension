import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { SkeletonLoader } from '../common/SkeletonLoader';

const TeamRoster = ({ tasks, project }) => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const projectId = project?.id;

    useEffect(() => {
        if (projectId) {
            fetchTeamMembers();
        }
    }, [projectId]);

    const fetchTeamMembers = async () => {
        if (!projectId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/projects/${projectId}/team`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.team) {
                    setTeamMembers(data.team);
                }
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            setError('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    // Custom grid style for team members (3 columns: name, designation, email)
    const gridStyle = {
        gridTemplateColumns: '1.5fr 1fr 1.5fr'
    };

    if (!projectId) return null;

    return (
        <div className="project-tasks-tab">
            <div style={{ padding: '0.5rem 1rem 0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Team Members
                    <span className="board-column-count">{teamMembers.length}</span>
                </h2>
            </div>

            {error && (
                <div className="modern-alert error" style={{ margin: '0 1.5rem 1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            <div className="asana-task-list">
                <div className="asana-list-header" style={gridStyle}>
                    <div>Name</div>
                    <div>Designation</div>
                    <div>Email</div>
                </div>

                {loading ? (
                    <>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="asana-task-row skeleton-row" style={gridStyle}>
                                <div className="asana-task-name-cell">
                                    <SkeletonLoader type="circle" width="24px" height="24px" style={{ marginRight: '0.75rem' }} />
                                    <SkeletonLoader type="text" width="120px" height="1rem" />
                                </div>
                                <div className="asana-task-date">
                                    <SkeletonLoader type="text" width="100px" height="1rem" />
                                </div>
                                <div className="asana-task-date">
                                    <SkeletonLoader type="text" width="150px" height="1rem" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : teamMembers.length === 0 ? (
                    <div className="loading-state">
                        <p style={{ color: '#64748b' }}>No team members assigned to this project.</p>
                    </div>
                ) : (
                    <>
                        {teamMembers.map(member => (
                            <div key={member.id} className="asana-task-row" style={gridStyle}>
                                <div className="asana-task-name-cell">
                                    <div className="asana-avatar-small" style={{ marginRight: '0.75rem' }}>
                                        {member.name ? member.name.charAt(0).toUpperCase() : member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="task-name-display">{member.name || member.username}</span>
                                </div>
                                <div className="asana-task-date" style={{ color: '#334155' }}>
                                    {member.designation || '—'}
                                </div>
                                <div className="asana-task-date">
                                    {member.email ? (
                                        <a href={`mailto:${member.email}`} style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Mail size={12} />
                                            {member.email}
                                        </a>
                                    ) : '—'}
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamRoster;