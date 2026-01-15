import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { apiGet } from '../../utils/api';
import '../projects/ProjectsList.css';
import '../projects/ProjectDetails.css'; // Import ProjectDetails styles
import {
    ChevronRight,
    Receipt,
    CheckCircle2,
    FileText,
    AlertCircle
} from 'lucide-react';


/**
 * GenerateInvoices - Select project and phase to generate invoice
 * Shows substages that must be completed before invoice can be generated
 */
const GenerateInvoices = ({ user }) => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const { isAdmin, isManager } = usePermissions(user);
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [phases, setPhases] = useState([]);
    const [project, setProject] = useState(null);
    const [expandedPhase, setExpandedPhase] = useState(null);
    const [substages, setSubstages] = useState({});
    const [completionStatus, setCompletionStatus] = useState({});
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

        if (projectId) {
            fetchProject();
            fetchPhases();
        } else {
            fetchProjects();
        }
    }, [user, navigate, isAdmin, isManager, projectId, pagination.currentPage]);

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

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setProject(data);
            }
        } catch (err) {
            console.error('Error fetching project:', err);
        }
    };

    const fetchPhases = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/projects/${projectId}/phases`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                setPhases(data || []);
                // Fetch completion status for each phase
                for (const phase of (data || [])) {
                    fetchPhaseSubstages(phase.id);
                }
            }
        } catch (err) {
            console.error('Error fetching phases:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPhaseSubstages = async (phaseId) => {
        try {
            const response = await fetch(`/api/phases/${phaseId}/substages`, { credentials: 'include' });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSubstages(prev => ({ ...prev, [phaseId]: data.substages || [] }));
                    setCompletionStatus(prev => ({ ...prev, [phaseId]: data.completionStatus }));
                }
            }
        } catch (err) {
            console.error('Error fetching substages:', err);
        }
    };

    const createDefaultSubstages = async (phaseId) => {
        try {
            const response = await fetch(`/api/phases/${phaseId}/substages/create-defaults`, {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                await fetchPhaseSubstages(phaseId);
            }
        } catch (err) {
            console.error('Error creating substages:', err);
        }
    };

    const toggleSubstageComplete = async (phaseId, substageId, isComplete) => {
        try {
            const endpoint = isComplete ? 'incomplete' : 'complete';
            const response = await fetch(`/api/phases/${phaseId}/substages/${substageId}/${endpoint}`, {
                method: 'PUT',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Update local state
                    setSubstages(prev => ({
                        ...prev,
                        [phaseId]: prev[phaseId].map(s =>
                            s.id === substageId ? data.substage : s
                        )
                    }));
                    setCompletionStatus(prev => ({ ...prev, [phaseId]: data.completionStatus }));
                }
            }
        } catch (err) {
            console.error('Error toggling substage:', err);
        }
    };

    const handleGenerateInvoice = (phase) => {
        navigate(`/invoices/new?projectId=${projectId}&phaseId=${phase.id}`, {
            state: {
                project: project,
                phase: phase
            }
        });
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
    };

    const togglePhaseExpand = (phaseId) => {
        setExpandedPhase(expandedPhase === phaseId ? null : phaseId);
    };

    const formatStatus = (status) => status?.toLowerCase().replace(/_/g, '-') || '';
    const formatPriority = (priority) => priority?.toLowerCase() || '';

    if (!user || (!isAdmin() && !isManager())) {
        return null;
    }

    // If projectId is present, show phases with substages
    if (projectId) {
        return (
            <div className="project-details-page fade-in">
                {/* Modern Header */}
                <div className="project-header-modern">
                    <div className="project-header-top">
                        <div className="project-header-left">
                            <button
                                onClick={() => navigate('/finance/generate-invoices')}
                                className="btn-icon-back"
                                style={{ marginRight: '1rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                            >
                                <ChevronRight className="w-6 h-6 text-slate-400 rotate-180" />
                            </button>
                            <div className="project-icon-square" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                                <Receipt size={20} />
                            </div>
                            <div className="project-title-wrapper">
                                <h1 className="project-title-modern">
                                    {project?.name || 'Project'}
                                    <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal', marginLeft: '0.5rem' }}>
                                        / Generate Invoice
                                    </span>
                                </h1>
                            </div>
                        </div>
                    </div>
                    {/* Tabs / Sub-header */}
                    <div className="project-tabs-modern">
                        <button className="project-tab-modern active">
                            <FileText size={16} />
                            Select Phase
                        </button>
                    </div>
                </div>

                <div className="project-content-area" style={{ padding: '0 2rem 2rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>

                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                            Loading phases...
                        </div>
                    ) : phases.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <AlertCircle size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>No Phases Found</h3>
                            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                                This project doesn't have any phases defined yet.
                            </p>
                        </div>
                    ) : (
                        <div className="phases-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                            {phases.map((phase, index) => {
                                const status = completionStatus[phase.id] || {};
                                const phaseSubstages = substages[phase.id] || [];
                                const isExpanded = expandedPhase === phase.id;
                                const canInvoice = status.allComplete === true || phaseSubstages.length === 0;

                                return (
                                    <div
                                        key={phase.id}
                                        style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            background: '#fff',
                                            overflow: 'hidden',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {/* Phase Header */}
                                        <div
                                            style={{
                                                padding: '1.25rem 1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                background: isExpanded ? '#f8fafc' : '#fff',
                                                borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none'
                                            }}
                                            onClick={() => togglePhaseExpand(phase.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div
                                                    style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: '#f1f5f9',
                                                        borderRadius: '6px',
                                                        color: '#64748b'
                                                    }}
                                                >
                                                    <ChevronRight size={16} style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                                </div>

                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1.1rem' }}>
                                                        {phase.name}
                                                    </div>
                                                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontWeight: 500 }}>Phase {index + 1}</span>
                                                        <span>•</span>
                                                        <span>{phase.contractAmount ? `₹${parseFloat(phase.contractAmount).toLocaleString('en-IN')}` : 'No amount set'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                {/* Completion Progress */}
                                                {phaseSubstages.length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: status.allComplete ? '#16a34a' : '#64748b' }}>
                                                                {status.complete || 0}/{status.total || 0} Deliverables
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            width: '120px',
                                                            height: '6px',
                                                            background: '#e2e8f0',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                height: '100%',
                                                                width: `${status.percentage || 0}%`,
                                                                background: status.allComplete ? '#22c55e' : '#3b82f6',
                                                                transition: 'width 0.3s ease'
                                                            }} />
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    className="btn-primary-modern"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (canInvoice) handleGenerateInvoice(phase);
                                                    }}
                                                    disabled={!canInvoice}
                                                    style={{
                                                        opacity: canInvoice ? 1 : 0.6,
                                                        cursor: canInvoice ? 'pointer' : 'not-allowed',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 1rem',
                                                        background: canInvoice ? '#0f172a' : '#94a3b8',
                                                        color: 'white',
                                                        borderRadius: '6px',
                                                        border: 'none',
                                                        fontWeight: 500,
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    <Receipt size={16} />
                                                    Generate Invoice
                                                </button>
                                            </div>
                                        </div>

                                        {/* Substages List (Expanded) */}
                                        {isExpanded && (
                                            <div style={{ padding: '0', background: '#fcfcfc' }}>
                                                {phaseSubstages.length === 0 ? (
                                                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                                                            No deliverables defined for this stage.
                                                        </p>
                                                        <button
                                                            className="btn-outline-modern"
                                                            onClick={() => createDefaultSubstages(phase.id)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                border: '1px solid #cbd5e1',
                                                                borderRadius: '6px',
                                                                background: 'white',
                                                                color: '#475569',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Add Default Deliverables
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {phaseSubstages.map(substage => (
                                                            <div
                                                                key={substage.id}
                                                                onClick={() => toggleSubstageComplete(phase.id, substage.id, substage.isCompleted)}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '1rem',
                                                                    padding: '1rem 1.5rem',
                                                                    borderBottom: '1px solid #f1f5f9',
                                                                    cursor: 'pointer',
                                                                    transition: 'background 0.1s ease',
                                                                    background: substage.isCompleted ? '#f0fdf4' : 'white'
                                                                }}
                                                                className="hover:bg-slate-50"
                                                            >
                                                                <div
                                                                    style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        borderRadius: '50%',
                                                                        border: substage.isCompleted ? 'none' : '2px solid #cbd5e1',
                                                                        background: substage.isCompleted ? '#22c55e' : 'transparent',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        color: 'white'
                                                                    }}
                                                                >
                                                                    {substage.isCompleted && <CheckCircle2 size={14} />}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <span style={{
                                                                        fontSize: '0.95rem',
                                                                        color: substage.isCompleted ? '#64748b' : '#334155',
                                                                        textDecoration: substage.isCompleted ? 'line-through' : 'none',
                                                                        fontWeight: 500
                                                                    }}>
                                                                        {substage.name}
                                                                    </span>
                                                                </div>
                                                                {substage.isCompleted && substage.completedByName && (
                                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>
                                                                        Completed by {substage.completedByName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
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

    // Show project list
    return (
        <div className="main-content projects-list-page fade-in">
            <div className="projects-header-compact">
                <div className="projects-header-left">
                    <h1 className="projects-title-compact">
                        Generate Invoices
                        <span className="projects-count">({pagination.totalItems})</span>
                    </h1>
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
                                    onClick={() => navigate(`/finance/generate-invoices/${project.id}`)}
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
                                                navigate(`/finance/generate-invoices/${project.id}`);
                                            }}
                                        >
                                            View Stages
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

export default GenerateInvoices;
