import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../common/PageHeader';
import { ChevronRight } from 'lucide-react';
import TaskDetailPanel from '../projects/TaskDetailPanel';
import { AsanaSection, AsanaTaskRow } from '../projects/AsanaListComponents';
import '../projects/ProjectDetails.css';
import './MyApprovals.css';
import { SkeletonTaskRow } from '../common/SkeletonLoader';

const MyApprovals = ({ user }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        hasNext: false,
        hasPrevious: false,
        pageSize: 10
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

    useEffect(() => {
        if (user) {
            fetchApprovalTasks();
        }
    }, [user]);

    const fetchApprovalTasks = async (page = 0) => {
        try {
            setLoading(true);
            // Use unified API with filter=to-check
            const params = new URLSearchParams({
                filter: 'to-check',
                page: page.toString(),
                size: pagination.pageSize.toString()
            });

            const response = await fetch(`/api/tasks?${params.toString()}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                setError('Failed to load approval tasks');
                return;
            }

            const data = await response.json();
            setTasks(data.tasks || []);
            setPagination({
                currentPage: data.currentPage ?? page,
                totalPages: data.totalPages ?? 0,
                totalItems: data.totalItems ?? 0,
                hasNext: data.hasNext ?? false,
                hasPrevious: data.hasPrevious ?? false,
                pageSize: data.pageSize ?? pagination.pageSize
            });
        } catch (error) {
            console.error('Error fetching approval tasks:', error);
            setError('Failed to load approval tasks');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchApprovalTasks(newPage);
        }
    };

    const handleTaskUpdate = async (taskId, updates) => {
        // Optimistic Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        ));

        // Also update the selected task panel state if it's the one being updated
        if (selectedTaskForPanel && selectedTaskForPanel.id === taskId) {
            setSelectedTaskForPanel(prev => ({ ...prev, ...updates }));
        }

        try {
            const apiPayload = { ...updates };
            if (updates.assignee) {
                apiPayload.assigneeId = updates.assignee.id;
                delete apiPayload.assignee;
            } else if (updates.assignee === null) {
                apiPayload.assigneeId = null;
            }

            // Transform checkedBy object to checkedById for backend
            if (updates.checkedBy) {
                apiPayload.checkedById = updates.checkedBy.id;
                delete apiPayload.checkedBy;
            } else if (updates.checkedBy === null) {
                apiPayload.checkedById = null;
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
            fetchApprovalTasks(pagination.currentPage);
        }
    };



    if (loading) {
        return (
            <div className="main-content approvals-page">
                <PageHeader
                    title="My Approvals"
                    subtitle="Tasks assigned to you for review and approval"
                    user={user}
                />
                <div className="asana-list-view" style={{ padding: '0 20px' }}>
                    <div className="asana-list-header" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 150px 150px 120px 120px 80px' }}>
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
                                {[1, 2, 3, 4, 5].map(i => (
                                    <SkeletonTaskRow key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content approvals-page">
            <PageHeader
                title="My Approvals"
                subtitle="Tasks assigned to you for review and approval"
                user={user}
            />

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                    <p>No tasks pending approval.</p>
                </div>
            ) : (
                <>
                    <div className="asana-list-view" style={{ padding: '0 20px' }}>
                        <div className="asana-list-header" style={{ gridTemplateColumns: 'minmax(400px, 1fr) 150px 150px 120px 120px 80px' }}>
                            <div className="header-cell">Task name</div>
                            <div className="header-cell">Assignee</div>
                            <div className="header-cell">Due date</div>
                            <div className="header-cell">Priority</div>
                            <div className="header-cell">Status</div>
                            <div className="header-cell"></div>
                        </div>

                        <div className="asana-list-body">
                            <AsanaSection
                                title="Approvals"
                                tasks={tasks}
                                defaultExpanded={true}
                                gridTemplateColumns="minmax(400px, 1fr) 150px 150px 120px 120px 80px"
                                renderRow={(task) => (
                                    <AsanaTaskRow
                                        key={task.id}
                                        task={task}
                                        teamMembers={availableUsers}
                                        onUpdate={handleTaskUpdate}
                                        onOpenDetails={() => setSelectedTaskForPanel(task)}
                                        gridTemplateColumns="minmax(400px, 1fr) 150px 150px 120px 120px 80px"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="pagination-controls">
                            <div className="pagination-info">
                                Showing {pagination.currentPage * pagination.pageSize + 1} to {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} tasks
                            </div>
                            <div className="pagination-buttons">
                                <button
                                    className="btn-small btn-outline"
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevious}
                                >
                                    ← Previous
                                </button>
                                <span style={{ padding: '0 1rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    Page {pagination.currentPage + 1} of {pagination.totalPages}
                                </span>
                                <button
                                    className="btn-small btn-outline"
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNext}
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
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

export default MyApprovals;
