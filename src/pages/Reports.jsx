import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Ship,
  FileText,
  DollarSign,
  Download,
  Filter,
  Calendar,
  Building,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ChevronRight,
  Receipt,
  Wallet,
  Landmark,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sales'); // sales, shipments, customers, financial
  const [loading, setLoading] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedFreightMode, setSelectedFreightMode] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Metadata dropdown options
  const [branches, setBranches] = useState([]);

  // Report Datasets
  const [salesSummary, setSalesSummary] = useState(null);
  const [quotationRegister, setQuotationRegister] = useState([]);
  const [customerSales, setCustomerSales] = useState([]);
  const [branchSales, setBranchSales] = useState([]);
  const [freightModeSales, setFreightModeSales] = useState([]);

  const [shipmentSummary, setShipmentSummary] = useState(null);
  const [shipmentRegister, setShipmentRegister] = useState([]);
  const [tradeLanes, setTradeLanes] = useState([]);

  const [customerDirectory, setCustomerDirectory] = useState([]);

  const [invoiceRegister, setInvoiceRegister] = useState([]);
  const [receiptRegister, setReceiptRegister] = useState([]);
  const [expensesSummary, setExpensesSummary] = useState(null);
  const [cashBankSummary, setCashBankSummary] = useState(null);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadReportData();
  }, [activeTab, startDate, endDate, selectedBranch, selectedFreightMode, selectedStatus]);

  const loadBranches = async () => {
    try {
      const res = await api.get('/branches');
      if (res.data?.success) setBranches(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getQueryString = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (selectedBranch !== 'ALL') params.append('branch', selectedBranch);
    if (selectedFreightMode !== 'ALL') params.append('freightMode', selectedFreightMode);
    if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
    return params.toString();
  };

  const loadReportData = async () => {
    setLoading(true);
    const qs = getQueryString();
    try {
      if (activeTab === 'sales') {
        const [sumRes, regRes, custRes, brRes, modeRes] = await Promise.all([
          api.get(`/reports/sales-summary?${qs}`),
          api.get(`/reports/quotations-register?${qs}`),
          api.get(`/reports/sales-by-customer?${qs}`),
          api.get(`/reports/sales-by-branch?${qs}`),
          api.get(`/reports/sales-by-freight-mode?${qs}`),
        ]);
        if (sumRes.data?.success) setSalesSummary(sumRes.data.data);
        if (regRes.data?.success) setQuotationRegister(regRes.data.data);
        if (custRes.data?.success) setCustomerSales(custRes.data.data);
        if (brRes.data?.success) setBranchSales(brRes.data.data);
        if (modeRes.data?.success) setFreightModeSales(modeRes.data.data);
      } else if (activeTab === 'shipments') {
        const [sumRes, regRes, lanesRes] = await Promise.all([
          api.get(`/reports/shipments-summary?${qs}`),
          api.get(`/reports/shipments-register?${qs}`),
          api.get(`/reports/trade-lanes?${qs}`),
        ]);
        if (sumRes.data?.success) setShipmentSummary(sumRes.data.data);
        if (regRes.data?.success) setShipmentRegister(regRes.data.data);
        if (lanesRes.data?.success) setTradeLanes(lanesRes.data.data);
      } else if (activeTab === 'customers') {
        const res = await api.get(`/reports/customers-directory?${qs}`);
        if (res.data?.success) setCustomerDirectory(res.data.data);
      } else if (activeTab === 'financial') {
        const [invRes, recRes, expRes, cbRes] = await Promise.all([
          api.get(`/reports/invoices-register?${qs}`),
          api.get(`/reports/receipts-register?${qs}`),
          api.get(`/reports/expenses-summary?${qs}`),
          api.get(`/reports/cash-bank-summary?${qs}`),
        ]);
        if (invRes.data?.success) setInvoiceRegister(invRes.data.data);
        if (recRes.data?.success) setReceiptRegister(recRes.data.data);
        if (expRes.data?.success) setExpensesSummary(expRes.data.data);
        if (cbRes.data?.success) setCashBankSummary(expRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    let type = 'quotations';
    if (activeTab === 'shipments') type = 'shipments';
    if (activeTab === 'financial') type = 'invoices';
    if (activeTab === 'customers') type = 'customers';

    const qs = getQueryString();
    window.open(`/api/reports/export/csv?reportType=${type}&${qs}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 0.25rem 0' }}>
            Reports & Analytics
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', margin: 0 }}>
            Management visibility across commercial sales, multi-modal freight logistics, and basic accounting
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={handleExportCsv}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={15} /> Print Report
          </button>
        </div>
      </div>

      {/* Universal Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <label className="label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label className="label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          />
        </div>

        {user?.role === 'Super Admin' && (
          <div>
            <label className="label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="input-field"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Branches (Global)</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Freight Mode</label>
          <select
            value={selectedFreightMode}
            onChange={(e) => setSelectedFreightMode(e.target.value)}
            className="input-field"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Freight Modes</option>
            <option value="Sea Freight FCL">Sea Freight FCL</option>
            <option value="Sea Freight LCL">Sea Freight LCL</option>
            <option value="Air Freight">Air Freight</option>
            <option value="Road Freight">Road Freight</option>
            <option value="Rail Freight">Rail Freight</option>
            <option value="Multimodal Freight">Multimodal Freight</option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSelectedBranch('ALL');
              setSelectedFreightMode('ALL');
              setSelectedStatus('ALL');
            }}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.825rem', padding: '0.5rem' }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Report Categories Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.25rem' }}>
        {[
          { key: 'sales', label: 'Commercial & Sales Reports', icon: BarChart3 },
          { key: 'shipments', label: 'Shipment Operations Reports', icon: Ship },
          { key: 'customers', label: 'Customer Directory & Analytics', icon: User },
          { key: 'financial', label: 'Financial Statements & Registers', icon: DollarSign },
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
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--teal-600)' : '2px solid transparent',
                color: isActive ? 'var(--teal-700)' : 'var(--slate-500)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 1. COMMERCIAL SALES */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Quotation Pipeline Value</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.3rem' }}>
                ${(salesSummary?.kpis?.totalQuoteValue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                {salesSummary?.kpis?.totalQuotations || 0} quotations drafted
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Accepted Quote Value</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '0.3rem' }}>
                ${(salesSummary?.kpis?.acceptedValue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>
                {salesSummary?.kpis?.acceptedCount || 0} officially accepted
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Quotation Conversion Rate</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7', marginTop: '0.3rem' }}>
                {salesSummary?.kpis?.conversionRate || 0}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
                Accepted vs Total Quotations
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Invoiced Commercial Revenue</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.3rem' }}>
                ${(salesSummary?.kpis?.invoicedRevenue || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>
                ${(salesSummary?.kpis?.collectedRevenue || 0).toLocaleString()} collected cash
              </div>
            </div>
          </div>

          {/* Customer & Branch Sales Breakdown Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.5rem' }}>
            {/* Customer-wise sales */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
                Customer-wise Sales Breakdown
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 360 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th style={{ textAlign: 'center' }}>Quotes</th>
                      <th style={{ textAlign: 'right' }}>Total Quoted</th>
                      <th style={{ textAlign: 'right' }}>Accepted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerSales.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <strong>{c.customerName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{c.customerCode}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{c.quotationCount}</td>
                        <td style={{ textAlign: 'right' }}>{c.totalQuoteValue.toLocaleString()} {c.currency}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>
                          {c.acceptedValue.toLocaleString()} {c.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Branch-wise sales */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
                Branch-wise Sales Performance
              </div>
              <div style={{ overflowX: 'auto', maxHeight: 360 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th style={{ textAlign: 'center' }}>Quotes</th>
                      <th style={{ textAlign: 'right' }}>Total Value</th>
                      <th style={{ textAlign: 'right' }}>Accepted Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branchSales.map((b, i) => (
                      <tr key={i}>
                        <td>
                          <strong>{b.branchName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{b.branchCode}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>{b.quotationCount}</td>
                        <td style={{ textAlign: 'right' }}>{b.totalQuoteValue.toLocaleString()} {b.currency}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#16A34A' }}>
                          {b.acceptedValue.toLocaleString()} {b.currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quotation Register Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
              Quotation Register
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Quote #</th>
                    <th>Customer</th>
                    <th>Route</th>
                    <th>Mode</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationRegister.slice(0, 15).map((q) => (
                    <tr key={q._id}>
                      <td><strong>{q.quotationNumber}</strong></td>
                      <td>{q.customer?.companyName || '—'}</td>
                      <td>{q.origin} → {q.destination}</td>
                      <td>{q.freightType}</td>
                      <td style={{ fontWeight: 600 }}>{q.totalAmount.toLocaleString()} {q.currency}</td>
                      <td>
                        <span className={`badge ${q.status === 'Accepted' ? 'badge-success' : q.status === 'Sent' ? 'badge-info' : 'badge-warning'}`}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {new Date(q.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. SHIPMENT OPERATIONS */}
      {activeTab === 'shipments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shipment KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Total Consignments</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '0.3rem' }}>
                {shipmentSummary?.kpis?.totalShipments || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>Booked shipments</div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Active in Operations</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284C7', marginTop: '0.3rem' }}>
                {shipmentSummary?.kpis?.activeShipments || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0284C7', marginTop: '0.25rem' }}>
                {shipmentSummary?.kpis?.inTransitShipments || 0} currently In Transit
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>Delivered & Completed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A', marginTop: '0.3rem' }}>
                {shipmentSummary?.kpis?.deliveredShipments || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.25rem' }}>POD confirmed</div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}>On Hold / Delayed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '0.3rem' }}>
                {shipmentSummary?.kpis?.delayedShipments || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem' }}>Requires attention</div>
            </div>
          </div>

          {/* Trade Lanes Analysis */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
              Top Operational Trade Lanes (Origin → Destination)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trade Corridor</th>
                    <th>Total Shipments</th>
                    <th>Cumulative Gross Weight</th>
                    <th>Cumulative Volume</th>
                    <th>Freight Modes Used</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeLanes.map((lane, idx) => (
                    <tr key={idx}>
                      <td><strong>{lane.lane}</strong></td>
                      <td>{lane.shipmentCount} consignments</td>
                      <td>{(lane.totalWeight || 0).toLocaleString()} kg</td>
                      <td>{(lane.totalVolume || 0).toLocaleString()} CBM</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                          {lane.freightModes?.join(', ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipment Register */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
              Shipment Register
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Shipment #</th>
                    <th>Customer</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Freight Mode</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {shipmentRegister.slice(0, 15).map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.shipmentNumber}</strong></td>
                      <td>{s.customer?.companyName || '—'}</td>
                      <td>{s.origin}</td>
                      <td>{s.destination}</td>
                      <td>{s.freightType}</td>
                      <td>
                        <span className={`badge ${s.status === 'Delivered' ? 'badge-success' : s.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. CUSTOMER DIRECTORY */}
      {activeTab === 'customers' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
            Customer Master Directory Report
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Code</th>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Country</th>
                  <th>Branch</th>
                  <th>Total Shipments</th>
                  <th>Total Invoiced</th>
                  <th>Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {customerDirectory.map((c) => (
                  <tr key={c._id}>
                    <td><code>{c.customerCode}</code></td>
                    <td><strong>{c.companyName}</strong></td>
                    <td>{c.contactPerson}</td>
                    <td>{c.country}</td>
                    <td>{c.branch}</td>
                    <td>{c.totalShipments}</td>
                    <td>{(c.totalInvoiced || 0).toLocaleString()} {c.currency}</td>
                    <td style={{ fontWeight: 700, color: c.outstandingBalance > 0 ? '#DC2626' : '#16A34A' }}>
                      {(c.outstandingBalance || 0).toLocaleString()} {c.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. FINANCIAL STATEMENTS */}
      {activeTab === 'financial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick links to Phase 4 detailed ledgers */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="/customer-ledger" className="btn btn-outline btn-sm">Customer Ledger →</a>
            <a href="/supplier-ledger" className="btn btn-outline btn-sm">Supplier Ledger →</a>
            <a href="/accounts-receivable" className="btn btn-outline btn-sm">AR Aging Statement →</a>
            <a href="/accounts-payable" className="btn btn-outline btn-sm">AP Aging Statement →</a>
            <a href="/profit-loss" className="btn btn-outline btn-sm">Profit & Loss Report →</a>
          </div>

          {/* Invoice Register */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--slate-200)', fontWeight: 700 }}>
              Commercial Invoice Register
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Invoice Date</th>
                    <th>Due Date</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRegister.slice(0, 15).map((inv) => (
                    <tr key={inv._id}>
                      <td><strong>{inv.invoiceNumber}</strong></td>
                      <td>{inv.customer?.companyName || '—'}</td>
                      <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{(inv.totalAmount || 0).toLocaleString()} {inv.currency}</td>
                      <td style={{ color: '#16A34A' }}>{(inv.paidAmount || 0).toLocaleString()} {inv.currency}</td>
                      <td style={{ fontWeight: 700, color: inv.balanceAmount > 0 ? '#DC2626' : '#16A34A' }}>
                        {(inv.balanceAmount || 0).toLocaleString()} {inv.currency}
                      </td>
                      <td>
                        <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : inv.status === 'Issued' ? 'badge-info' : 'badge-warning'}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
