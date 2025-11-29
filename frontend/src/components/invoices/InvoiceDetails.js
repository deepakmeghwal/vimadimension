import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const InvoiceDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Check if user has admin or manager role
  const canManageInvoices = user?.authorities?.some(auth => 
    auth.authority === 'ROLE_ADMIN' || auth.authority === 'ROLE_MANAGER'
  ) || false;

  useEffect(() => {
    if (canManageInvoices) {
      fetchInvoiceDetails();
    }
  }, [id, canManageInvoices]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        setError('Failed to fetch invoice details');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Error fetching invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    // If marking as SENT, show email confirmation dialog
    if (newStatus === 'SENT') {
      setShowEmailConfirm(true);
      return;
    }

    // For other status updates, proceed normally
    try {
      const response = await fetch(`/api/invoices/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInvoice(prev => ({ ...prev, status: newStatus }));
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
    setIsSendingEmail(true);
    setMessage(null);
    setError('');
    setShowEmailConfirm(false);

    try {
      const response = await fetch(`/api/invoices/${id}/send-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setInvoice(prev => ({ ...prev, status: 'SENT' }));
        setMessage({ type: 'success', text: result.message || 'Invoice email sent successfully' });
      } else {
        setError(result.message || 'Failed to send invoice email');
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      setError('Error sending invoice email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleSkipEmail = async () => {
    setShowEmailConfirm(false);
    // Just update status without sending email
    try {
      const response = await fetch(`/api/invoices/${id}/status?status=SENT`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setInvoice(prev => ({ ...prev, status: 'SENT' }));
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
    }
  };

  const handleViewPdf = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}/pdf`, {
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

  const handleDownloadPdf = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}/pdf`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${invoice.invoiceNumber}.pdf`;
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

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-secondary';
      case 'SENT': return 'bg-primary';
      case 'VIEWED': return 'bg-info';
      case 'PAID': return 'bg-success';
      case 'OVERDUE': return 'bg-danger';
      case 'CANCELLED': return 'bg-dark';
      default: return 'bg-secondary';
    }
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
      month: 'long',
      day: 'numeric'
    });
  };

  if (!canManageInvoices) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p>You don't have permission to view invoices. Only administrators and managers can access this feature.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Invoice Not Found</h4>
          <p>The requested invoice could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/invoices')}>
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary mb-2"
            onClick={() => navigate('/invoices')}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Invoices
          </button>
          <h2>Invoice Details</h2>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleViewPdf}
          >
            <i className="fas fa-file-pdf me-2"></i>
            View PDF
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={handleDownloadPdf}
          >
            <i className="fas fa-download me-2"></i>
            Download PDF
          </button>
          {invoice.status === 'DRAFT' && (
            <button
              className="btn btn-warning"
              onClick={() => navigate(`/invoices/${id}/edit`)}
            >
              <i className="fas fa-edit me-2"></i>
              Edit Invoice
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
          ></button>
        </div>
      )}

      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          {message.text}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMessage(null)}
          ></button>
        </div>
      )}

      {/* Email Confirmation Modal */}
      {showEmailConfirm && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Invoice Email</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEmailConfirm(false)}
                  disabled={isSendingEmail}
                ></button>
              </div>
              <div className="modal-body">
                <p>Do you want to send an email to the client with the invoice PDF?</p>
                {invoice?.clientEmail ? (
                  <p><strong>Client Email:</strong> {invoice.clientEmail}</p>
                ) : (
                  <p className="text-warning"><strong>Note:</strong> Client email is not available for this invoice.</p>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleSkipEmail}
                  disabled={isSendingEmail}
                >
                  Skip Email
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || !invoice?.clientEmail}
                >
                  {isSendingEmail ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Sending...
                    </>
                  ) : (
                    'Yes, Send Email'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEmailConfirm && <div className="modal-backdrop fade show"></div>}

      <div className="row">
        {/* Left Column - Invoice Information */}
        <div className="col-md-8">
          {/* Invoice Header */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Invoice {invoice.invoiceNumber}</h5>
              <span className={`badge ${getStatusBadgeClass(invoice.status)} text-white`}>
                {invoice.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Issue Date:</strong> {formatDate(invoice.issueDate)}</p>
                  <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
                  {invoice.projectName && (
                    <p><strong>Project:</strong> {invoice.projectName}</p>
                  )}
                </div>
                <div className="col-md-6">
                  <p><strong>Created By:</strong> {invoice.createdByName}</p>
                  {invoice.lastPaymentDate && (
                    <p><strong>Last Payment:</strong> {formatDate(invoice.lastPaymentDate)}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Bill To</h5>
            </div>
            <div className="card-body">
              <h6>{invoice.clientName}</h6>
              {invoice.clientAddress && (
                <p className="mb-1">{invoice.clientAddress}</p>
              )}
              {invoice.clientEmail && (
                <p className="mb-1">
                  <i className="fas fa-envelope me-2"></i>
                  {invoice.clientEmail}
                </p>
              )}
              {invoice.clientPhone && (
                <p className="mb-1">
                  <i className="fas fa-phone me-2"></i>
                  {invoice.clientPhone}
                </p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Line Items</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Type</th>
                      <th className="text-end">Quantity</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items && invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {item.itemType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-end">{item.quantity}</td>
                        <td className="text-end">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-end">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          {(invoice.notes || invoice.termsAndConditions) && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Additional Information</h5>
              </div>
              <div className="card-body">
                {invoice.notes && (
                  <div className="mb-3">
                    <h6>Notes:</h6>
                    <p>{invoice.notes}</p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h6>Terms and Conditions:</h6>
                    <p>{invoice.termsAndConditions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary and Actions */}
        <div className="col-md-4">
          {/* Financial Summary */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Financial Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <strong>Total:</strong>
                <strong>{formatCurrency(invoice.totalAmount)}</strong>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>Balance Due:</strong>
                    <strong className={invoice.balanceAmount > 0 ? 'text-danger' : 'text-success'}>
                      {formatCurrency(invoice.balanceAmount)}
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {/* Status Update Dropdown */}
                {(invoice.status !== 'PAID' && invoice.status !== 'CANCELLED') && (
                  <div className="btn-group" role="group" style={{ position: 'relative', width: '100%' }}>
                    <button
                      className="btn btn-primary dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{ width: '100%' }}
                    >
                      <i className="fas fa-cog me-2"></i>
                      Update Status
                    </button>
                    <ul className="dropdown-menu" style={{ zIndex: 1050, minWidth: '100%', width: '100%' }}>
                      {/* DRAFT Status Options */}
                      {invoice.status === 'DRAFT' && (
                        <>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleStatusUpdate('SENT')}
                            >
                              <i className="fas fa-paper-plane me-2"></i>
                              Mark as Sent
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleStatusUpdate('CANCELLED')}
                            >
                              <i className="fas fa-times me-2"></i>
                              Cancel Invoice
                            </button>
                          </li>
                        </>
                      )}

                      {/* SENT Status Options */}
                      {invoice.status === 'SENT' && (
                        <>
                          <li>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleStatusUpdate('VIEWED')}
                            >
                              <i className="fas fa-eye me-2"></i>
                              Mark as Viewed
                            </button>
                          </li>
                          <li>
                            <button 
                              className="dropdown-item text-warning"
                              onClick={() => handleStatusUpdate('OVERDUE')}
                            >
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              Mark Overdue
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleStatusUpdate('CANCELLED')}
                            >
                              <i className="fas fa-times me-2"></i>
                              Cancel Invoice
                            </button>
                          </li>
                        </>
                      )}

                      {/* VIEWED Status Options */}
                      {invoice.status === 'VIEWED' && (
                        <>
                          <li>
                            <button 
                              className="dropdown-item text-warning"
                              onClick={() => handleStatusUpdate('OVERDUE')}
                            >
                              <i className="fas fa-exclamation-triangle me-2"></i>
                              Mark Overdue
                            </button>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleStatusUpdate('CANCELLED')}
                            >
                              <i className="fas fa-times me-2"></i>
                              Cancel Invoice
                            </button>
                          </li>
                        </>
                      )}

                      {/* OVERDUE Status Options */}
                      {invoice.status === 'OVERDUE' && (
                        <>
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleStatusUpdate('CANCELLED')}
                            >
                              <i className="fas fa-times me-2"></i>
                              Cancel Invoice
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}

                {/* Record Payment Button (for SENT, VIEWED, OVERDUE) */}
                {(invoice.status === 'SENT' || invoice.status === 'VIEWED' || invoice.status === 'OVERDUE') && (
                  <button 
                    className="btn btn-success"
                    onClick={() => navigate(`/invoices/${id}/payment`)}
                  >
                    <i className="fas fa-rupee-sign me-2"></i>
                    Record Payment
                  </button>
                )}

                {/* PAID and CANCELLED Status - No Actions */}
                {(invoice.status === 'PAID' || invoice.status === 'CANCELLED') && (
                  <div className="alert alert-info mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Invoice is {invoice.status.toLowerCase()}. No further actions available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
