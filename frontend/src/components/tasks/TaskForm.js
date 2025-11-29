import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PROJECT_STAGES, TASK_PRIORITIES } from '../../constants/projectEnums';

// Searchable User Select Component
const SearchableUserSelect = ({
  users,
  value,
  onChange,
  name,
  placeholder = "Select user",
  emptyText = "Unassigned",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const userName = (user.name || user.username || '').toLowerCase();
    const userUsername = (user.username || '').toLowerCase();
    return userName.includes(searchLower) || userUsername.includes(searchLower);
  });

  // Show first 10 users by default, or all filtered users if searching
  const displayUsers = searchTerm ? filteredUsers : filteredUsers.slice(0, 10);

  // Get selected user
  const selectedUser = users.find(u => u.id.toString() === value?.toString());

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < displayUsers.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && displayUsers[highlightedIndex]) {
          handleSelect(displayUsers[highlightedIndex]);
        } else if (highlightedIndex === -1) {
          handleSelect(null); // Clear selection
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleSelect = (user) => {
    onChange({
      target: {
        name: name,
        value: user ? user.id.toString() : ''
      }
    });
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  return (
    <div className="searchable-select" ref={dropdownRef}>
      <div
        className={`searchable-select-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={toggleDropdown}
      >
        <span className="searchable-select-value">
          {selectedUser ? (selectedUser.name || selectedUser.username) : emptyText}
        </span>
        <svg
          className="searchable-select-arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or username..."
              className="searchable-select-input"
            />
          </div>
          <div className="searchable-select-options">
            <div
              className={`searchable-select-option ${highlightedIndex === -1 ? 'highlighted' : ''} ${!value ? 'selected' : ''}`}
              onClick={() => handleSelect(null)}
              onMouseEnter={() => setHighlightedIndex(-1)}
            >
              <span className="searchable-select-option-text">{emptyText}</span>
            </div>
            {displayUsers.map((user, index) => (
              <div
                key={user.id}
                className={`searchable-select-option ${highlightedIndex === index ? 'highlighted' : ''} ${value?.toString() === user.id.toString() ? 'selected' : ''}`}
                onClick={() => handleSelect(user)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="searchable-select-option-content">
                  <span className="searchable-select-option-name">
                    {user.name || user.username}
                  </span>
                  {user.name && user.username && (
                    <span className="searchable-select-option-username">
                      @{user.username}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {displayUsers.length === 0 && (
              <div className="searchable-select-option disabled">
                <span className="searchable-select-option-text">No users found</span>
              </div>
            )}
            {!searchTerm && filteredUsers.length > 10 && (
              <div className="searchable-select-hint">
                Showing 10 of {filteredUsers.length} users. Type to search...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TaskForm = () => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectStage: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
    checkedById: ''
  });
  const [phases, setPhases] = useState([]);
  const [fetchingPhases, setFetchingPhases] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  // Using shared constants from projectEnums.js

  useEffect(() => {
    fetchUsers();
    fetchProjectDetails();
    fetchPhases();
  }, []);

  const fetchPhases = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/phases`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPhases(data);
      }
    } catch (error) {
      console.error('Error fetching phases:', error);
    } finally {
      setFetchingPhases(false);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/details`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use projectId in the URL
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'name': formData.name,
          'description': formData.description,
          'projectStage': formData.projectStage,
          'priority': formData.priority,
          'dueDate': formData.dueDate,
          'assigneeId': formData.assigneeId,
          'checkedById': formData.checkedById
        }),
        credentials: 'include'
      });

      if (response.ok) {
        navigate(`/projects/${projectId}/details`);
      } else {
        const errorData = await response.json();
        console.error('Task creation failed:', errorData);
        setError(errorData.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <h1 className="page-title">
        {project ? `Create New Task for ${project.name}` : 'Create New Task'}
      </h1>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="project-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Task Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Enter task name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Acceptance Criteria</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="This task will be done when the following acceptance criteria is completed..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectStage">Project Lifecycle Stage *</label>
              <select
                id="projectStage"
                name="projectStage"
                value={formData.projectStage}
                onChange={handleChange}
                required
              >
                <option value="">Select a lifecycle stage</option>
                {PROJECT_STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                {TASK_PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                placeholder="Select due date (optional)"
              />
              <small className="form-help">Optional due date for the task</small>
            </div>

            <div className="form-group">
              <label htmlFor="assigneeId">Assign To</label>
              <SearchableUserSelect
                users={users}
                value={formData.assigneeId}
                onChange={handleChange}
                name="assigneeId"
                placeholder="Search and select user..."
                emptyText="Unassigned"
                disabled={fetchingUsers}
              />
              <small className="form-help">Optional: assign task to a team member</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="checkedById">Checked By</label>
              <SearchableUserSelect
                users={users}
                value={formData.checkedById}
                onChange={handleChange}
                name="checkedById"
                placeholder="Search and select checker..."
                emptyText="No checker assigned"
                disabled={fetchingUsers}
              />
              <small className="form-help">Optional: assign a checker to verify task completion</small>
            </div>
          </div>

          <div className="project-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate(`/projects/${projectId}/details`)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;