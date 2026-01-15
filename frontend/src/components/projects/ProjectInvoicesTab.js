import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, FileText, Calendar, User, DollarSign, MoreHorizontal, Eye } from 'lucide-react';

const ProjectInvoicesTab = ({ project }) => {
    const { id: projectId } = useParams();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, [projectId]);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`/api/invoices/project/${projectId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setInvoices(data || []);
            } else {
                if (response.status === 404) {
                    setInvoices([]);
                } else {
                    setError('Failed to fetch invoices');
                }
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('Error fetching invoices');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getPaymentStatusClass = (status) => {
        if (!status) return 'status-pending';
        return `status-${status.toString().toLowerCase()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatStatus = (status) => {
        if (!status) return 'Pending';
        return status.toString().replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
    };

    // Custom grid style for invoices
    const gridStyle = {
        gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr 40px'
    };

    return (
        <div className="project-tasks-tab">
            <div style={{ padding: '1rem 1.5rem 0.5rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Invoices
                    <span className="board-column-count">{invoices.length}</span>
                </h2>
            </div>

            {error && (
                <div className="modern-alert error" style={{ margin: '0 1.5rem 1rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            <div className="asana-task-list">
                <div className="asana-list-header" style={gridStyle}>
                    <div>Invoice #</div>
                    <div>Date</div>
                    <div>Client</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div></div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading invoices...</p>
                    </div>
                ) : (
                    <>
                        {invoices.map(invoice => (
                            <div key={invoice.id} className="asana-task-row" style={gridStyle}>
                                <div className="asana-task-name-cell">
                                    <div className="asana-avatar-small" style={{ marginRight: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                                        <FileText size={14} />
                                    </div>
                                    <span className="task-name-display" style={{ fontWeight: '600' }}>{invoice.invoiceNumber}</span>
                                </div>
                                <div className="asana-task-date" style={{ color: '#334155' }}>
                                    {formatDate(invoice.issueDate)}
                                </div>
                                <div className="asana-task-date">
                                    {invoice.clientName || '—'}
                                </div>
                                <div className="asana-task-date" style={{ fontWeight: '500' }}>
                                    {formatCurrency(invoice.totalAmount)}
                                </div>
                                <div className="asana-task-date">
                                    <span className={`asana-badge ${getPaymentStatusClass(invoice.status)}`}>
                                        {formatStatus(invoice.status)}
                                    </span>
                                </div>
                                <div>
                                    <Link
                                        to={`/invoices/${invoice.id}/details`}
                                        className="btn-icon-modern"
                                        title="View Details"
                                        style={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}
                                    >
                                        <Eye size={14} />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        <Link to="/invoices/new" className="asana-add-task-row" style={{ textDecoration: 'none' }}>
                            <Plus size={14} style={{ marginRight: '0.5rem' }} />
                            Create invoice...
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectInvoicesTab;






