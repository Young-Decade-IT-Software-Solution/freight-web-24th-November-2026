import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  Plus,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Ban,
  Tag,
  Paperclip,
  DollarSign,
  Calendar,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function Expenses() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Record Expense Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    expenseDate: new Date().toISOString().slice(0, 10),
    category: 'Office Rent',
    description: '',
    vendor: '',
    amount: '',
    tax: 0,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    accountId: '',
    shipmentId: '',
    referenceNumber: '',
    attachment: '',
    notes: '',
  });

  // Add Category Modal
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Void Expense Modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/expenses?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (categoryFilter) url += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setExpenses(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [cRes, bRes, aRes, sRes] = await Promise.all([
        api.get('/expenses/categories'),
        api.get('/branches'),
        api.get('/cash-bank/accounts'),
        api.get('/shipments'),
      ]);
      setCategories(cRes.data.data || []);
      setBranches(bRes.data.data || []);
      setAccounts(aRes.data.data || []);
      setShipments(sRes.data.data || []);
    } catch (err) {
      console.error('Failed to load expense dependencies', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [branchFilter, categoryFilter, statusFilter, searchTerm]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.description.trim() || !formData.amount || Number(formData.amount) <= 0) {
      setError('Please provide category, description, and positive amount');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount),
        tax: Number(formData.tax) || 0,
        accountId: formData.accountId || undefined,
        shipmentId: formData.shipmentId || undefined,
      });

      setSuccess('Expense recorded and posted successfully');
      setCreateModalOpen(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setActionLoading(true);
      const res = await api.post('/expenses/categories', {
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      });
      setCategories([...categories, res.data.data]);
      setFormData(prev => ({ ...prev, category: res.data.data.name }));
      setCategoryModalOpen(false);
      setNewCategoryName('');
      setNewCategoryDesc('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense category');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoidExpense = async () => {
    if (!voidReason.trim()) {
      setError('Void reason is required');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/expenses/${selectedExpense._id}/void`, { voidReason });
      setSuccess('Expense voided and account balance restored');
      setVoidModalOpen(false);
      setSelectedExpense(null);
      setVoidReason('');
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to void expense');
    } finally {
      setActionLoading(false);
    }
  };

  const totalExpenseAmount = expenses
    .filter(e => e.status !== 'Void')
    .reduce((acc, e) => acc + (e.totalAmount || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Wallet className="text-teal" size={26} />
            Expense Management
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Record operational overhead, petty cash, rent, salaries, and shipment direct expenses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchExpenses}
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
                expenseDate: new Date().toISOString().slice(0, 10),
                category: categories[0]?.name || 'Office Rent',
                description: '',
                vendor: '',
                amount: '',
                tax: 0,
                currency: 'USD',
                paymentMethod: 'Bank Transfer',
                accountId: '',
                shipmentId: '',
                referenceNumber: '',
                attachment: '',
                notes: '',
              });
              setCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            Record Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Expenses Recorded</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            ${totalExpenseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{expenses.filter(e => e.status !== 'Void').length} active records</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Categories Configured</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            {categories.length}
          </div>
          <div className="kpi-subtext">Overhead & operational types</div>
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
              placeholder="Search by expense #, description, vendor, ref..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['All', 'Recorded', 'Void'].map((s) => (
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

      {/* Expenses Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expense #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor</th>
                <th>Branch</th>
                <th>Account</th>
                <th>Shipment</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <Wallet size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No expense records found</p>
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{exp.expenseNumber}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(exp.expenseDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-default">{exp.category}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--navy-900)' }}>{exp.description}</td>
                    <td style={{ fontSize: '0.85rem' }}>{exp.vendor || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className="branch-pill">{exp.branch?.code || 'HQ'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {exp.account?.accountName || '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {exp.shipment ? exp.shipment.shipmentNumber : <span style={{ color: 'var(--slate-400)' }}>Overhead</span>}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>
                      {exp.currency} {exp.totalAmount?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${exp.status === 'Recorded' ? 'badge-success' : 'badge-danger'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {exp.status === 'Recorded' && (
                        <button
                          type="button"
                          className="btn-icon text-danger"
                          title="Void Expense"
                          onClick={() => {
                            setSelectedExpense(exp);
                            setVoidModalOpen(true);
                          }}
                        >
                          <Ban size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Operational Expense"
        maxWidth="640px"
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
              onClick={handleCreateExpense}
              disabled={actionLoading}
            >
              {actionLoading ? 'Recording...' : 'Record & Post Expense'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
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
              <label className="form-label">Expense Date *</label>
              <input
                type="date"
                className="input-text"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ margin: 0 }}>Category *</label>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--teal-600)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setCategoryModalOpen(true)}
                >
                  + New Category
                </button>
              </div>
              <select
                className="input-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(c => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
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
              <label className="form-label">Amount (Excl. Tax) *</label>
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
              <label className="form-label">Tax / VAT Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-text"
                placeholder="0.00"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="input-select"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Paid From Account</label>
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
              <label className="form-label">Vendor / Payee</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Dubai Internet City, Landlord, DEWA"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Shipment Link (If Direct Cost)</label>
              <select
                className="input-select"
                value={formData.shipmentId}
                onChange={(e) => setFormData({ ...formData, shipmentId: e.target.value })}
              >
                <option value="">General Overhead (Not Shipment-Specific)</option>
                {shipments.map(s => (
                  <option key={s._id} value={s._id}>{s.shipmentNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Expense Description *</label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. November 2026 Office High-Speed Internet Subscription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Receipt / Invoice Ref #</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. REC-99218"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Receipt Attachment URL / Name</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. receipt_november_deport.pdf"
                value={formData.attachment}
                onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title="Add Expense Category"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCategoryModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateCategory}
              disabled={actionLoading}
            >
              {actionLoading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        }
      >
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">Category Name *</label>
          <input
            type="text"
            className="input-text"
            placeholder="e.g. Port Customs Inspections"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="input-textarea"
            rows="2"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />
        </div>
      </Modal>

      {/* Void Expense Modal */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Expense: ${selectedExpense?.expenseNumber}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setVoidModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleVoidExpense}
              disabled={actionLoading}
            >
              {actionLoading ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Are you sure you want to void this expense? This will restore the account balance and record a reversal entry in the ledger.
        </p>
        <div className="form-group">
          <label className="form-label">Reason for Voiding *</label>
          <textarea
            className="input-textarea"
            rows="3"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
