import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Plus,
  Eye,
  Copy,
  Trash2,
  Download,
  Mail,
  Ship,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const STATUS_FILTERS = ['All', 'Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'];

export default function Quotations() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Delete modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);

  // Quick Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    contactPerson: '',
    freightType: 'Sea FCL',
    origin: '',
    destination: '',
    cargoDescription: '',
    grossWeight: 0,
    volumeCbm: 0,
    packagesCount: 1,
    currency: 'USD',
    freightCharges: 0,
    additionalChargeItems: [{ description: 'Documentation Fee', amount: 150 }],
    discount: 0,
    tax: 0,
    validityDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    termsAndConditions: 'Standard terms of freight carriage apply. Space subject to carrier confirmation.',
    branch: '',
  });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError('');
      let q = new URLSearchParams();
      if (searchTerm) q.append('search', searchTerm);
      if (statusFilter !== 'All') q.append('status', statusFilter);
      if (selectedBranch) q.append('branchId', selectedBranch);

      const res = await api.get(`/quotations?${q.toString()}`);
      if (res.data?.success) {
        setQuotations(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        api.get('/branches'),
        api.get('/customers'),
      ]);
      if (bRes.data?.success) setBranches(bRes.data.data);
      if (cRes.data?.success) setCustomers(cRes.data.data);
    } catch (e) {
      console.warn('Failed to load dependencies', e);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchQuotations();
  }, [statusFilter, selectedBranch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuotations();
  };

  // Calculation Engine helper for Create Form
  const calculateTotal = () => {
    const freight = Number(formData.freightCharges) || 0;
    const additional = formData.additionalChargeItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const tax = Number(formData.tax) || 0;
    const discount = Number(formData.discount) || 0;
    return Math.max(0, freight + additional + tax - discount);
  };

  const addChargeItem = () => {
    setFormData({
      ...formData,
      additionalChargeItems: [...formData.additionalChargeItems, { description: '', amount: 0 }],
    });
  };

  const removeChargeItem = (index) => {
    const items = formData.additionalChargeItems.filter((_, i) => i !== index);
    setFormData({ ...formData, additionalChargeItems: items });
  };

  const updateChargeItem = (index, field, value) => {
    const items = [...formData.additionalChargeItems];
    items[index][field] = field === 'amount' ? Number(value) || 0 : value;
    setFormData({ ...formData, additionalChargeItems: items });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/quotations', formData);
      if (res.data?.success) {
        setSuccess(`Quotation ${res.data.data?.quotationNumber} created successfully`);
        setIsCreateModalOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quotation');
    }
  };

  const handleDuplicate = async (id, isRevision = false) => {
    try {
      const res = await api.post(`/quotations/${id}/duplicate`, { isRevision });
      if (res.data?.success) {
        setSuccess(`${isRevision ? 'Revision' : 'Duplicate'} generated: ${res.data.data?.quotationNumber}`);
        fetchQuotations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Duplication failed');
    }
  };

  const handleDelete = async () => {
    if (!quoteToDelete) return;
    try {
      const res = await api.delete(`/quotations/${quoteToDelete._id}`);
      if (res.data?.success) {
        setSuccess('Quotation deleted successfully');
        setDeleteConfirmOpen(false);
        fetchQuotations();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quotation');
      setDeleteConfirmOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted': return 'badge-green';
      case 'Sent': return 'badge-blue';
      case 'Draft': return 'badge-slate';
      case 'Rejected': return 'badge-red';
      case 'Expired': return 'badge-amber';
      default: return 'badge-slate';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('quotations.title', 'Quotation Management')}</h1>
          <p className="page-subtitle">{t('quotations.subtitle', 'Create commercial freight proposals, manage revisions and convert to shipments')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchQuotations} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormData({
                ...formData,
                customer: customers[0]?._id || '',
                contactPerson: customers[0]?.contactPerson || '',
                branch: isSuperAdmin ? (branches[0]?._id || '') : (user?.branch?._id || ''),
              });
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>{t('quotations.create', 'New Quotation')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid #FECDD3', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingInlineStart: '2.2rem' }}
            placeholder={t('quotations.searchPlaceholder', 'Search quotations by number, route or contact person...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '0.75rem', color: 'var(--slate-400)' }} />
        </form>

        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', padding: '0.15rem' }}>
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${statusFilter === st ? 'btn-secondary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>

        {isSuperAdmin && (
          <div style={{ minWidth: '180px' }}>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quotations Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Quotation #</th>
              <th>Customer</th>
              <th>Mode</th>
              <th>Route (Origin → Destination)</th>
              <th>Validity</th>
              <th>Agreed Total</th>
              <th>Status</th>
              <th>Branch</th>
              <th style={{ textAlign: 'end' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  Loading quotations...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  No quotations found.
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q._id}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {q.quotationNumber}
                    </div>
                    {q.revision > 1 && (
                      <span className="badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                        Rev {q.revision}
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{q.customer?.companyName || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{q.contactPerson}</div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{q.freightType}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--navy-900)' }}>
                      {q.origin} → {q.destination}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                      {q.grossWeight} KG • {q.volumeCbm} CBM
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {q.validityDate ? new Date(q.validityDate).toLocaleDateString() : '30 Days'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      {q.currency} {q.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(q.status)}`}>
                      {q.status}
                    </span>
                    {q.isConvertedToShipment && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--teal-600)', fontWeight: 600, marginTop: '0.2rem' }}>
                        Converted to Shipment
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {q.branch?.name || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Full Quotation & Actions"
                        onClick={() => navigate(`/quotations/${q._id}`)}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Duplicate Quotation"
                        onClick={() => handleDuplicate(q._id, false)}
                      >
                        <Copy size={14} />
                      </button>
                      <a
                        href={`/api/quotations/${q._id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-icon"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </a>
                      {q.status === 'Draft' && (
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--rose-600)' }}
                          title="Delete Draft"
                          onClick={() => {
                            setQuoteToDelete(q);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 size={14} />
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

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Freight Quotation"
        maxWidth="740px"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                className="form-select"
                value={formData.customer}
                onChange={(e) => {
                  const cust = customers.find((c) => c._id === e.target.value);
                  setFormData({
                    ...formData,
                    customer: e.target.value,
                    contactPerson: cust?.contactPerson || '',
                    currency: cust?.currency || 'USD',
                  });
                }}
                required
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.customerCode} — {c.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Freight Type *</label>
              <select
                className="form-select"
                value={formData.freightType}
                onChange={(e) => setFormData({ ...formData, freightType: e.target.value })}
                required
              >
                <option value="Sea FCL">Sea FCL (Full Container)</option>
                <option value="Sea LCL">Sea LCL (Less Container)</option>
                <option value="Air">Air Freight</option>
                <option value="Road">Road Freight</option>
                <option value="Rail">Rail Freight</option>
                <option value="Multimodal">Multimodal</option>
                <option value="Courier">Courier / Express</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {['USD', 'EUR', 'AED', 'SAR', 'TRY', 'CNY', 'GBP'].map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Origin *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shanghai Port (CNSHA)"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Destination *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Jebel Ali Port (AEJEA)"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Gross Weight (KG)</label>
              <input
                type="number"
                className="form-input"
                value={formData.grossWeight}
                onChange={(e) => setFormData({ ...formData, grossWeight: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Volume (CBM)</label>
              <input
                type="number"
                className="form-input"
                step="0.1"
                value={formData.volumeCbm}
                onChange={(e) => setFormData({ ...formData, volumeCbm: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Packages</label>
              <input
                type="number"
                className="form-input"
                value={formData.packagesCount}
                onChange={(e) => setFormData({ ...formData, packagesCount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cargo Description</label>
            <input
              type="text"
              className="form-input"
              value={formData.cargoDescription}
              onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
              placeholder="e.g. General cargo, electronics, machinery..."
            />
          </div>

          {/* Charges & Calculation Engine Section */}
          <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '1rem', marginTop: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
              Quotation Calculation Engine
            </h4>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base Freight Charges ({formData.currency}) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.freightCharges}
                  onChange={(e) => setFormData({ ...formData, freightCharges: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax / Duties ({formData.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Discount ({formData.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Additional Charges Dynamic Line Items */}
            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Additional Charges (Line Items)
                </span>
                <button type="button" className="btn btn-outline btn-sm" onClick={addChargeItem}>
                  + Add Line Item
                </button>
              </div>

              {formData.additionalChargeItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 2 }}
                    placeholder="Charge description (e.g. Origin THC, Customs, Doc)"
                    value={item.description}
                    onChange={(e) => updateChargeItem(idx, 'description', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => updateChargeItem(idx, 'amount', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    style={{ color: 'var(--rose-600)' }}
                    onClick={() => removeChargeItem(idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Live Total Amount Box */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid var(--teal-500)', borderRadius: '6px', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>Total Quotation Amount:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-600)' }}>
                {formData.currency} {calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Quotation
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Draft Quotation"
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete quotation <strong>{quoteToDelete?.quotationNumber}</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirmOpen(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
