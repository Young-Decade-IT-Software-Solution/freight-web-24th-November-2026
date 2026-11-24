import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Calendar,
  Building,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plane,
  Truck,
  Train,
  Clock,
  MapPin,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const SHIPMENT_STATUSES = [
  'All',
  'Draft',
  'Booked',
  'Cargo Received',
  'In Transit',
  'Arrived at Destination',
  'Customs Clearance',
  'Out for Delivery',
  'Delivered',
  'On Hold',
  'Cancelled',
];

const FREIGHT_MODES = [
  'All',
  'Air Freight',
  'Sea Freight FCL',
  'Sea Freight LCL',
  'Road Freight',
  'Rail Freight',
  'Multimodal Freight',
  'Courier / Express',
];

export default function Shipments() {
  const { t } = useTranslation();
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [usersList, setUsersList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedFreightMode, setSelectedFreightMode] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('basic'); // 'basic', 'route', 'cargo', 'transport', 'schedule'
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer: '',
    customerReference: '',
    freightType: 'Sea Freight FCL',
    branch: '',
    assignedTo: '',
    internalRemarks: '',
    // Route
    originCountry: '',
    originCity: '',
    originPort: '',
    origin: '',
    destinationCountry: '',
    destinationCity: '',
    destinationPort: '',
    destination: '',
    placeOfReceipt: '',
    placeOfDelivery: '',
    // Cargo
    cargoDescription: 'General Cargo',
    packages: 1,
    packageType: 'Cartons',
    weight: 0,
    weightUnit: 'KG',
    volume: 0,
    volumeUnit: 'CBM',
    chargeableWeight: 0,
    commodityType: 'General',
    hsCode: '',
    dangerousGoods: false,
    specialHandling: '',
    // Transport
    shipper: '',
    consignee: '',
    notifyParty: '',
    carrier: '',
    masterReference: '',
    houseReference: '',
    bookingReference: '',
    containerNumber: '',
    vesselFlight: '',
    // Schedule
    etd: '',
    eta: '',
    // Financial
    agreedCharges: 0,
    currency: 'USD',
    status: 'Booked',
  });

  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError('');
      let q = new URLSearchParams();
      if (searchTerm) q.append('search', searchTerm);
      if (selectedStatus !== 'All') q.append('status', selectedStatus);
      if (selectedFreightMode !== 'All') q.append('freightType', selectedFreightMode);
      if (selectedBranch) q.append('branchId', selectedBranch);
      if (startDate && endDate) {
        q.append('startDate', startDate);
        q.append('endDate', endDate);
      }
      q.append('page', page);
      q.append('limit', 10);

      const res = await api.get(`/shipments?${q.toString()}`);
      if (res.data?.success) {
        setShipments(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [bRes, cRes, uRes] = await Promise.all([
        api.get('/branches'),
        api.get('/customers'),
        api.get('/users'),
      ]);
      if (bRes.data?.success) setBranches(bRes.data.data);
      if (cRes.data?.success) setCustomers(cRes.data.data);
      if (uRes.data?.success) setUsersList(uRes.data.data);
    } catch (e) {
      console.warn('Failed to fetch dependencies', e);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [selectedStatus, selectedFreightMode, selectedBranch, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchShipments();
  };

  const openCreateModal = () => {
    setFormData({
      customer: customers[0]?._id || '',
      customerReference: '',
      freightType: 'Sea Freight FCL',
      branch: isSuperAdmin ? (branches[0]?._id || '') : (user?.branch?._id || ''),
      assignedTo: user?._id || '',
      internalRemarks: '',
      originCountry: '',
      originCity: '',
      originPort: '',
      origin: '',
      destinationCountry: '',
      destinationCity: '',
      destinationPort: '',
      destination: '',
      placeOfReceipt: '',
      placeOfDelivery: '',
      cargoDescription: 'General Cargo',
      packages: 1,
      packageType: 'Cartons',
      weight: 0,
      weightUnit: 'KG',
      volume: 0,
      volumeUnit: 'CBM',
      chargeableWeight: 0,
      commodityType: 'General',
      hsCode: '',
      dangerousGoods: false,
      specialHandling: '',
      shipper: '',
      consignee: '',
      notifyParty: '',
      carrier: '',
      masterReference: '',
      houseReference: '',
      bookingReference: '',
      containerNumber: '',
      vesselFlight: '',
      etd: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      eta: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      agreedCharges: 0,
      currency: 'USD',
      status: 'Booked',
    });
    setActiveFormTab('basic');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        origin: formData.origin || `${formData.originCity || formData.originPort || 'Origin'}, ${formData.originCountry || ''}`.trim(),
        destination: formData.destination || `${formData.destinationCity || formData.destinationPort || 'Destination'}, ${formData.destinationCountry || ''}`.trim(),
      };

      const res = await api.post('/shipments', payload);
      if (res.data?.success) {
        setSuccess(`Shipment ${res.data.data.shipmentNumber} created successfully!`);
        setIsCreateModalOpen(false);
        fetchShipments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create shipment');
    }
  };

  const handleDeleteShipment = async () => {
    if (!shipmentToDelete) return;
    try {
      const res = await api.delete(`/shipments/${shipmentToDelete._id}`);
      if (res.data?.success) {
        setSuccess('Shipment deleted successfully');
        setDeleteModalOpen(false);
        fetchShipments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete shipment');
      setDeleteModalOpen(false);
    }
  };

  const handleExportCsv = () => {
    let q = new URLSearchParams();
    if (selectedStatus !== 'All') q.append('status', selectedStatus);
    if (selectedFreightMode !== 'All') q.append('freightType', selectedFreightMode);
    if (selectedBranch) q.append('branchId', selectedBranch);
    window.open(`/api/shipments/export/csv?${q.toString()}`, '_blank');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Booked':
      case 'Booking Confirmed': return 'badge-blue';
      case 'Cargo Received': return 'badge-teal';
      case 'In Transit': return 'badge-amber';
      case 'Arrived at Destination': return 'badge-slate';
      case 'Customs Clearance': return 'badge-blue';
      case 'Out for Delivery': return 'badge-teal';
      case 'Delivered': return 'badge-green';
      case 'On Hold': return 'badge-amber';
      case 'Cancelled': return 'badge-red';
      default: return 'badge-slate';
    }
  };

  const getFreightIcon = (type = '') => {
    if (type.includes('Air')) return <Plane size={14} color="var(--blue-600)" />;
    if (type.includes('Road') || type.includes('Truck')) return <Truck size={14} color="var(--amber-600)" />;
    if (type.includes('Rail')) return <Train size={14} color="var(--slate-600)" />;
    return <Ship size={14} color="var(--teal-600)" />;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('shipments.title', 'Freight & Shipment Management')}</h1>
          <p className="page-subtitle">{t('shipments.subtitle', 'Track active cargo movements, operational milestones, and shipping documents')}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleExportCsv} title="Export CSV">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchShipments} title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
          {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
            <button type="button" className="btn btn-primary" onClick={openCreateModal}>
              <Plus size={16} />
              <span>{t('shipments.create', 'New Shipment')}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid #FECDD3', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-600)', border: '1px solid #A7F3D0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            style={{ paddingInlineStart: '2.2rem' }}
            placeholder={t('shipments.searchPlaceholder', 'Search by shipment #, customer, carrier, origin, destination...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', insetInlineStart: '0.75rem', color: 'var(--slate-400)' }} />
        </form>

        <div style={{ minWidth: '160px' }}>
          <select className="form-select" value={selectedStatus} onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}>
            {SHIPMENT_STATUSES.map((st) => (
              <option key={st} value={st}>{st === 'All' ? 'All Statuses' : st}</option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '170px' }}>
          <select className="form-select" value={selectedFreightMode} onChange={(e) => { setSelectedFreightMode(e.target.value); setPage(1); }}>
            {FREIGHT_MODES.map((fm) => (
              <option key={fm} value={fm}>{fm === 'All' ? 'All Freight Modes' : fm}</option>
            ))}
          </select>
        </div>

        {isSuperAdmin && (
          <div style={{ minWidth: '160px' }}>
            <select className="form-select" value={selectedBranch} onChange={(e) => { setSelectedBranch(e.target.value); setPage(1); }}>
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Shipments Table */}
      <div className="erp-table-container">
        <table className="erp-table">
          <thead>
            <tr>
              <th>Shipment #</th>
              <th>Customer</th>
              <th>Mode</th>
              <th>Route (Origin → Destination)</th>
              <th>ETD / ETA</th>
              <th>Cargo Details</th>
              <th>Status</th>
              <th>Branch</th>
              <th style={{ textAlign: 'end' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                  Loading shipments...
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                  No shipments found matching current filters.
                </td>
              </tr>
            ) : (
              shipments.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy-900)' }}>
                      {s.shipmentNumber}
                    </div>
                    {s.quotation && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                        Quote: {s.quotation?.quotationNumber || 'Linked'}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>
                      {s.customer?.companyName || '—'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {s.customer?.contactPerson}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                      {getFreightIcon(s.freightType)}
                      <span>{s.freightType}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--navy-900)' }}>
                      {s.origin} &rarr; {s.destination}
                    </div>
                    {s.carrier && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        Carrier: {s.carrier}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                      <div>Dep: {s.etd ? new Date(s.etd).toLocaleDateString() : 'TBD'}</div>
                      <div>Arr: {s.eta ? new Date(s.eta).toLocaleDateString() : 'TBD'}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-700)' }}>
                      <span>{s.packages} pkgs • {s.weight} {s.weightUnit || 'KG'}</span>
                      {s.volume > 0 && <span> • {s.volume} {s.volumeUnit || 'CBM'}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                      {s.branch?.name || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Full Shipment Details & Milestones"
                        onClick={() => navigate(`/shipments/${s._id}`)}
                      >
                        <Eye size={14} />
                      </button>
                      {['Super Admin', 'Branch Admin'].includes(user?.role) && ['Draft', 'Cancelled'].includes(s.status) && (
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--rose-600)' }}
                          title="Delete Shipment"
                          onClick={() => {
                            setShipmentToDelete(s);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderTop: '1px solid var(--slate-100)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Showing {shipments.length} of {totalCount} shipments
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 0.5rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Manual Shipment Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Operational Shipment"
        maxWidth="820px"
      >
        {/* Step Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.65rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
          {[
            { id: 'basic', label: '1. Basic Info' },
            { id: 'route', label: '2. Route' },
            { id: 'cargo', label: '3. Cargo' },
            { id: 'transport', label: '4. Transport' },
            { id: 'schedule', label: '5. Schedule & Finance' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${activeFormTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFormTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleCreateSubmit}>
          {/* TAB 1: BASIC INFO */}
          {activeFormTab === 'basic' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client / Customer *</label>
                  <select
                    className="form-select"
                    value={formData.customer}
                    onChange={(e) => {
                      const c = customers.find((cust) => cust._id === e.target.value);
                      setFormData({
                        ...formData,
                        customer: e.target.value,
                        shipper: c?.companyName || '',
                        consignee: c?.contactPerson || '',
                        currency: c?.currency || 'USD',
                      });
                    }}
                    required
                  >
                    <option value="">Select customer...</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.customerCode} — {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Customer Job Reference</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PO-89210, INV-441"
                    value={formData.customerReference}
                    onChange={(e) => setFormData({ ...formData, customerReference: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Freight Mode *</label>
                  <select
                    className="form-select"
                    value={formData.freightType}
                    onChange={(e) => setFormData({ ...formData, freightType: e.target.value })}
                    required
                  >
                    {FREIGHT_MODES.filter((m) => m !== 'All').map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Booked">Booked</option>
                    <option value="Cargo Received">Cargo Received</option>
                    <option value="In Transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                {isSuperAdmin && (
                  <div className="form-group">
                    <label className="form-label">Operating Branch *</label>
                    <select
                      className="form-select"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      required
                    >
                      <option value="">Select branch...</option>
                      {branches.map((b) => (
                        <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Assigned Operations Officer</label>
                  <select
                    className="form-select"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    {usersList.map((u) => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Operations Remarks</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formData.internalRemarks}
                  onChange={(e) => setFormData({ ...formData, internalRemarks: e.target.value })}
                  placeholder="Special instructions or internal job notes..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-primary" onClick={() => setActiveFormTab('route')}>
                  Next: Route Details &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTE */}
          {activeFormTab === 'route' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>Origin & Receipt</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Origin Country *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. China"
                    value={formData.originCountry}
                    onChange={(e) => setFormData({ ...formData, originCountry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin City / Port *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shanghai Port (CNSHA)"
                    value={formData.originPort}
                    onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Place of Receipt</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Factory CFS Pudong"
                    value={formData.placeOfReceipt}
                    onChange={(e) => setFormData({ ...formData, placeOfReceipt: e.target.value })}
                  />
                </div>
              </div>

              <h4 style={{ fontSize: '0.95rem', color: 'var(--navy-900)', marginTop: '1rem', marginBottom: '0.75rem' }}>Destination & Delivery</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Destination Country *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. United Arab Emirates"
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination City / Port *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jebel Ali Port (AEJEA)"
                    value={formData.destinationPort}
                    onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Place of Delivery</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dubai Industrial City Warehouse"
                    value={formData.placeOfDelivery}
                    onChange={(e) => setFormData({ ...formData, placeOfDelivery: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveFormTab('basic')}>
                  &larr; Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setActiveFormTab('cargo')}>
                  Next: Cargo Details &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CARGO */}
          {activeFormTab === 'cargo' && (
            <div>
              <div className="form-group">
                <label className="form-label">Cargo Description *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cargoDescription}
                  onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Packages Count *</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={formData.packages}
                    onChange={(e) => setFormData({ ...formData, packages: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Package Type</label>
                  <select
                    className="form-select"
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                  >
                    <option value="Cartons">Cartons</option>
                    <option value="Pallets">Pallets</option>
                    <option value="Wooden Crates">Wooden Crates</option>
                    <option value="Drums">Drums</option>
                    <option value="Bales">Bales</option>
                    <option value="Loose / Bulk">Loose / Bulk</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Commodity Type</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Electronics, Machinery, Garments"
                    value={formData.commodityType}
                    onChange={(e) => setFormData({ ...formData, commodityType: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gross Weight</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    />
                    <select
                      className="form-select"
                      style={{ width: '80px' }}
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                    >
                      <option value="KG">KG</option>
                      <option value="LB">LB</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Volume</label>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: Number(e.target.value) })}
                    />
                    <select
                      className="form-select"
                      style={{ width: '85px' }}
                      value={formData.volumeUnit}
                      onChange={(e) => setFormData({ ...formData, volumeUnit: e.target.value })}
                    >
                      <option value="CBM">CBM</option>
                      <option value="CFT">CFT</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">HS Code (Harmonized)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 8481.80.90"
                    value={formData.hsCode}
                    onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.dangerousGoods}
                    onChange={(e) => setFormData({ ...formData, dangerousGoods: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600, color: formData.dangerousGoods ? 'var(--rose-600)' : 'var(--navy-900)' }}>
                    Dangerous Goods (DG / IMO)
                  </span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Special Handling Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Keep dry, temperature control +15C to +25C, Do not stack..."
                  value={formData.specialHandling}
                  onChange={(e) => setFormData({ ...formData, specialHandling: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveFormTab('route')}>
                  &larr; Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setActiveFormTab('transport')}>
                  Next: Transport Info &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSPORT */}
          {activeFormTab === 'transport' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Shipper Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.shipper}
                    onChange={(e) => setFormData({ ...formData, shipper: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Consignee Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.consignee}
                    onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Notify Party</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Same as consignee or notify agent..."
                    value={formData.notifyParty}
                    onChange={(e) => setFormData({ ...formData, notifyParty: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carrier / Shipping Line / Airline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maersk, Emirates SkyCargo, MSC, Hapag-Lloyd"
                    value={formData.carrier}
                    onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Master B/L or AWB Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MAEU982123440 / 176-12345678"
                    value={formData.masterReference}
                    onChange={(e) => setFormData({ ...formData, masterReference: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">House B/L or AWB Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. HBL-DXB-9021"
                    value={formData.houseReference}
                    onChange={(e) => setFormData({ ...formData, houseReference: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Container Number(s)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MSKU1234567 (where applicable)"
                    value={formData.containerNumber}
                    onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vessel / Flight / Train / Truck Ref</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MSC OSCAR V.2401E / EK0992"
                    value={formData.vesselFlight}
                    onChange={(e) => setFormData({ ...formData, vesselFlight: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveFormTab('cargo')}>
                  &larr; Back
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setActiveFormTab('schedule')}>
                  Next: Schedule & Finance &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE & FINANCE */}
          {activeFormTab === 'schedule' && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Estimated Departure (ETD)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.etd}
                    onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Arrival (ETA)</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.eta}
                    onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--slate-200)', marginTop: '0.75rem', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: '0.5rem' }}>Financial Summary</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Agreed Total Amount *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.agreedCharges}
                      onChange={(e) => setFormData({ ...formData, agreedCharges: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    >
                      {['USD', 'EUR', 'AED', 'SAR', 'TRY', 'CNY', 'GBP'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setActiveFormTab('transport')}>
                  &larr; Back
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateModalOpen(false)}>
                    {t('common.cancel')}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Shipment
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Shipment"
        maxWidth="420px"
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete shipment <strong>{shipmentToDelete?.shipmentNumber}</strong>?
          <br /><br />
          All associated internal milestones and documents will also be permanently removed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setDeleteModalOpen(false)}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteShipment}>
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
