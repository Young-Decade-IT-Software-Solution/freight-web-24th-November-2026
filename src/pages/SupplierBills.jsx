import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  Plus,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign,
  Ban,
  Trash2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const STATUS_FILTERS = ['All', 'Draft', 'Approved', 'Partially Paid', 'Paid', 'Overdue', 'Void'];

export default function SupplierBills() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Record Bill Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    branchId: '',
    supplierId: '',
    vendorBillNumber: '',
    shipmentId: '',
    billDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    currency: 'USD',
    taxRate: 0,
    discount: 0,
    notes: '',
    lineItems: [
      { description: 'Carrier Freight Fee', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    status: 'Approved',
  });

  // Void modal
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/supplier-bills?';
      if (statusFilter !== 'All') url += `status=${statusFilter}&`;
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (supplierFilter) url += `supplier=${supplierFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setBills(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplier bills');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [supRes, bRes, sRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/branches'),
        api.get('/shipments'),
      ]);
      setSuppliers(supRes.data.data || []);
      setBranches(bRes.data.data || []);
      setShipments(sRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dependencies', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [statusFilter, branchFilter, supplierFilter, searchTerm]);

  const handleLineItemChange = (index, field, value) => {
    const updated = [...formData.lineItems];
    updated[index][field] = value;
    const qty = Number(updated[index].quantity) || 0;
    const price = Number(updated[index].unitPrice) || 0;
    updated[index].amount = Math.round(qty * price * 100) / 100;
    setFormData({ ...formData, lineItems: updated });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: '', quantity: 1, unitPrice: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length === 1) return;
    const updated = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: updated });
  };

  const subtotal = formData.lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const discountAmount = Math.min(Number(formData.discount) || 0, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * ((Number(formData.taxRate) || 0) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const handleCreateBill = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }
    if (formData.lineItems.some(i => !i.description.trim() || Number(i.unitPrice) <= 0)) {
      setError('Please provide valid descriptions and unit prices for all line items');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      await api.post('/supplier-bills', {
        ...formData,
        discount: Number(formData.discount) || 0,
        taxRate: Number(formData.taxRate) || 0,
      });
      setSuccess('Supplier bill recorded successfully');
      setCreateModalOpen(false);
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record supplier bill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveBill = async (billId) => {
    try {
      setActionLoading(true);
      await api.post(`/supplier-bills/${billId}/approve`);
      setSuccess('Bill approved successfully');
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve bill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVoidBill = async () => {
    if (!voidReason.trim()) {
      setError('Please provide a reason to void this bill');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/supplier-bills/${selectedBill._id}/void`, { voidReason });
      setSuccess('Bill voided successfully');
      setVoidModalOpen(false);
      setSelectedBill(null);
      setVoidReason('');
      fetchBills();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to void bill');
    } finally {
      setActionLoading(false);
    }
  };

  const totalOutstanding = bills.filter(b => b.status !== 'Void').reduce((acc, b) => acc + (b.balanceAmount || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt className="text-teal" size={26} />
            Supplier Bills & Payables
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Track vendor bills, shipment direct costs, and manage payables
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchBills}
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
                vendorBillNumber: '',
                shipmentId: '',
                billDate: new Date().toISOString().slice(0, 10),
                dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                currency: 'USD',
                taxRate: 0,
                discount: 0,
                notes: '',
                lineItems: [
                  { description: 'Carrier Freight Fee', quantity: 1, unitPrice: 0, amount: 0 },
                ],
                status: 'Approved',
              });
              setCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            Record Supplier Bill
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Outstanding Payables</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            ${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">{bills.filter(b => b.balanceAmount > 0 && b.status !== 'Void').length} unpaid bills</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total Bills Recorded</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            {bills.length}
          </div>
          <div className="kpi-subtext">Across all vendors</div>
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
              placeholder="Search by bill #, vendor invoice #, supplier..."
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

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setStatusFilter(s)}
                style={{ fontSize: '0.78rem' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Vendor Invoice #</th>
                <th>Supplier</th>
                <th>Shipment</th>
                <th>Date</th>
                <th>Due Date</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Paid</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    Loading supplier bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <Receipt size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No supplier bills found</p>
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b._id}>
                    <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>
                      {b.billNumber}
                    </td>
                    <td>{b.vendorBillNumber || '—'}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--navy-900)' }}>{b.supplier?.companyName}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {b.shipment ? (
                        <span
                          style={{ color: 'var(--navy-700)', cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => navigate(`/shipments/${b.shipment._id || b.shipment}`)}
                        >
                          {b.shipment.shipmentNumber || 'Shipment'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--slate-400)' }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(b.billDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem' }}>{new Date(b.dueDate).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {b.currency} {b.totalAmount?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--teal-600)' }}>
                      {b.currency} {b.paidAmount?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: b.balanceAmount > 0 ? '#d97706' : 'var(--slate-600)' }}>
                      {b.currency} {b.balanceAmount?.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Overdue' ? 'badge-danger' : 'badge-info'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {b.status === 'Draft' && (
                          <button
                            type="button"
                            className="btn-icon text-success"
                            title="Approve Bill"
                            onClick={() => handleApproveBill(b._id)}
                            disabled={actionLoading}
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {b.status !== 'Void' && b.paidAmount === 0 && (
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Void Bill"
                            onClick={() => {
                              setSelectedBill(b);
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

      {/* Record Bill Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Supplier Bill"
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
              onClick={handleCreateBill}
              disabled={actionLoading}
            >
              {actionLoading ? 'Recording...' : 'Record Bill'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateBill}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
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
                onChange={(e) => {
                  const sId = e.target.value;
                  const sup = suppliers.find(s => s._id === sId);
                  setFormData(prev => ({
                    ...prev,
                    supplierId: sId,
                    currency: sup?.preferredCurrency || prev.currency,
                  }));
                }}
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.companyName}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Vendor Bill / Ref #</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. INV-998274"
                value={formData.vendorBillNumber}
                onChange={(e) => setFormData({ ...formData, vendorBillNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Linked Shipment (Optional)</label>
              <select
                className="input-select"
                value={formData.shipmentId}
                onChange={(e) => setFormData({ ...formData, shipmentId: e.target.value })}
              >
                <option value="">No Shipment (General Overhead)</option>
                {shipments.map(s => (
                  <option key={s._id} value={s._id}>{s.shipmentNumber}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bill Date *</label>
              <input
                type="date"
                className="input-text"
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date *</label>
              <input
                type="date"
                className="input-text"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
          </div>

          {/* Line items */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', margin: 0 }}>Bill Line Items</h4>
              <button type="button" className="btn btn-sm btn-secondary" onClick={addLineItem}>
                <Plus size={12} /> Add Item
              </button>
            </div>

            {formData.lineItems.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="input-text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                  required
                />
                <input
                  type="number"
                  min="1"
                  className="input-text"
                  style={{ textAlign: 'right' }}
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-text"
                  style={{ textAlign: 'right' }}
                  value={item.unitPrice}
                  onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                  required
                />
                <div style={{ textAlign: 'right', fontWeight: 600 }}>
                  {formData.currency} {item.amount.toFixed(2)}
                </div>
                {formData.lineItems.length > 1 && (
                  <button type="button" className="btn-icon text-danger" onClick={() => removeLineItem(idx)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <div style={{ width: '260px', background: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>
                <span>Total:</span>
                <span>{formData.currency} {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Void Modal */}
      <Modal
        isOpen={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={`Void Bill: ${selectedBill?.billNumber}`}
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
              onClick={handleVoidBill}
              disabled={actionLoading}
            >
              {actionLoading ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        }
      >
        <p style={{ color: 'var(--slate-600)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Are you sure you want to void this bill?
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
