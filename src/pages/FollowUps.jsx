import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  User,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function FollowUps() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, overdue, completed, all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New follow-up modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [formData, setFormData] = useState({
    targetType: 'Lead',
    leadId: '',
    customerId: '',
    followUpDate: '',
    assignedTo: '',
    notes: '',
  });

  const fetchFollowUps = async (tab = activeTab) => {
    try {
      setLoading(true);
      setError('');
      let url = '/follow-ups';
      if (tab !== 'all') {
        url += `?filter=${tab}`;
      }
      const res = await api.get(url);
      if (res.data?.success) {
        setFollowUps(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  };

  const fetchTargets = async () => {
    try {
      const [lRes, cRes, uRes] = await Promise.all([
        api.get('/leads'),
        api.get('/customers'),
        api.get('/users'),
      ]);
      if (lRes.data?.success) setLeads(lRes.data.data);
      if (cRes.data?.success) setCustomers(cRes.data.data);
      if (uRes.data?.success) setUsersList(uRes.data.data);
    } catch (e) {
      console.warn('Failed to fetch follow-up targets', e);
    }
  };

  useEffect(() => {
    fetchTargets();
    fetchFollowUps(activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchFollowUps(tab);
  };

  const handleMarkCompleted = async (id) => {
    try {
      const res = await api.put(`/follow-ups/${id}`, { status: 'Completed' });
      if (res.data?.success) {
        setSuccess('Follow-up marked as completed');
        fetchFollowUps(activeTab);
      }
    } catch (err) {
      setError('Failed to update follow-up status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/follow-ups/${id}`);
      if (res.data?.success) {
        setSuccess('Follow-up deleted');
        fetchFollowUps(activeTab);
      }
    } catch (err) {
      setError('Failed to delete follow-up');
    }
  };

  const openCreateModal = () => {
    setFormData({
      targetType: 'Lead',
      leadId: leads[0]?._id || '',
      customerId: '',
      followUpDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      assignedTo: user?._id || '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        targetType: formData.targetType,
        leadId: formData.targetType === 'Lead' ? formData.leadId : undefined,
        customerId: formData.targetType === 'Customer' ? formData.customerId : undefined,
        followUpDate: formData.followUpDate,
        assignedTo: formData.assignedTo || user._id,
        notes: formData.notes,
      };
      const res = await api.post('/follow-ups', payload);
      if (res.data?.success) {
        setSuccess('Follow-up scheduled successfully');
        setIsModalOpen(false);
        fetchFollowUps(activeTab);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule follow-up');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('followups.title', 'Follow-Up Management')}</h1>
          <p className="page-subtitle">{t('followups.subtitle', 'Track prospect calls, customer meetings and task deadlines')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => fetchFollowUps(activeTab)} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>{t('followups.schedule', 'Schedule Follow-Up')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleTabChange('upcoming')}
        >
          <Clock size={14} />
          <span>Upcoming Follow-Ups</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'overdue' ? 'btn-danger' : 'btn-outline'}`}
          onClick={() => handleTabChange('overdue')}
        >
          <AlertTriangle size={14} />
          <span>Overdue Follow-Ups</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleTabChange('completed')}
        >
          <CheckCircle size={14} />
          <span>Completed</span>
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => handleTabChange('all')}
        >
          <span>All Records</span>
        </button>
      </div>

      {/* Follow-ups List */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Entity / Prospect</th>
              <th>Due Date & Time</th>
              <th>Assigned Employee</th>
              <th>Notes / Action Item</th>
              <th>Status</th>
              <th style={{ textAlign: 'end' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  Loading follow-up tasks...
                </td>
              </tr>
            ) : followUps.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  No follow-ups found in this view.
                </td>
              </tr>
            ) : (
              followUps.map((f) => {
                const target = f.lead || f.customer;
                const isOverdue = new Date(f.followUpDate) < new Date() && f.status === 'Pending';

                return (
                  <tr key={f._id} style={{ backgroundColor: isOverdue ? '#FFF1F2' : 'transparent' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className={`badge ${f.targetType === 'Lead' ? 'badge-blue' : 'badge-teal'}`}>
                          {f.targetType}
                        </span>
                        <strong style={{ color: 'var(--navy-900)' }}>{target?.companyName || '—'}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                        {target?.contactPerson} {target?.phone && `• ${target.phone}`}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: isOverdue ? 'var(--rose-600)' : 'var(--navy-900)' }}>
                        <Calendar size={13} />
                        <span>{new Date(f.followUpDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <User size={13} color="var(--slate-400)" />
                        <span>{f.assignedTo?.name || 'Staff'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: 'var(--navy-900)', maxWidth: '340px' }}>
                        {f.notes}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${f.status === 'Completed' ? 'badge-green' : isOverdue ? 'badge-red' : 'badge-amber'}`}>
                        {isOverdue ? 'Overdue' : f.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {f.status !== 'Completed' && (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--emerald-600)', borderColor: '#A7F3D0' }}
                            onClick={() => handleMarkCompleted(f._id)}
                            title="Mark Completed"
                          >
                            <CheckCircle size={14} />
                            <span>Done</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--rose-600)' }}
                          onClick={() => handleDelete(f._id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Follow-Up"
        maxWidth="500px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Prospect Category</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="targetType"
                  value="Lead"
                  checked={formData.targetType === 'Lead'}
                  onChange={() => setFormData({ ...formData, targetType: 'Lead' })}
                />
                <span>Prospective Lead</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="targetType"
                  value="Customer"
                  checked={formData.targetType === 'Customer'}
                  onChange={() => setFormData({ ...formData, targetType: 'Customer' })}
                />
                <span>Existing Customer</span>
              </label>
            </div>
          </div>

          {formData.targetType === 'Lead' ? (
            <div className="form-group">
              <label className="form-label">Select Lead *</label>
              <select
                className="form-select"
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                required
              >
                <option value="">Select a lead...</option>
                {leads.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.leadNumber} — {l.companyName} ({l.contactPerson})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                required
              >
                <option value="">Select a customer...</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.customerCode} — {c.companyName} ({c.contactPerson})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Employee</label>
              <select
                className="form-select"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Follow-Up Objective / Notes *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Discuss revised quote rates for 2x40ft containers..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              Schedule Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
