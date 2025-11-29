import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AuditLogList from '../common/AuditLogList';
import ActivityLog from './ActivityLog';
import TeamRoster from './TeamRoster';
import ClientContacts from './ClientContacts';
import ResourcePlanner from './ResourcePlanner';
import ProjectLifecycleChevron from './ProjectLifecycleChevron';
import FinancialScorecard from './FinancialScorecard';
import ProjectFinancialsTab from './ProjectFinancialsTab';
import ProjectInvoicesTab from './ProjectInvoicesTab';
import LoadingSpinner from '../common/LoadingSpinner';
import ProjectDetailsSkeleton from './ProjectDetailsSkeleton';
import './ProjectDetails.css';

const PAGE_SIZE = 12;

const ProjectDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [phases, setPhases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const prevProjectIdRef = useRef(id);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const totalTasks = pagination.totalItems ?? tasks.length;
  const isTaskListEmpty = totalTasks === 0;
  const showPagination = !isTaskListEmpty && pagination.totalPages > 1;

  // Check if user has admin role
  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  // Check if user has manager role
  const isManager = () => user?.authorities?.some(auth => auth.authority === 'ROLE_MANAGER') || false;

  const fetchProjectDetails = async (pageToLoad = 0) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/projects/${id}/details?page=${pageToLoad}&size=${PAGE_SIZE}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setPhases(data.phases || []);
        const taskList = data.tasks || [];
        setTasks(taskList);
        const paginationPayload = data.taskPagination || {};
        const normalizedPagination = {
          currentPage: typeof paginationPayload.currentPage === 'number' ? paginationPayload.currentPage : pageToLoad,
          pageSize: typeof paginationPayload.pageSize === 'number' ? paginationPayload.pageSize : PAGE_SIZE,
          totalItems: typeof paginationPayload.totalItems === 'number' ? paginationPayload.totalItems : taskList.length,
          totalPages: typeof paginationPayload.totalPages === 'number' ? paginationPayload.totalPages : (taskList.length > 0 ? 1 : 0),
          hasNext: Boolean(paginationPayload.hasNext),
          hasPrevious: Boolean(paginationPayload.hasPrevious),
        };
        setPagination(normalizedPagination);
        if (normalizedPagination.currentPage !== pageToLoad) {
          setPage(prev => (prev === normalizedPagination.currentPage ? prev : normalizedPagination.currentPage));
        }
      } else {
        if (response.status === 404) {
          setError('Project not found');
        } else {
          const errorData = await response.json().catch(() => null);
          setError(errorData?.error || errorData?.message || 'Failed to load project details');
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refetch when project id or page changes
  useEffect(() => {
    let pageToLoad = page;
    if (prevProjectIdRef.current !== id) {
      prevProjectIdRef.current = id;
      if (page !== 0) {
        setPage(0);
        return;
      }
      pageToLoad = 0;
    }
    fetchProjectDetails(pageToLoad);
  }, [id, page]);

  // Set active tab from location state if available
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state so it doesn't persist on refresh if we don't want it to, 
      // but actually for history navigation it's fine. 
      // However, react-router state persists.
      // We might want to clear it to avoid stuck state, but usually it's fine.
    }
  }, [location.state]);

  // Refetch tasks when switching to the tasks tab
  useEffect(() => {
    if (activeTab === 'tasks' && project && !loading) {
      fetchProjectDetails(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatStatus = (status) => {
    if (!status) return 'to-do';
    return status.toLowerCase().replace(/_/g, '-');
  };

  const formatPriority = (priority) => {
    if (!priority) return 'medium';
    return priority.toLowerCase();
  };

  const getStatusClass = (status) => {
    if (!status) return 'to-do';

    switch (status.toString().toLowerCase()) {
      case 'done':
        return 'done';
      case 'in_progress':
      case 'in progress':
        return 'in-progress';
      case 'in_review':
        return 'in-review';
      case 'on_hold':
        return 'on-hold';
      case 'to_do':
      default:
        return 'to-do';
    }
  };

  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-medium';

    switch (priority.toString().toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'urgent':
        return 'priority-urgent';
      case 'low':
        return 'priority-low';
      case 'medium':
      default:
        return 'priority-medium';
    }
  };

  const handleDeleteProject = async () => {
    const taskCount = totalTasks;
    let confirmMessage = 'Are you sure you want to delete this project? This action cannot be undone.';

    if (taskCount > 0) {
      confirmMessage = `This project has ${taskCount} task${taskCount > 1 ? 's' : ''}. You cannot delete a project with existing tasks. Please delete or reassign all tasks first, then try again.`;
      alert(confirmMessage);
      return;
    }

    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/projects/${id}/delete`, {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          navigate('/projects');
        } else {
          // Try to get the error message from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || errorData?.message || 'Failed to delete project';
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        setError('Failed to delete project');
      }
    }
  };

  const handleDeleteTask = async (taskId, taskName) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          const isLastItemOnPage = tasks.length === 1;
          const targetPage = isLastItemOnPage && page > 0 ? page - 1 : page;
          if (targetPage === page) {
            fetchProjectDetails(page);
          } else {
            setPage(targetPage);
          }
        } else {
          // Try to get the error message from the response
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || errorData?.message || 'Failed to delete task';
          setError(errorMessage);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      }
    }
  };

  const canEditTask = (task) => {
    if (!user || !task) return false;

    // User can edit if they are:
    // 1. Assigned to the task
    // 2. Creator of the task  
    // 3. Assigned as checker of the task
    // 4. Admin user
    return (
      (task.assignee && task.assignee.id === user.id) ||
      (task.reporter && task.reporter.id === user.id) ||
      (task.checkedBy && task.checkedBy.id === user.id) ||
      (user.authorities && user.authorities.some(auth => auth.authority === 'ROLE_ADMIN'))
    );
  };

  const goToPreviousPage = () => {
    if (pagination.hasPrevious) {
      setPage(prev => Math.max(prev - 1, 0));
    }
  };

  const goToNextPage = () => {
    if (pagination.hasNext) {
      setPage(prev => prev + 1);
    }
  };

  if (loading && !project) return <ProjectDetailsSkeleton />;
  if (error) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;
  if (!project) return <div className="main-content">Project not found</div>;

  // Calculate task stats
  const taskStats = {
    total: totalTasks,
    todo: tasks.filter(t => t.status === 'TO_DO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
    done: tasks.filter(t => t.status === 'DONE').length
  };

  // Mock Financial Data (Replace with real data from backend later)
  const mockFinancials = {
    contractAmount: project.budget || 5000000, // Default 50L if no budget
    billedAmount: project.actualCost || 1500000, // Default 15L if no cost
    receivedAmount: 1200000
  };

  return (
    <div className="main-content project-details-page fade-in">
      {/* Back Navigation */}
      <div className="project-details-nav">
        <Link to="/projects" className="back-link-modern">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Projects
        </Link>
      </div>

      {/* Hero Section */}
      <div className="project-hero-section">
        <div className="project-hero-header">
          <div className="project-hero-title-section">
            <div style={{ width: '100%' }}>
              <div className="project-hero-main-row" style={{ alignItems: 'center', gap: '1rem' }}>
                {project.projectNumber && (
                  <span className="project-hero-number" style={{
                    backgroundColor: '#f1f5f9',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}>
                    #{project.projectNumber}
                  </span>
                )}

                {project.projectNumber && <span style={{ color: '#cbd5e1', fontSize: '1.25rem', fontWeight: 300 }}>|</span>}

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`project-hero-status-dot ${project.status === 'ACTIVE' ? 'status-dot-green' :
                      project.status === 'ON_HOLD' ? 'status-dot-grey' :
                        project.status === 'AT_RISK' ? 'status-dot-red' : 'status-dot-grey'
                      }`} style={{ width: '12px', height: '12px' }}></span>
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.025em'
                    }}>
                      {project.projectStage?.replace(/_/g, ' ') || 'PRELIM'}
                    </span>
                  </div>

                  <h1 className="project-hero-title" style={{
                    margin: 0,
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#6366f1',
                    lineHeight: 1.2
                  }}>
                    {project.name}
                  </h1>
                </div>
              </div>

              <div className="project-hero-badges">
                {/* Removed old badges as they are replaced by the new header design */}
              </div>
            </div>
            <div className="project-hero-meta">
              {project.clientName && (
                <div className="project-hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>{project.clientName}</span>
                </div>
              )}
              {project.location && (
                <div className="project-hero-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{project.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="project-hero-actions">
            <Link
              to={`/projects/${id}/tasks/new`}
              className="btn-primary-modern"
              title="Add New Task"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Task
            </Link>
            {isAdmin && (
              <>
                <Link to={`/projects/${id}/edit`} className="btn-icon-modern" title="Edit project">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </Link>
                <button
                  onClick={handleDeleteProject}
                  className="btn-icon-modern btn-icon-danger"
                  disabled={totalTasks > 0}
                  title={totalTasks > 0 ? `Cannot delete project with ${totalTasks} task${totalTasks > 1 ? 's' : ''}. Delete or reassign tasks first.` : "Delete this project permanently"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>


      </div>

      {/* Project Details Modal */}
      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="project-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="project-details-modal-header">
              <div className="project-details-modal-header-content">
                <div className="project-details-modal-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 className="project-details-modal-title">Project Details</h2>
                  <p className="project-details-modal-subtitle">{project.name}</p>
                </div>
              </div>
              <button className="modal-close-button" onClick={() => setShowDetailsModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="project-details-modal-body">
              <div className="project-details-info-grid">
                <div className="project-details-info-section">
                  <h3 className="project-details-section-title">Basic Information</h3>
                  <div className="project-details-info-list">
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Status</span>
                      <span className={`badge badge-project-status ${formatStatus(project.status)}`}>
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Priority</span>
                      <span className={`badge badge-priority ${formatPriority(project.priority)}`}>
                        {project.priority?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Stage</span>
                      <span className={`stage-${project.projectStage?.toLowerCase().replace(/_/g, '-')}`}>
                        {project.projectStage?.displayName || project.projectStage?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Client</span>
                      <span className="project-details-info-value">{project.clientName || 'N/A'}</span>
                    </div>
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Location</span>
                      <span className="project-details-info-value">{project.location || 'N/A'}</span>
                    </div>
                    {project.projectCategory && (
                      <div className="project-details-info-item">
                        <span className="project-details-info-label">Category</span>
                        <span className="project-details-info-value">{project.projectCategory.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="project-details-info-section">
                  <h3 className="project-details-section-title">Dates & Timeline</h3>
                  <div className="project-details-info-list">
                    <div className="project-details-info-item">
                      <span className="project-details-info-label">Start Date</span>
                      <span className="project-details-info-value">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                    {project.estimatedEndDate && (
                      <div className="project-details-info-item">
                        <span className="project-details-info-label">Estimated End Date</span>
                        <span className="project-details-info-value">
                          {new Date(project.estimatedEndDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {project.createdAt && (
                      <div className="project-details-info-item">
                        <span className="project-details-info-label">Created</span>
                        <span className="project-details-info-value">
                          {new Date(project.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {project.updatedAt && (
                      <div className="project-details-info-item">
                        <span className="project-details-info-label">Last Updated</span>
                        <span className="project-details-info-value">
                          {new Date(project.updatedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isAdmin && (project.budget || project.actualCost) && (
                  <div className="project-details-info-section">
                    <h3 className="project-details-section-title">Financial Information</h3>
                    <div className="project-details-info-list">
                      {project.budget && (
                        <div className="project-details-info-item">
                          <span className="project-details-info-label">Budget</span>
                          <span className="project-details-info-value budget-value">
                            ₹{project.budget.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      {project.actualCost && (
                        <div className="project-details-info-item">
                          <span className="project-details-info-label">Actual Cost</span>
                          <span className="project-details-info-value cost-value">
                            ₹{project.actualCost.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {project.description && (
                  <div className="project-details-info-section full-width">
                    <h3 className="project-details-section-title">Description</h3>
                    <p className="project-details-description">{project.description}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="project-details-modal-footer">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="btn-outline-modern"
              >
                Close
              </button>
              {isAdmin && (
                <Link
                  to={`/projects/${id}/edit`}
                  className="btn-primary-modern"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <i className="fas fa-edit"></i> Edit Project
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="project-tabs-container">
        <div className="project-tabs">
          <button
            className={`project-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Overview
          </button>

          <button
            className={`project-tab ${activeTab === 'contacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Client Contacts
          </button>

          <button
            className={`project-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Team
          </button>

          <button
            className={`project-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Tasks ({totalTasks})
          </button>

          {(isAdmin || isManager()) && (
            <button
              className={`project-tab ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
              </svg>
              Resource Planning
            </button>
          )}

          {(isAdmin || isManager()) && (
            <>
              <button
                className={`project-tab ${activeTab === 'invoices' ? 'active' : ''}`}
                onClick={() => setActiveTab('invoices')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Invoices
              </button>
              <button
                className={`project-tab ${activeTab === 'financials' ? 'active' : ''}`}
                onClick={() => setActiveTab('financials')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Financials
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="project-tab-content" style={{ position: 'relative', minHeight: '200px' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            borderRadius: '12px'
          }}>
            <LoadingSpinner size="medium" />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="project-overview-grid">
              <div className="project-overview-card">
                <div className="project-overview-card-header">
                  <h3 className="project-overview-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Project Lifecycle
                  </h3>
                </div>
                <div className="project-overview-card-body">
                  <ProjectLifecycleChevron currentStage={project.projectStage} horizontal={false} />
                </div>
              </div>
              <div className="project-overview-card">
                <div className="project-overview-card-header">
                  <h3 className="project-overview-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </svg>
                    Project Details
                  </h3>
                </div>
                <div className="project-overview-card-body">
                  <div className="project-details-overview">
                    <div className="project-details-overview-section">
                      <div className="project-details-overview-item">
                        <span className="project-details-overview-label">Status</span>
                        <span className={`badge badge-project-status ${formatStatus(project.status)}`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="project-details-overview-item">
                        <span className="project-details-overview-label">Priority</span>
                        <span className={`badge badge-priority ${formatPriority(project.priority)}`}>
                          {project.priority?.replace('_', ' ')}
                        </span>
                      </div>
                      {project.projectCategory && (
                        <div className="project-details-overview-item">
                          <span className="project-details-overview-label">Category</span>
                          <span className="project-details-overview-value">{project.projectCategory.replace('_', ' ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="project-details-overview-section">
                      <div className="project-details-overview-item">
                        <span className="project-details-overview-label">Start Date</span>
                        <span className="project-details-overview-value">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>
                      {project.estimatedEndDate && (
                        <div className="project-details-overview-item">
                          <span className="project-details-overview-label">Estimated End Date</span>
                          <span className="project-details-overview-value">
                            {new Date(project.estimatedEndDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {project.createdAt && (
                        <div className="project-details-overview-item">
                          <span className="project-details-overview-label">Created</span>
                          <span className="project-details-overview-value">
                            {new Date(project.createdAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      {project.updatedAt && (
                        <div className="project-details-overview-item">
                          <span className="project-details-overview-label">Last Updated</span>
                          <span className="project-details-overview-value">
                            {new Date(project.updatedAt).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    {isAdmin && (project.budget || project.actualCost) && (
                      <div className="project-details-overview-section">
                        {project.budget && (
                          <div className="project-details-overview-item">
                            <span className="project-details-overview-label">Budget</span>
                            <span className="project-details-overview-value budget-value">
                              ₹{project.budget.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        {project.actualCost && (
                          <div className="project-details-overview-item">
                            <span className="project-details-overview-label">Actual Cost</span>
                            <span className="project-details-overview-value cost-value">
                              ₹{project.actualCost.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {project.description && (
                      <div className="project-details-overview-section full-width">
                        <div className="project-details-overview-item">
                          <span className="project-details-overview-label">Description</span>
                          <p className="project-details-overview-description">{project.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="project-tasks-tab">
            <div className="tab-header-standard" style={{ padding: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div className="project-tasks-header-content">
                <h2 className="tab-header-title">Project Tasks</h2>
                <Link to={`/projects/${id}/tasks/new`} className="btn-icon-modern" title="Add New Task">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Task Statistics */}
            <div className="project-stats-grid" style={{ padding: '1.5rem' }}>
              <div className="project-stat-card">
                <div className="stat-icon stat-icon-tasks">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{taskStats.total}</div>
                  <div className="stat-label">Total Tasks</div>
                </div>
              </div>
              <div className="project-stat-card">
                <div className="stat-icon stat-icon-progress">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{taskStats.inProgress}</div>
                  <div className="stat-label">In Progress</div>
                </div>
              </div>
              <div className="project-stat-card">
                <div className="stat-icon stat-icon-review">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <path d="M14 2v6h6"></path>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{taskStats.inReview}</div>
                  <div className="stat-label">In Review</div>
                </div>
              </div>
              <div className="project-stat-card">
                <div className="stat-icon stat-icon-done">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{taskStats.done}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>
            </div>

            {isTaskListEmpty ? (
              <div className="project-empty-state">
                <div className="empty-state-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <h3 className="empty-state-title">No tasks yet</h3>
                <p className="empty-state-description">This project doesn't have any tasks. Create the first task to get started.</p>
              </div>
            ) : (
              <div className="project-tasks-list">
                {tasks.map(task => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}/details`}
                    className="project-task-list-item"
                  >
                    <div className="project-task-list-main">
                      <div className="project-task-list-title-section">
                        <h3 className="project-task-list-title">{task.name}</h3>
                        <div className="project-task-list-badges">
                          <span className={`badge badge-status ${getStatusClass(task.status)}`}>
                            {task.status?.replace(/_/g, ' ')}
                          </span>
                          {task.priority && (
                            <span className={`badge badge-priority ${getPriorityClass(task.priority)}`}>
                              {task.priority.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="project-task-list-meta">
                        {task.assignee && (
                          <div className="project-task-list-meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>{task.assignee.name || task.assignee.username}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className={`project-task-list-meta-item ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                            {new Date(task.dueDate) < new Date() && (
                              <span className="overdue-badge">OVERDUE</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="project-task-list-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {showPagination && (
              <div className="project-pagination">
                <button
                  type="button"
                  className="btn-outline-modern"
                  onClick={goToPreviousPage}
                  disabled={!pagination.hasPrevious}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="btn-outline-modern"
                  onClick={goToNextPage}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}



        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="project-team-tab">
            <div className="project-team-grid">
              <div className="project-team-card">
                <div className="project-team-card-header">
                  <h3 className="project-team-card-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Team Roster
                  </h3>
                </div>
                <div className="project-team-card-body">
                  <TeamRoster tasks={tasks} project={project} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="project-contacts-tab">
            <div className="project-contacts-grid">
              <div className="project-contacts-column">
                <div className="project-team-card">
                  <div className="project-team-card-header">
                    <h3 className="project-team-card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Client Contacts
                    </h3>
                  </div>
                  <div className="project-team-card-body">
                    <ClientContacts clientId={project.clientId} />
                  </div>
                </div>
              </div>
              <div className="project-contacts-column">
                <div className="project-team-card">
                  <div className="project-team-card-header">
                    <h3 className="project-team-card-title">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      Recent Activity
                    </h3>
                  </div>
                  <div className="project-team-card-body">
                    <ActivityLog projectId={id} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financials Tab */}
        {activeTab === 'financials' && (
          <div className="empty-state-container" style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="empty-state-title" style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>Coming Soon</h3>
            <p className="empty-state-description" style={{ color: '#64748b' }}>The Financials module is currently under development.</p>
          </div>
        )}

        {/* Invoices Tab */}
        {(isAdmin || isManager()) && activeTab === 'invoices' && (
          <ProjectInvoicesTab project={project} />
        )}

        {/* Resource Planning Tab */}
        {(isAdmin || isManager()) && activeTab === 'resources' && (
          <div className="project-resources-tab">
            <ResourcePlanner projectId={id} />
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectDetails;
