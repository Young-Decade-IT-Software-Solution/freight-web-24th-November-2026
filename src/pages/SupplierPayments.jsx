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
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function SupplierPayments() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [payments, setPayments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Record Payment Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [openBills, setOpenBills] = useState([]);
  const [formData, setFormData] = useState({
    branchId: '',
    supplierId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reversalReason, setReversalReason] = useState('');

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/supplier-payments?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (supplierFilter) url += `supplier=${supplierFilter}&`;
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setPayments(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplier payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [sRes, bRes, aRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/branches'),
        api.get('/cash-bank/accounts'),
      ]);
      setSuppliers(sRes.data.data || []);
      setBranches(bRes.data.data || []);
      setAccounts(aRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [branchFilter, supplierFilter, statusFilter, searchTerm]);

  const handleSupplierChange = async (supId) => {
    setFormData(prev => ({ ...prev, supplierId: supId, allocations: [] }));
    if (!supId) {
      setOpenBills([]);
      return;
    }
    try {
      const res = await api.get(`/supplier-bills?supplier=${supId}&status=Approved,Partially Paid,Overdue`);
      const billsData = res.data.data || [];
      setOpenBills(billsData);
      setFormData(prev => ({
        ...prev,
        supplierId: supId,
        allocations: billsData.map(b => ({
          bill: b._id,
          billNumber: b.billNumber,
          balanceAmount: b.balanceAmount,
          currency: b.currency,
          allocatedAmount: 0,
        })),
      }));
    } catch (err) {
      console.error('Failed to fetch unpaid bills for supplier', err);
    }
  };

  const handleAllocationChange = (index, val) => {
    const updated = [...formData.allocations];
    const maxBal = updated[index].balanceAmount;
    const numVal = Math.min(Math.max(0, Number(val) || 0), maxBal);
    updated[index].allocatedAmount = numVal;

    const sumAlloc = updated.reduce((sum, item) => sum + (item.allocatedAmount || 0), 0);
    setFormData(prev => ({
      ...prev,
      allocations: updated,
      amount: sumAlloc > 0 ? sumAlloc : prev.amount,
    }));
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.amount || Number(formData.amount) <= 0) {
      setError('Please select a supplier and enter a valid positive payment amount');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      const activeAllocations = (formData.allocations || [])
        .filter(a => Number(a.allocatedAmount) > 0)
        .map(a => ({
          bill: a.bill,
          allocatedAmount: Number(a.allocatedAmount),
        }));

      await api.post('/supplier-payments', {
        ...formData,
        amount: Number(formData.amount),
        allocations: activeAllocations,
      });

      setSuccess('Supplier payment posted successfully');
      setCreateModalOpen(false);
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReversePayment = async () => {
    if (!reversalReason.trim()) {
      setError('Please provide a reason for reversing this payment');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/supplier-payments/${selectedPayment._id}/reverse`, {
        reversalReason,
      });
      setSuccess('Supplier payment reversed successfully');
      setReverseModalOpen(false);
      setSelectedPayment(null);
      setReversalReason('');
      fetchPayments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reverse payment');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPaid = payments
    .filter(p => p.status === 'Recorded')
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CreditCard className="text-teal" size={26} />
            Supplier Payments & Disbursements
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Record payments to shipping lines, airlines, truckers, and bill settlements
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchPayments}
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
                supplierId: '',
                paymentDate: new Date().toISOString().slice(0, 10),
                amount: '',
                currency: 'USD',
                paymentMode: 'Bank Transfer',
                accountId: '',
                referenceNumber: '',
                notes: '',
                allocations: [],
              });
              setOpenBills([]);
              setCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Disbursements Paid</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            ${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{payments.length} transactions executed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Recorded Payments</div>
          <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
            {payments.filter(p => p.status === 'Recorded').length}
          </div>
          <div className="kpi-subtext">Active ledger entries</div>
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
              placeholder="Search by payment #, reference, supplier..."
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

          <div style={{ minWidth: '180px' }}>
            <select
              className="input-select"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>{s.companyName}</option>
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

      {/* Payments Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment #</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Branch</th>
                <th>Mode</th>
                <th>Account</th>
                <th>Reference #</th>
                <th style={{ textAlign: 'right' }}>Amount Paid</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    Loading supplier payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <CreditCard size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No supplier payments found</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span
                        style={{ fontWeight: 600, color: 'var(--teal-600)', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedPayment(p);
                          setDetailModalOpen(true);
                        }}
                      >
                        {p.paymentNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--navy-900)' }}>{p.supplier?.companyName}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className="branch-pill">{p.branch?.code || 'HQ'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.paymentMode}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {p.account ? `${p.account.accountName}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{p.referenceNumber || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {p.currency} {p.amount?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${p.status === 'Recorded' ? 'badge-success' : 'badge-danger'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Details"
                          onClick={() => {
                            setSelectedPayment(p);
                            setDetailModalOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {p.status === 'Recorded' && (
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Reverse Payment"
                            onClick={() => {
                              setSelectedPayment(p);
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Supplier Payment"
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
              onClick={handleCreatePayment}
              disabled={actionLoading}
            >
              {actionLoading ? 'Posting...' : 'Save & Post Payment'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreatePayment}>
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
              <label className="form-label">Supplier *</label>
              <select
                className="input-select"
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.companyName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Date *</label>
              <input
                type="date"
                className="input-text"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency *</label>
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
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Online">Online Gateway</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pay From Account</label>
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
              <label className="form-label">Payment Amount *</label>
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
              <label className="form-label">Transaction Reference #</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Bank wire reference, Cheque #"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Allocation to bills */}
          <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>
              Bill Allocations
            </h4>

            {formData.allocations.length === 0 ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                {formData.supplierId
                  ? 'No outstanding approved bills for this supplier. Payment will be treated as an advance.'
                  : 'Select a supplier above to load their open bills.'}
              </p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Bill #</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Outstanding</th>
                      <th style={{ textAlign: 'right', width: '130px' }}>Allocate ({formData.currency})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.allocations.map((alloc, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{alloc.billNumber}</td>
                        <td>{openBills[idx]?.dueDate ? new Date(openBills[idx].dueDate).toLocaleDateString() : '—'}</td>
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
        </form>
      </Modal>

      {/* Reversal Modal */}
      <Modal
        isOpen={reverseModalOpen}
        onClose={() => setReverseModalOpen(false)}
        title={`Reverse Payment: ${selectedPayment?.paymentNumber}`}
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
              onClick={handleReversePayment}
              disabled={actionLoading}
            >
              {actionLoading ? 'Reversing...' : 'Confirm Reversal'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Reversing this supplier payment will restore vendor bill balances and reverse bank/cash account debit entries.
        </p>
        <div className="form-group">
          <label className="form-label">Reason for Reversal *</label>
          <textarea
            className="input-textarea"
            rows="3"
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
        title={`Payment Details: ${selectedPayment?.paymentNumber}`}
        maxWidth="600px"
      >
        {selectedPayment && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
              <div><strong>Supplier:</strong> {selectedPayment.supplier?.companyName}</div>
              <div><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</div>
              <div><strong>Mode:</strong> {selectedPayment.paymentMode}</div>
              <div><strong>Status:</strong> {selectedPayment.status}</div>
              <div><strong>Amount:</strong> {selectedPayment.currency} {selectedPayment.amount?.toFixed(2)}</div>
              <div><strong>Reference #:</strong> {selectedPayment.referenceNumber || 'N/A'}</div>
            </div>

            {selectedPayment.status === 'Reversed' && (
              <div className="alert alert-danger" style={{ fontSize: '0.85rem' }}>
                <strong>Reversed on:</strong> {new Date(selectedPayment.reversedAt).toLocaleDateString()}<br />
                <strong>Reason:</strong> {selectedPayment.reversalReason}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
