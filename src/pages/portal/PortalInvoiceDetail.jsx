import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Receipt,
  Download,
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  Ship,
  CreditCard,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function PortalInvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get(`/invoices/${id}`);
      if (res.data?.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invoice not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading invoice statement...</div>;
  }

  if (error || !invoice) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#DC2626' }}>{error || 'Invoice not available'}</p>
        <Link to="/portal/invoices" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Invoices
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
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

  const badge = getStatusColor(invoice.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Back button & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to="/portal/invoices"
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
          <ArrowLeft size={16} /> Back to Invoices & Statements
        </Link>

        <a
          href={`/api/portal/invoices/${invoice._id}/pdf`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.15rem',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            borderRadius: 8,
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <Download size={15} /> Download Official PDF
        </a>
      </div>

      {/* Main Invoice Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#0284C7', fontWeight: 700, letterSpacing: '0.05em' }}>
              COMMERCIAL FREIGHT INVOICE
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0.25rem 0' }}>
              {invoice.invoiceNumber}
            </h1>
            <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
              Issued by {invoice.branch?.name || 'Head Office'} • {invoice.branch?.address || 'Dubai, UAE'}
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
                backgroundColor: badge.bg,
                color: badge.text,
                border: `1px solid ${badge.border}`,
              }}
            >
              {invoice.status}
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748B', marginTop: '0.5rem' }}>
              Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.825rem', color: invoice.status === 'Overdue' ? '#DC2626' : '#64748B', fontWeight: invoice.status === 'Overdue' ? 700 : 400 }}>
              Due Date: {new Date(invoice.dueDate).toLocaleDateString()} ({invoice.paymentTerms || 'Net 30 Days'})
            </div>
          </div>
        </div>

        {/* Billing & Shipment Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid #E2E8F0' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Billed To</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
              {invoice.customerBillingAddress || invoice.customer?.companyName || 'Valued Client'}
            </div>
            {invoice.customerTaxNumber && (
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                Tax / VAT No: {invoice.customerTaxNumber}
              </div>
            )}
          </div>

          {invoice.shipment && (
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Associated Consignment</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0284C7', marginTop: '0.25rem' }}>
                <Link to={`/portal/shipments/${invoice.shipment._id}`} style={{ color: '#0284C7', textDecoration: 'none' }}>
                  {invoice.shipment.shipmentNumber}
                </Link>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                {invoice.shipment.origin} → {invoice.shipment.destination} ({invoice.shipment.freightType})
              </div>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div style={{ marginTop: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Amount ({invoice.currency})</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.lineItems || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#334155' }}>{item.description}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#64748B' }}>{item.quantity}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>
                    {(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                    {(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <div style={{ width: 300, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span>{(invoice.subtotal || invoice.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</span>
              </div>
              {invoice.tax > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                  <span>Tax ({invoice.taxRate || 0}%):</span>
                  <span>{invoice.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#0F172A', paddingTop: '0.4rem', borderTop: '1px solid #E2E8F0' }}>
                <span>Total Invoiced:</span>
                <span>{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                <span>Amount Paid:</span>
                <span>-{(invoice.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 800,
                  fontSize: '1.15rem',
                  color: invoice.balanceAmount > 0 ? '#DC2626' : '#16A34A',
                  paddingTop: '0.5rem',
                  borderTop: '2px solid #CBD5E1',
                }}
              >
                <span>Net Balance Due:</span>
                <span>{(invoice.balanceAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Records */}
        {invoice.paymentHistory && invoice.paymentHistory.length > 0 && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid #E2E8F0', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
              Settlement Records & Receipts Applied
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {invoice.paymentHistory.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.65rem 1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#334155' }}>
                    Receipt <strong>{p.receiptNumber || 'CR-SETTLED'}</strong> on {new Date(p.date).toLocaleDateString()}
                  </span>
                  <span style={{ fontWeight: 700, color: '#16A34A' }}>
                    +{(p.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
