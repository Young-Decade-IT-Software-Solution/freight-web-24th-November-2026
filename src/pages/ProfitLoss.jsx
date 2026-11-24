import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PieChart,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfitLoss() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPnL = async () => {
    try {
      setLoading(true);
      setError('');
      let url = '/reports/profit-loss?';
      if (branchFilter) url += `branch=${branchFilter}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load Profit & Loss statement');
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
    fetchPnL();
  }, [branchFilter, startDate, endDate]);

  const summary = data?.summary || {};
  const currencies = Object.keys(summary);
  const overheadCategories = data?.details?.overheadByCategory || {};

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PieChart className="text-teal" size={26} />
            Profit & Loss (P&L) Statement
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Executive statement: Operating Revenue, Shipment Direct Costs, Gross Profit, and Net Earnings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchPnL}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {isSuperAdmin && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Branch Scoping</label>
              <select
                className="input-select"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">All Branches (Consolidated)</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Period Start Date</label>
            <input
              type="date"
              className="input-text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Period End Date</label>
            <input
              type="date"
              className="input-text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
          Calculating financial statement...
        </div>
      ) : currencies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--slate-400)' }}>
          <p style={{ margin: 0, fontWeight: 500 }}>No revenue or expense activity recorded for the selected period</p>
        </div>
      ) : (
        currencies.map((curr) => {
          const item = summary[curr];
          const margin = item.revenue > 0 ? ((item.netProfit / item.revenue) * 100).toFixed(1) : 0;
          const isProfitable = item.netProfit >= 0;

          return (
            <div key={curr} style={{ marginBottom: '2.5rem' }}>
              {/* Currency Top Summary Cards */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'var(--navy-900)', margin: 0 }}>
                  Financial Performance: {curr}
                </h2>
                <span className={`badge ${isProfitable ? 'badge-success' : 'badge-danger'}`}>
                  Net Margin: {margin}%
                </span>
              </div>

              <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="kpi-card" style={{ borderLeft: '4px solid var(--navy-900)' }}>
                  <div className="kpi-label">Operating Revenue</div>
                  <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
                    {curr} {item.revenue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-subtext">Issued freight invoices</div>
                </div>

                <div className="kpi-card" style={{ borderLeft: '4px solid #ea580c' }}>
                  <div className="kpi-label">Direct Cargo Costs</div>
                  <div className="kpi-value" style={{ color: '#ea580c' }}>
                    {curr} {item.directCosts?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-subtext">Carrier bills & port expenses</div>
                </div>

                <div className="kpi-card" style={{ borderLeft: '4px solid var(--teal-600)' }}>
                  <div className="kpi-label">Gross Profit</div>
                  <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
                    {curr} {item.grossProfit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-subtext">Revenue less direct costs</div>
                </div>

                <div className="kpi-card" style={{ borderLeft: '4px solid #dc2626' }}>
                  <div className="kpi-label">Operating Overhead</div>
                  <div className="kpi-value" style={{ color: '#dc2626' }}>
                    {curr} {item.operatingExpenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-subtext">Salaries, rent, utilities</div>
                </div>

                <div className="kpi-card" style={{ borderLeft: `4px solid ${isProfitable ? '#16a34a' : '#991b1b'}` }}>
                  <div className="kpi-label">Net Profit / (Loss)</div>
                  <div className="kpi-value" style={{ color: isProfitable ? '#16a34a' : '#991b1b' }}>
                    {curr} {item.netProfit?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="kpi-subtext">{isProfitable ? 'Net operational surplus' : 'Operating deficit'}</div>
                </div>
              </div>

              {/* Detailed Financial Statement Table */}
              <div className="card" style={{ overflow: 'hidden', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '1.25rem', borderBottom: '1px solid var(--slate-100)', paddingBottom: '0.75rem' }}>
                  Statement of Profit & Loss ({curr})
                </h3>

                <table className="data-table" style={{ width: '100%' }}>
                  <tbody>
                    {/* Operating Revenue */}
                    <tr style={{ background: 'var(--slate-50)', fontWeight: 700 }}>
                      <td style={{ color: 'var(--navy-900)' }}>OPERATING REVENUE</td>
                      <td style={{ textAlign: 'right', color: 'var(--navy-900)' }}>
                        {curr} {item.revenue?.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '2rem', color: 'var(--slate-600)' }}>
                        Freight Invoicing & Cargo Billings ({data.details?.invoiceCount} invoices)
                      </td>
                      <td style={{ textAlign: 'right' }}>{curr} {item.revenue?.toFixed(2)}</td>
                    </tr>

                    {/* Direct Costs */}
                    <tr style={{ background: 'var(--slate-50)', fontWeight: 700 }}>
                      <td style={{ color: '#ea580c' }}>LESS: DIRECT SHIPMENT COSTS (COGS)</td>
                      <td style={{ textAlign: 'right', color: '#ea580c' }}>
                        ({curr} {item.directCosts?.toFixed(2)})
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '2rem', color: 'var(--slate-600)' }}>
                        Carrier & Vendor Freight Bills ({data.details?.directBillCount} bills)
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {curr} {(data.details?.directCostsByCurrency?.[curr] || 0).toFixed(2)}
                      </td>
                    </tr>

                    {/* Gross Profit */}
                    <tr style={{ background: 'var(--teal-50)', fontWeight: 800, borderTop: '2px solid var(--teal-200)', borderBottom: '2px solid var(--teal-200)' }}>
                      <td style={{ color: 'var(--teal-700)' }}>GROSS PROFIT</td>
                      <td style={{ textAlign: 'right', color: 'var(--teal-700)', fontSize: '1.05rem' }}>
                        {curr} {item.grossProfit?.toFixed(2)}
                      </td>
                    </tr>

                    {/* Operating Expenses */}
                    <tr style={{ background: 'var(--slate-50)', fontWeight: 700 }}>
                      <td style={{ color: '#dc2626' }}>LESS: OPERATING EXPENSES (OVERHEAD)</td>
                      <td style={{ textAlign: 'right', color: '#dc2626' }}>
                        ({curr} {item.operatingExpenses?.toFixed(2)})
                      </td>
                    </tr>
                    {Object.entries(overheadCategories).map(([catName, catAmount]) => (
                      <tr key={catName}>
                        <td style={{ paddingLeft: '2rem', color: 'var(--slate-600)' }}>{catName}</td>
                        <td style={{ textAlign: 'right' }}>{curr} {Number(catAmount).toFixed(2)}</td>
                      </tr>
                    ))}

                    {/* Net Profit */}
                    <tr style={{ background: isProfitable ? '#f0fdf4' : '#fef2f2', fontWeight: 800, borderTop: '3px solid var(--navy-900)', fontSize: '1.2rem' }}>
                      <td style={{ color: isProfitable ? '#16a34a' : '#991b1b' }}>NET PROFIT / (LOSS)</td>
                      <td style={{ textAlign: 'right', color: isProfitable ? '#16a34a' : '#991b1b' }}>
                        {curr} {item.netProfit?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
