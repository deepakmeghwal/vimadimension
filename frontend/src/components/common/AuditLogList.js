import React, { useState, useEffect } from 'react';
import './AuditLogList.css';

const AuditLogList = ({ entityType, entityId }) => {
  // Simplified for debugging
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`/api/audit/${entityType}/${entityId}`, {
            credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        } else {
          setError('Failed to load audit logs');
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setError('Error fetching audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (entityType && entityId) {
        fetchLogs();
    }
  }, [entityType, entityId]);

  if (loading) return <div className="audit-loading">Loading history...</div>;
  if (error) return <div className="audit-error">{error}</div>;
  
  return (
    <div className="audit-log-list">
      {logs.length === 0 ? (
        <div className="audit-empty">No history available.</div>
      ) : (
        logs.map(log => (
            <div key={log.id} className="audit-log-item">
                {log.action} by {log.performedBy?.username}
            </div>
        ))
      )}
    </div>
  );
};

export default AuditLogList;
