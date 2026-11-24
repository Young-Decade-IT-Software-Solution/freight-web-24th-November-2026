import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  AlertCircle,
  Package,
  Calendar,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function PortalQuotationDetail() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadQuotation();
  }, [id]);

  const loadQuotation = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get(`/quotations/${id}`);
      if (res.data?.success) {
        setQuotation(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Quotation not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setActionLoading(true);
    setActionSuccess('');
    try {
      const res = await portalApi.post(`/quotations/${id}/accept`);
      setActionSuccess(res.data?.message || 'Quotation accepted!');
      loadQuotation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    setActionSuccess('');
    try {
      const res = await portalApi.post(`/quotations/${id}/reject`, { rejectionReason: rejectReason });
      setActionSuccess(res.data?.message || 'Quotation declined.');
      setRejectModalOpen(false);
      loadQuotation();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decline quotation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading quotation details...</div>;
  }

  if (error || !quotation) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#DC2626' }}>{error || 'Quotation not available'}</p>
        <Link to="/portal/quotations" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Quotations
        </Link>
      </div>
    );
  }

  const isExpired = quotation.validityDate && new Date(quotation.validityDate) < new Date();
  const canAct = quotation.status === 'Sent' && !isExpired;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Back link & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/portal/quotations"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to My Quotations
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a
            href={`/api/portal/quotations/${quotation._id}/pdf`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: 8,
              color: '#0F172A',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Download size={15} /> Download PDF
          </a>

          {canAct && (
            <>
              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle2 size={16} /> Accept Quotation
              </button>
              <button
                type="button"
                onClick={() => setRejectModalOpen(true)}
                disabled={actionLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: '#FFFFFF',
                  color: '#DC2626',
                  border: '1px solid #EF4444',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                <XCircle size={16} /> Decline
              </button>
            </>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div style={{ padding: '0.85rem 1rem', borderRadius: 8, backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' }}>
          {actionSuccess}
        </div>
      )}

      {/* Main Quotation Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Header Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#0284C7', fontWeight: 700, letterSpacing: '0.05em' }}>
              OFFICIAL FREIGHT QUOTATION
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0' }}>
              {quotation.quotationNumber}
            </h1>
            <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
              Issued by {quotation.branch?.name || 'Head Office'} • Branch Code: {quotation.branch?.code || 'HQ'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '0.35rem 0.85rem',
                borderRadius: 20,
                fontSize: '0.825rem',
                fontWeight: 700,
                backgroundColor: quotation.status === 'Accepted' ? '#DCFCE7' : quotation.status === 'Sent' ? '#E0F2FE' : '#FEE2E2',
                color: quotation.status === 'Accepted' ? '#16A34A' : quotation.status === 'Sent' ? '#0284C7' : '#DC2626',
              }}
            >
              Status: {quotation.status}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
              Date: {new Date(quotation.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: isExpired ? '#DC2626' : '#64748B' }}>
              Validity: {quotation.validityDate ? new Date(quotation.validityDate).toLocaleDateString() : '30 Days'}
              {isExpired && ' (Expired)'}
            </div>
          </div>
        </div>

        {/* Route & Cargo Specs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', padding: '1.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Origin</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>{quotation.origin}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Destination</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>{quotation.destination}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Freight Mode</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0284C7', marginTop: '0.2rem' }}>{quotation.freightType}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Cargo Specs</div>
            <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.2rem' }}>
              {quotation.grossWeight || 0} kg • {quotation.volumeCbm || 0} CBM • {quotation.packagesCount || 1} Pkgs
            </div>
          </div>
        </div>

        {/* Charges Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
            Agreed Commercial Rate & Charges
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Item / Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount ({quotation.currency})</th>
              </tr>
            </thead>
            <tbody>
              {(quotation.charges || []).map((ch, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{ch.description}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                    {(ch.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span>{(quotation.subtotal || quotation.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}</span>
              </div>
              {quotation.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Tax ({quotation.taxRate || 0}%):</span>
                  <span>{quotation.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: '#0F172A',
                  paddingTop: '0.5rem',
                  borderTop: '2px solid #E2E8F0',
                }}
              >
                <span>Total Quote:</span>
                <span>{quotation.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {quotation.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Status Logs */}
        {quotation.status === 'Accepted' && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: 8, border: '1px solid #BBF7D0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={20} color="#16A34A" />
            <div>
              <div style={{ fontWeight: 600, color: '#166534' }}>Quotation Accepted</div>
              <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                Accepted on {quotation.acceptedAt ? new Date(quotation.acceptedAt).toLocaleString() : 'N/A'}. A dedicated operations specialist is handling your shipment.
              </div>
            </div>
          </div>
        )}

        {quotation.status === 'Rejected' && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <XCircle size={20} color="#DC2626" />
            <div>
              <div style={{ fontWeight: 600, color: '#991B1B' }}>Quotation Declined</div>
              <div style={{ fontSize: '0.8rem', color: '#B91C1C' }}>
                Reason given: "{quotation.rejectionReason || 'Commercial terms'}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {rejectModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ maxWidth: 440, width: '100%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>Decline Quotation</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>Please state the reason for declining this rate offer:</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Price too high, change in transit plan..."
              style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.875rem', boxSizing: 'border-box', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setRejectModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleReject} disabled={actionLoading} style={{ padding: '0.5rem 1.25rem', borderRadius: 6, border: 'none', backgroundColor: '#DC2626', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}>Confirm Decline</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
