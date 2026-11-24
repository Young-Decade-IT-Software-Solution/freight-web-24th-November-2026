import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
  Search,
  AlertCircle,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function MyQuotations() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type: 'accept' | 'reject', quote: obj }
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get('/quotations');
      if (res.data?.success) {
        setQuotations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!actionModal?.quote) return;
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await portalApi.post(`/quotations/${actionModal.quote._id}/accept`);
      setMsg({ type: 'success', text: res.data?.message || 'Quotation accepted successfully!' });
      setActionModal(null);
      loadQuotations();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to accept quotation' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal?.quote) return;
    if (!rejectReason.trim()) {
      setMsg({ type: 'error', text: 'Please provide a reason for declining the quotation.' });
      return;
    }
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await portalApi.post(`/quotations/${actionModal.quote._id}/reject`, {
        rejectionReason: rejectReason,
      });
      setMsg({ type: 'success', text: res.data?.message || 'Quotation marked as declined.' });
      setActionModal(null);
      setRejectReason('');
      loadQuotations();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reject quotation' });
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = quotations.filter((q) => {
    const matchesFilter = filterStatus === 'ALL' || q.status === filterStatus;
    const matchesSearch =
      !search ||
      q.quotationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      q.origin?.toLowerCase().includes(search.toLowerCase()) ||
      q.destination?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' };
      case 'Sent':
        return { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' };
      case 'Rejected':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
            My Quotations
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Review, download official PDFs, and accept or decline freight quotation offers
          </p>
        </div>
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

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1rem 1.25rem',
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
          {['ALL', 'Sent', 'Accepted', 'Rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 6,
                border: '1px solid',
                borderColor: filterStatus === st ? '#0284C7' : '#CBD5E1',
                backgroundColor: filterStatus === st ? '#E0F2FE' : '#FFFFFF',
                color: filterStatus === st ? '#0284C7' : '#475569',
                fontSize: '0.825rem',
                fontWeight: filterStatus === st ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#94A3B8' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quote #, origin, destination..."
            style={{
              width: '100%',
              padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              borderRadius: 6,
              border: '1px solid #CBD5E1',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
            Loading quotations...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
            No quotations found matching your criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Quotation #</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Route & Mode</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Cargo Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Validity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => {
                  const badge = getStatusBadge(q.status);
                  const isExpired = q.validityDate && new Date(q.validityDate) < new Date();
                  const canAct = q.status === 'Sent' && !isExpired;

                  return (
                    <tr
                      key={q._id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>
                        <Link to={`/portal/quotations/${q._id}`} style={{ color: '#0284C7', textDecoration: 'none' }}>
                          {q.quotationNumber}
                        </Link>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                        <div style={{ fontWeight: 500 }}>
                          {q.origin} → {q.destination}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{q.freightType}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#475569', fontSize: '0.8rem' }}>
                        <div>{q.cargoDescription || 'General Cargo'}</div>
                        <div style={{ color: '#64748B' }}>
                          {q.grossWeight || 0} kg • {q.volumeCbm || 0} CBM
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0F172A' }}>
                        {(q.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {q.currency}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: isExpired ? '#DC2626' : '#64748B' }}>
                        {q.validityDate ? new Date(q.validityDate).toLocaleDateString() : '30 Days'}
                        {isExpired && <span style={{ display: 'block', fontWeight: 600 }}>Expired</span>}
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
                          {q.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <a
                            href={`/api/portal/quotations/${q._id}/pdf`}
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
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </a>

                          {canAct && (
                            <>
                              <button
                                type="button"
                                onClick={() => setActionModal({ type: 'accept', quote: q })}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 6,
                                  border: 'none',
                                  backgroundColor: '#16A34A',
                                  color: '#FFFFFF',
                                  fontSize: '0.775rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => setActionModal({ type: 'reject', quote: q })}
                                style={{
                                  padding: '0.4rem 0.75rem',
                                  borderRadius: 6,
                                  border: '1px solid #EF4444',
                                  backgroundColor: '#FFFFFF',
                                  color: '#DC2626',
                                  fontSize: '0.775rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Decline
                              </button>
                            </>
                          )}

                          <Link
                            to={`/portal/quotations/${q._id}`}
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
                            Details
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

      {/* Accept Confirmation Modal */}
      {actionModal?.type === 'accept' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: 460, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Confirm Quotation Acceptance
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
              You are officially accepting Quotation <strong>{actionModal.quote.quotationNumber}</strong> for amount{' '}
              <strong>
                {actionModal.quote.totalAmount?.toLocaleString()} {actionModal.quote.currency}
              </strong>
              . Our operations team will proceed with booking confirmation.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                style={{ padding: '0.55rem 1rem', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleAccept}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'Accepting...' : 'Yes, Accept Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {actionModal?.type === 'reject' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: 460, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Decline Quotation Offer
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
              Please let our freight team know why this quote did not meet your requirements:
            </p>

            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Rate higher than expected, transit time unsuitable, shipment delayed..."
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                style={{ padding: '0.55rem 1rem', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'Declining...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
