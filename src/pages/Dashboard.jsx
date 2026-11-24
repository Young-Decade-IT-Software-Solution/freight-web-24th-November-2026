import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  FileSpreadsheet,
  Ship,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  Activity as ActivityIcon,
  Filter,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  AlertTriangle,
  Navigation,
  CalendarCheck,
  Receipt,
  CreditCard,
  Wallet,
  Plus,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/Common/StatCard';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [error, setError] = useState('');

  const fetchDashboardData = async (branchId = '') => {
    try {
      setLoading(true);
      const url = branchId ? `/dashboard?branchId=${branchId}` : '/dashboard';
      const res = await api.get(url);
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
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
      console.warn('Failed to fetch branches list:', e);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchDashboardData();
  }, []);

  const handleBranchChange = (e) => {
    const val = e.target.value;
    setSelectedBranch(val);
    fetchDashboardData(val);
  };

  const kpis = data?.kpis || {};

  return (
    <div>
      {/* Top Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isSuperAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Filter size={16} color="var(--slate-500)" />
              <select
                className="form-select"
                style={{ minWidth: '220px', padding: '0.45rem 0.75rem' }}
                value={selectedBranch}
                onChange={handleBranchChange}
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

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => fetchDashboardData(selectedBranch)}
            title="Refresh Metrics"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* Quick Financial Action Toolbar */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.9rem' }}>
          Quick Operational Actions:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => navigate('/invoices/create')}
          >
            <Plus size={14} /> New Invoice
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={() => navigate('/receipts')}
          >
            <CreditCard size={14} /> Record Receipt
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => navigate('/supplier-bills')}
          >
            <Receipt size={14} /> Record Bill
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => navigate('/expenses')}
          >
            <Wallet size={14} /> Record Expense
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--rose-50)',
            color: 'var(--rose-600)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Phase 4 Financial KPIs Grid */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>
          Financial Performance Highlights
        </h3>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          <StatCard
            label="Total Invoiced"
            value={loading ? '...' : `$${Number(kpis.totalInvoiced ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Receipt}
            color="blue"
          />
          <StatCard
            label="Total Collected"
            value={loading ? '...' : `$${Number(kpis.totalCollected ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={CreditCard}
            color="emerald"
          />
          <StatCard
            label="Outstanding Receivables"
            value={loading ? '...' : `$${Number(kpis.outstandingReceivables ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="amber"
          />
          <StatCard
            label="Outstanding Payables"
            value={loading ? '...' : `$${Number(kpis.outstandingPayables ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Clock}
            color="rose"
          />
          <StatCard
            label="Total Expenses"
            value={loading ? '...' : `$${Number(kpis.totalExpenses ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={Wallet}
            color="slate"
          />
        </div>
      </div>

      {/* Operational KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          label={t('dashboard.totalLeads')}
          value={loading ? '...' : kpis.totalLeads ?? 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label={t('dashboard.totalCustomers')}
          value={loading ? '...' : kpis.totalCustomers ?? 0}
          icon={Building2}
          color="teal"
        />
        <StatCard
          label={t('dashboard.openQuotations')}
          value={loading ? '...' : kpis.openQuotations ?? 0}
          icon={FileSpreadsheet}
          color="amber"
        />
        <StatCard
          label={t('dashboard.activeShipments')}
          value={loading ? '...' : kpis.activeShipments ?? 0}
          icon={Ship}
          color="teal"
        />
        <StatCard
          label={t('dashboard.completedShipments')}
          value={loading ? '...' : kpis.completedShipments ?? 0}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Shipment Pulse Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t('dashboard.inTransit', 'In Transit')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              {loading ? '...' : kpis.shipmentsInTransit ?? 0}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t('dashboard.arrivingSoon', 'Arriving in 7 Days')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
              {loading ? '...' : kpis.arrivingSoon ?? 0}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: (kpis.delayedShipments > 0) ? '3px solid #ef4444' : undefined }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>{t('dashboard.delayedShipments', 'Delayed Shipments')}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
              {loading ? '...' : kpis.delayedShipments ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Branch Operations Summary Grid (All 5 Branches) */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="var(--teal-600)" />
            <span className="card-title">{t('dashboard.branchPerformance')}</span>
          </div>
          <span className="badge badge-teal">5 Operational Hubs</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Branch Hub</th>
                <th>City & Country</th>
                <th>Leads</th>
                <th>Customers</th>
                <th>Shipments</th>
                <th>Invoices Issued</th>
                <th style={{ textAlign: 'right' }}>Outstanding Receivables</th>
              </tr>
            </thead>
            <tbody>
              {data?.branchStats && data.branchStats.length > 0 ? (
                data.branchStats.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                        {b.name}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontFamily: 'monospace',
                          color: 'var(--slate-500)',
                        }}
                      >
                        {b.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={13} color="var(--slate-400)" />
                        <span>{b.city}, {b.country}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-blue">{b.leads}</span>
                    </td>
                    <td>
                      <span className="badge badge-teal">{b.customers}</span>
                    </td>
                    <td>
                      <span className="badge badge-slate">{b.shipments}</span>
                    </td>
                    <td>
                      <span className="badge badge-green">{b.invoices}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: b.outstandingReceivables > 0 ? '#d97706' : 'var(--slate-600)' }}>
                      ${b.outstandingReceivables?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--slate-400)' }}>
                    {t('dashboard.noData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Recent Invoices & Recent Receipts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Recent Invoices */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={18} color="var(--blue-600)" />
              <span className="card-title">Recent Invoices</span>
            </div>
            <a href="/invoices" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', textDecoration: 'none', fontWeight: 600 }}>
              View Invoices &rarr;
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentInvoices && data.recentInvoices.length > 0 ? (
                  data.recentInvoices.map((inv) => (
                    <tr key={inv._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        <a href={`/invoices/${inv._id}`} style={{ color: 'var(--teal-600)', textDecoration: 'none' }}>
                          {inv.invoiceNumber}
                        </a>
                      </td>
                      <td>{inv.customer?.companyName || '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {inv.currency} {inv.totalAmount?.toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-green' : inv.status === 'Overdue' ? 'badge-rose' : 'badge-blue'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)' }}>
                      No recent invoices
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Receipts */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--teal-600)" />
              <span className="card-title">Recent Collections</span>
            </div>
            <a href="/receipts" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', textDecoration: 'none', fontWeight: 600 }}>
              View Receipts &rarr;
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Receipt #</th>
                  <th>Customer</th>
                  <th>Mode</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentReceipts && data.recentReceipts.length > 0 ? (
                  data.recentReceipts.map((rec) => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--teal-600)' }}>
                        {rec.receiptNumber}
                      </td>
                      <td>{rec.customer?.companyName || '—'}</td>
                      <td>{rec.paymentMode}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--teal-600)' }}>
                        {rec.currency} {rec.amount?.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)' }}>
                      No recent receipts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Quotations & Recent Shipments */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Recent Quotations */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} color="var(--blue-600)" />
              <span className="card-title">{t('dashboard.recentQuotations')}</span>
            </div>
            <a href="/quotations" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', textDecoration: 'none', fontWeight: 600 }}>
              View All &rarr;
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Quotation #</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentQuotations && data.recentQuotations.length > 0 ? (
                  data.recentQuotations.map((q) => (
                    <tr key={q._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {q.quotationNumber}
                      </td>
                      <td>{q.customer?.companyName || '—'}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                        {q.origin} → {q.destination}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {q.currency} {q.totalAmount?.toLocaleString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            q.status === 'Accepted'
                              ? 'badge-green'
                              : q.status === 'Sent'
                              ? 'badge-blue'
                              : 'badge-slate'
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--slate-400)' }}>
                      {t('dashboard.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ship size={18} color="var(--teal-600)" />
              <span className="card-title">{t('dashboard.recentShipments')}</span>
            </div>
            <a href="/shipments" style={{ fontSize: '0.8rem', color: 'var(--teal-600)', textDecoration: 'none', fontWeight: 600 }}>
              View All &rarr;
            </a>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Shipment #</th>
                  <th>Customer</th>
                  <th>Freight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentShipments && data.recentShipments.length > 0 ? (
                  data.recentShipments.map((s) => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {s.shipmentNumber}
                      </td>
                      <td>{s.customer?.companyName || '—'}</td>
                      <td>
                        <span className="badge badge-slate">{s.freightType}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            s.status === 'Delivered'
                              ? 'badge-green'
                              : s.status === 'In Transit'
                              ? 'badge-amber'
                              : 'badge-teal'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-400)' }}>
                      {t('dashboard.noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ActivityIcon size={18} color="var(--navy-800)" />
            <span className="card-title">{t('dashboard.recentActivities')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data?.recentActivities && data.recentActivities.length > 0 ? (
            data.recentActivities.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-100)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-teal">{act.module}</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {act.action}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                      {act.details}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'end', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                  <div>{act.userName || 'System'}</div>
                  <div>{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '1rem' }}>
              {t('dashboard.noData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
