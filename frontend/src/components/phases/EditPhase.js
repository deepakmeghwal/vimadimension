import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const EditPhase = () => {
    const { projectId, phaseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phaseNumber: '',
        name: '',
        contractAmount: '',
        status: 'ACTIVE'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const phaseStatuses = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' }
    ];

    useEffect(() => {
        fetchPhaseDetails();
    }, [phaseId]);

    const fetchPhaseDetails = async () => {
        try {
            // Since we don't have a direct /api/phases/{id} endpoint exposed in PhaseController (it's under /projects/{projectId}/phases),
            // we might need to fetch all phases and filter, or update the backend to support direct access.
            // However, the PhaseController has PUT /{phaseId} which implies we can update it.
            // But for GET, it only has GET /api/projects/{projectId}/phases.
            // Let's fetch all phases for the project and find the one we need.

            const response = await fetch(`/api/projects/${projectId}/phases`, {
                credentials: 'include'
            });

            if (response.ok) {
                const phases = await response.json();
                const phase = phases.find(p => p.id === parseInt(phaseId));

                if (phase) {
                    setFormData({
                        phaseNumber: phase.phaseNumber || '',
                        name: phase.name || '',
                        contractAmount: phase.contractAmount || '',
                        status: phase.status || 'ACTIVE'
                    });
                } else {
                    setError('Phase not found');
                }
            } else {
                setError('Failed to load phases');
            }
        } catch (error) {
            console.error('Error fetching phase details:', error);
            setError('Failed to load phase details');
        } finally {
            setLoading(false);
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
        setSubmitting(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                navigate(`/projects/${projectId}/details`, { state: { activeTab: 'resources' } });
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to update phase');
            }
        } catch (error) {
            console.error('Error updating phase:', error);
            setError('Failed to update phase');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this phase? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    navigate(`/projects/${projectId}/details`, { state: { activeTab: 'resources' } });
                } else {
                    setError('Failed to delete phase. It may have associated tasks.');
                }
            } catch (error) {
                console.error('Error deleting phase:', error);
                setError('Failed to delete phase');
            }
        }
    };

    if (loading) return <div className="main-content">Loading...</div>;
    if (error && !formData.name) return <div className="main-content"><div className="alert alert-danger">{error}</div></div>;

    return (
        <div className="main-content">
            <div className="back-button-container">
                <button onClick={() => navigate(-1)} className="back-button" style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
                    ← Back
                </button>
            </div>

            <h1 className="page-title">Edit Phase</h1>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="project-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phaseNumber">Phase Number *:</label>
                            <input
                                type="text"
                                id="phaseNumber"
                                name="phaseNumber"
                                value={formData.phaseNumber}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 01, 02, A, B"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">Status *:</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                {phaseStatuses.map(status => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Phase Name *:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Concept Design"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contractAmount">Contract Amount (₹):</label>
                        <input
                            type="number"
                            id="contractAmount"
                            name="contractAmount"
                            value={formData.contractAmount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="project-actions">
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? 'Updating...' : 'Update Phase'}
                        </button>
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={handleDelete}
                            disabled={submitting}
                        >
                            Delete Phase
                        </button>
                        <Link
                            to={`/projects/${projectId}/details`}
                            state={{ activeTab: 'resources' }}
                            className="btn-outline"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPhase;
