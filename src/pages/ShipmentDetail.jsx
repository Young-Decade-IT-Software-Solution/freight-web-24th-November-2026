import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Ship,
  Plane,
  Truck,
  Train,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Trash2,
  DollarSign,
  Building,
  User,
  Plus,
  Edit2,
  MapPin,
  Package,
  Activity as ActivityIcon,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Common/Modal';

const SHIPMENT_STATUSES = [
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

const DOCUMENT_CATEGORIES = [
  'Commercial Invoice',
  'Packing List',
  'Bill of Lading',
  'Air Waybill',
  'Delivery Order',
  'Customs Documents',
  'Certificate of Origin',
  'Insurance Documents',
  'Other Documents',
];

export default function ShipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active Tab: 'overview', 'cargo', 'milestones', 'documents', 'finance', 'activities'
  const [activeTab, setActiveTab] = useState('overview');

  // Status Change State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

  // Milestone Modals
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneStatus, setMilestoneStatus] = useState('Completed');
  const [milestoneRemarks, setMilestoneRemarks] = useState('');

  const [isCustomMilestoneModalOpen, setIsCustomMilestoneModalOpen] = useState(false);
  const [customMilestoneTitle, setCustomMilestoneTitle] = useState('');
  const [customMilestoneRemarks, setCustomMilestoneRemarks] = useState('');

  // Document Upload State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Bill of Lading');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Activities
  const [activities, setActivities] = useState([]);

  const fetchShipment = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/shipments/${id}`);
      if (res.data?.success) {
        setShipment(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load shipment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/shipments/${id}/activities`);
      if (res.data?.success) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load shipment activities');
    }
  };

  useEffect(() => {
    fetchShipment();
    fetchActivities();
  }, [id]);

  const handleOpenStatusModal = (newStatus) => {
    setPendingStatus(newStatus);
    setStatusRemarks('');
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put(`/shipments/${id}/status`, {
        status: pendingStatus,
        remarks: statusRemarks,
      });
      if (res.data?.success) {
        setSuccess(`Shipment status updated to '${pendingStatus}'`);
        setIsStatusModalOpen(false);
        fetchShipment();
        fetchActivities();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenMilestoneModal = (m) => {
    setSelectedMilestone(m);
    setMilestoneStatus(m.status === 'Completed' ? 'Completed' : 'Completed');
    setMilestoneRemarks(m.remarks || '');
    setIsMilestoneModalOpen(true);
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/shipments/${id}/milestones/${selectedMilestone._id}`, {
        status: milestoneStatus,
        remarks: milestoneRemarks,
      });
      if (res.data?.success) {
        setSuccess(`Milestone '${selectedMilestone.title}' updated to ${milestoneStatus}`);
        setIsMilestoneModalOpen(false);
        fetchShipment();
        fetchActivities();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update milestone');
    }
  };

  const handleCreateCustomMilestone = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/shipments/${id}/milestones`, {
        title: customMilestoneTitle,
        remarks: customMilestoneRemarks,
        status: 'Pending',
      });
      if (res.data?.success) {
        setSuccess(`Custom milestone '${customMilestoneTitle}' added`);
        setIsCustomMilestoneModalOpen(false);
        setCustomMilestoneTitle('');
        setCustomMilestoneRemarks('');
        fetchShipment();
        fetchActivities();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add milestone');
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploadingDoc(true);
    setError('');
    setSuccess('');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', docTitle);
      uploadFormData.append('category', docCategory);
      uploadFormData.append('file', docFile);

      const res = await api.post(`/shipments/${id}/documents`, uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setSuccess(`Document '${docTitle}' uploaded successfully!`);
        setDocTitle('');
        setDocFile(null);
        fetchShipment();
        fetchActivities();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Document upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await api.delete(`/shipments/${id}/documents/${docId}`);
      if (res.data?.success) {
        setSuccess('Document removed successfully');
        fetchShipment();
        fetchActivities();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document');
    }
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
    if (type.includes('Air')) return <Plane size={18} color="var(--blue-600)" />;
    if (type.includes('Road') || type.includes('Truck')) return <Truck size={18} color="var(--amber-600)" />;
    if (type.includes('Rail')) return <Train size={18} color="var(--slate-600)" />;
    return <Ship size={18} color="var(--teal-600)" />;
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--slate-500)' }}>Loading shipment file...</div>;
  }

  if (!shipment) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--navy-900)' }}>Shipment Not Found</h3>
        <button type="button" className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/shipments')}>
          <ArrowLeft size={16} /> Back to Shipments
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header & Quick Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate('/shipments')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>{shipment.shipmentNumber}</span>
              <span className={`badge ${getStatusBadge(shipment.status)}`}>
                {shipment.status}
              </span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              {shipment.customer?.companyName} • {shipment.origin} &rarr; {shipment.destination} • {shipment.branch?.name}
            </p>
          </div>
        </div>

        {/* Quick Status Transition Dropdown */}
        {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-600)' }}>Update Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontWeight: 600 }}
              value={shipment.status}
              onChange={(e) => handleOpenStatusModal(e.target.value)}
            >
              {SHIPMENT_STATUSES.filter((s) => s !== 'All').map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        )}
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

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--slate-200)', paddingBottom: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Overview', icon: MapPin },
          { id: 'cargo', label: 'Cargo & Transport', icon: Package },
          { id: 'milestones', label: `Milestones (${shipment.milestones?.length || 0})`, icon: Clock },
          { id: 'documents', label: `Documents (${shipment.documents?.length || 0})`, icon: FileText },
          { id: 'finance', label: 'Financial Summary', icon: DollarSign },
          { id: 'activities', label: `Activity History (${activities.length})`, icon: ActivityIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Card: Route & Mode */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Freight Route & Specifications</span>
              {getFreightIcon(shipment.freightType)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Freight Mode</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--navy-900)' }}>{shipment.freightType}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Origin</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{shipment.origin}</div>
                  {shipment.placeOfReceipt && <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Receipt: {shipment.placeOfReceipt}</div>}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Destination</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{shipment.destination}</div>
                  {shipment.placeOfDelivery && <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Delivery: {shipment.placeOfDelivery}</div>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Estimated Departure (ETD)</div>
                  <div style={{ fontWeight: 600 }}>{shipment.etd ? new Date(shipment.etd).toLocaleDateString() : 'TBD'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Estimated Arrival (ETA)</div>
                  <div style={{ fontWeight: 600 }}>{shipment.eta ? new Date(shipment.eta).toLocaleDateString() : 'TBD'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Customer & Parties */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Customer & Operating Branch</span>
              <Building size={16} color="var(--slate-500)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Account / Customer</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy-900)' }}>{shipment.customer?.companyName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>{shipment.customer?.contactPerson} • {shipment.customer?.email}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Operating Branch</div>
                  <div style={{ fontWeight: 600 }}>{shipment.branch?.name} ({shipment.branch?.code})</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Assigned Ops Officer</div>
                  <div style={{ fontWeight: 600 }}>{shipment.assignedTo?.name || 'Unassigned'}</div>
                </div>
              </div>
              {shipment.customerReference && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Customer Job Reference</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.customerReference}</div>
                </div>
              )}
              {shipment.quotation && (
                <div style={{ backgroundColor: 'var(--teal-50)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--teal-100)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--teal-700)', fontWeight: 600 }}>Linked Commercial Quotation</div>
                  <div style={{ fontWeight: 700, color: 'var(--teal-800)' }}>{shipment.quotation?.quotationNumber || 'QT-LINKED'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CARGO & TRANSPORT */}
      {activeTab === 'cargo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* Cargo Specifications */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Cargo Specifications</span>
              <Package size={16} color="var(--slate-500)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Cargo Description</div>
                <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{shipment.cargoDescription}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Packages</div>
                  <div style={{ fontWeight: 700 }}>{shipment.packages} {shipment.packageType || 'pkgs'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Gross Weight</div>
                  <div style={{ fontWeight: 700 }}>{shipment.weight} {shipment.weightUnit || 'KG'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Volume</div>
                  <div style={{ fontWeight: 700 }}>{shipment.volume} {shipment.volumeUnit || 'CBM'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Commodity Type</div>
                  <div style={{ fontWeight: 600 }}>{shipment.commodityType || 'General'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>HS Code</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.hsCode || '—'}</div>
                </div>
              </div>
              {shipment.dangerousGoods && (
                <div style={{ backgroundColor: 'var(--rose-50)', border: '1px solid #FECDD3', padding: '0.6rem 0.85rem', borderRadius: '6px', color: 'var(--rose-600)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} /> Dangerous Goods (DG/IMO) Declaration
                </div>
              )}
              {shipment.specialHandling && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Special Handling Instructions</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)' }}>{shipment.specialHandling}</div>
                </div>
              )}
            </div>
          </div>

          {/* Transport & Carrier Details */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Carrier & Transport References</span>
              <Layers size={16} color="var(--slate-500)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Carrier / Shipping Line</div>
                  <div style={{ fontWeight: 600 }}>{shipment.carrier || 'Pending Assignment'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Vessel / Flight / Truck</div>
                  <div style={{ fontWeight: 600 }}>{shipment.vesselFlight || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Master B/L or AWB</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.masterReference || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>House B/L or AWB</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.houseReference || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Booking Reference</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.bookingReference || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Container Number(s)</div>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{shipment.containerNumber || '—'}</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Shipper</div>
                  <div style={{ fontSize: '0.85rem' }}>{shipment.shipper || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Consignee</div>
                  <div style={{ fontSize: '0.85rem' }}>{shipment.consignee || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES (Visual Timeline) */}
      {activeTab === 'milestones' && (
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Internal Milestone Tracking</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                Chronological operational lifecycle milestones
              </p>
            </div>
            {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setIsCustomMilestoneModalOpen(true)}
              >
                <Plus size={14} /> + Add Custom Milestone
              </button>
            )}
          </div>

          {/* Chronological Timeline */}
          <div style={{ position: 'relative', padding: '1rem 0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Timeline vertical bar */}
            <div
              style={{
                position: 'absolute',
                top: '1.5rem',
                bottom: '1.5rem',
                left: '2.25rem',
                width: '2px',
                backgroundColor: 'var(--slate-200)',
                zIndex: 1,
              }}
            />

            {shipment.milestones && shipment.milestones.map((m, idx) => {
              const isCompleted = m.status === 'Completed';
              const isDelayed = m.status === 'Delayed';

              return (
                <div
                  key={m._id}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                  }}
                >
                  {/* Status Indicator Icon */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'var(--emerald-600)' : isDelayed ? 'var(--rose-600)' : '#fff',
                      border: `2px solid ${isCompleted ? 'var(--emerald-600)' : isDelayed ? 'var(--rose-600)' : 'var(--slate-300)'}`,
                      color: isCompleted || isDelayed ? '#fff' : 'var(--slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? <Check size={16} /> : isDelayed ? <AlertTriangle size={14} /> : <Clock size={15} />}
                  </div>

                  {/* Milestone Card */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: isCompleted ? 'var(--slate-50)' : isDelayed ? '#FFF1F2' : '#fff',
                      border: `1px solid ${isDelayed ? '#FECDD3' : 'var(--slate-200)'}`,
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy-900)' }}>
                          {m.order}. {m.title}
                        </span>
                        {m.isCustom && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Custom</span>}
                        <span className={`badge ${isCompleted ? 'badge-green' : isDelayed ? 'badge-red' : 'badge-slate'}`}>
                          {m.status}
                        </span>
                      </div>
                      {m.remarks && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                          {m.remarks}
                        </div>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.35rem' }}>
                        {isCompleted && m.completedDate ? (
                          <span>Completed on {new Date(m.completedDate).toLocaleString()} {m.completedByName && `by ${m.completedByName}`}</span>
                        ) : (
                          <span>Pending operational completion</span>
                        )}
                      </div>
                    </div>

                    {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenMilestoneModal(m)}
                      >
                        <Edit2 size={13} /> Update State
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Upload Form Box */}
          {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
            <div className="card" style={{ backgroundColor: 'var(--slate-50)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Upload size={18} color="var(--teal-600)" />
                <h4 style={{ fontSize: '1rem', color: 'var(--navy-900)' }}>Upload Shipment Document</h4>
              </div>

              <form onSubmit={handleUploadDocument}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Document Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Master Bill of Lading Final"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value)}
                      required
                    >
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Select File (PDF, JPG, PNG &le; 10MB) *</label>
                    <input
                      type="file"
                      className="form-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={uploadingDoc}>
                    <Upload size={14} />
                    <span>{uploadingDoc ? 'Uploading...' : 'Upload & Secure Document'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Documents Table */}
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'end' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shipment.documents && shipment.documents.length > 0 ? (
                  shipment.documents.map((doc) => (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{doc.title}</div>
                      </td>
                      <td>
                        <span className="badge badge-teal">{doc.category}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--slate-600)' }}>
                          {doc.originalName}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem' }}>
                          {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem' }}>{doc.uploadedByName || 'Staff'}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <a
                            href={`/api/shipments/${shipment._id}/documents/${doc._id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline btn-sm"
                            title="Download Document"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </a>
                          {['Super Admin', 'Branch Admin', 'Operations'].includes(user?.role) && (
                            <button
                              type="button"
                              className="btn-icon"
                              style={{ color: 'var(--rose-600)' }}
                              title="Delete Document"
                              onClick={() => handleDeleteDocument(doc._id)}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-400)' }}>
                      No documents uploaded for this shipment yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL SUMMARY */}
      {activeTab === 'finance' && (
        <div className="card" style={{ maxWidth: '640px' }}>
          <div className="card-header">
            <span className="card-title">Commercial Financial Summary</span>
            <span className="badge badge-teal">{shipment.currency}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
              <span style={{ color: 'var(--slate-600)' }}>Base Freight Agreed:</span>
              <span style={{ fontWeight: 600 }}>{shipment.currency} {shipment.freightCharges?.toLocaleString()}</span>
            </div>
            {shipment.additionalCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ color: 'var(--slate-600)' }}>Additional Ancillary Charges:</span>
                <span style={{ fontWeight: 600 }}>{shipment.currency} {shipment.additionalCharges?.toLocaleString()}</span>
              </div>
            )}
            {shipment.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ color: 'var(--slate-600)' }}>Taxes & Duties:</span>
                <span style={{ fontWeight: 600 }}>{shipment.currency} {shipment.tax?.toLocaleString()}</span>
              </div>
            )}
            {shipment.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--slate-100)' }}>
                <span style={{ color: 'var(--rose-600)' }}>Discount:</span>
                <span style={{ fontWeight: 600, color: 'var(--rose-600)' }}>- {shipment.currency} {shipment.discount?.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.85rem 0', borderTop: '2px solid var(--slate-200)', marginTop: '0.25rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy-900)' }}>Total Agreed Contract:</span>
              <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--teal-600)' }}>
                {shipment.currency} {shipment.agreedCharges?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Billing / Invoice Status</div>
                <div style={{ fontWeight: 600 }}>{shipment.invoiceStatus || 'Unbilled'}</div>
              </div>
              {shipment.quotation && (
                <div style={{ textAlign: 'end' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Originated from Quote</div>
                  <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{shipment.quotation?.quotationNumber || 'Linked'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ACTIVITY HISTORY */}
      {activeTab === 'activities' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Audit Trail & Status History</span>
            <ActivityIcon size={16} color="var(--slate-500)" />
          </div>

          {/* Status History Array from Shipment */}
          {shipment.statusHistory && shipment.statusHistory.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>Status Transitions History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {shipment.statusHistory.map((sh, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                        {sh.previousStatus ? `${sh.previousStatus} → ` : ''}{sh.newStatus}
                      </span>
                      {sh.remarks && <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.15rem' }}>{sh.remarks}</div>}
                    </div>
                    <div style={{ textAlign: 'end', fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      <div>{sh.changedByName || 'Staff'}</div>
                      <div>{new Date(sh.date).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Activity Stream for this shipment */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--navy-900)', marginBottom: '0.75rem' }}>General Operation Logs</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div key={act._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', border: '1px solid var(--slate-100)', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <div>
                      <strong>{act.action}:</strong> {act.details}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>No additional activity logs recorded.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Change Remarks Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Change Status to '${pendingStatus}'`}
        maxWidth="460px"
      >
        <form onSubmit={handleConfirmStatusChange}>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
            Are you sure you want to transition shipment <strong>{shipment.shipmentNumber}</strong> from <strong>{shipment.status}</strong> to <strong>{pendingStatus}</strong>?
          </p>

          <div className="form-group">
            <label className="form-label">Operational Transition Remarks *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Customs released shipment in Jebel Ali CFS, loading on delivery truck..."
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title={`Update Milestone: ${selectedMilestone?.title}`}
        maxWidth="480px"
      >
        <form onSubmit={handleUpdateMilestone}>
          <div className="form-group">
            <label className="form-label">Milestone State *</label>
            <select
              className="form-select"
              value={milestoneStatus}
              onChange={(e) => setMilestoneStatus(e.target.value)}
            >
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Delayed">Delayed (Triggers Alert)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Operational Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Vessel berthed on time, documentation cleared..."
              value={milestoneRemarks}
              onChange={(e) => setMilestoneRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsMilestoneModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Milestone State
            </button>
          </div>
        </form>
      </Modal>

      {/* Custom Milestone Modal */}
      <Modal
        isOpen={isCustomMilestoneModalOpen}
        onClose={() => setIsCustomMilestoneModalOpen(false)}
        title="Add Custom Milestone"
        maxWidth="460px"
      >
        <form onSubmit={handleCreateCustomMilestone}>
          <div className="form-group">
            <label className="form-label">Milestone Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Fumigation Certificate Completed, Reefer Pre-cooling"
              value={customMilestoneTitle}
              onChange={(e) => setCustomMilestoneTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Remarks</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={customMilestoneRemarks}
              onChange={(e) => setCustomMilestoneRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsCustomMilestoneModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
