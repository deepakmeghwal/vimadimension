import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import './ProjectDetails.css';

// --- Helper Functions ---
export const formatStatus = (status) => {
    if (!status) return 'to-do';
    return status.toLowerCase().replace(/_/g, '-');
};

export const formatPriority = (priority) => {
    if (!priority) return 'medium';
    return priority.toLowerCase();
};

export const getPriorityClass = (priority) => {
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

export const getStatusClass = (status) => {
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

// --- Components ---

export const PriorityIcon = ({ priority }) => {
    if (!priority) return null;

    if (priority === 'HIGH' || priority === 'URGENT')
        return <div className="priority-icon priority-high"></div>;
    if (priority === 'MEDIUM')
        return <div className="priority-icon priority-medium"></div>;
    return <div className="priority-icon priority-low"></div>;
};

export const AssigneeSelector = ({ members, onSelect, onClose }) => {
    const [search, setSearch] = useState('');
    const inputRef = useRef(null);

    const filteredMembers = members?.filter(m =>
        (m.name || m.username).toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    ) || [];

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
        }
    }, []);

    return (
        <div className="asana-dropdown-menu assignee-dropdown">
            <div className="assignee-search-container">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    className="asana-dropdown-search"
                    placeholder="Search people..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="dropdown-divider"></div>
            <div className="asana-dropdown-list">
                {filteredMembers.map(member => (
                    <div
                        key={member.id}
                        className="asana-dropdown-item user-item"
                        onClick={() => onSelect(member)}
                    >
                        <div className="asana-avatar-medium">
                            {member.name ? member.name.charAt(0).toUpperCase() : member.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{member.name || member.username}</span>
                            <span className="user-email">{member.email}</span>
                        </div>
                        {/* Optional: Add a checkmark if selected, but we don't have selected state passed in right now */}
                    </div>
                ))}
                {filteredMembers.length === 0 && (
                    <div className="asana-dropdown-empty">
                        <p>No members found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AsanaSection = ({ title, tasks, defaultExpanded = true, renderRow, onAddTask }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className="asana-section">
            <div className="asana-section-header" onClick={() => setIsExpanded(!isExpanded)}>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`asana-section-toggle ${!isExpanded ? 'collapsed' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                {title}
            </div>
            {isExpanded && (
                <div className="asana-section-body">
                    {tasks.map(task => renderRow(task))}
                    {onAddTask && (
                        <div className="asana-add-task-row" onClick={onAddTask}>
                            Add task...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const AsanaTaskRow = ({ task, teamMembers, onUpdate, onCommit, onOpenDetails, gridTemplateColumns }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [name, setName] = useState(task.name);

    // Selectors State
    const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);
    const [showStatusSelector, setShowStatusSelector] = useState(false);

    const rowRef = useRef(null);
    const nameInputRef = useRef(null);
    const assigneeRef = useRef(null);
    const priorityRef = useRef(null);
    const statusRef = useRef(null);

    const isFormMode = isHovered || isFocused || task.isTemp || showAssigneeSelector || showPrioritySelector || showStatusSelector;

    useEffect(() => {
        if (task.isTemp && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [task.isTemp]);

    // Close selectors on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rowRef.current && !rowRef.current.contains(event.target)) {
                setIsFocused(false);
            }
            if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
                setShowAssigneeSelector(false);
            }
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setShowPrioritySelector(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setShowStatusSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNameSubmit = () => {
        if (task.isTemp) {
            if (onCommit) onCommit(task.id, { ...task, name });
        } else if (name !== task.name) {
            if (onUpdate) onUpdate(task.id, { name });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const handleFocus = () => setIsFocused(true);

    return (
        <div
            className={`asana-task-row ${isFormMode ? 'form-mode' : ''}`}
            style={{ gridTemplateColumns }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={rowRef}
        >
            <div className="asana-task-name-cell">
                {isFormMode ? (
                    <input
                        ref={nameInputRef}
                        type="text"
                        className="asana-task-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameSubmit}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        placeholder="Write a task name"
                    />
                ) : (
                    <div className="task-name-content">
                        <span className="task-name-display">
                            {task.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Assignee Cell */}
            <div className="asana-task-assignee" ref={assigneeRef} style={{ position: 'relative' }}>
                {isFormMode ? (
                    <>
                        <div
                            className="asana-cell-trigger form-input"
                            onClick={() => {
                                setShowAssigneeSelector(!showAssigneeSelector);
                                handleFocus();
                            }}
                        >
                            {task.assignee ? (
                                <>
                                    <div className="asana-avatar-small">
                                        {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <span className="asana-assignee-name">{task.assignee.name || task.assignee.username}</span>
                                </>
                            ) : (
                                <span className="placeholder-text">Assignee</span>
                            )}
                        </div>
                        {showAssigneeSelector && (
                            <AssigneeSelector
                                members={teamMembers}
                                onSelect={(user) => {
                                    if (onUpdate) onUpdate(task.id, { assignee: user });
                                    setShowAssigneeSelector(false);
                                }}
                                onClose={() => setShowAssigneeSelector(false)}
                            />
                        )}
                    </>
                ) : (
                    task.assignee && (
                        <div className="asana-assignee-display">
                            <div className="asana-avatar-small" title={task.assignee.name || task.assignee.username}>
                                {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="asana-assignee-name">{task.assignee.name || task.assignee.username}</span>
                        </div>
                    )
                )}
            </div>

            {/* Due Date Cell */}
            <div
                className="asana-task-date"
                onClick={() => {
                    const dateInput = rowRef.current?.querySelector('.asana-date-input');
                    if (dateInput) {
                        dateInput.showPicker && dateInput.showPicker();
                        dateInput.focus();
                    }
                }}
            >
                {isFormMode || !task.dueDate ? (
                    <input
                        type="date"
                        className="asana-date-input form-input"
                        value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => onUpdate && onUpdate(task.id, { dueDate: e.target.value })}
                        onFocus={handleFocus}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (e.target.showPicker) e.target.showPicker();
                        }}
                    />
                ) : (
                    <span className={task.dueDate && new Date(task.dueDate) < new Date() ? 'overdue' : ''}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                )}
            </div>

            {/* Priority Cell */}
            <div style={{ position: 'relative' }} ref={priorityRef}>
                {isFormMode ? (
                    <>
                        <div
                            className="asana-cell-trigger form-input"
                            onClick={() => {
                                setShowPrioritySelector(!showPrioritySelector);
                                handleFocus();
                            }}
                        >
                            {task.priority ? (
                                <span className={`asana-priority-badge priority-${task.priority.toLowerCase()}`}>
                                    {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                                </span>
                            ) : (
                                <span className="asana-priority-none">—</span>
                            )}
                        </div>
                        {showPrioritySelector && (
                            <div className="asana-dropdown-menu">
                                <div
                                    className="asana-dropdown-item"
                                    onClick={() => {
                                        if (onUpdate) onUpdate(task.id, { priority: null });
                                        setShowPrioritySelector(false);
                                    }}
                                >
                                    <span className="asana-priority-none">—</span>
                                </div>
                                {[
                                    { value: 'LOW', label: 'Low', class: 'low' },
                                    { value: 'MEDIUM', label: 'Medium', class: 'medium' },
                                    { value: 'HIGH', label: 'High', class: 'high' }
                                ].map(p => (
                                    <div
                                        key={p.value}
                                        className="asana-dropdown-item"
                                        onClick={() => {
                                            if (onUpdate) onUpdate(task.id, { priority: p.value });
                                            setShowPrioritySelector(false);
                                        }}
                                    >
                                        <span className={`asana-priority-badge priority-${p.class}`}>
                                            {p.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    task.priority && (
                        <span className={`asana-priority-badge priority-${task.priority.toLowerCase()}`}>
                            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                        </span>
                    )
                )}
            </div>

            {/* Status Cell */}
            <div style={{ position: 'relative' }} ref={statusRef}>
                {isFormMode ? (
                    <>
                        <div
                            className="asana-cell-trigger form-input"
                            onClick={() => {
                                setShowStatusSelector(!showStatusSelector);
                                handleFocus();
                            }}
                        >
                            <span className={`asana-badge status-${task.status === 'IN_PROGRESS' ? 'on-track' : task.status === 'AT_RISK' ? 'at-risk' : task.status === 'ON_HOLD' ? 'on-hold' : 'on-track'}`}>
                                {task.status === 'IN_PROGRESS' ? 'On track' : task.status?.replace(/_/g, ' ') || 'On track'}
                            </span>
                        </div>
                        {showStatusSelector && (
                            <div className="asana-dropdown-menu">
                                {[
                                    { value: 'TO_DO', label: 'To Do', class: 'on-track' },
                                    { value: 'IN_PROGRESS', label: 'On Track', class: 'on-track' },
                                    { value: 'IN_REVIEW', label: 'In Review', class: 'on-track' },
                                    { value: 'DONE', label: 'Done', class: 'on-track' },
                                    { value: 'ON_HOLD', label: 'On Hold', class: 'on-hold' },
                                    { value: 'AT_RISK', label: 'At Risk', class: 'at-risk' }
                                ].map(s => (
                                    <div
                                        key={s.value}
                                        className="asana-dropdown-item"
                                        onClick={() => {
                                            if (onUpdate) onUpdate(task.id, { status: s.value });
                                            setShowStatusSelector(false);
                                        }}
                                    >
                                        <span className={`asana-badge status-${s.class}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <span className={`asana-badge status-${task.status === 'IN_PROGRESS' ? 'on-track' : task.status === 'AT_RISK' ? 'at-risk' : task.status === 'ON_HOLD' ? 'on-hold' : 'on-track'}`}>
                        {task.status === 'IN_PROGRESS' ? 'On track' : task.status?.replace(/_/g, ' ') || 'On track'}
                    </span>
                )}
            </div>

            <div>
                {isHovered && (
                    <button
                        className="btn-task-details-slider"
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails();
                        }}
                        style={{ marginLeft: 'auto', marginRight: '8px' }}
                    >
                        <ChevronRight size={14} />
                        Details
                    </button>
                )}
            </div>
        </div>
    );
};
