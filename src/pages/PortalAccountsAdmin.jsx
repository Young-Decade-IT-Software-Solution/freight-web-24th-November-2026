import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Search,
  Filter,
  AlertCircle,
  Building,
  Key,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PortalAccountsAdmin() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Generated invitation modal
  const [generatedInvite, setGeneratedInvite] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionMsg, setActionMsg] = useState(null);

  useEffect(() => {
    loadAccounts();
    loadCustomers();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portal/accounts');
      if (res.data?.success) {
        setAccounts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers');
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCustomerSelect = (custId) => {
    setSelectedCustomerId(custId);
    const found = customers.find((c) => c._id === custId);
    if (found) {
      setInviteName(found.contactPerson || '');
      setInviteEmail(found.email || '');
      setInvitePhone(found.phone || '');
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);

    try {
      const res = await api.post('/portal/accounts/invite', {
        customerId: selectedCustomerId,
        name: inviteName,
        email: inviteEmail,
        phone: invitePhone,
      });

      if (res.data?.success) {
        const fullUrl = `${window.location.origin}${res.data.inviteUrl}`;
        setGeneratedInvite({
          email: inviteEmail,
          name: inviteName,
          token: res.data.inviteToken,
          url: fullUrl,
        });
        setInviteModalOpen(false);
        setSelectedCustomerId('');
        setInviteName('');
        setInviteEmail('');
        setInvitePhone('');
        loadAccounts();
      }
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleResend = async (accId) => {
    try {
      const res = await api.post(`/portal/accounts/${accId}/resend`);
      if (res.data?.success) {
        const fullUrl = `${window.location.origin}${res.data.inviteUrl}`;
        setGeneratedInvite({
          token: res.data.inviteToken,
          url: fullUrl,
        });
        setActionMsg({ type: 'success', text: res.data.message });
        loadAccounts();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to resend invite' });
    }
  };

  const handleStatusChange = async (accId, newStatus) => {
    try {
      const res = await api.put(`/portal/accounts/${accId}/status`, { status: newStatus });
      if (res.data?.success) {
        setActionMsg({ type: 'success', text: res.data.message });
        loadAccounts();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status' });
    }
  };

  const handleDelete = async (accId) => {
    if (!window.confirm('Are you sure you want to delete this customer portal account?')) return;
    try {
      const res = await api.delete(`/portal/accounts/${accId}`);
      if (res.data?.success) {
        setActionMsg({ type: 'success', text: 'Portal account removed successfully' });
        loadAccounts();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete account' });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = accounts.filter((acc) => {
    const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      acc.name?.toLowerCase().includes(q) ||
      acc.email?.toLowerCase().includes(q) ||
      acc.customer?.companyName?.toLowerCase().includes(q) ||
      acc.customer?.customerCode?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 0.25rem 0' }}>
            Customer Portal Accounts
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', margin: 0 }}>
            Invite, configure, and monitor external customer logins for FreightERP Customer Self-Service
          </p>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UserPlus size={16} /> Invite Customer Contact
        </button>
      </div>

      {actionMsg && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 8,
            backgroundColor: actionMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            color: actionMsg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${actionMsg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          }}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: 10,
          border: '1px solid var(--slate-200)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'Active', 'Pending', 'Suspended'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            >
              {st === 'ALL' ? 'All Accounts' : st}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: 'var(--slate-400)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, contact name or email..."
            className="input-field"
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading portal accounts...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-400)' }}>
            No customer portal accounts found. Click "Invite Customer Contact" above to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Company</th>
                  <th>Contact Person</th>
                  <th>Portal Email</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Invited On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc) => (
                  <tr key={acc._id}>
                    <td>
                      <strong>{acc.customer?.companyName || 'Unknown Company'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {acc.customer?.customerCode || 'N/A'}
                      </div>
                    </td>
                    <td>{acc.name}</td>
                    <td>
                      <code>{acc.email}</code>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          acc.status === 'Active'
                            ? 'badge-success'
                            : acc.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {acc.lastLogin ? new Date(acc.lastLogin).toLocaleString() : 'Never logged in'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {new Date(acc.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {acc.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleResend(acc._id)}
                            className="btn btn-outline btn-xs"
                            title="Resend Invitation Link"
                          >
                            <RefreshCw size={13} /> Resend
                          </button>
                        )}

                        {acc.status === 'Active' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(acc._id, 'Suspended')}
                            className="btn btn-outline btn-xs"
                            style={{ color: '#DC2626' }}
                            title="Suspend Portal Access"
                          >
                            Suspend
                          </button>
                        ) : acc.status === 'Suspended' ? (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(acc._id, 'Active')}
                            className="btn btn-outline btn-xs"
                            style={{ color: '#16A34A' }}
                            title="Activate Portal Access"
                          >
                            Reactivate
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleDelete(acc._id)}
                          className="btn btn-icon btn-xs"
                          style={{ color: '#EF4444' }}
                          title="Delete Portal Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Customer Modal */}
      {inviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: 480, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 0.5rem 0' }}>
              Invite Customer to Self-Service Portal
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Select a client customer record to generate a secure activation invitation link.
            </p>

            {inviteError && (
              <div style={{ padding: '0.75rem', borderRadius: 6, backgroundColor: '#FEE2E2', color: '#991B1B', marginBottom: '1rem', fontSize: '0.85rem' }}>
                {inviteError}
              </div>
            )}

            <form onSubmit={handleSendInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Select Customer Company *</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="input-field"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName} ({c.customerCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Sarah Jenkins"
                />
              </div>

              <div>
                <label className="label">Login Email *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-field"
                  placeholder="sarah@company.com"
                />
              </div>

              <div>
                <label className="label">Phone (Optional)</label>
                <input
                  type="text"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  className="input-field"
                  placeholder="+971 50 123 4567"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="btn btn-primary"
                >
                  {inviteLoading ? 'Generating...' : 'Generate Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Invitation Link Modal */}
      {generatedInvite && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: 500, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem 0' }}>
              Invitation Link Ready!
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Share this secure activation link with your customer contact to let them set their password:
            </p>

            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 8,
                wordBreak: 'break-all',
                fontSize: '0.825rem',
                color: 'var(--navy-900)',
                marginBottom: '1.25rem',
              }}
            >
              {generatedInvite.url}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setGeneratedInvite(null)}
                className="btn btn-outline"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedInvite.url)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Activation Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
