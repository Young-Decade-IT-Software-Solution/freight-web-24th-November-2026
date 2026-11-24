import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CreditCard,
  Plus,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  DollarSign,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function CustomerReceipts() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [receipts, setReceipts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Record Receipt Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openInvoices, setOpenInvoices] = useState([]);
  const [formData, setFormData] = useState({
    branchId: '',
    customerId: '',
    receiptDate: new Date().toISOString().slice(0, 10),
    amount: '',
    currency: 'USD',
    paymentMode: 'Bank Transfer',
    accountId: '',
    referenceNumber: '',
    notes: '',
    allocations: [],
  });

  // Reversal Modal
  const [reverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [reversalReason, setReversalReason] = useState('');

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/receipts?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (customerFilter) url += `customer=${customerFilter}&`;
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setReceipts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customer receipts');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [bRes, cRes, aRes] = await Promise.all([
        api.get('/branches'),
        api.get('/customers'),
        api.get('/cash-bank/accounts'),
      ]);
      setBranches(bRes.data.data || []);
      setCustomers(cRes.data.data || []);
      setAccounts(aRes.data.data || []);
    } catch (err) {
      console.error('Error fetching dependencies', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchReceipts();
  }, [branchFilter, customerFilter, statusFilter, searchTerm]);

  // When customer is selected in Create modal, fetch their unpaid invoices
  const handleCustomerChange = async (custId) => {
    setFormData(prev => ({ ...prev, customerId: custId, allocations: [] }));
    if (!custId) {
      setOpenInvoices([]);
      return;
    }
    try {
      const res = await api.get(`/invoices?customer=${custId}&status=Issued,Partially Paid,Overdue`);
      const invs = res.data.data || [];
      setOpenInvoices(invs);
      // Initialize allocations with 0
      setFormData(prev => ({
        ...prev,
        customerId: custId,
        allocations: invs.map(inv => ({
          invoice: inv._id,
          invoiceNumber: inv.invoiceNumber,
          balanceAmount: inv.balanceAmount,
          currency: inv.currency,
          allocatedAmount: 0,
        })),
      }));
    } catch (err) {
      console.error('Failed to load open invoices for customer', err);
    }
  };

  const handleAllocationChange = (index, val) => {
    const updated = [...formData.allocations];
    const maxBal = updated[index].balanceAmount;
    const numVal = Math.min(Math.max(0, Number(val) || 0), maxBal);
    updated[index].allocatedAmount = numVal;

    // Recalculate total amount from allocations
    const sumAlloc = updated.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0);
    setFormData(prev => ({
      ...prev,
      allocations: updated,
      amount: sumAlloc > 0 ? sumAlloc : prev.amount,
    }));
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.amount || Number(formData.amount) <= 0) {
      setError('Please select a customer and provide a valid receipt amount');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const activeAllocations = (formData.allocations || [])
        .filter(a => Number(a.allocatedAmount) > 0)
        .map(a => ({
          invoice: a.invoice,
          allocatedAmount: Number(a.allocatedAmount),
        }));

      await api.post('/receipts', {
        ...formData,
        amount: Number(formData.amount),
        allocations: activeAllocations,
      });

      setSuccess('Customer receipt recorded and posted successfully');
      setCreateModalOpen(false);
      fetchReceipts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReverseReceipt = async () => {
    if (!reversalReason.trim()) {
      setError('Please enter a reversal reason');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/receipts/${selectedReceipt._id}/reverse`, {
        reversalReason,
      });
      setSuccess('Receipt successfully reversed');
      setReverseModalOpen(false);
      setSelectedReceipt(null);
      setReversalReason('');
      fetchReceipts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reverse receipt');
    } finally {
      setActionLoading(false);
    }
  };

  const totalCollected = receipts
    .filter(r => r.status !== 'Reversed' && r.status !== 'Void')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard className="text-teal" size={26} />
            Customer Receipts & Collections
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Record customer payments, invoice allocations, and manage cash receipts
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchReceipts}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                branchId: '',
                customerId: '',
                receiptDate: new Date().toISOString().slice(0, 10),
                amount: '',
                currency: 'USD',
                paymentMode: 'Bank Transfer',
                accountId: '',
                referenceNumber: '',
                notes: '',
                allocations: [],
              });
              setOpenInvoices([]);
              setCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            Record Receipt
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Receipts Collected</div>
          <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{receipts.length} receipts processed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Active Receipts</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            {receipts.filter(r => r.status === 'Recorded').length}
          </div>
          <div className="kpi-subtext">Posted to accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Reversed Receipts</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            {receipts.filter(r => r.status === 'Reversed').length}
          </div>
          <div className="kpi-subtext">Controlled reversals</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Search by receipt #, reference, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>

          {isSuperAdmin && (
            <div style={{ minWidth: '180px' }}>
              <select
                className="input-select"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ minWidth: '200px' }}>
            <select
              className="input-select"
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
            >
              <option value="">All Customers</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['All', 'Recorded', 'Reversed'].map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(s)}
                style={{ fontSize: '0.8rem' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Branch</th>
                <th>Mode</th>
                <th>Account</th>
                <th>Reference #</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <CreditCard size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No customer receipts found</p>
                  </td>
                </tr>
              ) : (
                receipts.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      <span
                        style={{ fontWeight: 600, color: 'var(--teal-600)', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedReceipt(rec);
                          setDetailModalOpen(true);
                        }}
                      >
                        {rec.receiptNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(rec.receiptDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--navy-900)' }}>{rec.customer?.companyName || '—'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className="branch-pill">{rec.branch?.code || 'HQ'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{rec.paymentMode}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {rec.account ? `${rec.account.accountName}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{rec.referenceNumber || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--teal-600)' }}>
                      {rec.currency} {rec.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${rec.status === 'Recorded' ? 'badge-success' : 'badge-danger'}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => {
                            setSelectedReceipt(rec);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {rec.status === 'Recorded' && (
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Reverse Receipt"
                            onClick={() => {
                              setSelectedReceipt(rec);
                              setReverseModalOpen(true);
                            }}
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Receipt Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Customer Receipt"
        maxWidth="680px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateReceipt}
              disabled={actionLoading}
            >
              {actionLoading ? 'Posting...' : 'Save & Post Receipt'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateReceipt}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {isSuperAdmin && (
              <div className="form-group">
                <label className="form-label">Branch *</label>
                <select
                  className="input-select"
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                className="input-select"
                value={formData.customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                required
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Date *</label>
              <input
                type="date"
                className="input-text"
                value={formData.receiptDate}
                onChange={(e) => setFormData({ ...formData, receiptDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Currency *</label>
              <select
                className="input-select"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
                <option value="TRY">TRY</option>
                <option value="CNY">CNY</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Mode *</label>
              <select
                className="input-select"
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Online">Online Gateway</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Deposit Account</label>
              <select
                className="input-select"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                <option value="">Select Account (Optional)</option>
                {accounts.filter(a => a.currency === formData.currency).map(a => (
                  <option key={a._id} value={a._id}>{a.accountName} ({a.accountType})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Total Received Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-text"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reference #</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Wire transfer ID, Cheque #"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Invoices Allocation Section */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Invoice Allocations
            </h4>

            {formData.allocations.length === 0 ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                {formData.customerId
                  ? 'No outstanding unpaid invoices found for this customer. Receipt will be held as unallocated / customer advance.'
                  : 'Select a customer above to view their outstanding invoices.'}
              </p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Outstanding</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Allocate ({formData.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.allocations.map((alloc, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{alloc.invoiceNumber}</td>
                        <td>{openInvoices[idx]?.dueDate ? new Date(openInvoices[idx].dueDate).toLocaleDateString() : '—'}</td>
                        <td style={{ textAlign: 'right' }}>
                          {alloc.currency} {alloc.balanceAmount?.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={alloc.balanceAmount}
                            className="input-text"
                            style={{ textAlign: 'right', padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
                            value={alloc.allocatedAmount}
                            onChange={(e) => handleAllocationChange(idx, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Notes</label>
            <textarea
              className="input-textarea"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Reversal Modal */}
      <Modal
        isOpen={reverseModalOpen}
        onClose={() => setReverseModalOpen(false)}
        title={`Reverse Receipt: ${selectedReceipt?.receiptNumber}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setReverseModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleReverseReceipt}
              disabled={actionLoading}
            >
              {actionLoading ? 'Reversing...' : 'Confirm Reversal'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Reversing this receipt will automatically roll back invoice allocations, restore open invoice balances, and reverse bank/cash account transactions.
        </p>
        <div className="form-group">
          <label className="form-label">Reason for Reversal *</label>
          <textarea
            className="input-textarea"
            rows="3"
            placeholder="e.g. Cheque bounced, duplicate deposit entry, wire recalled..."
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Receipt Details: ${selectedReceipt?.receiptNumber}`}
        maxWidth="600px"
      >
        {selectedReceipt && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Customer:</strong> {selectedReceipt.customer?.companyName}
              </div>
              <div>
                <strong>Receipt Date:</strong> {new Date(selectedReceipt.receiptDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Payment Mode:</strong> {selectedReceipt.paymentMode}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <span className={`badge ${selectedReceipt.status === 'Recorded' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedReceipt.status}
                </span>
              </div>
              <div>
                <strong>Total Amount:</strong> {selectedReceipt.currency} {selectedReceipt.amount?.toFixed(2)}
              </div>
              <div>
                <strong>Allocated:</strong> {selectedReceipt.currency} {selectedReceipt.allocatedAmount?.toFixed(2)}
              </div>
              <div>
                <strong>Unallocated / Advance:</strong> {selectedReceipt.currency} {selectedReceipt.unallocatedAmount?.toFixed(2)}
              </div>
              <div>
                <strong>Reference #:</strong> {selectedReceipt.referenceNumber || 'N/A'}
              </div>
            </div>

            {selectedReceipt.allocations?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Allocated Invoices</h4>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th style={{ textAlign: 'right' }}>Allocated Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReceipt.allocations.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{a.invoiceNumber}</td>
                        <td style={{ textAlign: 'right' }}>
                          {selectedReceipt.currency} {a.allocatedAmount?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedReceipt.status === 'Reversed' && (
              <div className="alert alert-danger" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                <strong>Reversed on:</strong> {new Date(selectedReceipt.reversedAt).toLocaleDateString()}<br />
                <strong>Reason:</strong> {selectedReceipt.reversalReason}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
