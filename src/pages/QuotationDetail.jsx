import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Mail,
  Copy,
  Ship,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Building,
  User,
  MapPin,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

export default function QuotationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [consignee, setConsignee] = useState('');
  const [convertingShipment, setConvertingShipment] = useState(false);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/quotations/${id}`);
      if (res.data?.success) {
        setQuotation(res.data.data);
        setEmailAddress(res.data.data?.customer?.email || '');
        setConsignee(res.data.data?.contactPerson || res.data.data?.customer?.companyName || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await api.patch(`/quotations/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setSuccess(`Status updated to ${newStatus}`);
        fetchQuotation();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDuplicate = async (isRevision = false) => {
    try {
      const res = await api.post(`/quotations/${id}/duplicate`, { isRevision });
      if (res.data?.success) {
        navigate(`/quotations/${res.data.data._id}`);
      }
    } catch (err) {
      setError('Failed to duplicate quotation');
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/quotations/${id}/send-email`, { email: emailAddress });
      if (res.data?.success) {
        setSuccess(`Quotation sent to ${emailAddress}`);
        setEmailModalOpen(false);
        fetchQuotation();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email dispatch failed');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleConvertToShipment = async () => {
    setConvertingShipment(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post(`/quotations/${id}/convert-to-shipment`, { consignee });
      if (res.data?.success) {
        setSuccess(`Shipment ${res.data.data.shipment.shipmentNumber} generated successfully!`);
        setConvertModalOpen(false);
        fetchQuotation();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert to shipment');
    } finally {
      setConvertingShipment(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>Loading quotation...</div>;
  }

  if (!quotation) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--navy-900)' }}>Quotation Not Found</h3>
        <button type="button" className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/quotations')}>
          <ArrowLeft size={16} /> Back to Quotations
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/quotations')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{quotation.quotationNumber}</span>
              {quotation.revision > 1 && <span className="badge badge-amber">Revision {quotation.revision}</span>}
              <span className={`badge ${quotation.status === 'Accepted' ? 'badge-green' : quotation.status === 'Sent' ? 'badge-blue' : 'badge-slate'}`}>
                {quotation.status}
              </span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Created on {new Date(quotation.createdAt).toLocaleDateString()} • {quotation.branch?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontWeight: 600 }}
            value={quotation.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>

          <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDuplicate(true)} title="Create Next Revision">
            <Copy size={14} />
            <span>Revise</span>
          </button>

          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEmailModalOpen(true)}>
            <Mail size={14} />
            <span>Email</span>
          </button>

          <button type="button" className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={14} />
            <span>Print</span>
          </button>

          <a href={`/api/quotations/${quotation._id}/pdf`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
            <Download size={14} />
            <span>Download PDF</span>
          </a>

          {/* Convert to Shipment Button */}
          {quotation.status === 'Accepted' && !quotation.isConvertedToShipment && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: 'var(--emerald-600)' }}
              onClick={() => setConvertModalOpen(true)}
            >
              <Ship size={15} />
              <span>Convert to Shipment</span>
            </button>
          )}

          {quotation.isConvertedToShipment && (
            <div className="badge badge-teal" style={{ padding: '0.45rem 0.75rem' }}>
              ✓ Converted to Shipment
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid #FECDD3', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
          {success}
        </div>
      )}

      {/* Printable / Preview Card */}
      <div className="card" style={{ padding: '2.5rem', maxWidth: '900px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {/* Header Branding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--slate-100)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--navy-900)' }}>
              Freight<span style={{ color: 'var(--teal-600)' }}>ERP</span> Logistics
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              {quotation.branch?.name} • {quotation.branch?.city}, {quotation.branch?.country}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Email: {quotation.branch?.email} • Tel: {quotation.branch?.phone}
            </div>
          </div>

          <div style={{ textAlign: 'end' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--slate-400)' }}>
              OFFICIAL PROPOSAL
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy-900)' }}>
              {quotation.quotationNumber}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Valid Until: {quotation.validityDate ? new Date(quotation.validityDate).toLocaleDateString() : '30 Days'}
            </div>
          </div>
        </div>

        {/* Bill To & Route Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.75rem' }}>
          <div style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              CUSTOMER / BILL TO
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
              {quotation.customer?.companyName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
              Attn: {quotation.contactPerson || quotation.customer?.contactPerson}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
              {quotation.customer?.email} • {quotation.customer?.phone}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              {quotation.customer?.address}, {quotation.customer?.country}
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--teal-50)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--teal-100)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--teal-700)' }}>
              FREIGHT ROUTE & SPECIFICATIONS
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy-900)', marginTop: '0.25rem' }}>
              {quotation.origin} → {quotation.destination}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>
              Mode: <strong>{quotation.freightType}</strong>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
              Packages: {quotation.packagesCount} | Gross Weight: {quotation.grossWeight} KG | Volume: {quotation.volumeCbm} CBM
            </div>
            {quotation.cargoDescription && (
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                Cargo: {quotation.cargoDescription}
              </div>
            )}
          </div>
        </div>

        {/* Charges Breakdown Table */}
        <div style={{ marginBottom: '1.75rem' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th>Charge Item Description</th>
                <th style={{ textAlign: 'end' }}>Amount ({quotation.currency})</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Base Freight Charges</strong> ({quotation.freightType})
                </td>
                <td style={{ textAlign: 'end', fontWeight: 600 }}>
                  {quotation.currency} {quotation.freightCharges?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
              {quotation.additionalChargeItems && quotation.additionalChargeItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.description}</td>
                  <td style={{ textAlign: 'end' }}>
                    {quotation.currency} {Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {quotation.tax > 0 && (
                <tr>
                  <td>VAT / Taxes</td>
                  <td style={{ textAlign: 'end' }}>
                    {quotation.currency} {quotation.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              {quotation.discount > 0 && (
                <tr>
                  <td style={{ color: 'var(--rose-600)' }}>Commercial Discount</td>
                  <td style={{ textAlign: 'end', color: 'var(--rose-600)' }}>
                    - {quotation.currency} {quotation.discount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              )}
              <tr style={{ backgroundColor: 'var(--slate-50)', borderTop: '2px solid var(--slate-300)' }}>
                <td style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                  Total Agreed Quotation Amount
                </td>
                <td style={{ textAlign: 'end', fontSize: '1.25rem', fontWeight: 700, color: 'var(--teal-600)' }}>
                  {quotation.currency} {quotation.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Terms & Conditions */}
        <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          <strong>Terms & Conditions:</strong>
          <p style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
            {quotation.termsAndConditions}
          </p>
        </div>
      </div>

      {/* Send Email Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Send Quotation via Email"
        maxWidth="480px"
      >
        <form onSubmit={handleSendEmail}>
          <div className="form-group">
            <label className="form-label">Recipient Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '1rem' }}>
            The customer will receive an official email notification with the quotation details and summary.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEmailModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={sendingEmail}>
              {sendingEmail ? 'Sending...' : 'Send Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Convert to Shipment Modal */}
      <Modal
        isOpen={convertModalOpen}
        onClose={() => setConvertModalOpen(false)}
        title="Convert Quotation to Shipment"
        maxWidth="500px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
          This will initiate a real operational shipment record in the system based on accepted quote <strong>{quotation.quotationNumber}</strong>.
          <br /><br />
          All cargo details, route specifications, and agreed price (<strong>{quotation.currency} {quotation.totalAmount}</strong>) will be transferred automatically.
        </p>

        <div className="form-group">
          <label className="form-label">Designated Consignee / Delivery Receiver</label>
          <input
            type="text"
            className="form-input"
            value={consignee}
            onChange={(e) => setConsignee(e.target.value)}
            placeholder="e.g. Warehouse Receiver, Buyer Name"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setConvertModalOpen(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ backgroundColor: 'var(--emerald-600)' }}
            disabled={convertingShipment}
            onClick={handleConvertToShipment}
          >
            <Ship size={16} />
            <span>{convertingShipment ? 'Converting...' : 'Confirm Conversion'}</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}
