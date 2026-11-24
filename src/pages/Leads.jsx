import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  UserCheck,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  Clock,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
const LEAD_SOURCES = ['Website', 'Referral', 'Exhibition', 'Cold Call', 'Social Media', 'Other'];

export default function Leads() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [branches, setBranches] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [selectedLead, setSelectedLead] = useState(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewLeadData, setViewLeadData] = useState(null);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // New follow-up modal for this lead
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    contactPerson: '',
    companyName: '',
    email: '',
    phone: '',
    country: 'United Arab Emirates',
    leadSource: 'Website',
    status: 'New',
    notes: '',
    assignedTo: '',
    branch: '',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError('');
      let q = new URLSearchParams();
      if (searchTerm) q.append('search', searchTerm);
      if (selectedStatus) q.append('status', selectedStatus);
      if (selectedBranch) q.append('branchId', selectedBranch);

      const res = await api.get(`/leads?${q.toString()}`);
      if (res.data?.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        api.get('/branches'),
        api.get('/users'),
      ]);
      if (bRes.data?.success) setBranches(bRes.data.data);
      if (uRes.data?.success) setUsersList(uRes.data.data);
    } catch (e) {
      console.warn('Failed to fetch dependencies', e);
    }
  };

  useEffect(() => {
    fetchDependencies();
    fetchLeads();
  }, [selectedStatus, selectedBranch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads();
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormData({
      contactPerson: '',
      companyName: '',
      email: '',
      phone: '',
      country: 'United Arab Emirates',
      leadSource: 'Website',
      status: 'New',
      notes: '',
      assignedTo: user?._id || '',
      branch: isSuperAdmin ? (branches[0]?._id || '') : (user?.branch?._id || ''),
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (lead) => {
    setFormMode('edit');
    setSelectedLead(lead);
    setFormData({
      contactPerson: lead.contactPerson || lead.leadName,
      companyName: lead.companyName,
      email: lead.email || '',
      phone: lead.phone || '',
      country: lead.country || '',
      leadSource: lead.leadSource || 'Website',
      status: lead.status || 'New',
      notes: lead.notes || '',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      branch: lead.branch?._id || lead.branch || '',
    });
    setIsFormModalOpen(true);
  };

  const openViewModal = async (lead) => {
    try {
      const res = await api.get(`/leads/${lead._id}`);
      if (res.data?.success) {
        setViewLeadData(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      setError('Failed to load lead details');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (formMode === 'create') {
        const res = await api.post('/leads', formData);
        if (res.data?.success) {
          setSuccess('Lead created successfully');
          setIsFormModalOpen(false);
          fetchLeads();
        }
      } else {
        const res = await api.put(`/leads/${selectedLead._id}`, formData);
        if (res.data?.success) {
          setSuccess('Lead updated successfully');
          setIsFormModalOpen(false);
          fetchLeads();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleConvertLead = async () => {
    if (!leadToConvert) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/leads/${leadToConvert._id}/convert`, {});
      if (res.data?.success) {
        setSuccess(`Lead successfully converted to customer: ${res.data.data?.customer?.customerCode}`);
        setIsConvertModalOpen(false);
        fetchLeads();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed');
      setIsConvertModalOpen(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setError('');
    setSuccess('');

    try {
      const res = await api.delete(`/leads/${leadToDelete._id}`);
      if (res.data?.success) {
        setSuccess('Lead deleted successfully');
        setDeleteConfirmOpen(false);
        fetchLeads();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lead');
      setDeleteConfirmOpen(false);
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/follow-ups', {
        targetType: 'Lead',
        leadId: viewLeadData._id,
        followUpDate,
        notes: followUpNotes,
      });
      if (res.data?.success) {
        setSuccess('Follow-up scheduled successfully');
        setIsFollowUpModalOpen(false);
        setFollowUpDate('');
        setFollowUpNotes('');
        // Refresh detail
        openViewModal(viewLeadData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule follow-up');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'New': return 'badge-blue';
      case 'Contacted': return 'badge-amber';
      case 'Qualified': return 'badge-teal';
      case 'Converted': return 'badge-green';
      case 'Lost': return 'badge-red';
      default: return 'badge-slate';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('leads.title', 'Lead Management')}</h1>
          <p className="page-subtitle">{t('leads.subtitle', 'Track prospect inquiries and qualification workflows')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchLeads} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} />
            <span>{t('leads.addLead', 'New Lead')}</span>
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
            placeholder={t('leads.searchPlaceholder', 'Search leads by company, contact person, email or lead #...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '0.75rem', color: 'var(--slate-400)' }} />
        </form>

        <div style={{ minWidth: '160px' }}>
          <select className="form-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">{t('leads.allStatuses', 'All Statuses')}</option>
            {LEAD_STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {isSuperAdmin && (
          <div style={{ minWidth: '180px' }}>
            <select className="form-select" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
              <option value="">{t('dashboard.allBranches', 'All Branches')}</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>{t('leads.leadNumber', 'Lead #')}</th>
              <th>{t('leads.companyName', 'Company & Contact')}</th>
              <th>{t('leads.location', 'Location')}</th>
              <th>{t('leads.source', 'Source')}</th>
              <th>{t('leads.assignedTo', 'Assigned To')}</th>
              <th>{t('leads.status', 'Status')}</th>
              <th>{t('leads.branch', 'Branch')}</th>
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
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                  {t('dashboard.noData')}
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {l.leadNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{l.companyName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {l.contactPerson} {l.phone && `• ${l.phone}`}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{l.country}</span>
                  </td>
                  <td>
                    <span className="badge badge-slate">{l.leadSource}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                      {l.assignedTo?.name || 'Unassigned'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                    {l.convertedToCustomer && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--emerald-600)', marginTop: '0.2rem' }}>
                        → {l.convertedToCustomer.customerCode}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {l.branch?.name || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button type="button" className="btn-icon" title="View Lead" onClick={() => openViewModal(l)}>
                        <Eye size={14} />
                      </button>
                      <button type="button" className="btn-icon" title="Edit Lead" onClick={() => openEditModal(l)}>
                        <Edit2 size={14} />
                      </button>
                      {l.status !== 'Converted' && (
                        <button
                          type="button"
                          className="btn-icon"
                          title="Convert to Customer"
                          style={{ color: 'var(--teal-600)' }}
                          onClick={() => {
                            setLeadToConvert(l);
                            setIsConvertModalOpen(true);
                          }}
                        >
                          <UserCheck size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn-icon"
                        title="Delete Lead"
                        style={{ color: 'var(--rose-600)' }}
                        onClick={() => {
                          setLeadToDelete(l);
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
        title={formMode === 'create' ? t('leads.addLead', 'Create New Lead') : t('leads.editLead', 'Edit Lead')}
        maxWidth="600px"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('leads.companyName', 'Company Name')} *</label>
              <input
                type="text"
                className="form-input"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('leads.contactPerson', 'Contact Person')} *</label>
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
              <label className="form-label">{t('leads.email', 'Email Address')}</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('leads.phone', 'Phone Number')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('leads.country', 'Country')}</label>
              <input
                type="text"
                className="form-input"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('leads.source', 'Lead Source')}</label>
              <select
                className="form-select"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('leads.status', 'Status')}</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {LEAD_STATUSES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('leads.assignedTo', 'Assigned Employee')}</label>
              <select
                className="form-select"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          {isSuperAdmin && (
            <div className="form-group">
              <label className="form-label">{t('leads.branch', 'Branch')} *</label>
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

          <div className="form-group">
            <label className="form-label">{t('leads.notes', 'Notes & Cargo Requirements')}</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Exporting 3x40ft containers monthly from Shanghai to Rotterdam..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsFormModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              {formMode === 'create' ? t('common.save', 'Save Lead') : t('common.update', 'Update Lead')}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Lead Details & Follow-Up History Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewLeadData ? `${viewLeadData.companyName} (${viewLeadData.leadNumber})` : 'Lead Details'}
        maxWidth="680px"
      >
        {viewLeadData && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Contact Person</div>
                <div style={{ fontWeight: 600 }}>{viewLeadData.contactPerson}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Status</div>
                <div><span className={`badge ${getStatusBadge(viewLeadData.status)}`}>{viewLeadData.status}</span></div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Email / Phone</div>
                <div style={{ fontSize: '0.85rem' }}>{viewLeadData.email || '—'} / {viewLeadData.phone || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Branch</div>
                <div style={{ fontWeight: 600 }}>{viewLeadData.branch?.name} ({viewLeadData.branch?.code})</div>
              </div>
            </div>

            {viewLeadData.notes && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy-900)', marginBottom: '0.35rem' }}>Notes:</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', backgroundColor: '#fff', border: '1px solid var(--slate-200)', padding: '0.75rem', borderRadius: '6px' }}>
                  {viewLeadData.notes}
                </div>
              </div>
            )}

            {/* Follow-up History */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Follow-Up History</h4>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setIsFollowUpModalOpen(true)}
                >
                  <Calendar size={14} />
                  <span>Schedule Follow-Up</span>
                </button>
              </div>

              {viewLeadData.followUps && viewLeadData.followUps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {viewLeadData.followUps.map((f) => (
                    <div
                      key={f._id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid var(--slate-200)',
                        backgroundColor: f.status === 'Completed' ? 'var(--emerald-50)' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {f.notes}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          Scheduled: {new Date(f.followUpDate).toLocaleString()} • Assigned: {f.assignedTo?.name || 'Staff'}
                        </div>
                      </div>
                      <span className={`badge ${f.status === 'Completed' ? 'badge-green' : 'badge-amber'}`}>
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)', textAlign: 'center', padding: '1rem' }}>
                  No follow-ups logged yet. Click "Schedule Follow-Up" to create one.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Follow-up Mini-Modal */}
      <Modal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        title="Schedule Follow-Up"
        maxWidth="450px"
      >
        <form onSubmit={handleCreateFollowUp}>
          <div className="form-group">
            <label className="form-label">Follow-Up Date & Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Follow-Up Notes *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="e.g. Call client to discuss quotation QT-2026-0001 rates and space allocation..."
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsFollowUpModalOpen(false)}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary">
              Save Follow-Up
            </button>
          </div>
        </form>
      </Modal>

      {/* Convert to Customer Modal */}
      <Modal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        title="Convert Lead to Official Customer"
        maxWidth="460px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
          Are you sure you want to convert <strong>{leadToConvert?.companyName}</strong> into an official Customer?
          <br /><br />
          This will generate a formal Customer Code, carry forward all contact details, and lock the lead status as <strong>Converted</strong>.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setIsConvertModalOpen(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConvertLead}>
            <UserCheck size={16} />
            <span>Convert to Customer</span>
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Lead"
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete lead <strong>{leadToDelete?.leadNumber}</strong> ({leadToDelete?.companyName})?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setDeleteConfirmOpen(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteLead}>
            Delete Lead
          </button>
        </div>
      </Modal>
    </div>
  );
}
