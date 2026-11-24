import React, { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  HardDrive,
  DollarSign,
  Ship,
  Users,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  Globe,
  Plus,
  Trash2,
  Sliders,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    companyName: '',
    logoUrl: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    taxNumber: '',
    defaultCurrency: 'USD',
    timezone: 'Asia/Dubai',
    dateFormat: 'YYYY-MM-DD',
    freightModes: [],
    defaultMilestones: [],
    documentCategories: [],
    defaultCustomerVisible: false,
    supportedCurrencies: [],
    invoicePaymentTerms: [],
    defaultTaxRate: 5,
    invoicePrefix: 'INV',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    isEmailConfigured: false,
    storageProvider: 'local',
    s3Bucket: '',
    s3Region: 'us-east-1',
    s3Endpoint: '',
    s3AccessKey: '',
    s3SecretKey: '',
  });

  // Branch Settings State
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [editBranchModal, setEditBranchModal] = useState(false);

  // Test Email Modal State
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  useEffect(() => {
    loadSettings();
    loadBranches();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data?.success) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await api.get('/settings/branches');
      if (res.data?.success) {
        setBranches(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/settings/company', settings);
      setMsg({ type: 'success', text: res.data?.message || 'Company settings saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update company settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFreight = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/settings/freight', {
        freightModes: settings.freightModes,
        defaultMilestones: settings.defaultMilestones,
        documentCategories: settings.documentCategories,
        defaultCustomerVisible: settings.defaultCustomerVisible,
      });
      setMsg({ type: 'success', text: res.data?.message || 'Freight operational settings saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save freight settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFinancial = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/settings/financial', {
        supportedCurrencies: settings.supportedCurrencies,
        invoicePaymentTerms: settings.invoicePaymentTerms,
        defaultTaxRate: settings.defaultTaxRate,
        invoicePrefix: settings.invoicePrefix,
      });
      setMsg({ type: 'success', text: res.data?.message || 'Financial configuration saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save financial settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/settings/email', {
        smtpHost: settings.smtpHost,
        smtpPort: settings.smtpPort,
        smtpUser: settings.smtpUser,
        smtpPass: settings.smtpPass,
        smtpFrom: settings.smtpFrom,
      });
      setMsg({ type: 'success', text: res.data?.message || 'Email settings saved successfully!' });
      setSettings((prev) => ({ ...prev, smtpPass: '' }));
      loadSettings();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update email settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setTestingEmail(true);
    setTestEmailResult(null);
    try {
      const res = await api.post('/settings/email/test', { recipient: testRecipient });
      setTestEmailResult({
        success: true,
        message: res.data?.message,
        previewUrl: res.data?.previewUrl,
      });
    } catch (err) {
      setTestEmailResult({
        success: false,
        message: err.response?.data?.message || 'Failed to send test email',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSaveStorage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await api.put('/settings/storage', {
        storageProvider: settings.storageProvider,
        s3Bucket: settings.s3Bucket,
        s3Region: settings.s3Region,
        s3Endpoint: settings.s3Endpoint,
        s3AccessKey: settings.s3AccessKey,
        s3SecretKey: settings.s3SecretKey,
      });
      setMsg({ type: 'success', text: res.data?.message || 'Storage preferences updated!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update storage settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBranch = async (branchId) => {
    try {
      const res = await api.put(`/settings/branches/${branchId}/toggle`);
      setMsg({ type: 'success', text: res.data?.message });
      loadBranches();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to toggle branch' });
    }
  };

  const handleUpdateBranch = async (e) => {
    e.preventDefault();
    if (!selectedBranch) return;
    try {
      const res = await api.put(`/settings/branches/${selectedBranch._id}`, selectedBranch);
      setMsg({ type: 'success', text: res.data?.message || 'Branch updated successfully' });
      setEditBranchModal(false);
      loadBranches();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update branch' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 0.25rem 0' }}>
          System Configuration & Settings
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', margin: 0 }}>
          Manage global enterprise branding, multi-branch preferences, SMTP email dispatch, and storage abstractions
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: 8,
            backgroundColor: msg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
            color: msg.type === 'success' ? '#166534' : '#991B1B',
            border: `1px solid ${msg.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {[
          { key: 'company', label: 'Company Profile', icon: Building2 },
          { key: 'branches', label: 'Branches (5)', icon: Globe },
          { key: 'freight', label: 'Freight & Operations', icon: Ship },
          { key: 'financial', label: 'Financial & Tax', icon: DollarSign },
          { key: 'email', label: 'SMTP Email', icon: Mail },
          { key: 'storage', label: 'Storage Abstraction', icon: HardDrive },
          { key: 'users', label: 'Security & Roles', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--teal-600)' : '2px solid transparent',
                color: isActive ? 'var(--teal-700)' : 'var(--slate-500)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. COMPANY PROFILE */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
            Enterprise Company Information
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
            These details appear on official quotations, commercial invoices, customer receipts, and email headers.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="label">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Tax / VAT Registration #</label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => setSettings({ ...settings, taxNumber: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Official Contact Email</label>
              <input
                type="email"
                required
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Official Telephone</label>
              <input
                type="text"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Registered Physical Address</label>
              <textarea
                rows={2}
                value={settings.companyAddress}
                onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Website URL</label>
              <input
                type="text"
                value={settings.companyWebsite}
                onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Default System Currency</label>
              <input
                type="text"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">System Timezone</label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Date Format</label>
              <input
                type="text"
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Company Settings'}
            </button>
          </div>
        </form>
      )}

      {/* 2. BRANCH MANAGEMENT */}
      {activeTab === 'branches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--navy-900)' }}>
              Operating Branches & Global Hubs
            </h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
              FreightERP operates across 5 international hubs. Data isolation is strictly enforced at the branch boundary.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {branches.map((b) => (
              <div key={b._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)', margin: 0 }}>
                        {b.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        Code: <strong>{b.code}</strong> • {b.city}, {b.country}
                      </div>
                    </div>
                    {b.isHeadOffice ? (
                      <span className="badge badge-primary">HQ</span>
                    ) : (
                      <span className={`badge ${b.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>Email: {b.email || '—'}</div>
                    <div>Phone: {b.phone || '—'}</div>
                    <div>Currency: <strong>{b.currency || 'USD'}</strong></div>
                  </div>

                  {/* Record counts */}
                  <div style={{ display: 'flex', gap: '1rem', padding: '0.6rem 0.8rem', backgroundColor: 'var(--slate-50)', borderRadius: 6, fontSize: '0.775rem', color: 'var(--slate-600)' }}>
                    <div>Users: <strong>{b.usersCount}</strong></div>
                    <div>Shipments: <strong>{b.shipmentsCount}</strong></div>
                    <div>Invoices: <strong>{b.invoicesCount}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBranch(b);
                      setEditBranchModal(true);
                    }}
                    className="btn btn-outline btn-xs"
                  >
                    Edit Details
                  </button>

                  {!b.isHeadOffice && user?.role === 'Super Admin' && (
                    <button
                      type="button"
                      onClick={() => handleToggleBranch(b._id)}
                      className="btn btn-outline btn-xs"
                      style={{ color: b.isActive ? '#DC2626' : '#16A34A' }}
                    >
                      {b.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FREIGHT & OPERATIONS */}
      {activeTab === 'freight' && (
        <form onSubmit={handleSaveFreight} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
            Freight Logistics & Document Policies
          </h2>

          <div>
            <label className="label">Active Freight Modes (Comma-separated)</label>
            <input
              type="text"
              value={settings.freightModes?.join(', ')}
              onChange={(e) => setSettings({ ...settings, freightModes: e.target.value.split(',').map((s) => s.trim()) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Default Shipment Milestones Workflow (Comma-separated)</label>
            <textarea
              rows={3}
              value={settings.defaultMilestones?.join(', ')}
              onChange={(e) => setSettings({ ...settings, defaultMilestones: e.target.value.split(',').map((s) => s.trim()) })}
              className="input-field"
            />
          </div>

          <div>
            <label className="label">Shipping Document Categories (Comma-separated)</label>
            <textarea
              rows={2}
              value={settings.documentCategories?.join(', ')}
              onChange={(e) => setSettings({ ...settings, documentCategories: e.target.value.split(',').map((s) => s.trim()) })}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="defCustVis"
              checked={settings.defaultCustomerVisible}
              onChange={(e) => setSettings({ ...settings, defaultCustomerVisible: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--teal-600)' }}
            />
            <label htmlFor="defCustVis" style={{ fontSize: '0.9rem', color: 'var(--navy-900)', fontWeight: 500, cursor: 'pointer' }}>
              Make newly uploaded shipment documents customer-visible by default
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Freight Settings'}
            </button>
          </div>
        </form>
      )}

      {/* 4. FINANCIAL SETTINGS */}
      {activeTab === 'financial' && (
        <form onSubmit={handleSaveFinancial} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
            Financial, Invoicing & Tax Preferences
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="label">Invoice Numbering Prefix</label>
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                className="input-field"
                placeholder="e.g. INV"
              />
            </div>

            <div>
              <label className="label">Default Value-Added Tax (VAT) %</label>
              <input
                type="number"
                step="0.1"
                value={settings.defaultTaxRate}
                onChange={(e) => setSettings({ ...settings, defaultTaxRate: Number(e.target.value) })}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Supported Multi-Currencies (Comma-separated)</label>
              <input
                type="text"
                value={settings.supportedCurrencies?.join(', ')}
                onChange={(e) => setSettings({ ...settings, supportedCurrencies: e.target.value.split(',').map((s) => s.trim().toUpperCase()) })}
                className="input-field"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Commercial Payment Terms (Comma-separated)</label>
              <input
                type="text"
                value={settings.invoicePaymentTerms?.join(', ')}
                onChange={(e) => setSettings({ ...settings, invoicePaymentTerms: e.target.value.split(',').map((s) => s.trim()) })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Financial Settings'}
            </button>
          </div>
        </form>
      )}

      {/* 5. SMTP EMAIL CONFIGURATION */}
      {activeTab === 'email' && (
        <form onSubmit={handleSaveEmail} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
                SMTP Email Gateway Dispatch Configuration
              </h2>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                Used for sending quotation notifications, customer portal invitations, and invoice delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTestRecipient(user?.email || '');
                setTestEmailModal(true);
              }}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={15} /> Test SMTP Connection
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="label">SMTP Server Host</label>
              <input
                type="text"
                required
                value={settings.smtpHost}
                onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                className="input-field"
                placeholder="smtp.mailtrap.io or smtp.gmail.com"
              />
            </div>

            <div>
              <label className="label">SMTP Server Port</label>
              <input
                type="number"
                required
                value={settings.smtpPort}
                onChange={(e) => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                className="input-field"
                placeholder="587 or 465"
              />
            </div>

            <div>
              <label className="label">SMTP Username / Account</label>
              <input
                type="text"
                value={settings.smtpUser}
                onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                className="input-field"
                placeholder="username@service.com"
              />
            </div>

            <div>
              <label className="label">SMTP Password (Leave blank to keep unchanged)</label>
              <input
                type="password"
                value={settings.smtpPass}
                onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                className="input-field"
                placeholder="••••••••••••"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Default From Display Address</label>
              <input
                type="text"
                value={settings.smtpFrom}
                onChange={(e) => setSettings({ ...settings, smtpFrom: e.target.value })}
                className="input-field"
                placeholder="FreightERP Logistics <ops@freighterp.com>"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Email Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* 6. STORAGE CONFIGURATION */}
      {activeTab === 'storage' && (
        <form onSubmit={handleSaveStorage} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
            Document Storage Provider Abstraction
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
            FreightERP supports local persistent volume storage out of the box, as well as production S3-compatible object storage (AWS S3, MinIO, Cloudflare R2).
          </p>

          <div>
            <label className="label">Storage Abstraction Mode</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="storageProvider"
                  value="local"
                  checked={settings.storageProvider === 'local'}
                  onChange={(e) => setSettings({ ...settings, storageProvider: e.target.value })}
                />
                <span>Local Persistent Disk Storage (Default)</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="storageProvider"
                  value="s3"
                  checked={settings.storageProvider === 's3'}
                  onChange={(e) => setSettings({ ...settings, storageProvider: e.target.value })}
                />
                <span>S3-Compatible Cloud Object Storage</span>
              </label>
            </div>
          </div>

          {settings.storageProvider === 's3' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div>
                <label className="label">S3 Bucket Name</label>
                <input
                  type="text"
                  value={settings.s3Bucket}
                  onChange={(e) => setSettings({ ...settings, s3Bucket: e.target.value })}
                  className="input-field"
                  placeholder="freighterp-documents-prod"
                />
              </div>

              <div>
                <label className="label">S3 Region</label>
                <input
                  type="text"
                  value={settings.s3Region}
                  onChange={(e) => setSettings({ ...settings, s3Region: e.target.value })}
                  className="input-field"
                  placeholder="me-central-1 or us-east-1"
                />
              </div>

              <div>
                <label className="label">Custom Endpoint URL (Optional)</label>
                <input
                  type="text"
                  value={settings.s3Endpoint}
                  onChange={(e) => setSettings({ ...settings, s3Endpoint: e.target.value })}
                  className="input-field"
                  placeholder="https://s3.me-central-1.amazonaws.com"
                />
              </div>

              <div>
                <label className="label">S3 Access Key ID</label>
                <input
                  type="text"
                  value={settings.s3AccessKey}
                  onChange={(e) => setSettings({ ...settings, s3AccessKey: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">S3 Secret Access Key</label>
                <input
                  type="password"
                  value={settings.s3SecretKey}
                  onChange={(e) => setSettings({ ...settings, s3SecretKey: e.target.value })}
                  className="input-field"
                  placeholder="••••••••••••"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Storage Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* 7. SECURITY & ROLES */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--navy-900)' }}>
            Enterprise Role-Based Access Control (RBAC) & Security Policies
          </h2>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: 0 }}>
            FreightERP enforces a 5-tier role hierarchy with strict branch data isolation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Super Admin</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Full cross-branch visibility across all 5 international hubs. Protected: System cannot delete the last active Super Admin.
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Branch Admin</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Complete operational and financial control strictly scoped to their assigned hub.
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Sales</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                CRM leads, customers, follow-ups, and quotation creation within assigned branch.
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Operations</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Consignment dispatch, tracking, milestone progression, and shipment document uploads.
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--slate-200)', borderRadius: 8 }}>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Accounts</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Commercial invoicing, customer receipts, supplier bills, expenses, and cash/bank ledger.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.5rem' }}>
            <a href="/users" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} /> Manage System Staff Users →
            </a>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {editBranchModal && selectedBranch && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ maxWidth: 480, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 1rem 0' }}>
              Edit Branch: {selectedBranch.name}
            </h3>
            <form onSubmit={handleUpdateBranch} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label className="label">Branch Name</label>
                <input
                  type="text"
                  required
                  value={selectedBranch.name}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, name: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Telephone</label>
                <input
                  type="text"
                  value={selectedBranch.phone || ''}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, phone: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={selectedBranch.email || ''}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Physical Address</label>
                <textarea
                  rows={2}
                  value={selectedBranch.address || ''}
                  onChange={(e) => setSelectedBranch({ ...selectedBranch, address: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setEditBranchModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testEmailModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ maxWidth: 480, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', margin: '0 0 0.5rem 0' }}>
              Test SMTP Dispatch Handshake
            </h3>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Send an automated test verification email to confirm server connectivity.
            </p>

            {testEmailResult && (
              <div
                style={{
                  padding: '0.85rem',
                  borderRadius: 6,
                  backgroundColor: testEmailResult.success ? '#DCFCE7' : '#FEE2E2',
                  color: testEmailResult.success ? '#166534' : '#991B1B',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                <div>{testEmailResult.message}</div>
                {testEmailResult.previewUrl && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <a href={testEmailResult.previewUrl} target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 600 }}>
                      View Delivered Message on Ethereal →
                    </a>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleTestEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Destination Recipient Email</label>
                <input
                  type="email"
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  className="input-field"
                  placeholder="test@freighterp.com"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setTestEmailModal(false)} className="btn btn-outline">Close</button>
                <button type="submit" disabled={testingEmail} className="btn btn-primary">
                  {testingEmail ? 'Sending Test...' : 'Dispatch Test Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
