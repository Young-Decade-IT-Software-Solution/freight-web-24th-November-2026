import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function Branches() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    country: '',
    address: '',
    phone: '',
    email: '',
    isHeadOffice: false,
    isActive: true,
  });

  // Delete confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/branches');
      if (res.data?.success) {
        setBranches(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      code: '',
      city: '',
      country: '',
      address: '',
      phone: '',
      email: '',
      isHeadOffice: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (branch) => {
    setModalMode('edit');
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      city: branch.city,
      country: branch.country,
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      isHeadOffice: branch.isHeadOffice || false,
      isActive: branch.isActive !== undefined ? branch.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        const res = await api.post('/branches', formData);
        if (res.data?.success) {
          setSuccess('Branch created successfully');
          setIsModalOpen(false);
          fetchBranches();
        }
      } else {
        const res = await api.put(`/branches/${selectedBranch._id}`, formData);
        if (res.data?.success) {
          setSuccess('Branch updated successfully');
          setIsModalOpen(false);
          fetchBranches();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save branch');
    }
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/branches/${branchToDelete._id}`);
      if (res.data?.success) {
        setSuccess('Branch deleted successfully');
        setDeleteConfirmOpen(false);
        fetchBranches();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete branch');
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('branches.title')}</h1>
          <p className="page-subtitle">{t('branches.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchBranches}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          {isSuperAdmin && (
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              <span>{t('branches.addBranch')}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--rose-50)',
            border: '1px solid #FECDD3',
            color: 'var(--rose-600)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            backgroundColor: 'var(--emerald-50)',
            border: '1px solid #A7F3D0',
            color: 'var(--emerald-600)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
          }}
        >
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Branches Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{t('branches.name')}</th>
              <th>{t('branches.code')}</th>
              <th>Location</th>
              <th>Contact Details</th>
              <th>Type</th>
              <th>{t('branches.status')}</th>
              <th style={{ textAlign: 'end' }}>{t('branches.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('dashboard.noData')}
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{b.name}</div>
                    {b.address && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', maxWidth: '280px' }}>
                        {b.address}
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: 'var(--slate-100)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {b.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <MapPin size={14} color="var(--slate-400)" />
                      <span>{b.city}, {b.country}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
                      {b.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} color="var(--slate-400)" />
                          <span>{b.phone}</span>
                        </div>
                      )}
                      {b.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Mail size={12} color="var(--slate-400)" />
                          <span>{b.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {b.isHeadOffice ? (
                      <span className="badge badge-teal">HQ Office</span>
                    ) : (
                      <span className="badge badge-slate">Regional Branch</span>
                    )}
                  </td>
                  <td>
                    {b.isActive ? (
                      <span className="badge badge-green">
                        <CheckCircle size={10} /> {t('branches.active')}
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <XCircle size={10} /> {t('branches.inactive')}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Edit Branch"
                        onClick={() => openEditModal(b)}
                      >
                        <Edit2 size={14} />
                      </button>
                      {isSuperAdmin && !b.isHeadOffice && (
                        <button
                          type="button"
                          className="btn-icon"
                          title="Delete Branch"
                          style={{ color: 'var(--rose-600)' }}
                          onClick={() => {
                            setBranchToDelete(b);
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

      {/* Create / Edit Branch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? t('branches.addBranch') : t('branches.editBranch')}
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('branches.name')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('branches.code')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={modalMode === 'edit' && !isSuperAdmin}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('branches.city')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('branches.country')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('branches.address')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('branches.phone')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('branches.email')}</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {isSuperAdmin && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isHeadOffice}
                  onChange={(e) => setFormData({ ...formData, isHeadOffice: e.target.checked })}
                />
                <span>{t('branches.headOffice')}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>{t('branches.active')}</span>
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? t('branches.save') : t('branches.update')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t('branches.delete')}
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          {t('branches.deleteConfirm')} <br />
          <strong>{branchToDelete?.name} ({branchToDelete?.code})</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteBranch}
          >
            {t('branches.delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
