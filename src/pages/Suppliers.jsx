import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Building,
  DollarSign,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function Suppliers() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [branchFilter, setBranchFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'United Arab Emirates',
    address: '',
    taxNumber: '',
    preferredCurrency: 'USD',
    paymentTerms: 'Net 30',
    branchId: '',
    notes: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/suppliers?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      setSuppliers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers');
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
    fetchSuppliers();
  }, [branchFilter, searchTerm]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      country: 'United Arab Emirates',
      address: '',
      taxNumber: '',
      preferredCurrency: 'USD',
      paymentTerms: 'Net 30',
      branchId: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setIsEditing(true);
    setCurrentId(sup._id);
    setFormData({
      companyName: sup.companyName,
      contactPerson: sup.contactPerson,
      email: sup.email,
      phone: sup.phone,
      country: sup.country,
      address: sup.address,
      taxNumber: sup.taxNumber || '',
      preferredCurrency: sup.preferredCurrency,
      paymentTerms: sup.paymentTerms,
      branchId: sup.branch?._id || sup.branch || '',
      notes: sup.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      if (isEditing) {
        await api.put(`/suppliers/${currentId}`, formData);
        setSuccess('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        setSuccess('Supplier created successfully');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier');
    } finally {
      setActionLoading(false);
    }
  };

  const totalPayables = suppliers.reduce((acc, s) => acc + (s.balancePayable || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck className="text-teal" size={26} />
            Supplier & Vendor Directory
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage shipping carriers, airlines, trucking companies, and logistics vendors
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchSuppliers}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreate}
          >
            <Plus size={16} />
            Add Supplier
          </button>
        </div>
      </div>

      {/* KPI Card */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Suppliers</div>
          <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
            {suppliers.length}
          </div>
          <div className="kpi-subtext">Active vendor accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Outstanding Payables</div>
          <div className="kpi-value" style={{ color: '#d97706' }}>
            ${totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="kpi-subtext">Cumulative vendor liability</div>
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
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
            <input
              type="text"
              className="input-text"
              placeholder="Search by code, company name, contact, country..."
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
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Country</th>
                <th>Phone / Email</th>
                <th>Currency</th>
                <th>Payment Terms</th>
                <th>Branch</th>
                <th style={{ textAlign: 'right' }}>Balance Payable</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
                    <RefreshCw size={20} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                    Loading suppliers...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
                    <Truck size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 500 }}>No suppliers found</p>
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => (
                  <tr key={sup._id}>
                    <td>
                      <span
                        style={{ fontWeight: 600, color: 'var(--teal-600)', cursor: 'pointer' }}
                        onClick={() => navigate(`/suppliers/${sup._id}`)}
                      >
                        {sup.supplierCode}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{sup.companyName}</div>
                    </td>
                    <td>{sup.contactPerson || '—'}</td>
                    <td>{sup.country}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      <div>{sup.email}</div>
                      <div>{sup.phone}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{sup.preferredCurrency}</td>
                    <td style={{ fontSize: '0.85rem' }}>{sup.paymentTerms}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <span className="branch-pill">{sup.branch?.code || 'HQ'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: sup.balancePayable > 0 ? '#d97706' : 'var(--slate-600)' }}>
                      {sup.preferredCurrency} {sup.balancePayable?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="View Supplier Profile"
                          onClick={() => navigate(`/suppliers/${sup._id}`)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Supplier"
                          onClick={() => handleOpenEdit(sup)}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Supplier' : 'Add New Supplier'}
        maxWidth="600px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="input-text"
                placeholder="e.g. Maersk Line, Emirates SkyCargo"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input
                type="text"
                className="input-text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input-text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="input-text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                type="text"
                className="input-text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Currency</label>
              <select
                className="input-select"
                value={formData.preferredCurrency}
                onChange={(e) => setFormData({ ...formData, preferredCurrency: e.target.value })}
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
              <label className="form-label">Payment Terms</label>
              <select
                className="input-select"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              >
                <option value="Net 7">Net 7 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 60">Net 60 Days</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tax / VAT Number</label>
              <input
                type="text"
                className="input-text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Address</label>
            <input
              type="text"
              className="input-text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
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
    </div>
  );
}
