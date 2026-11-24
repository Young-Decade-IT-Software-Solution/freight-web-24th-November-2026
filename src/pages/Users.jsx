import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Building,
  Mail,
  Phone,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const ROLES = ['Super Admin', 'Branch Admin', 'Sales', 'Operations', 'Accounts'];

export default function UsersPage() {
  const { t } = useTranslation();
  const { user: currentUser, isSuperAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sales',
    branch: '',
    department: '',
    phone: '',
    isActive: true,
  });

  // Delete modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (selectedBranchFilter) queryParams.append('branchId', selectedBranchFilter);
      if (selectedRoleFilter) queryParams.append('role', selectedRoleFilter);

      const res = await api.get(`/users?${queryParams.toString()}`);
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data?.success) {
        setBranches(res.data.data);
      }
    } catch (e) {
      console.warn('Failed to load branches:', e);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedBranchFilter, selectedRoleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Sales',
      branch: isSuperAdmin ? (branches[0]?._id || '') : (currentUser?.branch?._id || ''),
      department: '',
      phone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setModalMode('edit');
    setSelectedUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '', // Leave blank unless changing
      role: u.role,
      branch: u.branch?._id || u.branch || '',
      department: u.department || '',
      phone: u.phone || '',
      isActive: u.isActive !== undefined ? u.isActive : true,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalMode === 'create') {
        const res = await api.post('/users', formData);
        if (res.data?.success) {
          setSuccess('User created successfully');
          setIsModalOpen(false);
          fetchUsers();
        }
      } else {
        const payload = { ...formData };
        if (!payload.password) delete payload.password; // Do not send empty password

        const res = await api.put(`/users/${selectedUser._id}`, payload);
        if (res.data?.success) {
          setSuccess('User updated successfully');
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/users/${userToDelete._id}`);
      if (res.data?.success) {
        setSuccess('User removed successfully');
        setDeleteConfirmOpen(false);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('users.title')}</h1>
          <p className="page-subtitle">{t('users.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={fetchUsers}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>{t('users.addUser')}</span>
          </button>
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

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <form
          onSubmit={handleSearchSubmit}
          style={{ flex: 1, minWidth: '240px', position: 'relative' }}
        >
          <input
            type="text"
            className="form-input"
            style={{ paddingInlineStart: '2.2rem' }}
            placeholder={t('users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={16}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              insetInlineStart: '0.75rem',
              color: 'var(--slate-400)',
            }}
          />
        </form>

        {isSuperAdmin && (
          <div style={{ minWidth: '200px' }}>
            <select
              className="form-select"
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
            >
              <option value="">{t('dashboard.allBranches')}</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="">{t('users.allRoles')}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{t('users.name')}</th>
              <th>{t('users.role')}</th>
              <th>{t('users.branch')}</th>
              <th>{t('users.department')}</th>
              <th>{t('users.status')}</th>
              <th>{t('users.lastLogin')}</th>
              <th style={{ textAlign: 'end' }}>{t('users.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('common.loading')}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('dashboard.noData')}
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={12} />
                      <span>{u.email}</span>
                      {u.phone && <span>• {u.phone}</span>}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === 'Super Admin'
                          ? 'badge-teal'
                          : u.role === 'Branch Admin'
                          ? 'badge-blue'
                          : u.role === 'Sales'
                          ? 'badge-amber'
                          : u.role === 'Operations'
                          ? 'badge-slate'
                          : 'badge-green'
                      }`}
                    >
                      <Shield size={10} />
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                      <Building size={14} color="var(--slate-400)" />
                      <span>{u.branch?.name || (u.role === 'Super Admin' ? 'All Branches' : 'Unassigned')}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {u.department || '—'}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-green">
                        <CheckCircle size={10} /> {t('branches.active')}
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <XCircle size={10} /> {t('branches.inactive')}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="Edit User"
                        onClick={() => openEditModal(u)}
                      >
                        <Edit2 size={14} />
                      </button>
                      {isSuperAdmin && u._id !== currentUser?._id && (
                        <button
                          type="button"
                          className="btn-icon"
                          title="Delete User"
                          style={{ color: 'var(--rose-600)' }}
                          onClick={() => {
                            setUserToDelete(u);
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

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === 'create' ? t('users.addUser') : t('users.editUser')}
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('users.name')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('users.email')} *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                {t('users.password')} {modalMode === 'create' ? '*' : '(Leave blank to keep)'}
              </label>
              <input
                type="password"
                className="form-input"
                placeholder={t('users.passwordPlaceholder')}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={modalMode === 'create'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('users.role')} *</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                {ROLES.map((r) => {
                  // Only super admin can create another super admin
                  if (r === 'Super Admin' && !isSuperAdmin) return null;
                  return (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('users.branch')} {formData.role !== 'Super Admin' ? '*' : ''}</label>
              <select
                className="form-select"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                disabled={!isSuperAdmin}
                required={formData.role !== 'Super Admin'}
              >
                <option value="">Select Branch</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('users.department')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Logistics, Sales, Billing"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('users.phone')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Active Account Status</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? t('users.save') : t('users.update')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title={t('users.delete')}
        maxWidth="440px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          {t('users.deleteConfirm')} <br />
          <strong>{userToDelete?.name} ({userToDelete?.email})</strong>
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
            onClick={handleDeleteUser}
          >
            {t('users.delete')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
