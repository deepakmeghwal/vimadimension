import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import ProjectsListSkeleton from './ProjectsListSkeleton';
import './ProjectsList.css';

const ProjectsList = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filters, setFilters] = useState({
    chargeType: '',
    priority: '',
    status: ''
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    itemsPerPage: 9,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false
  });

  const isAdmin = user?.authorities?.some(auth => auth.authority === 'ROLE_ADMIN') || false;

  const projectChargeTypes = [
    { value: '', label: 'All Charge Types' },
    { value: 'REGULAR', label: 'Regular' },
    { value: 'OVERHEAD', label: 'Overhead' },
    { value: 'PROMOTIONAL', label: 'Promotional' }
  ];

  const projectPriorities = [
    { value: '', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const projectStatuses = [
    { value: '', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DORMANT', label: 'Dormant' }
  ];

  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.currentPage]);

  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      currentPage: 0
    }));
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        size: pagination.itemsPerPage.toString()
      });

      if (filters.chargeType) params.append('chargeType', filters.chargeType);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/projects/paginated?${params}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        setPagination(prev => ({
          ...prev,
          totalPages: data.totalPages || 0,
          totalItems: data.totalItems || 0,
          hasNext: data.hasNext || false,
          hasPrevious: data.hasPrevious || false
        }));
      } else {
        setError('Failed to load projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      chargeType: '',
      priority: '',
      status: ''
    });
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
  };

  const hasActiveFilters = filters.chargeType || filters.priority || filters.status;

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const formatStatus = (status) => {
    return status?.toLowerCase().replace(/_/g, '-') || '';
  };

  const formatPriority = (priority) => {
    return priority?.toLowerCase() || '';
  };

  const renderGridView = () => (
    <div className="projects-grid">
      {projects.map(project => (
        <Link
          key={project.id}
          to={`/projects/${project.id}/details`}
          className="project-card-modern"
        >
          <div className="project-card-modern-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {project.projectNumber && (
                <span className="project-card-number">#{project.projectNumber}</span>
              )}
              <span style={{ color: '#cbd5e1' }}>|</span>
              <div className="project-hero-stage-pill" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                <span className={`project-hero-status-dot ${project.status === 'ACTIVE' ? 'status-dot-green' :
                  project.status === 'ON_HOLD' ? 'status-dot-grey' :
                    project.status === 'AT_RISK' ? 'status-dot-red' : 'status-dot-grey'
                  }`} style={{ width: '8px', height: '8px', marginRight: '0.35rem' }}></span>
                {project.projectStage?.replace(/_/g, ' ') || 'Concept Design'}
              </div>
            </div>
            <h3 className="project-card-modern-title">{project.name}</h3>
          </div>

          <div className="project-card-modern-badges">
            {/* Badges removed in favor of new header design */}
          </div>

          {project.description && (
            <p className="project-card-description">
              {project.description.length > 120 ? `${project.description.substring(0, 120)}...` : project.description}
            </p>
          )}

          <div className="project-card-modern-meta">
            <div className="project-card-modern-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <div>
                <span className="project-card-modern-meta-label">Client</span>
                <span className="project-card-modern-meta-value">{project.clientName || 'N/A'}</span>
              </div>
            </div>
            <div className="project-card-modern-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div>
                <span className="project-card-modern-meta-label">Location</span>
                <span className="project-card-modern-meta-value">{project.location || 'N/A'}</span>
              </div>
            </div>
            <div className="project-card-modern-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <div>
                <span className="project-card-modern-meta-label">Start Date</span>
                <span className="project-card-modern-meta-value">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
            <div className="project-card-modern-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              <div>
                <span className="project-card-modern-meta-label">Charge Type</span>
                <span className="project-card-modern-meta-value">{project.chargeType?.replace(/_/g, ' ') || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="project-card-modern-footer">
            {isAdmin && project.budget && (
              <div className="project-budget">
                <span className="budget-label">Budget</span>
                <span className="budget-value">₹{parseFloat(project.budget).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="project-card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderListView = () => (
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
            {isAdmin && <th>Budget</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>
                <div style={{ fontWeight: 600, color: '#0f172a' }}>{project.name}</div>
                {project.projectStage && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {project.projectStage.replace(/_/g, ' ')}
                  </div>
                )}
              </td>
              <td>{project.clientName}</td>
              <td>{project.chargeType?.replace(/_/g, ' ')}</td>
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
              <td>{project.location}</td>
              <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}</td>
              {isAdmin && (
                <td>
                  {project.budget ? `₹${parseFloat(project.budget).toLocaleString('en-IN')}` : '-'}
                </td>
              )}
              <td>
                <Link
                  to={`/projects/${project.id}/details`}
                  className="btn-small btn-outline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (loading) return <ProjectsListSkeleton />;

  return (
    <div className="main-content projects-list-page fade-in">
      <div className="projects-header-compact">
        <div className="projects-header-left">
          <h1 className="projects-title-compact">Projects <span className="projects-count">({pagination.totalItems})</span></h1>
        </div>
        <div className="projects-header-right">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`btn-filter-compact ${hasActiveFilters ? 'active' : ''}`}
            title="Filter projects"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
            {hasActiveFilters && <span className="filter-badge"></span>}
          </button>
          <div className="view-toggle-compact">
            <button
              className={`view-toggle-btn-compact ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`view-toggle-btn-compact ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
          <Link to="/projects/new" className="btn-new-project-compact">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Project
          </Link>
        </div>
      </div>

      {showFilterModal && (
        <ProjectFilterModal
          filters={filters}
          projectChargeTypes={projectChargeTypes}
          projectPriorities={projectPriorities}
          projectStatuses={projectStatuses}
          onApply={applyFilters}
          onClose={() => setShowFilterModal(false)}
          onClear={clearFilters}
        />
      )}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center">
          <p>{pagination.totalItems === 0 ? 'No projects found.' : 'No projects match the selected filters.'}</p>
          {pagination.totalItems > 0 && (
            <button onClick={clearFilters} className="btn-outline">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>
              Page {pagination.currentPage + 1} of {pagination.totalPages}
            </span>
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

            <div className="page-numbers">
              {Array.from({ length: pagination.totalPages }, (_, i) => i)
                .filter(page => {
                  return page === 0 ||
                    page === pagination.totalPages - 1 ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1);
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="page-ellipsis">...</span>}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`btn-small ${page === pagination.currentPage ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {page + 1}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

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

// Project Filter Modal Component
const ProjectFilterModal = ({ filters, projectChargeTypes, projectPriorities, projectStatuses, onApply, onClose, onClear }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      chargeType: '',
      priority: '',
      status: ''
    };
    setLocalFilters(clearedFilters);
    onClear();
  };

  const hasFilters = localFilters.chargeType || localFilters.priority || localFilters.status;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="project-filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-filter-modal-header">
          <div className="project-filter-modal-header-content">
            <div className="project-filter-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <div>
              <h2 className="project-filter-modal-title">Filter Projects</h2>
              <p className="project-filter-modal-subtitle">Refine your project list by applying filters</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="project-filter-modal-body">
          <div className="project-filter-form">
            <div className="form-group">
              <label htmlFor="chargeType">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                Charge Type
              </label>
              <select
                id="chargeType"
                value={localFilters.chargeType}
                onChange={(e) => handleChange('chargeType', e.target.value)}
                className="form-control"
              >
                {projectChargeTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Status
              </label>
              <select
                id="status"
                value={localFilters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="form-control"
              >
                {projectStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Priority
              </label>
              <select
                id="priority"
                value={localFilters.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="form-control"
              >
                {projectPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="project-filter-modal-footer">
          <button
            onClick={handleClear}
            className="btn-outline-modern"
            disabled={!hasFilters}
          >
            Clear Filters
          </button>
          <button
            onClick={handleApply}
            className="btn-primary-modern"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;