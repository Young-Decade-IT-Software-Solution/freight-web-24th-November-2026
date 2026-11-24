import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import portalApi from '../../services/portalApi';
import { usePortalAuth } from '../../context/PortalAuthContext';

export default function MyInvoices() {
  const { portalCustomer } = usePortalAuth();
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'receipts'
  const [invoices, setInvoices] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invRes, recRes] = await Promise.all([
        portalApi.get('/invoices'),
        portalApi.get('/receipts'),
      ]);
      if (invRes.data?.success) setInvoices(invRes.data.data);
      if (recRes.data?.success) setReceipts(recRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber?.toLowerCase().includes(q) ||
      inv.shipment?.shipmentNumber?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
      case 'Issued':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'Partially Paid':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'Overdue':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
            Invoices & Statements
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Commercial invoice statements, tax invoices, and official payment receipts
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>
            Total Invoiced
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })} {portalCustomer?.currency || 'USD'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            {invoices.length} commercial invoices issued
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>
            Total Paid & Settled
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16A34A' }}>
            {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} {portalCustomer?.currency || 'USD'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Confirmed credits and remittances
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B', marginBottom: '0.4rem' }}>
            Current Balance Due
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: totalBalance > 0 ? '#DC2626' : '#16A34A' }}>
            {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {portalCustomer?.currency || 'USD'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Outstanding net payable balance
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #CBD5E1', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'invoices' ? '2px solid #0284C7' : '2px solid transparent',
            color: activeTab === 'invoices' ? '#0284C7' : '#64748B',
            fontWeight: activeTab === 'invoices' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Invoices ({invoices.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('receipts')}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'receipts' ? '2px solid #0284C7' : '2px solid transparent',
            color: activeTab === 'receipts' ? '#0284C7' : '#64748B',
            fontWeight: activeTab === 'receipts' ? 700 : 500,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Payment Receipts ({receipts.length})
        </button>
      </div>

      {activeTab === 'invoices' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Invoices Filter */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'Issued', 'Partially Paid', 'Paid', 'Overdue'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: filterStatus === st ? '#0284C7' : '#CBD5E1',
                    backgroundColor: filterStatus === st ? '#E0F2FE' : '#FFFFFF',
                    color: filterStatus === st ? '#0284C7' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: filterStatus === st ? 600 : 500,
                    cursor: 'pointer',
                  }}
                >
                  {st === 'ALL' ? 'All Invoices' : st}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: 260 }}>
              <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#94A3B8' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice # or shipment #..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Invoices Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading invoices...</div>
            ) : filteredInvoices.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                No invoices found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '0.85rem 1.25rem' }}>Invoice #</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Issue Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Shipment</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Balance Due</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => {
                      const badge = getStatusBadge(inv.status);
                      return (
                        <tr
                          key={inv._id}
                          style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>
                            <Link to={`/portal/invoices/${inv._id}`} style={{ color: '#0284C7', textDecoration: 'none' }}>
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                            {new Date(inv.invoiceDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: inv.status === 'Overdue' ? '#DC2626' : '#475569', fontWeight: inv.status === 'Overdue' ? 600 : 400 }}>
                            {new Date(inv.dueDate).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                            {inv.shipment?.shipmentNumber ? (
                              <span style={{ fontWeight: 500 }}>{inv.shipment.shipmentNumber}</span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0F172A' }}>
                            {(inv.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: inv.balanceAmount > 0 ? '#DC2626' : '#16A34A' }}>
                            {(inv.balanceAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              style={{
                                fontSize: '0.725rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.55rem',
                                borderRadius: 12,
                                backgroundColor: badge.bg,
                                color: badge.text,
                                border: `1px solid ${badge.border}`,
                              }}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <a
                                href={`/api/portal/invoices/${inv._id}/pdf`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  padding: '0.4rem',
                                  borderRadius: 6,
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: '#FFFFFF',
                                  color: '#475569',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                                title="Download Invoice PDF"
                              >
                                <Download size={14} />
                              </a>
                              <Link
                                to={`/portal/invoices/${inv._id}`}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 6,
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: '#FFFFFF',
                                  color: '#0F172A',
                                  fontSize: '0.775rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                }}
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Receipts Table */
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {receipts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
              No payment receipts recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Receipt #</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Receipt Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Method</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Transaction Ref</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount Received</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((rec) => (
                    <tr key={rec._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0F172A' }}>
                        {rec.receiptNumber}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                        {new Date(rec.receiptDate).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                        {rec.paymentMethod}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>
                        {rec.referenceNumber || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#16A34A' }}>
                        {(rec.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {rec.currency}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.55rem',
                            borderRadius: 12,
                            backgroundColor: '#DCFCE7',
                            color: '#16A34A',
                            border: '1px solid #BBF7D0',
                          }}
                        >
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
