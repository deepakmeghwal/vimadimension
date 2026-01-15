import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  FileText,
  Eye,
  Download,
  Send,
  MoreVertical,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  FileBox
} from 'lucide-react';
import '../projects/ProjectsList.css'; // Ensure we have the base styles available

const InvoicesList = ({ user }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

  const navigate = useNavigate();

  // Check if user has admin or manager role
  const canManageInvoices = user?.authorities?.some(auth =>
    auth.authority === 'ROLE_ADMIN' || auth.authority === 'ROLE_MANAGER'
  ) || false;

  useEffect(() => {
    if (canManageInvoices) {
      fetchInvoices();
    }
  }, [canManageInvoices, currentPage, pageSize, filter]);

  // Click outside to close action menu
  useEffect(() => {
    const handleClickOutside = () => setActiveActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString()
      });

      if (filter && filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/invoices?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setCurrentPage(data.currentPage || 0);
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
        setHasNext(data.hasNext || false);
        setHasPrevious(data.hasPrevious || false);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Error fetching invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    // If marking as SENT, show email confirmation dialog
    if (newStatus === 'SENT') {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      setSelectedInvoice(invoice);
      setShowEmailConfirm(true);
      return;
    }

    // For other status updates, proceed normally
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status?status=${newStatus}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the invoice in the list
          setInvoices(invoices.map(invoice =>
            invoice.id === invoiceId
              ? { ...invoice, status: newStatus }
              : invoice
          ));
          setMessage({ type: 'success', text: result.message || 'Status updated successfully' });
        } else {
          setError(result.message || 'Failed to update status');
        }
      } else {
        setError('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating invoice status');
    }
  };

  const handleSendEmail = async () => {
    if (!selectedInvoice) return;

    setIsSendingEmail(true);
    setMessage(null);
    setError('');
    setShowEmailConfirm(false);

    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/send-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the invoice in the list
        setInvoices(invoices.map(invoice =>
          invoice.id === selectedInvoice.id
            ? { ...invoice, status: 'SENT' }
            : invoice
        ));
        setMessage({ type: 'success', text: result.message || 'Invoice email sent successfully' });
      } else {
        setError(result.message || 'Failed to send invoice email');
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      setError('Error sending invoice email');
    } finally {
      setIsSendingEmail(false);
      setSelectedInvoice(null);
    }
  };

  const handleSkipEmail = async () => {
    if (!selectedInvoice) return;

    setShowEmailConfirm(false);
    // Just update status without sending email
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}/status?status=SENT`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the invoice in the list
          setInvoices(invoices.map(invoice =>
            invoice.id === selectedInvoice.id
              ? { ...invoice, status: 'SENT' }
              : invoice
          ));
          setMessage({ type: 'success', text: 'Invoice status updated to SENT' });
        } else {
          setError(result.message || 'Failed to update status');
        }
      } else {
        setError('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Error updating invoice status');
    } finally {
      setSelectedInvoice(null);
    }
  };

  const handleDownloadPdf = async (invoiceId, invoiceNumber) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError('Error downloading PDF');
    }
  };

  const handleViewPdf = async (invoiceId, invoiceNumber) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        setError('Failed to view PDF');
      }
    } catch (error) {
      console.error('Error viewing PDF:', error);
      setError('Error viewing PDF');
    }
  };

  const getStatusBadgeClass = (status) => {
    // Map to badge-project-status style classes loosely
    switch (status) {
      case 'DRAFT': return 'badge-project-status in-discussion'; // Yellow/Orange
      case 'SENT': return 'badge-project-status progress'; // Blue
      case 'VIEWED': return 'badge-project-status progress'; // Blue/Purple? Using progress for now
      case 'PAID': return 'badge-project-status completed'; // Green
      case 'OVERDUE': return 'badge-project-status on-hold'; // Red usage of on-hold/risk
      case 'CANCELLED': return 'badge-project-status archived'; // Grey
      default: return 'badge-project-status';
    }
  };

  const getCustomStatusStyle = (status) => {
    if (status === 'OVERDUE') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    if (status === 'VIEWED') return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
    return {};
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(0); // Reset to first page
  };

  const toggleActionMenu = (e, invoiceId) => {
    e.stopPropagation();
    if (activeActionMenu === invoiceId) {
      setActiveActionMenu(null);
    } else {
      setActiveActionMenu(invoiceId);
    }
  };

  if (!canManageInvoices) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <h3>Access Denied</h3>
          <p>You don't have permission to view invoices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content projects-list-page fade-in">
      <div className="projects-header-compact">
        <div className="projects-header-left">
          <h1 className="projects-title-compact">
            Invoices
            <span className="projects-count">({totalItems})</span>
          </h1>
        </div>
        <div className="projects-header-right">
          <div style={{ position: 'relative' }}>
            <select
              className="form-input"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              style={{ paddingRight: '2rem', minWidth: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="VIEWED">Viewed</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
          </div>

          <Link to="/invoices/new" className="btn-new-project-compact">
            <Plus size={16} />
            Create Invoice
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ margin: '0 0 1.5rem 0' }}>{error}</div>
      )}

      {message && (
        <div className={`alert alert-${message.type}`} style={{ margin: '0 0 1.5rem 0' }}>{message.text}</div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <div className="spinner-border" style={{ width: '2rem', height: '2rem', marginBottom: '1rem', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading invoices...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 2rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <FileBox size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>No invoices found</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {filter !== 'all' ? 'No invoices match your selected filters.' : 'Get started by creating your first invoice.'}
          </p>
          {filter === 'all' && (
            <Link to="/invoices/new" className="btn-primary-modern">
              <Plus size={16} style={{ marginRight: '0.5rem' }} />
              Create Invoice
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    onClick={() => navigate(`/invoices/${invoice.id}/details`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{invoice.invoiceNumber}</td>
                    <td>{invoice.clientName}</td>
                    <td>{invoice.projectName || <span style={{ color: '#94a3b8' }}>-</span>}</td>
                    <td>{formatDate(invoice.issueDate)}</td>
                    <td>
                      <span style={{
                        color: (invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && new Date(invoice.dueDate) < new Date()) ? '#ef4444' : 'inherit',
                        fontWeight: (invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && new Date(invoice.dueDate) < new Date()) ? 600 : 400
                      }}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      {formatCurrency(invoice.totalAmount)}
                      {invoice.paidAmount > 0 && invoice.status !== 'PAID' && (
                        <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 500 }}>
                          Paid: {formatCurrency(invoice.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(invoice.status)}`}
                        style={getCustomStatusStyle(invoice.status)}
                      >
                        {invoice.status?.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          className="btn-icon"
                          onClick={(e) => toggleActionMenu(e, invoice.id)}
                          style={{ padding: '0.25rem', color: '#64748b' }}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {activeActionMenu === invoice.id && (
                          <div className="dropdown-menu-modern" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            zIndex: 50,
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            minWidth: '180px',
                            overflow: 'hidden',
                            marginTop: '0.25rem'
                          }}>
                            <div
                              className="dropdown-item-modern"
                              onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}/details`); setActiveActionMenu(null); }}
                              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                              <Eye size={14} /> View Details
                            </div>
                            <div
                              className="dropdown-item-modern"
                              onClick={(e) => { e.stopPropagation(); handleViewPdf(invoice.id, invoice.invoiceNumber); setActiveActionMenu(null); }}
                              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                              <FileText size={14} /> View PDF
                            </div>
                            <div
                              className="dropdown-item-modern"
                              onClick={(e) => { e.stopPropagation(); handleDownloadPdf(invoice.id, invoice.invoiceNumber); setActiveActionMenu(null); }}
                              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                              <Download size={14} /> Download PDF
                            </div>

                            {invoice.status === 'DRAFT' && (
                              <>
                                <div className="dropdown-divider" style={{ borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }}></div>
                                <div
                                  className="dropdown-item-modern"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}/edit`); setActiveActionMenu(null); }}
                                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
                                >
                                  <FileText size={14} /> Edit Invoice
                                </div>
                                <div
                                  className="dropdown-item-modern"
                                  onClick={(e) => { e.stopPropagation(); handleStatusUpdate(invoice.id, 'SENT'); setActiveActionMenu(null); }}
                                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#2563eb' }}
                                >
                                  <Send size={14} /> Mark as Sent
                                </div>
                              </>
                            )}

                            {['SENT', 'VIEWED', 'OVERDUE'].includes(invoice.status) && (
                              <>
                                <div className="dropdown-divider" style={{ borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }}></div>
                                <div
                                  className="dropdown-item-modern"
                                  onClick={(e) => { e.stopPropagation(); navigate(`/invoices/${invoice.id}/payment`); setActiveActionMenu(null); }}
                                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: '#16a34a' }}
                                >
                                  <CheckCircle2 size={14} /> Record Payment
                                </div>
                              </>
                            )}

                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-controls" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevious}
                className="btn-small btn-outline"
              >
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNext}
                className="btn-small btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Email Confirmation Modal - Custom Style */}
      {showEmailConfirm && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowEmailConfirm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Send Invoice Email</h3>
              <button onClick={() => setShowEmailConfirm(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem', color: '#334155' }}>
              <p style={{ marginBottom: '0.5rem' }}>Do you want to send an email to the client with the invoice PDF?</p>
              {selectedInvoice?.clientEmail ? (
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 500, color: '#0f172a' }}>Client Email:</span> {selectedInvoice.clientEmail}
                </div>
              ) : (
                <div style={{ background: '#fffbeb', color: '#b45309', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                  <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }} />
                  Client email is not available for this invoice.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={handleSkipEmail}
                disabled={isSendingEmail}
                className="btn-outline-modern"
              >
                Skip Email
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSendingEmail || !selectedInvoice?.clientEmail}
                className="btn-primary-modern"
              >
                {isSendingEmail ? 'Sending...' : 'Yes, Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoicesList;
