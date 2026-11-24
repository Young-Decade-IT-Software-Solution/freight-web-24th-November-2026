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
  Truck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SupplierLedger() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSupplierId = searchParams.get('supplierId') || '';

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSupplierId);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currency, setCurrency] = useState('');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await api.get('/suppliers');
        const list = res.data.data || [];
        setSuppliers(list);
        if (!selectedSupplierId && list.length > 0) {
          setSelectedSupplierId(list[0]._id);
        }
      } catch (err) {
        console.error('Failed to load suppliers', err);
      }
    };
    fetchSuppliers();
  }, []);

  const fetchLedger = async () => {
    if (!selectedSupplierId) return;
    try {
      setLoading(true);
      setError('');
      let url = `/reports/supplier-ledger?supplierId=${selectedSupplierId}&`;
      if (startDate) url += `startDate=${startDate}&`;
      if (endDate) url += `endDate=${endDate}&`;
      if (currency) url += `currency=${currency}&`;

      const res = await api.get(url);
      setReport(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate supplier ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSupplierId) {
      fetchLedger();
    }
  }, [selectedSupplierId, startDate, endDate, currency]);

  const handleExportCsv = () => {
    if (!report || !report.data || report.data.length === 0) return;

    let csvContent = 'Date,Type,Reference Number,Description,Debit (Paid),Credit (Billed),Running Payable Balance\n';
    csvContent += `Period Start,Opening Balance,-,Opening Balance,0,0,${report.summary.openingBalance}\n`;

    report.data.forEach((row) => {
      const cleanDesc = `"${(row.description || '').replace(/"/g, '""')}"`;
      csvContent += `${new Date(row.date).toLocaleDateString()},${row.transactionType},${row.referenceNumber},${cleanDesc},${row.debit},${row.credit},${row.runningBalance}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Supplier_Ledger_${report.supplier.companyName.replace(/\s+/g, '_')}.csv`);
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
            Supplier Statement & Ledger
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Detailed account statement of vendor bills (credits), payments (debits), and net outstanding payables
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
            <label className="form-label">Select Supplier *</label>
            <select
              className="input-select"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
            >
              <option value="">Select a supplier...</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.companyName} ({s.supplierCode})
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
              <div className="kpi-label">Opening Payable</div>
              <div className="kpi-value" style={{ color: 'var(--navy-900)' }}>
                ${report.summary.openingBalance?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Before period start</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Bills (Credits)</div>
              <div className="kpi-value" style={{ color: '#d97706' }}>
                ${report.summary.totalBilled?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Vendor charges incurred</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Total Paid (Debits)</div>
              <div className="kpi-value" style={{ color: 'var(--teal-600)' }}>
                ${report.summary.totalPaid?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Disbursements cleared</div>
            </div>

            <div className="kpi-card">
              <div className="kpi-label">Closing Payable Balance</div>
              <div className="kpi-value" style={{ color: report.summary.closingBalance > 0 ? '#d97706' : 'var(--teal-600)' }}>
                ${report.summary.closingBalance?.toFixed(2)}
              </div>
              <div className="kpi-subtext">Net outstanding payable</div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--navy-900)', margin: 0 }}>
                  Statement for {report.supplier.companyName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Vendor Code: {report.supplier.supplierCode} • Contact: {report.supplier.contactPerson} • {report.supplier.email}
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
                    <th style={{ textAlign: 'right' }}>Debit (Paid)</th>
                    <th style={{ textAlign: 'right' }}>Credit (Billed)</th>
                    <th style={{ textAlign: 'right' }}>Running Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: 'var(--slate-50)', fontWeight: 600 }}>
                    <td>{startDate ? new Date(startDate).toLocaleDateString() : 'Beginning'}</td>
                    <td>Opening Balance</td>
                    <td>—</td>
                    <td>Balance brought forward</td>
                    <td style={{ textAlign: 'right' }}>—</td>
                    <td style={{ textAlign: 'right' }}>—</td>
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
                          <span className={`badge ${row.transactionType === 'Supplier Bill' ? 'badge-info' : 'badge-success'}`}>
                            {row.transactionType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.referenceNumber}</td>
                        <td style={{ fontSize: '0.85rem' }}>{row.description}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.debit > 0 ? 'var(--teal-600)' : 'var(--slate-400)' }}>
                          {row.debit > 0 ? `${row.currency} ${row.debit.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.credit > 0 ? '#d97706' : 'var(--slate-400)' }}>
                          {row.credit > 0 ? `${row.currency} ${row.credit.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: row.runningBalance > 0 ? '#d97706' : 'var(--teal-600)' }}>
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
