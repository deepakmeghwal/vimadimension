import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { apiGet } from '../../utils/api';
import ResourceAllocator from '../projects/ResourceAllocator';
import '../projects/ProjectsList.css';

/**
 * ResourcePlanningDashboard - Shows project list (like Projects page), click to view resource planning
 */
const ResourcePlanningDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { isAdmin, isManager } = usePermissions(user);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0
    });

    useEffect(() => {
        if (!user) {
            navigate('/projects');
            return;
        }
        if (!isAdmin() && !isManager()) {
            navigate('/projects');
            return;
        }
        // Only fetch projects list when not viewing a specific project
        if (!projectId) {
            fetchProjects();
        }
    }, [user, navigate, isAdmin, isManager, pagination.currentPage, projectId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.currentPage.toString(),
                size: pagination.itemsPerPage.toString()
            });

            const response = await apiGet(`/api/projects/paginated?${params}`);
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
                setPagination(prev => ({
                    ...prev,
                    totalPages: data.totalPages || 0,
                    totalItems: data.totalItems || 0
                }));
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const formatStatus = (status) => status?.toLowerCase().replace(/_/g, '-') || '';
    const formatPriority = (priority) => priority?.toLowerCase() || '';

    if (!user || (!isAdmin() && !isManager())) {
        return null;
    }

    // If projectId is present, show ResourceAllocator
    if (projectId) {
        const project = projects.find(p => p.id === parseInt(projectId));
        return (
            <div className="main-content fade-in" style={{ padding: '1.5rem' }}>
                {/* Back button */}
                <button
                    onClick={() => navigate('/finance/resource-planning')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        marginBottom: '1rem',
                        padding: 0
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Projects
                </button>

                {/* Project title */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1rem' }}>
                    {project?.name || `Project #${projectId}`}
                </h1>

                {/* ResourceAllocator */}
                <ResourceAllocator projectId={parseInt(projectId)} />
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="main-content fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <p style={{ color: '#64748b' }}>Loading projects...</p>
            </div>
        );
    }

    // Show project list (same style as ProjectsList)
    return (
        <div className="main-content projects-list-page fade-in">
            <div className="projects-header-compact">
                <div className="projects-header-left">
                    <h1 className="projects-title-compact">Resource Planning <span className="projects-count">({pagination.totalItems})</span></h1>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center">
                    <p>No projects found.</p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Client</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr
                                    key={project.id}
                                    onClick={() => navigate(`/finance/resource-planning/${project.id}`)}
                                    style={{ cursor: 'pointer' }}
                                    className="project-list-row-clickable"
                                >
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{project.name}</div>
                                        {project.projectStage && (
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                {project.projectStage.replace(/_/g, ' ')}
                                            </div>
                                        )}
                                    </td>
                                    <td>{project.clientName}</td>
                                    <td>
                                        <span className={`badge badge-project-status ${formatStatus(project.status)}`}>
                                            {project.status?.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-priority ${formatPriority(project.priority)}`}>
                                            {project.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-small btn-outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/finance/resource-planning/${project.id}`);
                                            }}
                                        >
                                            Plan Resources
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination-controls">
                    <div className="pagination-info">
                        <span>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
                    </div>
                    <div className="pagination-buttons">
                        <button
                            onClick={() => handlePageChange(0)}
                            disabled={pagination.currentPage === 0}
                            className="btn-small btn-outline"
                        >
                            First
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 0}
                            className="btn-small btn-outline"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages - 1}
                            className="btn-small btn-outline"
                        >
                            Next
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.totalPages - 1)}
                            disabled={pagination.currentPage === pagination.totalPages - 1}
                            className="btn-small btn-outline"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourcePlanningDashboard;
