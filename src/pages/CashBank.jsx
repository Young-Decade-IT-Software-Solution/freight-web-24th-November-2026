import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  Plus,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Sliders,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function CashBank() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Create Account Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    accountName: '',
    accountType: 'Bank',
    bankName: '',
    accountNumber: '',
    accountReference: '',
    currency: 'USD',
    openingBalance: 0,
  });

  // Adjust Balance Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [adjustData, setAdjustData] = useState({
    amount: '',
    adjustmentType: 'Deposit',
    reason: '',
    referenceNumber: '',
  });

  // Transaction Ledger Modal
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/cash-bank/accounts?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (typeFilter !== 'All') url += `accountType=${typeFilter}&`;

      const res = await api.get(url);
      setAccounts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cash and bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data.data || []);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [branchFilter, typeFilter]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!formData.accountName.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await api.post('/cash-bank/accounts', {
        ...formData,
        openingBalance: Number(formData.openingBalance) || 0,
      });
      setSuccess('Account created and initialized successfully');
      setCreateModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!adjustData.amount || Number(adjustData.amount) <= 0 || !adjustData.reason.trim()) {
      setError('Please provide positive amount and adjustment reason');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await api.post(`/cash-bank/accounts/${selectedAccount._id}/adjust`, {
        amount: Number(adjustData.amount),
        adjustmentType: adjustData.adjustmentType,
        reason: adjustData.reason,
        referenceNumber: adjustData.referenceNumber,
      });
      setSuccess('Balance adjustment applied successfully');
      setAdjustModalOpen(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust balance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewLedger = async (acc) => {
    setSelectedAccount(acc);
    setLedgerModalOpen(true);
    setTransactionsLoading(true);
    try {
      const res = await api.get(`/cash-bank/accounts/${acc._id}/transactions`);
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Landmark className="text-teal" size={26} />
            Cash & Bank Management
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Monitor real-time cash, petty cash, and bank account balances across branches
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchAccounts}
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
                accountName: '',
                accountType: 'Bank',
                bankName: '',
                accountNumber: '',
                accountReference: '',
                currency: 'USD',
                openingBalance: 0,
              });
              setCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            Create Account
          </button>
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

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {['All', 'Bank', 'Cash', 'Petty Cash'].map((t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTypeFilter(t)}
                style={{ fontSize: '0.8rem' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--slate-500)' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading accounts...
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }} className="card">
            <Landmark size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
            <p style={{ margin: 0, fontWeight: 500 }}>No cash or bank accounts found</p>
          </div>
        ) : (
          accounts.map((acc) => (
            <div key={acc._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge ${acc.accountType === 'Bank' ? 'badge-info' : acc.accountType === 'Cash' ? 'badge-success' : 'badge-warning'}`}>
                    {acc.accountType}
                  </span>
                  <span className="branch-pill">{acc.branch?.code || 'HQ'}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 0.25rem' }}>
                  {acc.accountName}
                </h3>
                {acc.bankName && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginBottom: '0.2rem' }}>
                    {acc.bankName} {acc.accountNumber ? `• ${acc.accountNumber}` : ''}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 600 }}>
                  Current Balance
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: acc.currentBalance >= 0 ? 'var(--teal-600)' : '#dc2626', marginTop: '0.2rem' }}>
                  {acc.currency} {acc.currentBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => handleViewLedger(acc)}
                  >
                    <Eye size={14} />
                    Transactions
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setSelectedAccount(acc);
                      setAdjustData({
                        amount: '',
                        adjustmentType: 'Deposit',
                        reason: '',
                        referenceNumber: '',
                      });
                      setAdjustModalOpen(true);
                    }}
                  >
                    <Sliders size={14} />
                    Adjust
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Cash / Bank Account"
        maxWidth="580px"
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
              onClick={handleCreateAccount}
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateAccount}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
              <label className="form-label">Account Name *</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Emirates NBD Operating USD"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Type *</label>
              <select
                className="input-select"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              >
                <option value="Bank">Bank Account</option>
                <option value="Cash">Cash Account</option>
                <option value="Petty Cash">Petty Cash</option>
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
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Emirates NBD"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account / IBAN Number</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. AE0703300000000000"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Opening Balance</label>
              <input
                type="number"
                step="0.01"
                className="input-text"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title={`Adjust Balance: ${selectedAccount?.accountName}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAdjustModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdjustBalance}
              disabled={actionLoading}
            >
              {actionLoading ? 'Applying...' : 'Apply Adjustment'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleAdjustBalance}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Adjustment Type *</label>
            <select
              className="input-select"
              value={adjustData.adjustmentType}
              onChange={(e) => setAdjustData({ ...adjustData, adjustmentType: e.target.value })}
            >
              <option value="Deposit">Deposit (Increase Balance)</option>
              <option value="Withdrawal">Withdrawal (Decrease Balance)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Amount ({selectedAccount?.currency}) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="input-text"
              value={adjustData.amount}
              onChange={(e) => setAdjustData({ ...adjustData, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Reason *</label>
            <textarea
              className="input-textarea"
              rows="2"
              placeholder="e.g. Bank reconciliation difference, Petty cash replenishment"
              value={adjustData.reason}
              onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reference #</label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. REC-BANK-STMT-2026"
              value={adjustData.referenceNumber}
              onChange={(e) => setAdjustData({ ...adjustData, referenceNumber: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Transaction Ledger Modal */}
      <Modal
        isOpen={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
        title={`Transaction Ledger: ${selectedAccount?.accountName}`}
        maxWidth="840px"
      >
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Currency:</strong> {selectedAccount?.currency} | <strong>Current Balance:</strong> {selectedAccount?.currency} {selectedAccount?.currentBalance?.toFixed(2)}
          </div>
        </div>

        {transactionsLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <p style={{ color: 'var(--slate-400)', textAlign: 'center', padding: '2rem' }}>No transactions recorded for this account yet.</p>
        ) : (
          <div className="table-responsive" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Debit (Out)</th>
                  <th style={{ textAlign: 'right' }}>Credit (In)</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-default" style={{ fontSize: '0.72rem' }}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td>{tx.description}</td>
                    <td style={{ textAlign: 'right', color: tx.debit > 0 ? '#dc2626' : 'var(--slate-400)' }}>
                      {tx.debit > 0 ? tx.debit.toFixed(2) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', color: tx.credit > 0 ? 'var(--teal-600)' : 'var(--slate-400)' }}>
                      {tx.credit > 0 ? tx.credit.toFixed(2) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {tx.balance?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
