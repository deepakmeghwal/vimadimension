import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const RecordPayment = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

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
        // Pre-fill payment amount with total amount (full payment only)
        setFormData(prev => ({
          ...prev,
          paymentAmount: data.totalAmount || ''
        }));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Prepare payment data
      const paymentData = new URLSearchParams();
      paymentData.append('amount', formData.paymentAmount);
      if (formData.paymentDate) {
        paymentData.append('paymentDate', formData.paymentDate);
      }

      const response = await fetch(`/api/invoices/${id}/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: paymentData.toString(),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Navigate back to invoice details
        navigate(`/invoices/${id}/details`);
      } else {
        setError(result.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      setError('Error recording payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (!canManageInvoices) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4>Access Denied</h4>
          <p>You don't have permission to record payments. Only administrators and managers can access this feature.</p>
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

  if (error && !invoice) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(`/invoices/${id}/details`)}>
            Back to Invoice
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

  // Check if invoice is already paid
  if (invoice.status === 'PAID') {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          <h4>Invoice Already Paid</h4>
          <p>This invoice has already been marked as paid.</p>
          <button className="btn btn-primary" onClick={() => navigate(`/invoices/${id}/details`)}>
            Back to Invoice
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
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back
          </button>
          <h2>Record Payment</h2>
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

      <div className="row">
        {/* Left Column - Payment Form */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Payment Information</h5>
            </div>
            <div className="card-body">
              {/* Invoice Summary */}
              <div className="alert alert-info">
                <h6 className="mb-2">Invoice Summary</h6>
                <p className="mb-1"><strong>Invoice Number:</strong> {invoice.invoiceNumber}</p>
                <p className="mb-1"><strong>Client:</strong> {invoice.clientName}</p>
                <p className="mb-1"><strong>Total Amount:</strong> {formatCurrency(invoice.totalAmount)}</p>
                {invoice.balanceAmount > 0 && (
                  <p className="mb-0"><strong>Balance Due:</strong> {formatCurrency(invoice.balanceAmount)}</p>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="paymentAmount" className="form-label">
                    Payment Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    id="paymentAmount"
                    name="paymentAmount"
                    value={formData.paymentAmount}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                  <small className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Full payment only. Amount must equal the total invoice amount: {formatCurrency(invoice.totalAmount)}
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="paymentDate" className="form-label">
                    Payment Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="paymentDate"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <small className="form-text text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Date when the payment was received
                  </small>
                </div>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Recording Payment...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check me-2"></i>
                        Record Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Details */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Invoice Details</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Status:</strong>
                <span className={`badge ms-2 ${invoice.status === 'DRAFT' ? 'bg-secondary' :
                  invoice.status === 'SENT' ? 'bg-primary' :
                    invoice.status === 'VIEWED' ? 'bg-info' :
                      invoice.status === 'PAID' ? 'bg-success' :
                        invoice.status === 'OVERDUE' ? 'bg-danger' : 'bg-dark'}`}>
                  {invoice.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="mb-3">
                <strong>Issue Date:</strong>
                <p className="mb-0">{new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
              {invoice.dueDate && (
                <div className="mb-3">
                  <strong>Due Date:</strong>
                  <p className="mb-0">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              )}
              <hr />
              <div className="mb-2">
                <strong>Subtotal:</strong>
                <span className="float-end">{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxAmount > 0 && (
                <div className="mb-2">
                  <strong>Tax:</strong>
                  <span className="float-end">{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="mb-2">
                <strong>Total:</strong>
                <span className="float-end">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <hr />
                  <div className="mb-2 text-success">
                    <strong>Paid:</strong>
                    <span className="float-end">{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="mb-0">
                    <strong>Balance:</strong>
                    <span className={`float-end ${invoice.balanceAmount > 0 ? 'text-danger' : 'text-success'}`}>
                      {formatCurrency(invoice.balanceAmount)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPayment;






