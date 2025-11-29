import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STANDARD_PHASE_TYPES } from '../../constants/phaseTypes';

const CreatePhase = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        phaseNumber: '',
        name: '',
        phaseType: '', // Standard phase type
        customName: '', // For custom phase name
        contractAmount: '',
        status: 'ACTIVE'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useStandardPhase, setUseStandardPhase] = useState(true); // Default to standard phases

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/projects/${projectId}/phases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (response.ok) {
                navigate(`/projects/${projectId}/details`);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create phase');
            }
        } catch (error) {
            console.error('Error creating phase:', error);
            setError('Failed to create phase');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content">
            <h1 className="page-title">Create New Phase</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="project-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="phaseType">Select Standard Phase *:</label>
                        <select
                            id="phaseType"
                            name="phaseType"
                            value={formData.phaseType || ''}
                            onChange={(e) => {
                                const selectedPhase = STANDARD_PHASE_TYPES.find(p => p.value === e.target.value);
                                setFormData({
                                    ...formData,
                                    phaseType: e.target.value,
                                    name: selectedPhase ? selectedPhase.label : '',
                                    phaseNumber: selectedPhase ? String(selectedPhase.sequence).padStart(2, '0') : ''
                                });
                            }}
                            required
                        >
                            <option value="">-- Select a Standard Phase --</option>
                            {STANDARD_PHASE_TYPES.map(phase => (
                                <option key={phase.value} value={phase.value}>
                                    {phase.sequence.toString().padStart(2, '0')} - {phase.label}
                                </option>
                            ))}
                        </select>
                        <small style={{ display: 'block', marginTop: '0.25rem', color: '#6b7280' }}>
                            Based on standard Indian architectural practice (COA standards)
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="phaseNumber">Phase Number *:</label>
                        <input
                            type="text"
                            id="phaseNumber"
                            name="phaseNumber"
                            value={formData.phaseNumber}
                            onChange={handleChange}
                            required
                            placeholder="Auto-filled from selection"
                            readOnly
                        />
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
                            placeholder="Auto-filled from selection"
                            readOnly
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
                            step="0.01"
                            min="0"
                            placeholder="Enter amount"
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
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div className="project-actions">
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Phase'}
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

export default CreatePhase;
