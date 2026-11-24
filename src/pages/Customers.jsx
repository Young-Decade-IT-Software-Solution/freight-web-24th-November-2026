import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  FileSpreadsheet,
  Ship,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const CURRENCIES = ['USD', 'EUR', 'AED', 'SAR', 'TRY', 'CNY', 'GBP'];

export default function Customers() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewCustomerData, setViewCustomerData] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerCode: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    country: 'United Arab Emirates',
    taxNumber: '',
    currency: 'USD',
    branch: '',
    notes: '',
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      let q = new URLSearchParams();
      if (searchTerm) q.append('search', searchTerm);
      if (selectedBranch) q.append('branchId', selectedBranch);

      const res = await api.get(`/customers?${q.toString()}`);
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data?.success) setBranches(res.data.data);
    } catch (e) {
      console.warn('Failed to load branches', e);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCustomers();
  }, [selectedBranch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      customerCode: '',
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      country: 'United Arab Emirates',
      taxNumber: '',
      currency: 'USD',
      branch: isSuperAdmin ? (branches[0]?._id || '') : (user?.branch?._id || ''),
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (c) => {
    setFormMode('edit');
    setSelectedCustomer(c);
    setFormData({
      customerCode: c.customerCode,
      companyName: c.companyName,
      contactPerson: c.contactPerson,
      email: c.email,
      phone: c.phone,
      address: c.address || '',
      country: c.country || '',
      taxNumber: c.taxNumber || '',
      currency: c.currency || 'USD',
      branch: c.branch?._id || c.branch || '',
      notes: c.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const openViewModal = async (c) => {
    try {
      const res = await api.get(`/customers/${c._id}`);
      if (res.data?.success) {
        setViewCustomerData(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      setError('Failed to load customer details');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (formMode === 'create') {
        const res = await api.post('/customers', formData);
        if (res.data?.success) {
          setSuccess('Customer created successfully');
          setIsFormModalOpen(false);
          fetchCustomers();
        }
      } else {
        const res = await api.put(`/customers/${selectedCustomer._id}`, formData);
        if (res.data?.success) {
          setSuccess('Customer updated successfully');
          setIsFormModalOpen(false);
          fetchCustomers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/customers/${customerToDelete._id}`);
      if (res.data?.success) {
        setSuccess('Customer deleted successfully');
        setDeleteConfirmOpen(false);
        fetchCustomers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete customer');
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('customers.title', 'Customer Management')}</h1>
          <p className="page-subtitle">{t('customers.subtitle', 'Manage commercial accounts, payment terms and freight history')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchCustomers} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>{t('customers.addCustomer', 'New Customer')}</span>
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
            placeholder={t('customers.searchPlaceholder', 'Search by customer code, company, contact person or email...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '0.75rem', color: 'var(--slate-400)' }} />
        </form>

        {isSuperAdmin && (
          <div style={{ minWidth: '200px' }}>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">{t('dashboard.allBranches', 'All Branches')}</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Customers Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{t('customers.code', 'Code')}</th>
              <th>{t('customers.company', 'Company Name')}</th>
              <th>{t('customers.contactPerson', 'Contact Person')}</th>
              <th>{t('customers.contact', 'Contact Details')}</th>
              <th>{t('customers.country', 'Country')}</th>
              <th>{t('customers.currency', 'Currency')}</th>
              <th>{t('customers.branch', 'Branch')}</th>
              <th style={{ textAlign: 'end' }}>{t('common.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('dashboard.noData')}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {c.customerCode}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{c.companyName}</div>
                    {c.taxNumber && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        VAT: {c.taxNumber}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{c.contactPerson}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Mail size={12} color="var(--slate-400)" />
                        <span>{c.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={12} color="var(--slate-400)" />
                        <span>{c.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{c.country}</span>
                  </td>
                  <td>
                    <span className="badge badge-teal">{c.currency || 'USD'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {c.branch?.name || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button type="button" className="btn-icon" title="View Customer History" onClick={() => openViewModal(c)}>
                        <Eye size={14} />
                      </button>
                      <button type="button" className="btn-icon" title="Edit Customer" onClick={() => openEditModal(c)}>
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Delete Customer"
                        style={{ color: 'var(--rose-600)' }}
                        onClick={() => {
                          setCustomerToDelete(c);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={formMode === 'create' ? t('customers.addCustomer', 'Create Customer') : t('customers.editCustomer', 'Edit Customer')}
        maxWidth="620px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('customers.company', 'Company Name')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('customers.contactPerson', 'Contact Person')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('customers.email', 'Email Address')} *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('customers.phone', 'Phone Number')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('customers.address', 'Billing & Office Address')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('customers.country', 'Country')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('customers.taxNumber', 'VAT / Tax Number')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('customers.currency', 'Preferred Currency')}</label>
              <select
                className="form-select"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                {CURRENCIES.map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            {isSuperAdmin && (
              <div className="form-group">
                <label className="form-label">{t('customers.branch', 'Branch')} *</label>
                <select
                  className="form-select"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t('customers.notes', 'Commercial Notes')}</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsFormModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {formMode === 'create' ? t('common.save') : t('common.update')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Customer Details & History Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewCustomerData ? `${viewCustomerData.companyName} (${viewCustomerData.customerCode})` : 'Customer History'}
        maxWidth="720px"
      >
        {viewCustomerData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Contact Person</div>
                <div style={{ fontWeight: 600 }}>{viewCustomerData.contactPerson}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Email & Phone</div>
                <div style={{ fontSize: '0.85rem' }}>{viewCustomerData.email} • {viewCustomerData.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Address</div>
                <div style={{ fontSize: '0.85rem' }}>{viewCustomerData.address || '—'}, {viewCustomerData.country}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Branch</div>
                <div style={{ fontWeight: 600 }}>{viewCustomerData.branch?.name}</div>
              </div>
            </div>

            {/* Related Quotations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <FileSpreadsheet size={16} color="var(--blue-600)" />
                <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>Quotation History ({viewCustomerData.quotations?.length || 0})</h4>
              </div>
              {viewCustomerData.quotations && viewCustomerData.quotations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {viewCustomerData.quotations.map((q) => (
                    <div key={q._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', border: '1px solid var(--slate-200)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <div>
                        <strong>{q.quotationNumber}</strong> — {q.origin} → {q.destination} ({q.freightType})
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span>{q.currency} {q.totalAmount?.toLocaleString()}</span>
                        <span className={`badge ${q.status === 'Accepted' ? 'badge-green' : q.status === 'Sent' ? 'badge-blue' : 'badge-slate'}`}>{q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No quotations generated yet.</div>
              )}
            </div>

            {/* Related Shipments */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Ship size={16} color="var(--teal-600)" />
                <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)' }}>Shipment History ({viewCustomerData.shipments?.length || 0})</h4>
              </div>
              {viewCustomerData.shipments && viewCustomerData.shipments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {viewCustomerData.shipments.map((s) => (
                    <div key={s._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', border: '1px solid var(--slate-200)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <div>
                        <strong>{s.shipmentNumber}</strong> — {s.origin} → {s.destination}
                      </div>
                      <span className="badge badge-teal">{s.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>No active or past shipments.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Customer"
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete customer <strong>{customerToDelete?.customerCode}</strong> ({customerToDelete?.companyName})?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirmOpen(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteCustomer}>
            Delete Customer
          </button>
        </div>
      </Modal>
    </div>
  );
}
