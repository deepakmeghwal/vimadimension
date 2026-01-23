import React, { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    Paperclip,
    MoreHorizontal,
    Calendar,
    AlignLeft,
    Send,
    ChevronRight,
    User
} from 'lucide-react';
import { AssigneeSelector } from './AsanaListComponents';
import './ProjectDetails.css'; // Reusing existing styles where possible, will add specific ones

const PriorityIcon = ({ priority }) => {
    if (!priority) return null;

    if (priority === 'HIGH' || priority === 'URGENT')
        return <div className="priority-icon priority-high"></div>;
    if (priority === 'MEDIUM')
        return <div className="priority-icon priority-medium"></div>;
    return <div className="priority-icon priority-low"></div>;
};

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const STATUS_OPTIONS = ['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CHECKED', 'ON_HOLD'];

const TaskDetailPanel = ({ task, onClose, onSave, onUpdate, teamMembers }) => {
    const [desc, setDesc] = useState(task.description || '');
    const [name, setName] = useState(task.name || '');
    const [showAssigneeSelector, setShowAssigneeSelector] = useState(false);
    const [showCheckedBySelector, setShowCheckedBySelector] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPrioritySelector, setShowPrioritySelector] = useState(false);
    const [showStatusSelector, setShowStatusSelector] = useState(false);
    const [dueDate, setDueDate] = useState(task.dueDate || '');

    useEffect(() => {
        setDesc(task.description || '');
        setName(task.name || '');
        setDueDate(task.dueDate || '');
        setShowAssigneeSelector(false);
        setShowCheckedBySelector(false);
        setShowDatePicker(false);
        setShowPrioritySelector(false);
        setShowStatusSelector(false);
    }, [task]);

    // Close selector when clicking outside is handled by the selector itself or we can add a ref here if needed for deeper control
    // But AssigneeSelector in AsanaListComponents doesn't self-close on outside click effectively if not structured right.
    // Let's rely on a simplified approach or reusable component logic.
    // The previous AssigneeSelector implementation didn't have self-close logic embedded in itself strictly, 
    // it was controlled by the parent. Let's wrap it or handle click outside here if needed, 
    // but typically the dropdown is absolute.

    const handleAssigneeClick = (e) => {
        e.stopPropagation();
        setShowAssigneeSelector(!showAssigneeSelector);
        setShowCheckedBySelector(false); // Close other dropdown
    };

    const handleCheckedByClick = (e) => {
        e.stopPropagation();
        setShowCheckedBySelector(!showCheckedBySelector);
        setShowAssigneeSelector(false); // Close other dropdown
    };

    const handleNameBlur = () => {
        if (name !== task.name) {
            onUpdate(task.id, { name });
        }
    };

    const handleStatusToggle = () => {
        const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE';
        onUpdate(task.id, { status: newStatus });
    };

    return (
        <>
            <div className="task-panel-overlay" onClick={onClose}></div>
            <div className="task-detail-panel slide-in-right">
                <div className="task-panel-header">
                    <button
                        className={`btn-complete-toggle ${task.status === 'DONE' ? 'completed' : ''}`}
                        onClick={handleStatusToggle}
                    >
                        <CheckCircle2 size={18} />
                        {task.status === 'DONE' ? 'Completed' : 'Mark Complete'}
                    </button>

                    <div className="task-panel-actions">
                        <button onClick={onClose} className="btn-icon-panel close-btn"><ChevronRight size={20} /></button>
                    </div>
                </div>

                <div className="task-panel-content">
                    <div className="task-panel-main">
                        <input
                            className="task-panel-title-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onBlur={handleNameBlur}
                            placeholder="Task name"
                        />

                        <div className="task-panel-fields">
                            <div className="task-field-row" style={{ position: 'relative' }}>
                                <div className="task-field-label">Assignee</div>
                                <div
                                    className="task-field-value"
                                    onClick={handleAssigneeClick}
                                >
                                    {task.assignee ? (
                                        <div className="assignee-display">
                                            <div className="assignee-avatar-modal">
                                                {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span>{task.assignee.name || task.assignee.username}</span>
                                        </div>
                                    ) : (
                                        <div className="assignee-display">
                                            <div className="assignee-avatar-modal" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                                <User size={14} />
                                            </div>
                                            <span className="task-field-empty">Unassigned</span>
                                        </div>
                                    )}
                                </div>
                                {showAssigneeSelector && (
                                    <div style={{ position: 'absolute', top: '100%', left: '130px', zIndex: 100 }}>
                                        <AssigneeSelector
                                            members={teamMembers}
                                            onSelect={(user) => {
                                                onUpdate(task.id, { assignee: user });
                                                setShowAssigneeSelector(false);
                                            }}
                                            onClose={() => setShowAssigneeSelector(false)}
                                        />
                                        {/* Overlay to close on click outside */}
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAssigneeSelector(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="task-field-row" style={{ position: 'relative' }}>
                                <div className="task-field-label">Checked By</div>
                                <div
                                    className="task-field-value"
                                    onClick={handleCheckedByClick}
                                >
                                    {task.checkedBy ? (
                                        <div className="assignee-display">
                                            <div className="assignee-avatar-modal">
                                                {task.checkedBy.name ? task.checkedBy.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span>{task.checkedBy.name || task.checkedBy.username}</span>
                                        </div>
                                    ) : (
                                        <div className="assignee-display">
                                            <div className="assignee-avatar-modal" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                                                <User size={14} />
                                            </div>
                                            <span className="task-field-empty">Unassigned</span>
                                        </div>
                                    )}
                                </div>
                                {showCheckedBySelector && (
                                    <div style={{ position: 'absolute', top: '100%', left: '130px', zIndex: 100 }}>
                                        <AssigneeSelector
                                            members={teamMembers}
                                            onSelect={(user) => {
                                                console.log('Selected user for Checked By:', user);
                                                console.log('Task ID:', task.id);
                                                onUpdate(task.id, { checkedBy: user });
                                                setShowCheckedBySelector(false);
                                            }}
                                            onClose={() => setShowCheckedBySelector(false)}
                                        />
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowCheckedBySelector(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="task-field-row" style={{ position: 'relative' }}>
                                <div className="task-field-label">Due date</div>
                                <div
                                    className="task-field-value"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDatePicker(!showDatePicker);
                                        setShowPrioritySelector(false);
                                        setShowStatusSelector(false);
                                        setShowAssigneeSelector(false);
                                        setShowCheckedBySelector(false);
                                    }}
                                >
                                    <Calendar size={16} className="field-icon" />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
                                </div>
                                {showDatePicker && (
                                    <div style={{ position: 'absolute', top: '100%', left: '130px', zIndex: 100 }}>
                                        <div className="asana-dropdown-menu" style={{ padding: '0.75rem' }}>
                                            <input
                                                type="date"
                                                value={dueDate ? dueDate.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    setDueDate(newDate);
                                                    onUpdate(task.id, { dueDate: newDate });
                                                    setShowDatePicker(false);
                                                }}
                                                style={{
                                                    padding: '0.5rem',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem'
                                                }}
                                            />
                                            {task.dueDate && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDueDate('');
                                                        onUpdate(task.id, { dueDate: null });
                                                        setShowDatePicker(false);
                                                    }}
                                                    style={{
                                                        marginTop: '0.5rem',
                                                        padding: '0.375rem 0.75rem',
                                                        background: '#fee2e2',
                                                        color: '#dc2626',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        cursor: 'pointer',
                                                        width: '100%'
                                                    }}
                                                >
                                                    Clear date
                                                </button>
                                            )}
                                        </div>
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowDatePicker(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="task-field-row" style={{ position: 'relative' }}>
                                <div className="task-field-label">Priority</div>
                                <div
                                    className="task-field-value"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPrioritySelector(!showPrioritySelector);
                                        setShowDatePicker(false);
                                        setShowStatusSelector(false);
                                        setShowAssigneeSelector(false);
                                        setShowCheckedBySelector(false);
                                    }}
                                >
                                    <PriorityIcon priority={task.priority} />
                                    <span>{task.priority || 'None'}</span>
                                </div>
                                {showPrioritySelector && (
                                    <div style={{ position: 'absolute', top: '100%', left: '130px', zIndex: 100 }}>
                                        <div className="asana-dropdown-menu">
                                            {PRIORITY_OPTIONS.map(priority => (
                                                <div
                                                    key={priority}
                                                    className="asana-dropdown-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdate(task.id, { priority });
                                                        setShowPrioritySelector(false);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        padding: '0.5rem 0.75rem',
                                                        cursor: 'pointer',
                                                        background: task.priority === priority ? '#f1f5f9' : 'transparent'
                                                    }}
                                                >
                                                    <PriorityIcon priority={priority} />
                                                    <span>{priority}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowPrioritySelector(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="task-field-row" style={{ position: 'relative' }}>
                                <div className="task-field-label">Status</div>
                                <div
                                    className="task-field-value"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowStatusSelector(!showStatusSelector);
                                        setShowDatePicker(false);
                                        setShowPrioritySelector(false);
                                        setShowAssigneeSelector(false);
                                        setShowCheckedBySelector(false);
                                    }}
                                >
                                    <span className={`status-badge-modal ${task.status === 'TO_DO' ? 'status-badge-todo' :
                                        task.status === 'IN_PROGRESS' ? 'status-badge-in-progress' :
                                            task.status === 'IN_REVIEW' ? 'status-badge-in-review' :
                                                task.status === 'DONE' ? 'status-badge-done' :
                                                    task.status === 'CHECKED' ? 'status-badge-checked' :
                                                        'status-badge-on-hold'
                                        }`}>
                                        {task.status?.replace(/_/g, ' ') || 'To Do'}
                                    </span>
                                </div>
                                {showStatusSelector && (
                                    <div style={{ position: 'absolute', top: '100%', left: '130px', zIndex: 100 }}>
                                        <div className="asana-dropdown-menu">
                                            {STATUS_OPTIONS.map(status => (
                                                <div
                                                    key={status}
                                                    className="asana-dropdown-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdate(task.id, { status });
                                                        setShowStatusSelector(false);
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        cursor: 'pointer',
                                                        background: task.status === status ? '#f1f5f9' : 'transparent'
                                                    }}
                                                >
                                                    <span className={`status-badge-modal ${status === 'TO_DO' ? 'status-badge-todo' :
                                                        status === 'IN_PROGRESS' ? 'status-badge-in-progress' :
                                                            status === 'IN_REVIEW' ? 'status-badge-in-review' :
                                                                status === 'DONE' ? 'status-badge-done' :
                                                                    status === 'CHECKED' ? 'status-badge-checked' :
                                                                        'status-badge-on-hold'
                                                        }`}>
                                                        {status.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <div
                                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowStatusSelector(false);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="task-description-section">
                            <div className="task-description-header">
                                <AlignLeft size={18} />
                                <span>Description</span>
                            </div>
                            <textarea
                                className="task-description-input"
                                placeholder="What is this task about?"
                                value={desc}
                                onChange={(e) => {
                                    setDesc(e.target.value);
                                    // Debounce or save on blur could be better, but for now direct update
                                }}
                                onBlur={() => {
                                    if (desc !== task.description) {
                                        onUpdate(task.id, { description: desc });
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="task-panel-sidebar">
                        <h3 className="sidebar-title">Meta Data</h3>
                        <div className="sidebar-content">
                            <div className="sidebar-row">
                                <span>Created on</span>
                                <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                            </div>
                            <div className="sidebar-row">
                                <span>Created by</span>
                                <span>{task.reporter?.name || 'System'}</span>
                            </div>
                            <div className="sidebar-divider"></div>
                            <div className="sidebar-id">
                                Task ID: #{task.id.toString().substring(0, 6)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TaskDetailPanel;
