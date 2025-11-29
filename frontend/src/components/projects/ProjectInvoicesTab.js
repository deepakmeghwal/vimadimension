import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

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
        switch (status.toString().toUpperCase()) {
            case 'PAID': return 'status-paid';
            case 'PARTIAL': return 'status-partial';
            case 'UNPAID': return 'status-unpaid';
            case 'OVERDUE': return 'status-overdue';
            case 'SENT': return 'status-sent';
            case 'VIEWED': return 'status-viewed';
            case 'DRAFT': return 'status-draft';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-pending';
        }
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

    return (
        <div className="project-invoices-tab">
            <div className="financial-section">
                <div className="tab-header-standard">
                    <h3 className="tab-header-title">Invoices</h3>
                    <Link to="/invoices/new" className="btn-small btn-primary-modern">
                        Create Invoice
                    </Link>
                </div>

                {loading ? (
                    <div className="empty-state-small">
                        <div className="loading-spinner"></div>
                        <p>Loading invoices...</p>
                    </div>
                ) : error ? (
                    <div className="empty-state-small">
                        <p className="alert alert-danger">{error}</p>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="empty-state-small">
                        <p>No invoices generated yet.</p>
                    </div>
                ) : (
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Invoice #</th>
                                    <th>Client</th>
                                    <th>Subtotal</th>
                                    <th>Tax</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(invoice => (
                                    <tr key={invoice.id}>
                                        <td>{formatDate(invoice.issueDate)}</td>
                                        <td>
                                            <strong>{invoice.invoiceNumber}</strong>
                                        </td>
                                        <td>{invoice.clientName || 'N/A'}</td>
                                        <td>{formatCurrency(invoice.subtotal)}</td>
                                        <td>
                                            {invoice.taxRate ? `${invoice.taxRate}%` : '0%'}
                                        </td>
                                        <td>
                                            <strong>{formatCurrency(invoice.totalAmount)}</strong>
                                        </td>
                                        <td>
                                            <span className={`badge ${getPaymentStatusClass(invoice.status)}`}>
                                                {formatStatus(invoice.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <Link
                                                to={`/invoices/${invoice.id}/details`}
                                                className="btn-small btn-outline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectInvoicesTab;





