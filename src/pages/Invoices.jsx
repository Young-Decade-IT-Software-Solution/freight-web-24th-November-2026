import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Eye,
  Download,
  Mail,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  DollarSign,
  Ban,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const STATUS_FILTERS = ['All', 'Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Void'];

export default function Invoices() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Void modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/invoices?';
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setInvoices(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [branchRes, custRes] = await Promise.all([
        api.get('/branches'),
        api.get('/customers'),
      ]);
      setBranches(branchRes.data.data || []);
      setCustomers(custRes.data.data || []);
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, branchFilter, searchTerm]);

  const handleDownloadPdf = async (id, invNumber) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invNumber || 'Invoice'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download invoice PDF');
    }
  };

  const handleSendEmail = async (id) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/invoices/${id}/send-email`);
      setSuccess(res.data.message || 'Invoice sent successfully');
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invoice email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (!voidReason.trim()) {
      setError('Please provide a reason to void this invoice');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/invoices/${selectedInvoice._id}/void`, { voidReason });
      setSuccess('Invoice voided successfully');
      setVoidModalOpen(false);
      setSelectedInvoice(null);
      setVoidReason('');
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to void invoice');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics summary
  const totalInvoiced = invoices.filter(i => i.status !== 'Void').reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalCollected = invoices.filter(i => i.status !== 'Void').reduce((acc, i) => acc + (i.paidAmount || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status !== 'Void').reduce((acc, i) => acc + (i.balanceAmount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'Overdue' || (new Date(i.dueDate) < new Date() && i.balanceAmount > 0)).length;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Paid': return 'badge-success';
      case 'Partially Paid': return 'badge-warning';
      case 'Issued': return 'badge-info';
      case 'Overdue': return 'badge-danger';
      case 'Void': return 'badge-secondary';
      default: return 'badge-default';
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt className="text-teal" size={26} />
            {t('invoicing.title', 'Invoice Management')}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {t('invoicing.subtitle', 'Create, track, issue, and manage commercial freight invoices')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchInvoices}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            {t('common.refresh', 'Refresh')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/invoices/create')}
          >
            <Plus size={16} />
            {t('invoicing.createInvoice', 'New Invoice')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">{t('invoicing.totalInvoiced', 'Total Invoiced')}</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            ${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{invoices.length} {t('invoicing.invoicesCount', 'invoices listed')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">{t('invoicing.totalCollected', 'Total Collected')}</div>
          <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{t('invoicing.clearedReceipts', 'Receipt payments received')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">{t('invoicing.outstandingReceivables', 'Outstanding Receivables')}</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{t('invoicing.uncollectedBalance', 'Uncollected balance')}</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">{t('invoicing.overdueInvoices', 'Overdue Invoices')}</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            {overdueCount}
          </div>
          <div className="kpi-subtext">{t('invoicing.requireFollowUp', 'Require follow-up')}</div>
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

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="input-text"
              placeholder={t('invoicing.searchPlaceholder', 'Search by invoice #, customer name...')}
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
                <option value="">{t('dashboard.allBranches', 'All Branches')}</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Status filter tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(s)}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('invoicing.invoiceNumber', 'Invoice #')}</th>
                <th>{t('invoicing.issueDate', 'Date')}</th>
                <th>{t('invoicing.customer', 'Customer')}</th>
                <th>{t('invoicing.branch', 'Branch')}</th>
                <th>{t('invoicing.shipment', 'Shipment')}</th>
                <th style={{ textAlign: 'right' }}>{t('invoicing.totalAmount', 'Total')}</th>
                <th style={{ textAlign: 'right' }}>{t('invoicing.paidAmount', 'Paid')}</th>
                <th style={{ textAlign: 'right' }}>{t('invoicing.balance', 'Balance')}</th>
                <th style={{ textAlign: 'center' }}>{t('invoicing.status', 'Status')}</th>
                <th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    {t('common.loading', 'Loading invoices...')}
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <Receipt size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>{t('invoicing.noInvoices', 'No invoices found matching criteria')}</p>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <span
                        style={{ fontWeight: 600, color: 'var(--teal-600)', cursor: 'pointer' }}
                        onClick={() => navigate(`/invoices/${inv._id}`)}
                      >
                        {inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--navy-900)' }}>{inv.customer?.companyName || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{inv.customer?.contactPerson}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className="branch-pill">{inv.branch?.code || 'HQ'}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {inv.shipment ? (
                        <span
                          style={{ color: 'var(--navy-700)', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => navigate(`/shipments/${inv.shipment._id || inv.shipment}`)}
                        >
                          {inv.shipment.shipmentNumber || 'Shipment'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {inv.currency} {inv.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--teal-600)' }}>
                      {inv.currency} {inv.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: inv.balanceAmount > 0 ? '#d97706' : 'var(--slate-600)' }}>
                      {inv.currency} {inv.balanceAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${getStatusBadgeClass(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Invoice"
                          onClick={() => navigate(`/invoices/${inv._id}`)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Download PDF"
                          onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                        >
                          <Download size={16} />
                        </button>
                        {inv.status !== 'Void' && (
                          <button
                            type="button"
                            className="btn-icon"
                            title="Send Email"
                            onClick={() => handleSendEmail(inv._id)}
                            disabled={actionLoading}
                          >
                            <Mail size={16} />
                          </button>
                        )}
                        {inv.status !== 'Void' && inv.paidAmount === 0 && (
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Void Invoice"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setVoidModalOpen(true);
                            }}
                          >
                            <Ban size={16} />
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

      {/* Void Modal */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Invoice: ${selectedInvoice?.invoiceNumber}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setVoidModalOpen(false)}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleVoidInvoice}
              disabled={actionLoading}
            >
              {actionLoading ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Are you sure you want to void this invoice? Once voided, the invoice will be cancelled and cannot be paid.
        </p>
        <div className="form-group">
          <label className="form-label">Reason for Voiding *</label>
          <textarea
            className="input-textarea"
            rows="3"
            placeholder="e.g., Incorrect billing details, customer cancelled booking..."
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            required
          />
        </div>
      </Modal>
    </div>
  );
}
