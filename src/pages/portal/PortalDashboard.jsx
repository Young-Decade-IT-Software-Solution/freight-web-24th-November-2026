import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  Navigation,
  CheckCircle2,
  FileText,
  Receipt,
  Search,
  ArrowRight,
  ExternalLink,
  Clock,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';
import portalApi from '../../services/portalApi';
import { usePortalAuth } from '../../context/PortalAuthContext';

export default function PortalDashboard() {
  const { portalCustomer, portalUser } = usePortalAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get('/dashboard');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const kpis = data?.kpis || {};
  const recentShipments = data?.recentShipments || [];
  const recentQuotations = data?.recentQuotations || [];
  const recentInvoices = data?.recentInvoices || [];

  const filteredShipments = recentShipments.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shipmentNumber?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.customerReference?.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'Delivered':
        return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
      case 'Booked':
      case 'Cargo Received':
        return { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' };
      case 'Customs Clearance':
        return { bg: '#F3E8FF', text: '#9333EA', border: '#E9D5FF' };
      case 'Accepted':
      case 'Paid':
        return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
      case 'Sent':
      case 'Issued':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'Overdue':
      case 'Rejected':
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
        Loading your customer portal dashboard...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome & Search Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: '1.75rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
              Welcome, {portalUser?.name || 'Customer Partner'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
              Live logistics tracking and commercial center for <strong>{portalCustomer?.companyName}</strong> ({portalCustomer?.customerCode})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to="/portal/shipments"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                padding: '0.6rem 1rem',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Ship size={16} /> Track All Shipments
            </Link>
          </div>
        </div>

        {/* Quick Search bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 14, color: '#94A3B8' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search shipment by #, customer reference, origin or destination..."
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.6rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Active Shipments */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B' }}>Active Shipments</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
              <Ship size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A' }}>
            {kpis.activeShipments ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            {kpis.inTransitShipments ?? 0} currently In Transit
          </div>
        </div>

        {/* In-Transit Shipments */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B' }}>In Transit</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
              <Navigation size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0284C7' }}>
            {kpis.inTransitShipments ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Air, Sea & Road shipments on the move
          </div>
        </div>

        {/* Delivered / Completed */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B' }}>Delivered Cargo</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16A34A' }}>
            {kpis.deliveredShipments ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Total shipments successfully completed
          </div>
        </div>

        {/* Open Quotations */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B' }}>Open Quotations</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#D97706' }}>
            {kpis.openQuotations ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            Awaiting your review and approval
          </div>
        </div>

        {/* Invoices Balance */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.25rem', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#64748B' }}>Balance Due</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>
            {(kpis.totalOutstandingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {portalCustomer?.currency || 'USD'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
            {kpis.pendingInvoicesCount ?? 0} pending commercial invoices
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Shipments & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Recent Shipments */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.5rem', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Recent Shipments & Tracking
            </h2>
            <Link to="/portal/shipments" style={{ color: '#0284C7', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all ({kpis.totalShipments || 0}) <ArrowRight size={14} />
            </Link>
          </div>

          {filteredShipments.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
              No active shipments found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredShipments.map((s) => {
                const badge = getStatusColor(s.status);
                return (
                  <div
                    key={s._id}
                    style={{
                      padding: '1rem',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F8FAFC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                          {s.shipmentNumber}
                        </span>
                        {s.customerReference && (
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Ref: {s.customerReference}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '0.15rem 0.5rem',
                            borderRadius: 12,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {s.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#475569' }}>
                        {s.origin} → {s.destination} • <span style={{ color: '#0284C7' }}>{s.freightType}</span>
                      </div>
                    </div>

                    <Link
                      to={`/portal/shipments/${s._id}`}
                      style={{
                        padding: '0.4rem 0.85rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 6,
                        color: '#0F172A',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Track Shipment <ArrowRight size={13} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Open Quotations & Invoices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Open Quotations */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.5rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Open Quotations
              </h2>
              <Link to="/portal/quotations" style={{ color: '#0284C7', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentQuotations.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                No quotations currently pending.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentQuotations.map((q) => {
                  const badge = getStatusColor(q.status);
                  return (
                    <div
                      key={q._id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
                            {q.quotationNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: 10,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {q.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.2rem' }}>
                          {q.origin} → {q.destination} • <strong>{q.totalAmount?.toLocaleString()} {q.currency}</strong>
                        </div>
                      </div>

                      <Link
                        to={`/portal/quotations/${q._id}`}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: q.status === 'Sent' ? '#0284C7' : '#FFFFFF',
                          color: q.status === 'Sent' ? '#FFFFFF' : '#0F172A',
                          border: q.status === 'Sent' ? 'none' : '1px solid #CBD5E1',
                          borderRadius: 6,
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        {q.status === 'Sent' ? 'Review & Accept' : 'View Quote'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending Invoices */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.5rem', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Pending Invoices
              </h2>
              <Link to="/portal/invoices" style={{ color: '#0284C7', fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentInvoices.length === 0 ? (
              <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
                All invoices are fully settled.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentInvoices.map((inv) => {
                  const badge = getStatusColor(inv.status);
                  return (
                    <div
                      key={inv._id}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: 8,
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.875rem' }}>
                            {inv.invoiceNumber}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.15rem 0.45rem',
                              borderRadius: 10,
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                            }}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '0.2rem' }}>
                          Due: {new Date(inv.dueDate).toLocaleDateString()} • Balance:{' '}
                          <strong style={{ color: '#DC2626' }}>
                            {(inv.balanceAmount || inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                          </strong>
                        </div>
                      </div>

                      <Link
                        to={`/portal/invoices/${inv._id}`}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: 6,
                          color: '#0F172A',
                          fontSize: '0.775rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        View Invoice
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
