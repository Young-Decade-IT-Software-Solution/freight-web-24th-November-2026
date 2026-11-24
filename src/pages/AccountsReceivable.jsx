import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileBarChart,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AccountsReceivable() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const fetchAR = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/reports/accounts-receivable?';
      if (branchFilter) url += `branch=${branchFilter}&`;

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Accounts Receivable report');
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
    fetchAR();
  }, [branchFilter]);

  const toggleCustomer = (id) => {
    setExpandedCustomer(prev => (prev === id ? null : id));
  };

  const summary = data?.summaryByCurrency || {};
  const currencies = Object.keys(summary);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileBarChart className="text-teal" size={26} />
            Accounts Receivable (AR) Aging
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Aging analysis of customer debt across Current, 1-30, 31-60, 61-90, and 90+ days overdue
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isSuperAdmin && (
            <select
              className="input-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              style={{ minWidth: '180px' }}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchAR}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
          Loading aging report...
        </div>
      ) : currencies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
          <Clock size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 500 }}>No outstanding receivables found</p>
        </div>
      ) : (
        <>
          {/* Aging Buckets Grid per Currency */}
          {currencies.map((curr) => {
            const bucket = summary[curr];
            return (
              <div key={curr} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', margin: 0 }}>
                    Currency: {curr}
                  </h3>
                  <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                    {bucket.invoiceCount} Unpaid Invoices
                  </span>
                </div>

                <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="kpi-card" style={{ borderLeft: '4px solid var(--navy-900)' }}>
                    <div className="kpi-label">Total Outstanding</div>
                    <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
                      {curr} {bucket.totalOutstanding?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <div className="kpi-label">Current (Not Overdue)</div>
                    <div className="kpi-value" style={{ color: '#16a34a' }}>
                      {curr} {bucket.current?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #eab308' }}>
                    <div className="kpi-label">1 - 30 Days</div>
                    <div className="kpi-value" style={{ color: '#ca8a04' }}>
                      {curr} {bucket['1-30']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #f97316' }}>
                    <div className="kpi-label">31 - 60 Days</div>
                    <div className="kpi-value" style={{ color: '#ea580c' }}>
                      {curr} {bucket['31-60']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="kpi-label">61 - 90 Days</div>
                    <div className="kpi-value" style={{ color: '#dc2626' }}>
                      {curr} {bucket['61-90']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #991b1b' }}>
                    <div className="kpi-label">90+ Days (High Risk)</div>
                    <div className="kpi-value" style={{ color: '#991b1b' }}>
                      {curr} {bucket['90+']?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Customer Aging Breakdown Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-100)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
                Customer-Wise Aging Breakdown
              </h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Customer Name</th>
                    <th>Currency</th>
                    <th style={{ textAlign: 'right' }}>Current</th>
                    <th style={{ textAlign: 'right' }}>1 - 30 Days</th>
                    <th style={{ textAlign: 'right' }}>31 - 60 Days</th>
                    <th style={{ textAlign: 'right' }}>61 - 90 Days</th>
                    <th style={{ textAlign: 'right' }}>90+ Days</th>
                    <th style={{ textAlign: 'right' }}>Total Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.customerBreakdown?.map((cust) => {
                    const isExpanded = expandedCustomer === cust.customerId;
                    return (
                      <React.Fragment key={cust.customerId}>
                        <tr
                          style={{ cursor: 'pointer', background: isExpanded ? 'var(--slate-50)' : 'transparent' }}
                          onClick={() => toggleCustomer(cust.customerId)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {cust.customerName}
                          </td>
                          <td>{cust.currency}</td>
                          <td style={{ textAlign: 'right', color: '#16a34a' }}>
                            {cust.current > 0 ? cust.current.toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ca8a04' }}>
                            {cust['1-30'] > 0 ? cust['1-30'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ea580c' }}>
                            {cust['31-60'] > 0 ? cust['31-60'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#dc2626' }}>
                            {cust['61-90'] > 0 ? cust['61-90'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>
                            {cust['90+'] > 0 ? cust['90+'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--navy-900)' }}>
                            {cust.currency} {cust.totalOutstanding.toFixed(2)}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan="9" style={{ padding: '1rem 2rem', background: 'var(--slate-50)' }}>
                              <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                                Unpaid Invoices for {cust.customerName}
                              </div>
                              <table className="data-table" style={{ fontSize: '0.82rem', background: '#fff' }}>
                                <thead>
                                  <tr>
                                    <th>Invoice #</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                    <th style={{ textAlign: 'right' }}>Paid</th>
                                    <th style={{ textAlign: 'right' }}>Balance Due</th>
                                    <th style={{ textAlign: 'center' }}>Aging Category</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {cust.invoices.map((inv) => (
                                    <tr key={inv._id}>
                                      <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{inv.invoiceNumber}</td>
                                      <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                      <td style={{ textAlign: 'right' }}>{inv.currency} {inv.totalAmount?.toFixed(2)}</td>
                                      <td style={{ textAlign: 'right', color: 'var(--teal-600)' }}>{inv.currency} {inv.paidAmount?.toFixed(2)}</td>
                                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                                        {inv.currency} {inv.balanceAmount?.toFixed(2)}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span className={`badge ${inv.bucket === 'current' ? 'badge-success' : inv.bucket === '90+' ? 'badge-danger' : 'badge-warning'}`}>
                                          {inv.bucket === 'current' ? 'Current' : `${inv.bucket} Days`}
                                        </span>
                                      </td>
                                      <td style={{ textAlign: 'right' }}>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline"
                                          onClick={() => navigate(`/invoices/${inv._id}`)}
                                        >
                                          <Eye size={12} /> View
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
