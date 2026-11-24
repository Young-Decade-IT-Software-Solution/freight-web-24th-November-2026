import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  ArrowLeft,
  Download,
  Mail,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Building,
  User,
  CreditCard,
  Ban,
  Clock,
  Printer,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'Bank Transfer',
    accountId: '',
    referenceNumber: '',
    notes: '',
  });

  // Void modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data.data);
      if (res.data.data) {
        setPaymentData((prev) => ({
          ...prev,
          amount: res.data.data.balanceAmount,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/cash-bank/accounts');
      setAccounts(res.data.data || []);
    } catch (err) {
      console.error('Failed to load accounts', err);
    }
  };

  useEffect(() => {
    fetchInvoice();
    fetchAccounts();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to download invoice PDF');
    }
  };

  const handleSendEmail = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/invoices/${id}/send-email`);
      setSuccess(res.data.message || 'Invoice dispatched via email');
      fetchInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch email');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueInvoice = async () => {
    try {
      setActionLoading(true);
      await api.post(`/invoices/${id}/issue`);
      setSuccess('Invoice status updated to Issued');
      fetchInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentData.amount || Number(paymentData.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/invoices/${id}/payments`, {
        amount: Number(paymentData.amount),
        paymentMode: paymentData.paymentMode,
        accountId: paymentData.accountId || undefined,
        referenceNumber: paymentData.referenceNumber,
        notes: paymentData.notes,
      });
      setSuccess('Payment recorded and allocated successfully');
      setPaymentModalOpen(false);
      fetchInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
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
      await api.post(`/invoices/${id}/void`, { voidReason });
      setSuccess('Invoice voided successfully');
      setVoidModalOpen(false);
      fetchInvoice();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to void invoice');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ color: 'var(--slate-500)', fontSize: '1rem' }}>Loading invoice details...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Invoice not found</div>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/invoices')}
        >
          <ArrowLeft size={16} />
          {t('common.back', 'Back to Invoices')}
        </button>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownloadPdf}
          >
            <Download size={16} />
            {t('invoicing.downloadPdf', 'Download PDF')}
          </button>

          {invoice.status !== 'Void' && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleSendEmail}
              disabled={actionLoading}
            >
              <Mail size={16} />
              {t('invoicing.sendEmail', 'Send via Email')}
            </button>
          )}

          {invoice.status === 'Draft' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleIssueInvoice}
              disabled={actionLoading}
            >
              <CheckCircle size={16} />
              {t('invoicing.issueInvoice', 'Issue Invoice')}
            </button>
          )}

          {['Issued', 'Partially Paid', 'Overdue'].includes(invoice.status) && invoice.balanceAmount > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setPaymentModalOpen(true)}
            >
              <DollarSign size={16} />
              {t('invoicing.recordPayment', 'Record Payment')}
            </button>
          )}

          {invoice.status !== 'Void' && invoice.paidAmount === 0 && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setVoidModalOpen(true)}
            >
              <Ban size={16} />
              {t('invoicing.void', 'Void Invoice')}
            </button>
          )}
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

      {/* Invoice Document Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        {/* Top Letterhead Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.5px' }}>
              Freight<span style={{ color: 'var(--teal-600)' }}>ERP</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
              {invoice.branch?.name} ({invoice.branch?.code})
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              {invoice.branch?.address || invoice.branch?.city} • {invoice.branch?.country}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              TAX INVOICE
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--teal-600)', marginTop: '0.2rem' }}>
              {invoice.invoiceNumber}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className={`badge ${invoice.status === 'Paid' ? 'badge-success' : invoice.status === 'Overdue' ? 'badge-danger' : 'badge-info'}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Meta Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Billed To
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {invoice.customer?.companyName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
              Attn: {invoice.customer?.contactPerson}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              {invoice.customer?.email} • {invoice.customer?.phone}
            </div>
            {invoice.customer?.taxNumber && (
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                Tax / VAT No: {invoice.customer.taxNumber}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 700, marginBottom: '0.4rem' }}>
              Shipment / Reference
            </div>
            {invoice.shipment ? (
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--navy-800)' }}>
                  Shipment: {invoice.shipment.shipmentNumber}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {invoice.shipment.freightType} • {invoice.shipment.origin} → {invoice.shipment.destination}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Standalone Invoice (No shipment linked)</div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>
              <strong>Issue Date:</strong> {new Date(invoice.issueDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>
              <strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              <strong>Currency:</strong> {invoice.currency}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Description</th>
                <th style={{ textAlign: 'right', width: '15%' }}>Quantity</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Unit Price ({invoice.currency})</th>
                <th style={{ textAlign: 'right', width: '20%' }}>Amount ({invoice.currency})</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems?.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{item.description}</td>
                  <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>
                    {item.unitPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '320px', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
              <span>Subtotal:</span>
              <span>{invoice.currency} {invoice.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            {invoice.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: '#16a34a' }}>
                <span>Discount:</span>
                <span>-{invoice.currency} {invoice.discount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {invoice.taxAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                <span>Tax / VAT ({invoice.taxRate}%):</span>
                <span>{invoice.currency} {invoice.taxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid var(--slate-200)', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              <span>Total Amount:</span>
              <span>{invoice.currency} {invoice.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.95rem', color: 'var(--teal-600)', fontWeight: 600 }}>
              <span>Paid Amount:</span>
              <span>{invoice.currency} {invoice.paidAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px dashed var(--slate-300)', fontSize: '1.1rem', fontWeight: 700, color: invoice.balanceAmount > 0 ? '#d97706' : 'var(--slate-600)' }}>
              <span>Balance Due:</span>
              <span>{invoice.currency} {invoice.balanceAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
          {invoice.notes && (
            <div style={{ marginBottom: '0.8rem' }}>
              <strong>Notes:</strong> {invoice.notes}
            </div>
          )}
          {invoice.termsAndConditions && (
            <div>
              <strong>Payment Terms & Conditions:</strong> {invoice.termsAndConditions}
            </div>
          )}
        </div>
      </div>

      {/* Payment History Section */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} className="text-teal" />
          Receipt & Payment Allocation History
        </h3>

        {invoice.paymentHistory?.length === 0 ? (
          <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', margin: 0 }}>No payment receipts recorded for this invoice yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Payment Date</th>
                  <th>Payment Mode</th>
                  <th>Reference #</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {invoice.paymentHistory?.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{p.receiptNumber}</td>
                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td>{p.paymentMode}</td>
                    <td>{p.referenceNumber || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {invoice.currency} {p.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email History Section */}
      {invoice.emailHistory?.length > 0 && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} className="text-teal" />
            Email Dispatch Log
          </h3>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sent At</th>
                  <th>Recipient Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoice.emailHistory.map((e, idx) => (
                  <tr key={idx}>
                    <td>{new Date(e.sentAt).toLocaleString()}</td>
                    <td>{e.sentTo}</td>
                    <td>{e.subject}</td>
                    <td>
                      <span className="badge badge-success">Delivered</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${invoice.invoiceNumber}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPaymentModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRecordPayment}
              disabled={actionLoading}
            >
              {actionLoading ? 'Recording...' : 'Confirm Payment'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleRecordPayment}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Payment Amount ({invoice.currency}) *</label>
            <input
              type="number"
              step="0.01"
              max={invoice.balanceAmount}
              className="input-text"
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
              required
            />
            <small style={{ color: 'var(--slate-400)', fontSize: '0.78rem' }}>
              Current outstanding balance: {invoice.currency} {invoice.balanceAmount?.toFixed(2)}
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Payment Mode *</label>
            <select
              className="input-select"
              value={paymentData.paymentMode}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Online">Online Payment Gateway</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Deposit Cash / Bank Account</label>
            <select
              className="input-select"
              value={paymentData.accountId}
              onChange={(e) => setPaymentData({ ...paymentData, accountId: e.target.value })}
            >
              <option value="">Select Account (Optional)</option>
              {accounts.filter(a => a.currency === invoice.currency).map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.accountName} ({acc.accountType} - {acc.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Transaction Reference #</label>
            <input
              type="text"
              className="input-text"
              placeholder="e.g. Bank wire transfer reference / Cheque number"
              value={paymentData.referenceNumber}
              onChange={(e) => setPaymentData({ ...paymentData, referenceNumber: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Internal Notes</label>
            <textarea
              className="input-textarea"
              rows="2"
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Void Modal */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Invoice: ${invoice.invoiceNumber}`}
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
              onClick={handleVoidInvoice}
              disabled={actionLoading}
            >
              {actionLoading ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Are you sure you want to void this invoice?
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
