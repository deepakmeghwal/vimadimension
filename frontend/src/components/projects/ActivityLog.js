import React, { useState, useEffect } from 'react';

const ActivityLog = ({ projectId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newActivity, setNewActivity] = useState({ type: 'NOTE', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchActivities();
    }, [projectId]);

    const fetchActivities = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/activities`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newActivity.description.trim()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newActivity),
                credentials: 'include'
            });

            if (response.ok) {
                const savedActivity = await response.json();
                setActivities([savedActivity, ...activities]);
                setNewActivity({ type: 'NOTE', description: '' });
            }
        } catch (error) {
            console.error('Error creating activity:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'CALL': return '📞';
            case 'MEETING': return '📅';
            case 'EMAIL': return '✉️';
            case 'NOTE': return '📝';
            default: return '📝';
        }
    };

    return (
        <div className="activity-log-section">
            <h3>Activity Log</h3>

            <form onSubmit={handleSubmit} className="activity-form">
                <div className="form-row">
                    <select
                        value={newActivity.type}
                        onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })}
                        className="activity-type-select"
                    >
                        <option value="NOTE">Note</option>
                        <option value="CALL">Call</option>
                        <option value="MEETING">Meeting</option>
                        <option value="EMAIL">Email</option>
                    </select>
                    <input
                        type="text"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        placeholder="Log an activity..."
                        className="activity-input"
                        disabled={submitting}
                    />
                    <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Logging...' : 'Log'}
                    </button>
                </div>
            </form>

            <div className="activity-list">
                {loading ? (
                    <div>Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className="empty-state">No activities logged yet.</div>
                ) : (
                    activities.map(activity => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                            <div className="activity-content">
                                <div className="activity-header">
                                    <span className="activity-user">{activity.loggedBy || 'Unknown User'}</span>
                                    <span className="activity-type">{activity.type}</span>
                                    <span className="activity-date">
                                        {new Date(activity.time).toLocaleString()}
                                    </span>
                                </div>
                                <div className="activity-description">{activity.description}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
