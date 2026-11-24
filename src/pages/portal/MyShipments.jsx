import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ship,
  Navigation,
  CheckCircle2,
  Clock,
  ArrowRight,
  Search,
  Filter,
  MapPin,
  Package,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function MyShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get('/shipments');
      if (res.data?.success) {
        setShipments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      s.shipmentNumber?.toLowerCase().includes(q) ||
      s.customerReference?.toLowerCase().includes(q) ||
      s.origin?.toLowerCase().includes(q) ||
      s.destination?.toLowerCase().includes(q) ||
      s.shipper?.toLowerCase().includes(q) ||
      s.consignee?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
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
      case 'On Hold':
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
            My Shipments & Live Tracking
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Real-time multi-modal logistics tracking across air, sea, road and rail consignments
          </p>
        </div>
      </div>

      {/* Filter & Search */}
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
          {['ALL', 'In Transit', 'Booked', 'Customs Clearance', 'Delivered'].map((st) => (
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
              {st === 'ALL' ? 'All Shipments' : st}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#94A3B8' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipment #, ref, shipper, destination..."
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

      {/* Shipments List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading shipments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', color: '#94A3B8', borderRadius: 12, border: '1px solid #E2E8F0' }}>
          No shipments found matching your search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((s) => {
            const badge = getStatusBadge(s.status);
            return (
              <div
                key={s._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.25rem',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {/* Left: ID & Route */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 280 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                      {s.shipmentNumber}
                    </span>
                    {s.customerReference && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#F1F5F9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: 4, fontWeight: 500 }}>
                        Ref: {s.customerReference}
                      </span>
                    )}
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
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155', fontWeight: 600 }}>
                    <span>{s.origin}</span>
                    <span style={{ color: '#94A3B8' }}>→</span>
                    <span>{s.destination}</span>
                    <span style={{ fontSize: '0.8rem', color: '#0284C7', fontWeight: 500 }}>({s.freightType})</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Cargo: {s.cargoDescription || 'General Cargo'} • {s.weight || 0} kg • {s.volume || 0} CBM • {s.packages || 1} pkgs
                  </div>
                </div>

                {/* Center: Shipper & Consignee */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.825rem', color: '#475569', minWidth: 200 }}>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Shipper:</span> <strong>{s.shipper || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Consignee:</span> <strong>{s.consignee || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#94A3B8' }}>Booking Date:</span> {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Right: Action */}
                <div>
                  <Link
                    to={`/portal/shipments/${s._id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.25rem',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      borderRadius: 8,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Track Progress <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
