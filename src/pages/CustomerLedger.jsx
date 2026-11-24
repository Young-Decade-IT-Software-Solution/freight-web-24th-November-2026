import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertCircle,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CustomerLedger() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCustomerId = searchParams.get('customerId') || '';

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        const list = res.data.data || [];
        setCustomers(list);
        if (!selectedCustomerId && list.length > 0) {
          setSelectedCustomerId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load customers', err);
      }
    };
    fetchCustomers();
  }, []);

  const fetchLedger = async () => {
    if (!selectedCustomerId) return;
    try {
      setLoading(true);
      setError('');
      let url = `/reports/customer-ledger?customerId=${selectedCustomerId}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (currency) url += `currency=${currency}&`;

      const res = await api.get(url);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate customer ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      fetchLedger();
    }
  }, [selectedCustomerId, startDate, endDate, currency]);

  const handleExportCsv = () => {
    if (!report || !report.data || report.data.length === 0) return;

    let csvContent = 'Date,Type,Reference Number,Description,Debit,Credit,Running Balance\n';
    // Add opening balance
    csvContent += `Period Start,Opening Balance,-,Opening Balance,${report.summary.openingBalance >= 0 ? report.summary.openingBalance : 0},${report.summary.openingBalance < 0 ? Math.abs(report.summary.openingBalance) : 0},${report.summary.openingBalance}\n`;

    report.data.forEach((row) => {
      const cleanDesc = `"${(row.description || '').replace(/"/g, '""')}"`;
      csvContent += `${new Date(row.date).toLocaleDateString()},${row.transactionType},${row.referenceNumber},${cleanDesc},${row.debit},${row.credit},${row.runningBalance}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Customer_Ledger_${report.customer.companyName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText className="text-teal" size={26} />
            Customer Statement & Ledger
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Detailed running statement of customer debits (invoices), credits (receipts), and open balance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchLedger}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCsv}
            disabled={!report || report.data?.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select Customer *</label>
            <select
              className="input-select"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Select a customer...</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} ({c.contactPerson})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="input-text"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="input-text"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Currency</label>
            <select
              className="input-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="AED">AED</option>
              <option value="SAR">SAR</option>
              <option value="TRY">TRY</option>
              <option value="CNY">CNY</option>
              <option value="INR">INR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Ledger Report Content */}
      {report && (
        <>
          {/* Summary KPIs */}
          <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="kpi-card">
              <div className="kpi-label">Opening Balance</div>
              <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
                ${report.summary.openingBalance?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Before period start</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Invoiced (Debits)</div>
              <div className="kpi-value" style={{ color: '#d97706' }}>
                ${report.summary.totalDebit?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Billings in period</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Collected (Credits)</div>
              <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
                ${report.summary.totalCredit?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Receipts in period</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Closing Balance</div>
              <div className="kpi-value" style={{ color: report.summary.closingBalance > 0 ? '#d97706' : 'var(--teal-600)' }}>
                ${report.summary.closingBalance?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Net amount receivable</div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
                  Statement for {report.customer.companyName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Attn: {report.customer.contactPerson} • {report.customer.email}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                {report.data?.length} transactions
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference #</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Debit (Invoiced)</th>
                    <th style={{ textAlign: 'right' }}>Credit (Paid)</th>
                    <th style={{ textAlign: 'right' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'var(--slate-50)', fontWeight: 600 }}>
                    <td>{startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'}</td>
                    <td>Opening Balance</td>
                    <td>—</td>
                    <td>Balance brought forward</td>
                    <td style={{ textAlign: 'right' }}>{report.summary.openingBalance > 0 ? report.summary.openingBalance.toFixed(2) : '—'}</td>
                    <td style={{ textAlign: 'right' }}>{report.summary.openingBalance < 0 ? Math.abs(report.summary.openingBalance).toFixed(2) : '—'}</td>
                    <td style={{ textAlign: 'right' }}>{report.summary.openingBalance.toFixed(2)}</td>
                  </tr>

                  {report.data?.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                        No transactions recorded in this date range.
                      </td>
                    </tr>
                  ) : (
                    report.data.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontSize: '0.85rem' }}>{new Date(row.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${row.transactionType === 'Invoice' ? 'badge-info' : row.transactionType === 'Receipt' ? 'badge-success' : 'badge-danger'}`}>
                            {row.transactionType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.referenceNumber}</td>
                        <td style={{ fontSize: '0.85rem' }}>{row.description}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.debit > 0 ? '#d97706' : 'var(--slate-400)' }}>
                          {row.debit > 0 ? `${row.currency} ${row.debit.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.credit > 0 ? 'var(--teal-600)' : 'var(--slate-400)' }}>
                          {row.credit > 0 ? `${row.currency} ${row.credit.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: row.runningBalance > 0 ? 'var(--navy-900)' : 'var(--teal-600)' }}>
                          {row.currency} {row.runningBalance.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
