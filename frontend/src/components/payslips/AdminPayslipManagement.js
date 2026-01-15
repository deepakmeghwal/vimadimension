import React, { useState, useEffect } from 'react';
import './PayslipManagement.css';
import { useNavigate } from 'react-router-dom';

const AdminPayslipManagement = ({ user, isPeopleContext = false }) => {
    const [payslips, setPayslips] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showGenerateForm, setShowGenerateForm] = useState(false);
    const [showBulkGenerate, setShowBulkGenerate] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [statusFilter, setStatusFilter] = useState('active'); // 'active' (Draft/Approved), 'all', 'history'

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Confirmation Modal State
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'PAID' | 'CANCELLED', id: string }

    // Generate form state (Single)
    const [generateForm, setGenerateForm] = useState({
        userId: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        monthlySalary: '',
        allowances: '',
        bonuses: '',
        otherDeductions: '',
        notes: ''
    });

    // Bulk Generate State
    const [bulkForm, setBulkForm] = useState({
        payPeriodStart: '',
        payPeriodEnd: '',
        selectedUserIds: [], // Array of user IDs
        notes: ''
    });
    const [bulkProgress, setBulkProgress] = useState(0); // 0 to 100

    useEffect(() => {
        fetchUsers();
        fetchPayslips();
    }, [currentPage]); // Note: We filter client-side for now as API doesn't support status filter

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users', {
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                const orgUsers = (data.users || []).filter(u => u.organizationId === user.organizationId);
                setUsers(orgUsers);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            // Note: The API currently returns paginated results. Client-side filtering on paginated results is imperfect
            // but acceptable if we assume we want to see "Active" ones mostly.
            // Ideally, backend should support status filtering.
            const url = `/api/payslips/organization?organizationId=${user.organizationId}&page=${currentPage}&size=50`; // Increased size to help with client-side filter visibility

            const response = await fetch(url, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                setPayslips(data.payslips);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } else {
                setError(data.message || 'Failed to fetch payslips');
            }
        } catch (err) {
            setError('Error fetching payslips: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filtered Payslips Logic
    const getFilteredPayslips = () => {
        if (statusFilter === 'all') return payslips;
        if (statusFilter === 'active') {
            return payslips.filter(p => ['DRAFT', 'GENERATED', 'APPROVED'].includes(p.status));
        }
        if (statusFilter === 'history') {
            return payslips.filter(p => ['PAID', 'CANCELLED'].includes(p.status));
        }
        return payslips;
    };

    const filteredPayslips = getFilteredPayslips();

    const handleGeneratePayslip = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!generateForm.userId || !generateForm.monthlySalary || !generateForm.payPeriodStart || !generateForm.payPeriodEnd) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/payslips/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: generateForm.userId,
                    organizationId: user.organizationId,
                    monthlySalary: generateForm.monthlySalary || '0',
                    payPeriodStart: generateForm.payPeriodStart,
                    payPeriodEnd: generateForm.payPeriodEnd,
                    allowances: generateForm.allowances || '0',
                    bonuses: generateForm.bonuses || '0',
                    otherDeductions: generateForm.otherDeductions || '0',
                    notes: generateForm.notes || ''
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob, `payslip_${generateForm.payPeriodStart}_to_${generateForm.payPeriodEnd}.pdf`);

                setSuccess('Payslip generated successfully!');
                setShowGenerateForm(false);
                resetGenerateForm();
                fetchPayslips(); // Refresh list
            } else {
                const errorText = await response.text();
                setError(errorText || 'Failed to generate payslip');
            }
        } catch (err) {
            setError('Error generating payslip: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkGenerate = async (e) => {
        e.preventDefault();
        if (bulkForm.selectedUserIds.length === 0) {
            setError('Please select at least one employee');
            return;
        }
        if (!bulkForm.payPeriodStart || !bulkForm.payPeriodEnd) {
            setError('Please select pay period');
            return;
        }

        setLoading(true);
        setBulkProgress(0);
        setError('');
        let successCount = 0;
        let failCount = 0;

        // Iterate and generate for each user
        for (let i = 0; i < bulkForm.selectedUserIds.length; i++) {
            const userId = bulkForm.selectedUserIds[i];
            try {
                // We assume 0 salary/allowances for bulk generation as specific data might be missing in this UI
                // In a real app, we'd fetch salary from user profile or having a more complex form
                // For now, we send 0 and let backend/logic handle or expect user to edit draft later
                const response = await fetch('/api/payslips/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        userId: userId,
                        organizationId: user.organizationId,
                        monthlySalary: '0', // Placeholder, allows draft creation
                        payPeriodStart: bulkForm.payPeriodStart,
                        payPeriodEnd: bulkForm.payPeriodEnd,
                        notes: bulkForm.notes || 'Bulk Generated'
                    })
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                failCount++;
            }
            setBulkProgress(Math.round(((i + 1) / bulkForm.selectedUserIds.length) * 100));
        }

        setLoading(false);
        setShowBulkGenerate(false);
        setSuccess(`Bulk generation completed: ${successCount} successful, ${failCount} failed.`);
        fetchPayslips();
        setBulkForm({ payPeriodStart: '', payPeriodEnd: '', selectedUserIds: [], notes: '' });
        setBulkProgress(0);
    };

    const confirmStatusUpdate = (payslipId, newStatus) => {
        if (newStatus === 'PAID' || newStatus === 'CANCELLED') {
            setConfirmAction({ type: newStatus, id: payslipId });
        } else {
            handleUpdateStatus(payslipId, newStatus);
        }
    };

    const proceedWithStatusUpdate = () => {
        if (confirmAction) {
            handleUpdateStatus(confirmAction.id, confirmAction.type);
            setConfirmAction(null);
        }
    };

    const handleUpdateStatus = async (payslipId, status) => {
        try {
            const response = await fetch(`/api/payslips/${payslipId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(`Payslip marked as ${status}!`);
                fetchPayslips();
            } else {
                setError(data.message || 'Failed to update status');
            }
        } catch (err) {
            setError('Error updating status: ' + err.message);
        }
    };

    const handleDownloadPayslip = async (payslipId) => {
        try {
            const response = await fetch(`/api/payslips/${payslipId}/download`, { credentials: 'include' });
            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob, `payslip_${payslipId}.pdf`);
            } else {
                setError('Failed to download payslip');
            }
        } catch (err) {
            setError('Error downloading payslip: ' + err.message);
        }
    };

    const downloadBlob = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const resetGenerateForm = () => {
        setGenerateForm({
            userId: '',
            payPeriodStart: '',
            payPeriodEnd: '',
            monthlySalary: '',
            allowances: '',
            bonuses: '',
            otherDeductions: '',
            notes: ''
        });
    };

    // Helpers
    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');
    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return '#6c757d';
            case 'GENERATED': return '#007bff';
            case 'APPROVED': return '#28a745';
            case 'PAID': return '#17a2b8';
            case 'CANCELLED': return '#dc3545';
            default: return '#6c757d';
        }
    };
    const getStatusOptions = (currentStatus) => ['DRAFT', 'GENERATED', 'APPROVED', 'PAID', 'CANCELLED'].filter(s => s !== currentStatus);

    const toggleUserSelection = (userId) => {
        setBulkForm(prev => {
            const selected = prev.selectedUserIds.includes(userId)
                ? prev.selectedUserIds.filter(id => id !== userId)
                : [...prev.selectedUserIds, userId];
            return { ...prev, selectedUserIds: selected };
        });
    };

    const selectAllUsers = () => {
        if (bulkForm.selectedUserIds.length === users.length) {
            setBulkForm(prev => ({ ...prev, selectedUserIds: [] }));
        } else {
            setBulkForm(prev => ({ ...prev, selectedUserIds: users.map(u => u.id) }));
        }
    };

    return (
        <div className="main-content">
            <div className="page-header">
                <h1 className="page-title">Payroll Management</h1>
                <div className="page-actions">
                    {isPeopleContext ? (
                        <button onClick={() => navigate(-1)} className="btn-outline">Back</button>
                    ) : (
                        <button onClick={() => navigate(-1)} className="btn-outline">Back</button>
                    )}
                    <button className="btn-primary" onClick={() => setShowBulkGenerate(true)}>Bulk Generate</button>
                    <button className="btn-primary" onClick={() => setShowGenerateForm(true)}>Single Entry</button>
                </div>
            </div>

            <div className="payslip-controls-bar">
                <div className="view-toggles">
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        ☰
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        ☷
                    </button>
                </div>

                <div className="filter-controls">
                    <label>Status: </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="status-filter-select"
                    >
                        <option value="active">Active (Draft/Approved)</option>
                        <option value="history">History (Paid/Cancelled)</option>
                        <option value="all">All Payslips</option>
                    </select>
                </div>
            </div>

            <div className="payslip-management">
                {error && <div className="alert alert-error">{error}<button onClick={() => setError('')}>&times;</button></div>}
                {success && <div className="alert alert-success">{success}<button onClick={() => setSuccess('')}>&times;</button></div>}

                {/* Payslips View */}
                {loading ? (
                    <div className="loading">Loading payslips...</div>
                ) : filteredPayslips.length === 0 ? (
                    <div className="no-data">No {statusFilter !== 'all' ? statusFilter : ''} payslips found</div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="payslips-grid">
                                {filteredPayslips.map((payslip) => (
                                    <div key={payslip.id} className="payslip-card">
                                        <div className="payslip-header">
                                            <h4>#{payslip.payslipNumber}</h4>
                                            <span className="status-badge" style={{ backgroundColor: getStatusColor(payslip.status) }}>
                                                {payslip.status}
                                            </span>
                                        </div>
                                        <div className="payslip-details">
                                            <div className="detail-row"><span>Employee:</span><strong>{payslip.userName}</strong></div>
                                            <div className="detail-row"><span>Period:</span><span>{formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}</span></div>
                                            <div className="detail-row"><span>Net Salary:</span><span className="net-salary">{formatCurrency(payslip.netSalary)}</span></div>
                                        </div>
                                        <div className="payslip-card-actions">
                                            <select
                                                onChange={(e) => confirmStatusUpdate(payslip.id, e.target.value)}
                                                className="status-select-small"
                                                value=""
                                            >
                                                <option value="" disabled>Action</option>
                                                {getStatusOptions(payslip.status).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <button className="btn-icon" onClick={() => handleDownloadPayslip(payslip.id)} title="Download">📥</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="data-table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Employee</th>
                                            <th>Period</th>
                                            <th>Gross</th>
                                            <th>Net Salary</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPayslips.map((payslip) => (
                                            <tr key={payslip.id}>
                                                <td>#{payslip.payslipNumber}</td>
                                                <td>{payslip.userName}</td>
                                                <td>{formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}</td>
                                                <td>{formatCurrency(payslip.grossSalary)}</td>
                                                <td style={{ fontWeight: 'bold' }}>{formatCurrency(payslip.netSalary)}</td>
                                                <td>
                                                    <span className="status-badge" style={{ backgroundColor: getStatusColor(payslip.status) }}>
                                                        {payslip.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <select
                                                            onChange={(e) => confirmStatusUpdate(payslip.id, e.target.value)}
                                                            className="status-select-small"
                                                            value=""
                                                        >
                                                            <option value="" disabled>Update Status</option>
                                                            {getStatusOptions(payslip.status).map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                        <button className="btn-link" onClick={() => handleDownloadPayslip(payslip.id)}>Download</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>Prev</button>
                                <span className="page-info">Page {currentPage + 1} / {totalPages}</span>
                                <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}>Next</button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Single Generate Modal */}
            {showGenerateForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h3>Generate Payslip</h3><button className="close-btn" onClick={() => setShowGenerateForm(false)}>&times;</button></div>
                        <form onSubmit={handleGeneratePayslip} className="payslip-form">
                            <div className="form-group">
                                <label>Employee:</label>
                                <select value={generateForm.userId} onChange={e => setGenerateForm({ ...generateForm, userId: e.target.value })} required>
                                    <option value="">Select Employee</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Start Date:</label><input type="date" value={generateForm.payPeriodStart} onChange={e => setGenerateForm({ ...generateForm, payPeriodStart: e.target.value })} required /></div>
                                <div className="form-group"><label>End Date:</label><input type="date" value={generateForm.payPeriodEnd} onChange={e => setGenerateForm({ ...generateForm, payPeriodEnd: e.target.value })} required /></div>
                            </div>
                            <div className="form-group"><label>Monthly Salary (₹):</label><input type="number" value={generateForm.monthlySalary} onChange={e => setGenerateForm({ ...generateForm, monthlySalary: e.target.value })} required /></div>
                            <div className="form-group"><label>Allowances (₹):</label><input type="number" value={generateForm.allowances} onChange={e => setGenerateForm({ ...generateForm, allowances: e.target.value })} /></div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowGenerateForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Generate Modal */}
            {showBulkGenerate && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header"><h3>Bulk Generate Payslips</h3><button className="close-btn" onClick={() => setShowBulkGenerate(false)}>&times;</button></div>
                        <form onSubmit={handleBulkGenerate} className="payslip-form">
                            <div className="form-row">
                                <div className="form-group"><label>Start Date:</label><input type="date" value={bulkForm.payPeriodStart} onChange={e => setBulkForm({ ...bulkForm, payPeriodStart: e.target.value })} required /></div>
                                <div className="form-group"><label>End Date:</label><input type="date" value={bulkForm.payPeriodEnd} onChange={e => setBulkForm({ ...bulkForm, payPeriodEnd: e.target.value })} required /></div>
                            </div>
                            <div className="form-group">
                                <label>Select Employees ({bulkForm.selectedUserIds.length} selected):</label>
                                <div className="user-select-list">
                                    <div className="user-select-item header">
                                        <input type="checkbox" onChange={selectAllUsers} checked={bulkForm.selectedUserIds.length === users.length && users.length > 0} />
                                        <span>Select All</span>
                                    </div>
                                    {users.map(u => (
                                        <div key={u.id} className="user-select-item">
                                            <input
                                                type="checkbox"
                                                checked={bulkForm.selectedUserIds.includes(u.id)}
                                                onChange={() => toggleUserSelection(u.id)}
                                            />
                                            <span>{u.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="form-group"><label>Notes (Applied to all):</label><textarea value={bulkForm.notes} onChange={e => setBulkForm({ ...bulkForm, notes: e.target.value })} rows="2" /></div>

                            {loading && <div className="progress-bar"><div className="progress-fill" style={{ width: `${bulkProgress}%` }}></div></div>}

                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkGenerate(false)} disabled={loading}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={loading || bulkForm.selectedUserIds.length === 0}>{loading ? `Generating (${bulkProgress}%)` : 'Generate Selected'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="modal-overlay">
                    <div className="modal-content small">
                        <div className="modal-header"><h3>Confirm Action</h3></div>
                        <div className="modal-body">
                            <p>Are you sure you want to mark this payslip as <strong>{confirmAction.type}</strong>?</p>
                            <p className="text-sm text-muted">This action may be irreversible or affect financial records.</p>
                        </div>
                        <div className="form-actions">
                            <button className="btn btn-secondary" onClick={() => setConfirmAction(null)}>No, Cancel</button>
                            <button className="btn btn-danger" onClick={proceedWithStatusUpdate}>Yes, Proceed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayslipManagement;
