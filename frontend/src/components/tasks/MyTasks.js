import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { SkeletonTaskRow } from '../common/SkeletonLoader';
import TaskDetailPanel from '../projects/TaskDetailPanel';
import { AsanaSection, AsanaTaskRow, formatStatus, formatPriority } from '../projects/AsanaListComponents';
import '../projects/ProjectDetails.css';
import './MyTasks.css';

const MyTasks = ({ user }) => {
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);
  const isMyTasks = location.pathname === '/my-tasks';

  // Single state for all tasks
  const [allTasks, setAllTasks] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
    pageSize: 50 // Larger page size to get more tasks at once
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
  const [showStandaloneForm, setShowStandaloneForm] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    assigneeIds: [], // Array of selected user IDs
    status: [],
    priority: []
  });

  const [selectedTaskForPanel, setSelectedTaskForPanel] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/tasks/users', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            setAvailableUsers(data.users);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Fetch tasks with filters via API call
  const fetchTasks = async (page = 0, currentFilters = null) => {
    try {
      setLoading(true);
      setError('');

      // Use provided filters or current state filters
      const activeFilters = currentFilters || filters;

      const params = new URLSearchParams({
        page: page.toString(),
        size: pagination.pageSize.toString()
      });

      // If on /my-tasks route, use the backend endpoint that filters by current user
      // Otherwise, use the general tasks endpoint with assignee filters if provided
      let apiEndpoint = '/api/tasks';

      if (isMyTasks) {
        // Use the backend endpoint that automatically filters by authenticated user
        apiEndpoint = '/api/tasks/assigned-to-me';
      } else if (activeFilters.assigneeIds && activeFilters.assigneeIds.length > 0) {
        // If assignees are selected, filter by the first assignee (backend supports single assigneeId)
        params.append('assigneeId', activeFilters.assigneeIds[0].toString());
      }

      // Apply status and priority filters to the API call
      if (activeFilters.status && activeFilters.status.length > 0) {
        activeFilters.status.forEach(s => params.append('status', s));
      }
      if (activeFilters.priority && activeFilters.priority.length > 0) {
        activeFilters.priority.forEach(p => params.append('priority', p));
      }

      const response = await fetch(`${apiEndpoint}?${params.toString()}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        setError('Failed to load tasks');
        return false;
      }

      const data = await response.json();
      setAllTasks(data.tasks || []);
      setPagination({
        currentPage: data.currentPage ?? page,
        totalPages: data.totalPages ?? 0,
        totalItems: data.totalItems ?? 0,
        hasNext: data.hasNext ?? false,
        hasPrevious: data.hasPrevious ?? false,
        pageSize: data.pageSize ?? pagination.pageSize
      });

      return true;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch tasks based on route
  useEffect(() => {
    if (user) {
      fetchTasks(0);
    }
  }, [user, isMyTasks]);

  // Refetch tasks when navigating to this route from another route
  useEffect(() => {
    const isTasksRoute = location.pathname === '/my-tasks' || location.pathname === '/tasks';

    // Refetch if we're on a tasks route and the pathname changed
    // This includes switching between /my-tasks and /tasks
    if (user && isTasksRoute && prevPathnameRef.current !== location.pathname) {
      fetchTasks(0);
    }

    // Update the ref for the next render
    prevPathnameRef.current = location.pathname;
  }, [location.pathname, user, isMyTasks]);

  // Don't auto-refetch on filter change - let user click Apply button instead

  // Tasks are already filtered by API, just use them directly
  const currentTasks = allTasks;

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchTasks(newPage);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    // Optimistic Update
    setAllTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, ...updates } : t
    ));

    try {
      const apiPayload = { ...updates };
      if (updates.assignee) {
        apiPayload.assigneeId = updates.assignee.id;
        delete apiPayload.assignee;
      } else if (updates.assignee === null) {
        apiPayload.assigneeId = null;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (error) {
      console.error('Task update failed:', error);
      // Revert changes by refetching
      fetchTasks(pagination.currentPage);
    }
  };

  const handleCreateStandaloneTask = async (formData) => {
    try {
      const response = await fetch('/api/tasks/create-standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include',
        body: new URLSearchParams(formData)
      });

      if (response.ok) {
        setShowStandaloneForm(false);
        fetchTasks(pagination.currentPage);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create standalone task');
      }
    } catch (error) {
      console.error('Error creating standalone task:', error);
      setError('Failed to create standalone task');
    }
  };



  const hasActiveFilters = () => {
    return filters.assigneeIds.length > 0 || filters.status.length > 0 || filters.priority.length > 0;
  };

  const clearFilters = () => {
    const clearedFilters = {
      assigneeIds: [],
      status: [],
      priority: []
    };
    setFilters(clearedFilters);
    // Reset to default view - fetch all tasks
    fetchTasks(0, clearedFilters);
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    // Fetch tasks with new filters immediately
    fetchTasks(0, newFilters);
  };

  const renderListView = (tasks) => {
    const gridTemplateColumns = 'minmax(400px, 1fr) 150px 150px 120px 120px 80px';

    return (
      <div className="asana-list-view" style={{ padding: '0 20px' }}>
        <div className="asana-list-header" style={{ gridTemplateColumns }}>
          <div className="header-cell">Task name</div>
          <div className="header-cell">Assignee</div>
          <div className="header-cell">Due date</div>
          <div className="header-cell">Priority</div>
          <div className="header-cell">Status</div>
          <div className="header-cell"></div>
        </div>

        <div className="asana-list-body">
          <AsanaSection
            title="Tasks"
            tasks={tasks}
            defaultExpanded={true}
            gridTemplateColumns={gridTemplateColumns}
            renderRow={(task) => (
              <AsanaTaskRow
                key={task.id}
                task={task}
                teamMembers={availableUsers} // Pass fetched users here
                onUpdate={handleTaskUpdate}
                onOpenDetails={() => setSelectedTaskForPanel(task)}
                gridTemplateColumns={gridTemplateColumns}
              />
            )}
          />
        </div>
      </div>
    );
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) {
      console.error('No taskId found in drag data');
      return;
    }

    const taskToUpdate = allTasks.find(t => t.id.toString() === taskId);
    if (!taskToUpdate) {
      console.error('Task not found');
      return;
    }

    const oldStatus = taskToUpdate.status;

    // Optimistically update UI
    setAllTasks(prev => prev.map(task =>
      task.id.toString() === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        // Rollback on error
        setAllTasks(prev => prev.map(task =>
          task.id.toString() === taskId ? { ...task, status: oldStatus } : task
        ));
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setAllTasks(prev => prev.map(task =>
        task.id.toString() === taskId ? { ...task, status: oldStatus } : task
      ));
      setError('Failed to update task status');
    }
  };

  const renderBoardView = (tasks) => {
    const statuses = ['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    const statusLabels = {
      'TO_DO': 'To Do',
      'IN_PROGRESS': 'In Progress',
      'IN_REVIEW': 'In Review',
      'DONE': 'Done'
    };

    const tasksByStatus = statuses.reduce((acc, status) => {
      acc[status] = tasks.filter(task => task.status === status);
      return acc;
    }, {});

    return (
      <div className="kanban-board">
        {statuses.map(status => (
          <div
            key={status}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="kanban-column-header">
              <span className="kanban-column-title">{statusLabels[status]}</span>
              <span className="kanban-column-count">{tasksByStatus[status].length}</span>
            </div>
            <div className="kanban-column-cards">
              {tasksByStatus[status].map(task => (
                <div
                  key={task.id}
                  className="board-task-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className="board-task-card-content"
                    onClick={() => setSelectedTaskForPanel(task)}
                  >
                    <div className="task-card-row-1">
                      <div className="task-check-icon">
                        <CheckCircle2 size={18} className="text-gray-400" />
                      </div>
                      <div className="task-card-name">{task.name}</div>
                    </div>

                    <div className="task-card-row-2">
                      <span className={`badge badge-priority ${formatPriority(task.priority)}`}>
                        {task.priority || 'Medium'}
                      </span>
                      <span className={`badge badge-status ${formatStatus(task.status)}`}>
                        {task.status?.replace(/_/g, ' ') || 'To Do'}
                      </span>
                    </div>

                    <div className="task-card-row-3">
                      {task.assignee && (
                        <div className="task-assignee-avatar-small" title={task.assignee.name || task.assignee.username}>
                          {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      {task.dueDate && (
                        <div className={`task-due-date-text ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn-task-details-slider board-card-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTaskForPanel(task);
                    }}
                  >
                    <ChevronRight size={14} />
                    Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, pageSize, totalItems, totalPages, hasPrevious, hasNext } = pagination;
    const hasItems = totalItems > 0;
    const startItem = hasItems ? currentPage * pageSize + 1 : 0;
    const endItem = hasItems ? Math.min((currentPage + 1) * pageSize, totalItems) : 0;

    return (
      <div className="pagination-controls">
        <div className="pagination-info">
          {hasItems ? `Showing ${startItem} to ${endItem} of ${totalItems} tasks` : 'No tasks to display'}
        </div>
        <div className="pagination-buttons">
          <button
            className="btn-small btn-outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevious}
          >
            ← Previous
          </button>
          <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.875rem' }}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            className="btn-small btn-outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            Next →
          </button>
        </div>
      </div>
    );
  };

  if (loading && allTasks.length === 0) {
    const gridTemplateColumns = 'minmax(400px, 1fr) 150px 150px 120px 120px 80px';
    return (
      <div className="main-content my-tasks-page">
        <div className="projects-header-compact">
          <div className="projects-header-left">
            <h1 className="projects-title-compact">Tasks</h1>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="asana-list-view" style={{ padding: '0 20px' }}>
            <div className="asana-list-header" style={{ gridTemplateColumns }}>
              <div className="header-cell">Task name</div>
              <div className="header-cell">Assignee</div>
              <div className="header-cell">Due date</div>
              <div className="header-cell">Priority</div>
              <div className="header-cell">Status</div>
              <div className="header-cell"></div>
            </div>
            <div className="asana-list-body">
              <div className="asana-section">
                <div className="asana-section-header">
                  <span style={{ width: '100px', height: '1.2em', background: '#f1f5f9', borderRadius: '4px' }}></span>
                </div>
                <div className="asana-section-body">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <SkeletonTaskRow key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="main-content my-tasks-page">
      <div className="projects-header-compact">
        <div className="projects-header-left">
          <h1 className="projects-title-compact">
            {isMyTasks ? 'My Tasks' : 'Tasks'}
            <span className="projects-count">({currentTasks.length})</span>
          </h1>
        </div>
        <div className="projects-header-right">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`btn-filter-compact ${hasActiveFilters() ? 'active' : ''}`}
            title="Filter tasks"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filter
            {hasActiveFilters() && <span className="filter-badge"></span>}
          </button>
          <div className="view-toggle-compact">
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
            <button
              className={`view-toggle-btn-compact ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
              title="Board view"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {showFilterModal && (
        <TaskFilterModal
          filters={filters}
          onApply={applyFilters}
          onClose={() => setShowFilterModal(false)}
          onClear={clearFilters}
          isMyTasks={isMyTasks}
        />
      )}

      {showStandaloneForm && (
        <StandaloneTaskForm
          onSubmit={handleCreateStandaloneTask}
          onCancel={() => setShowStandaloneForm(false)}
        />
      )}

      {currentTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p>No tasks found in this category.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? renderListView(currentTasks) : renderBoardView(currentTasks)}
          {renderPaginationControls()}
        </>
      )}

      {selectedTaskForPanel && (
        <TaskDetailPanel
          task={selectedTaskForPanel}
          onClose={() => setSelectedTaskForPanel(null)}
          onUpdate={handleTaskUpdate}
          teamMembers={availableUsers}
        />
      )}
    </div>
  );
};

// Task Filter Modal Component
const TaskFilterModal = ({ filters, onApply, onClose, onClear, isMyTasks = false }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const taskStatuses = [
    { value: 'TO_DO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'DONE', label: 'Done' },
    { value: 'CHECKED', label: 'Checked' },
    { value: 'ON_HOLD', label: 'On Hold' }
  ];

  const taskPriorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  // Initialize selected users from filters
  useEffect(() => {
    const loadUserDetails = async () => {
      if (filters.assigneeIds && filters.assigneeIds.length > 0) {
        try {
          const response = await fetch('/api/tasks/users', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.users) {
              const users = data.users.filter(user => filters.assigneeIds.includes(user.id));
              setSelectedUsers(users);
            }
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      } else {
        setSelectedUsers([]);
      }
    };
    loadUserDetails();
  }, [filters.assigneeIds]);


  const searchUsers = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/tasks/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          const queryLower = query.toLowerCase().trim();
          const filtered = data.users.filter(user => {
            const userId = user.id.toString();
            const username = (user.username || '').toLowerCase();
            const name = (user.name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();

            return userId.includes(queryLower) ||
              username.includes(queryLower) ||
              name.includes(queryLower) ||
              email.includes(queryLower);
          });
          setSearchResults(filtered);
          setShowResults(true);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showResults && !event.target.closest('.user-search-container')) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showResults]);

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      const newUsers = [...selectedUsers, user];
      setSelectedUsers(newUsers);
      setLocalFilters(prev => ({
        ...prev,
        assigneeIds: newUsers.map(u => u.id)
      }));
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleUserRemove = (userId) => {
    const newUsers = selectedUsers.filter(u => u.id !== userId);
    setSelectedUsers(newUsers);
    setLocalFilters(prev => ({
      ...prev,
      assigneeIds: newUsers.map(u => u.id)
    }));
  };

  const handleStatusChange = (value) => {
    setLocalFilters(prev => ({
      ...prev,
      status: prev.status.includes(value)
        ? prev.status.filter(s => s !== value)
        : [...prev.status, value]
    }));
  };

  const handlePriorityChange = (value) => {
    setLocalFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(value)
        ? prev.priority.filter(p => p !== value)
        : [...prev.priority, value]
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      assigneeIds: [],
      status: [],
      priority: []
    };
    setLocalFilters(clearedFilters);
    setSelectedUsers([]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    onClear();
  };

  const hasFilters = localFilters.assigneeIds.length > 0 || localFilters.status.length > 0 || localFilters.priority.length > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-filter-modal-header">
          <div className="task-filter-modal-header-content">
            <div className="task-filter-modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <div>
              <h2 className="task-filter-modal-title">Filter Tasks</h2>
              <p className="task-filter-modal-subtitle">Refine your task list by applying filters</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="task-filter-modal-body">
          <div className="task-filter-form">
            {!isMyTasks && (
              <div className="form-group">
                <label htmlFor="userSearch">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Filter by User
                </label>
                <div className="user-search-container" style={{ position: 'relative' }}>
                  <div className="user-search-input-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }}>
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      id="userSearch"
                      className="user-search-input"
                      placeholder="Search by username, name, email, or user ID..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() => searchQuery && searchResults.length > 0 && setShowResults(true)}
                    />
                    {isSearching && (
                      <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <div className="spinner-small"></div>
                      </div>
                    )}
                  </div>

                  {showResults && searchResults.length > 0 && (
                    <div className="user-search-results">
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          className="user-search-result-item"
                          onClick={() => handleUserSelect(user)}
                        >
                          <div className="user-search-result-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-search-result-info">
                            <div className="user-search-result-name">{user.name || user.username}</div>
                            <div className="user-search-result-meta">
                              {user.username} {user.email && `• ${user.email}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedUsers.length > 0 && (
                    <div className="selected-users-list">
                      {selectedUsers.map(user => (
                        <div key={user.id} className="selected-user-chip">
                          <div className="selected-user-avatar">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="selected-user-name">{user.name || user.username}</span>
                          <button
                            type="button"
                            className="selected-user-remove"
                            onClick={() => handleUserRemove(user.id)}
                            aria-label="Remove user"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Status
              </label>
              <div className="checkbox-group">
                {taskStatuses.map(status => (
                  <label key={status.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={status.value}
                      checked={localFilters.status.includes(status.value)}
                      onChange={() => handleStatusChange(status.value)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
                Priority
              </label>
              <div className="checkbox-group">
                {taskPriorities.map(priority => (
                  <label key={priority.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={priority.value}
                      checked={localFilters.priority.includes(priority.value)}
                      onChange={() => handlePriorityChange(priority.value)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{priority.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="task-filter-modal-footer">
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

// Standalone Task Form Component (keeping existing implementation)
const StandaloneTaskForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    checkedById: ''
  });
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);

  const taskPriorities = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/tasks/users', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.users) {
          setUsers(data.users);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.assigneeId || !formData.checkedById) {
      alert('Please select both Assignee and Checker');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create Standalone Task</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Task Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange}>
                {taskPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Assignee *</label>
              <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} required>
                <option value="">Select assignee</option>
                {!fetchingUsers && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Checked By *</label>
              <select name="checkedById" value={formData.checkedById} onChange={handleChange} required>
                <option value="">Select checker</option>
                {!fetchingUsers && users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.username}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyTasks;
