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

export default function AccountsPayable() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSupplier, setExpandedSupplier] = useState(null);

  const fetchAP = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/reports/accounts-payable?';
      if (branchFilter) url += `branch=${branchFilter}&`;

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Accounts Payable report');
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
    fetchAP();
  }, [branchFilter]);

  const toggleSupplier = (id) => {
    setExpandedSupplier(prev => (prev === id ? null : id));
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
            Accounts Payable (AP) Aging
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Aging schedule of vendor bills across Current, 1-30, 31-60, 61-90, and 90+ days overdue
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
            onClick={fetchAP}
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
          Loading payables aging...
        </div>
      ) : currencies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
          <Clock size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 500 }}>No outstanding vendor payables found</p>
        </div>
      ) : (
        <>
          {/* Aging Buckets per Currency */}
          {currencies.map((curr) => {
            const bucket = summary[curr];
            return (
              <div key={curr} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)', margin: 0 }}>
                    Currency: {curr}
                  </h3>
                  <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                    {bucket.billCount} Unpaid Vendor Bills
                  </span>
                </div>

                <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                  <div className="kpi-card" style={{ borderLeft: '4px solid var(--navy-900)' }}>
                    <div className="kpi-label">Total Payables</div>
                    <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
                      {curr} {bucket.totalOutstanding?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #16a34a' }}>
                    <div className="kpi-label">Current (Due Later)</div>
                    <div className="kpi-value" style={{ color: '#16a34a' }}>
                      {curr} {bucket.current?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #eab308' }}>
                    <div className="kpi-label">1 - 30 Days Overdue</div>
                    <div className="kpi-value" style={{ color: '#ca8a04' }}>
                      {curr} {bucket['1-30']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #f97316' }}>
                    <div className="kpi-label">31 - 60 Days Overdue</div>
                    <div className="kpi-value" style={{ color: '#ea580c' }}>
                      {curr} {bucket['31-60']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="kpi-label">61 - 90 Days Overdue</div>
                    <div className="kpi-value" style={{ color: '#dc2626' }}>
                      {curr} {bucket['61-90']?.toFixed(2)}
                    </div>
                  </div>

                  <div className="kpi-card" style={{ borderLeft: '4px solid #991b1b' }}>
                    <div className="kpi-label">90+ Days (Critical)</div>
                    <div className="kpi-value" style={{ color: '#991b1b' }}>
                      {curr} {bucket['90+']?.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Supplier Aging Breakdown Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-100)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
                Supplier-Wise Payables Breakdown
              </h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Supplier / Carrier</th>
                    <th>Currency</th>
                    <th style={{ textAlign: 'right' }}>Current</th>
                    <th style={{ textAlign: 'right' }}>1 - 30 Days</th>
                    <th style={{ textAlign: 'right' }}>31 - 60 Days</th>
                    <th style={{ textAlign: 'right' }}>61 - 90 Days</th>
                    <th style={{ textAlign: 'right' }}>90+ Days</th>
                    <th style={{ textAlign: 'right' }}>Total Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.supplierBreakdown?.map((sup) => {
                    const isExpanded = expandedSupplier === sup.supplierId;
                    return (
                      <React.Fragment key={sup.supplierId}>
                        <tr
                          style={{ cursor: 'pointer', background: isExpanded ? 'var(--slate-50)' : 'transparent' }}
                          onClick={() => toggleSupplier(sup.supplierId)}
                        >
                          <td style={{ textAlign: 'center' }}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </td>
                          <td style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                            {sup.supplierName}
                          </td>
                          <td>{sup.currency}</td>
                          <td style={{ textAlign: 'right', color: '#16a34a' }}>
                            {sup.current > 0 ? sup.current.toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ca8a04' }}>
                            {sup['1-30'] > 0 ? sup['1-30'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#ea580c' }}>
                            {sup['31-60'] > 0 ? sup['31-60'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: '#dc2626' }}>
                            {sup['61-90'] > 0 ? sup['61-90'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>
                            {sup['90+'] > 0 ? sup['90+'].toFixed(2) : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                            {sup.currency} {sup.totalOutstanding.toFixed(2)}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan="9" style={{ padding: '1rem 2rem', background: 'var(--slate-50)' }}>
                              <div style={{ marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                                Unpaid Bills for {sup.supplierName}
                              </div>
                              <table className="data-table" style={{ fontSize: '0.82rem', background: '#fff' }}>
                                <thead>
                                  <tr>
                                    <th>Bill #</th>
                                    <th>Vendor Bill #</th>
                                    <th>Bill Date</th>
                                    <th>Due Date</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                    <th style={{ textAlign: 'right' }}>Paid</th>
                                    <th style={{ textAlign: 'right' }}>Balance Due</th>
                                    <th style={{ textAlign: 'center' }}>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {sup.bills.map((b) => (
                                    <tr key={b._id}>
                                      <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{b.billNumber}</td>
                                      <td>{b.vendorBillNumber || '—'}</td>
                                      <td>{new Date(b.billDate).toLocaleDateString()}</td>
                                      <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                                      <td style={{ textAlign: 'right' }}>{b.currency} {b.totalAmount?.toFixed(2)}</td>
                                      <td style={{ textAlign: 'right', color: 'var(--teal-600)' }}>{b.currency} {b.paidAmount?.toFixed(2)}</td>
                                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#d97706' }}>
                                        {b.currency} {b.balanceAmount?.toFixed(2)}
                                      </td>
                                      <td style={{ textAlign: 'center' }}>
                                        <span className={`badge ${b.bucket === 'current' ? 'badge-success' : 'badge-danger'}`}>
                                          {b.bucket === 'current' ? 'Current' : `${b.bucket} Days`}
                                        </span>
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
