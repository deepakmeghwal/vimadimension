import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ResourcePlanner = ({ projectId, isFullView = false }) => {
    const navigate = useNavigate();
    const [phases, setPhases] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState(null);
    const [assignmentForm, setAssignmentForm] = useState({
        roleOnPhase: '',
        roleOnPhase: '',
        plannedHours: '',
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [creatingPhases, setCreatingPhases] = useState(false);
    const [availabilityData, setAvailabilityData] = useState(null);
    const [activeMenuPhaseId, setActiveMenuPhaseId] = useState(null);


    useEffect(() => {
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            // Fetch phases and users first, then assignments
            await Promise.all([
                fetchPhases(),
                fetchUsers()
            ]);
            // Fetch assignments after phases/users are loaded
            await fetchAssignments();
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load resource planner data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPhases = async () => {
        const response = await fetch(`/api/projects/${projectId}/phases`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            setPhases(data);
        }
    };

    const fetchUsers = async () => {
        const response = await fetch(`/api/tasks/users`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.users) {
                setUsers(data.users);
            }
        }
    };

    const fetchAssignments = async () => {
        const response = await fetch(`/api/projects/${projectId}/resources`, {
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.assignments) {
                setAssignments(data.assignments);
            }
        }
    };

    const getAssignmentForCell = (userId, phaseId) => {
        return assignments.find(a => {
            // Handle multiple possible data structures from backend
            let aUserId = null;
            let aPhaseId = null;

            if (a) {
                // Try direct properties first
                aUserId = a.userId || (a.user && typeof a.user === 'object' ? a.user.id : null);
                aPhaseId = a.phaseId || (a.phase && typeof a.phase === 'object' ? a.phase.id : null);
            }

            return aUserId === userId && aPhaseId === phaseId;
        });
    };

    const handleCellClick = (userId, phaseId) => {
        const existingAssignment = getAssignmentForCell(userId, phaseId);
        setSelectedCell({ userId, phaseId });

        if (existingAssignment) {
            setAssignmentForm({
                roleOnPhase: existingAssignment.roleOnPhase || '',
                billingRate: existingAssignment.billingRate || '',
                costRate: existingAssignment.costRate || '',
                plannedHours: existingAssignment.plannedHours || '',
                allocatedPercentage: existingAssignment.allocatedPercentage || '',
                startDate: existingAssignment.startDate || '',
                endDate: existingAssignment.endDate || ''
            });
        } else {
            setAssignmentForm({
                roleOnPhase: '',
                roleOnPhase: '',
                plannedHours: '',
                plannedHours: '',
                startDate: '',
                endDate: ''
            });
        }

        setShowAssignmentModal(true);
        fetchAvailability(userId, phaseId);
    };

    const fetchAvailability = async (userId, phaseId) => {
        setAvailabilityData(null);
        try {
            const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}/resources/users/${userId}/availability`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailabilityData(data.availability);
                }
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        }
    };

    const handleSaveAssignment = async () => {
        if (!selectedCell) return;

        try {
            setError('');
            setSuccess('');

            const { userId, phaseId } = selectedCell;
            const existingAssignment = getAssignmentForCell(userId, phaseId);

            const payload = {
                userId: userId,
                roleOnPhase: assignmentForm.roleOnPhase || null,
                roleOnPhase: assignmentForm.roleOnPhase || null,
                plannedHours: assignmentForm.plannedHours ? parseInt(assignmentForm.plannedHours) : null,
                startDate: assignmentForm.startDate || null,
                endDate: assignmentForm.endDate || null
            };

            let response;
            if (existingAssignment) {
                // Update existing
                response = await fetch(
                    `/api/projects/${projectId}/phases/${phaseId}/resources/${existingAssignment.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        credentials: 'include'
                    }
                );
            } else {
                // Create new
                response = await fetch(
                    `/api/projects/${projectId}/phases/${phaseId}/resources`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        credentials: 'include'
                    }
                );
            }

            if (response.ok) {
                setSuccess('Resource assignment saved successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setShowAssignmentModal(false);
                fetchAssignments();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to save assignment' }));
                setError(errorData.error || 'Failed to save resource assignment');
            }
        } catch (error) {
            console.error('Error saving assignment:', error);
            setError('Failed to save resource assignment');
        }
    };

    const handleDeleteAssignment = async () => {
        if (!selectedCell) return;

        const existingAssignment = getAssignmentForCell(selectedCell.userId, selectedCell.phaseId);
        if (!existingAssignment) return;

        if (!window.confirm('Are you sure you want to delete this resource assignment?')) {
            return;
        }

        try {
            const response = await fetch(
                `/api/projects/${projectId}/phases/${selectedCell.phaseId}/resources/${existingAssignment.id}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if (response.ok) {
                setSuccess('Resource assignment deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                setShowAssignmentModal(false);
                fetchAssignments();
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Failed to delete assignment' }));
                setError(errorData.error || 'Failed to delete resource assignment');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            setError('Failed to delete resource assignment');
        }
    };

    if (!projectId) return null;

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading resource planner...</p>
            </div>
        );
    }

    const handleCreateStandardPhases = async () => {
        try {
            setCreatingPhases(true);
            setError('');

            const response = await fetch(`/api/projects/${projectId}/phases/standard`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(`Successfully created ${data.count} standard phases!`);
                setTimeout(() => {
                    fetchData(); // Reload phases
                    setSuccess('');
                }, 2000);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Failed to create standard phases' }));
                setError(errorData.message || 'Failed to create standard phases');
            }
        } catch (error) {
            console.error('Error creating standard phases:', error);
            setError('Failed to create standard phases');
        } finally {
            setCreatingPhases(false);
        }
    };





    // Show message if no phases exist
    if (phases.length === 0) {
        return (
            <div className="resource-planner-section">

                {error && (
                    <div className="modern-alert error" style={{ marginBottom: '1rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="modern-alert success" style={{ marginBottom: '1rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        {success}
                    </div>
                )}
                <div className="empty-state-modern">
                    <div className="empty-state-icon">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                        </svg>
                    </div>
                    <h3>No Phases Found</h3>
                    <p>This project doesn't have any phases yet. Create phases from the project's lifecycle stages.</p>
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <button
                            onClick={handleCreateStandardPhases}
                            disabled={creatingPhases}
                            className="btn-primary-modern"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {creatingPhases ? (
                                <>
                                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                    </svg>
                                    Creating Standard Phases...
                                </>
                            ) : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Create Project Phases
                                </>
                            )}
                        </button>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Or</p>
                        <Link
                            to={`/projects/${projectId}/phases/new`}
                            className="btn-outline-modern"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create Custom Phase
                        </Link>
                    </div>
                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.875rem', color: '#475569' }}>
                        <strong>Note:</strong> Phases will be created based on the lifecycle stages selected when this project was created.
                    </div>
                </div>
            </div>
        );
    }

    // Show message if no users exist
    if (users.length === 0) {
        return (
            <div className="resource-planner-section">

                <div className="empty-state-modern">
                    <p>No team members found. Please add team members to the project first.</p>
                </div>
            </div>
        );
    }

    const selectedUser = selectedCell ? users.find(u => u.id === selectedCell.userId) : null;
    const selectedPhase = selectedCell ? phases.find(p => p.id === selectedCell.phaseId) : null;
    const existingAssignment = selectedCell ? getAssignmentForCell(selectedCell.userId, selectedCell.phaseId) : null;

    return (
        <div className="resource-planner-section">


            {success && (
                <div className="modern-alert success" style={{ marginBottom: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    {success}
                </div>
            )}

            {error && (
                <div className="modern-alert error" style={{ marginBottom: '1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            <div className="resource-planner-grid-container">
                <div className="resource-planner-table">
                    <div className="resource-planner-header-row">
                        <div className="resource-planner-header-cell resource-planner-sticky-column">
                            <strong>Team Member</strong>
                        </div>
                        {phases.map(phase => {
                            // Calculate total burn for this phase
                            const phaseAssignments = assignments.filter(a =>
                                (a.phaseId === phase.id) || (a.phase && a.phase.id === phase.id)
                            );

                            const totalBurn = phaseAssignments.reduce((sum, a) => {
                                const rate = a.billingRate || 0; // This is now the Burn Rate
                                const hours = a.plannedHours || 0;
                                return sum + (rate * hours);
                            }, 0);

                            const budget = phase.contractAmount || 0;
                            const burnPercentage = budget > 0 ? (totalBurn / budget) * 100 : 0;
                            const isOverBudget = totalBurn > budget;

                            return (
                                <div
                                    key={phase.id}
                                    className="resource-planner-header-cell"
                                    style={{ position: 'relative', cursor: 'pointer' }}
                                    onDoubleClick={() => navigate(`/projects/${projectId}/phases/${phase.id}/edit`)}
                                    title="Double-click to edit phase"
                                >
                                    <div className="phase-name">{phase.name}</div>
                                    <div className="phase-number">{phase.phaseNumber}</div>

                                    {/* Burn vs Budget Visualization */}
                                    <div className="phase-budget-viz" style={{ marginTop: '8px', fontSize: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                            <span>Burn: ₹{(totalBurn / 1000).toFixed(1)}k</span>
                                            <span style={{ color: '#64748b' }}>Fee: ₹{(budget / 1000).toFixed(1)}k</span>
                                        </div>
                                        <div style={{
                                            height: '6px',
                                            width: '100%',
                                            backgroundColor: '#e2e8f0',
                                            borderRadius: '3px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${Math.min(burnPercentage, 100)}%`,
                                                backgroundColor: isOverBudget ? '#ef4444' : '#22c55e',
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {users.map(user => (
                        <div key={user.id} className="resource-planner-row">
                            <div className="resource-planner-sticky-column resource-planner-user-cell">
                                <div className="user-name">{user.name || user.username}</div>
                                <div className="user-email">{user.email}</div>
                            </div>
                            {phases.map(phase => {
                                const assignment = getAssignmentForCell(user.id, phase.id);
                                return (
                                    <div
                                        key={phase.id}
                                        className={`resource-planner-cell ${assignment ? 'has-assignment' : ''}`}
                                        onClick={() => handleCellClick(user.id, phase.id)}
                                        title={assignment ? `Click to edit: ${assignment.roleOnPhase || 'No role'}, ${assignment.allocatedPercentage || 0}%` : 'Click to assign'}
                                    >
                                        {assignment ? (
                                            <div className="cell-content">
                                                <div className="cell-role">{assignment.roleOnPhase || '-'}</div>
                                                {assignment.billingRate && (
                                                    <div className="cell-rate">₹{assignment.billingRate}/hr</div>
                                                )}
                                                {assignment.plannedHours && (
                                                    <div className="cell-hours" style={{ fontSize: '0.75rem', color: '#64748b' }}>{assignment.plannedHours} hrs</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="cell-empty">+</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Assignment Modal */}
            {showAssignmentModal && selectedUser && selectedPhase && (
                <div className="modal-overlay" onClick={() => setShowAssignmentModal(false)}>
                    <div className="modal-container-modern" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-modern">
                            <div className="modal-header-content">
                                <div className="modal-icon-wrapper">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="9" y1="3" x2="9" y2="21"></line>
                                        <line x1="3" y1="9" x2="21" y2="9"></line>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="modal-title">Resource Assignment</h2>
                                    <p className="modal-subtitle">
                                        {selectedUser.name || selectedUser.username} → {selectedPhase.name}
                                    </p>
                                </div>
                            </div>
                            <button className="modal-close-button" onClick={() => setShowAssignmentModal(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="modal-body-modern">
                            <form className="edit-form-modern">
                                <div className="form-group-modern">
                                    <label htmlFor="roleOnPhase">Role on Phase</label>
                                    <input
                                        id="roleOnPhase"
                                        type="text"
                                        className="form-input-modern"
                                        placeholder="e.g., Senior Architect, Job Captain"
                                        value={assignmentForm.roleOnPhase}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, roleOnPhase: e.target.value })}
                                    />
                                </div>

                                {/* Rates are now calculated automatically */}
                                <div className="form-row-modern">
                                    <div className="form-group-modern" style={{ gridColumn: '1 / -1' }}>
                                        <div className="modern-alert info" style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                            </svg>
                                            Rates are calculated automatically based on staff salary & overhead multiplier (2.5x).
                                        </div>
                                    </div>
                                    {availabilityData && (
                                        <div className="form-group-modern" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                                            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                                                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#334155' }}>Budget & Availability Check</div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Phase Budget:</span>
                                                        <div style={{ fontWeight: '500' }}>₹{(availabilityData.totalBudget / 1000).toFixed(1)}k</div>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Remaining:</span>
                                                        <div style={{ fontWeight: '500', color: availabilityData.remainingBudget < 0 ? '#ef4444' : '#22c55e' }}>
                                                            ₹{(availabilityData.remainingBudget / 1000).toFixed(1)}k
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Max Hours (Budget):</span>
                                                        <div style={{ fontWeight: '500' }}>{availabilityData.maxHoursByBudget} hrs</div>
                                                    </div>
                                                    <div>
                                                        <span style={{ color: '#64748b' }}>Current Project Load:</span>
                                                        <div style={{ fontWeight: '500' }}>{availabilityData.currentProjectLoad} hrs</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-row-modern">
                                    <div className="form-group-modern">
                                        <label htmlFor="plannedHours">Planned Hours</label>
                                        <input
                                            id="plannedHours"
                                            type="number"
                                            className="form-input-modern"
                                            placeholder="200"
                                            value={assignmentForm.plannedHours}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, plannedHours: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row-modern">
                                    <div className="form-group-modern">
                                        <label htmlFor="startDate">Start Date</label>
                                        <input
                                            id="startDate"
                                            type="date"
                                            className="form-input-modern"
                                            value={assignmentForm.startDate}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group-modern">
                                        <label htmlFor="endDate">End Date</label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            className="form-input-modern"
                                            value={assignmentForm.endDate}
                                            onChange={(e) => setAssignmentForm({ ...assignmentForm, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-actions-modern">
                                    {existingAssignment && (
                                        <button
                                            type="button"
                                            className="btn-outline-modern btn-danger"
                                            onClick={handleDeleteAssignment}
                                        >
                                            Delete
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-outline-modern"
                                        onClick={() => setShowAssignmentModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-primary-modern"
                                        onClick={handleSaveAssignment}
                                    >
                                        Save Assignment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div >
            )}
        </div >
    );
};

export default ResourcePlanner;

