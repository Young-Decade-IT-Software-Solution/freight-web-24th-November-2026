import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Download,
  Search,
  Filter,
  FileText,
  Ship,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const res = await portalApi.get('/documents');
      if (res.data?.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'ALL',
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading',
    'Air Waybill',
    'Customs Documents',
    'Certificate of Origin',
    'Delivery Order',
    'Other Documents',
  ];

  const filtered = documents.filter((doc) => {
    const matchesCategory = category === 'ALL' || doc.category === category;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      doc.title?.toLowerCase().includes(q) ||
      doc.category?.toLowerCase().includes(q) ||
      doc.shipment?.shipmentNumber?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
            My Shipping Documents
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
            Central repository of all commercial, transport, customs, and clearance documentation
          </p>
        </div>
      </div>

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
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 6,
                border: '1px solid',
                borderColor: category === cat ? '#0284C7' : '#CBD5E1',
                backgroundColor: category === cat ? '#E0F2FE' : '#FFFFFF',
                color: category === cat ? '#0284C7' : '#475569',
                fontSize: '0.825rem',
                fontWeight: category === cat ? 600 : 500,
                cursor: 'pointer',
              }}
            >
              {cat === 'ALL' ? 'All Documents' : cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 12, color: '#94A3B8' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search document title, shipment #..."
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

      {/* Documents Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>Loading document repository...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
            No shipping documents found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Document Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Associated Shipment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Upload Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Size</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => (
                  <tr
                    key={doc._id}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#0F172A' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderOpen size={17} color="#0284C7" />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                      <span
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 6,
                          fontSize: '0.775rem',
                          fontWeight: 500,
                        }}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#0F172A' }}>
                      {doc.shipment?.shipmentNumber ? (
                        <div>
                          <strong>{doc.shipment.shipmentNumber}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {doc.shipment.origin} → {doc.shipment.destination}
                          </div>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.825rem' }}>
                      {new Date(doc.uploadDate || doc.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#64748B', fontSize: '0.825rem' }}>
                      {(doc.fileSize / 1024).toFixed(1)} KB
                    </td>
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      <a
                        href={`/api/portal/documents/${doc._id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#0284C7',
                          color: '#FFFFFF',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <Download size={14} /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
