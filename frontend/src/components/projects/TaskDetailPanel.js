import React, { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    Paperclip,
    MoreHorizontal,
    Calendar,
    AlignLeft,
    Send,
    ChevronRight
} from 'lucide-react';
import './ProjectDetails.css'; // Reusing existing styles where possible, will add specific ones

const PriorityIcon = ({ priority }) => {
    if (!priority) return null;

    if (priority === 'HIGH' || priority === 'URGENT')
        return <div className="priority-icon priority-high"></div>;
    if (priority === 'MEDIUM')
        return <div className="priority-icon priority-medium"></div>;
    return <div className="priority-icon priority-low"></div>;
};

const TaskDetailPanel = ({ task, onClose, onSave, onUpdate }) => {
    const [desc, setDesc] = useState(task.description || '');
    const [name, setName] = useState(task.name || '');

    useEffect(() => {
        setDesc(task.description || '');
        setName(task.name || '');
    }, [task]);

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
                            <div className="task-field-row">
                                <div className="task-field-label">Assignee</div>
                                <div className="task-field-value">
                                    {task.assignee ? (
                                        <div className="assignee-display">
                                            <div className="assignee-avatar-modal">
                                                {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span>{task.assignee.name || task.assignee.username}</span>
                                        </div>
                                    ) : (
                                        <span className="task-field-empty">Unassigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="task-field-row">
                                <div className="task-field-label">Due date</div>
                                <div className="task-field-value">
                                    <Calendar size={16} className="field-icon" />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}
                                </div>
                            </div>

                            <div className="task-field-row">
                                <div className="task-field-label">Priority</div>
                                <div className="task-field-value">
                                    <PriorityIcon priority={task.priority} />
                                    <span>{task.priority || 'None'}</span>
                                </div>
                            </div>

                            <div className="task-field-row">
                                <div className="task-field-label">Status</div>
                                <div className="task-field-value">
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
