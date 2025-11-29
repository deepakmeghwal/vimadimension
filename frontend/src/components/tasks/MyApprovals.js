import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../common/PageHeader';

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

    const formatStatus = (status) => {
        return status?.toLowerCase().replace(/_/g, '-') || 'to-do';
    };

    const formatPriority = (priority) => {
        return priority?.toLowerCase() || 'medium';
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-spinner">Loading approval tasks...</div>
            </div>
        );
    }

    return (
        <div className="main-content">
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
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th style={{ width: '120px' }}>Priority</th>
                                    <th style={{ width: '120px' }}>Status</th>
                                    <th style={{ width: '150px' }}>Assignee</th>
                                    <th style={{ width: '120px' }}>Due Date</th>
                                    <th style={{ width: '100px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id}>
                                        <td>
                                            <Link
                                                to={`/tasks/${task.id}/details`}
                                                className="task-row-title"
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                {task.name}
                                            </Link>
                                            {task.project && (
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                                    {task.project.name}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge badge-priority ${formatPriority(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge badge-status ${formatStatus(task.status)}`}>
                                                {task.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            {task.assignee && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div className="avatar avatar-sm">
                                                        {getInitials(task.assignee.name || task.assignee.username)}
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem' }}>
                                                        {task.assignee.name || task.assignee.username}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="task-row-date">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/tasks/${task.id}/details`}
                                                className="btn-small btn-outline"
                                            >
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
        </div>
    );
};

export default MyApprovals;
