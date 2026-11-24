import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Ship,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FolderOpen,
  MapPin,
  Package,
  Calendar,
  Building,
  AlertCircle,
  FileText,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function PortalShipmentDetail() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShipment();
  }, [id]);

  const loadShipment = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get(`/shipments/${id}`);
      if (res.data?.success) {
        setShipment(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading shipment tracking data...</div>;
  }

  if (error || !shipment) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#DC2626' }}>{error || 'Shipment not found'}</p>
        <Link to="/portal/shipments" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Shipments
        </Link>
      </div>
    );
  }

  const milestones = shipment.milestones || [];
  const documents = shipment.documents || [];

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
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const badge = getStatusColor(shipment.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back button */}
      <div>
        <Link
          to="/portal/shipments"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} /> Back to My Shipments
        </Link>
      </div>

      {/* Shipment Header Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {shipment.shipmentNumber}
              </h1>
              {shipment.customerReference && (
                <span style={{ fontSize: '0.8rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: 4, fontWeight: 600 }}>
                  Customer Ref: {shipment.customerReference}
                </span>
              )}
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: 14,
                  backgroundColor: badge.bg,
                  color: badge.text,
                  border: `1px solid ${badge.border}`,
                }}
              >
                {shipment.status}
              </span>
            </div>

            <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Booked with {shipment.branch?.name || 'Main Hub'} • Booking Date: {new Date(shipment.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Freight Mode</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284C7' }}>{shipment.freightType}</div>
          </div>
        </div>

        {/* Route Visualizer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 0', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284C7' }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Origin</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{shipment.origin}</div>
              {shipment.originPort && <div style={{ fontSize: '0.775rem', color: '#64748B' }}>Port: {shipment.originPort}</div>}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 150, borderBottom: '2px dashed #CBD5E1', margin: '0 1rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', padding: '0 0.5rem', color: '#0284C7' }}>
              <Ship size={20} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <MapPin size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748B', fontWeight: 600 }}>Destination</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>{shipment.destination}</div>
              {shipment.destinationPort && <div style={{ fontSize: '0.775rem', color: '#64748B' }}>Port: {shipment.destinationPort}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Tracking Progress Timeline */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1.5rem 0' }}>
          Milestone Progression & Timeline
        </h2>

        {milestones.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>
            No milestone updates logged yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {milestones.map((m, idx) => {
              const isCompleted = m.status === 'Completed';
              return (
                <div
                  key={m._id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    position: 'relative',
                  }}
                >
                  {/* Left Icon */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? '#DCFCE7' : '#F1F5F9',
                      color: isCompleted ? '#16A34A' : '#94A3B8',
                      border: `2px solid ${isCompleted ? '#16A34A' : '#CBD5E1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : <Clock size={16} />}
                  </div>

                  {/* Text details */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: isCompleted ? '#F8FAFC' : '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '0.85rem 1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: isCompleted ? '#0F172A' : '#64748B', fontSize: '0.9rem' }}>
                        {m.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 10,
                          backgroundColor: isCompleted ? '#DCFCE7' : '#FEF3C7',
                          color: isCompleted ? '#16A34A' : '#D97706',
                        }}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
                      {m.completedDate ? `Completed: ${new Date(m.completedDate).toLocaleString()}` : 'Awaiting operational completion'}
                    </div>

                    {m.remarks && (
                      <div style={{ fontSize: '0.8rem', color: '#334155', marginTop: '0.4rem', fontStyle: 'italic' }}>
                        Note: {m.remarks}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cargo Specs & Operational Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Cargo specs */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
            Cargo & Commercial Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#64748B' }}>Cargo Description:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.cargoDescription || 'General Cargo'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#64748B' }}>Gross Weight:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.weight || 0} kg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#64748B' }}>Total Volume:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.volume || 0} CBM</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#64748B' }}>Packages:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.packages || 1} units</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
              <span style={{ color: '#64748B' }}>Shipper:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.shipper || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Consignee:</span>
              <span style={{ fontWeight: 600, color: '#0F172A' }}>{shipment.consignee || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Customer-visible documents */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 1rem 0' }}>
            Attached Shipping Documents
          </h3>
          {documents.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
              No customer documents released for this consignment yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FolderOpen size={18} color="#0284C7" />
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {doc.category} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>

                  <a
                    href={`/api/portal/documents/${doc._id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
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
                    <Download size={13} /> Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
