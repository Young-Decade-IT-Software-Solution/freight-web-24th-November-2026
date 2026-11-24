import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  ArrowLeft,
  Receipt,
  CreditCard,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [supplier, setSupplier] = useState(null);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('bills');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError('');
      const [supRes, billsRes, payRes] = await Promise.all([
        api.get(`/suppliers/${id}`),
        api.get(`/supplier-bills?supplier=${id}`),
        api.get(`/supplier-payments?supplier=${id}`),
      ]);
      setSupplier(supRes.data.data);
      setBills(billsRes.data.data || []);
      setPayments(payRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
        <p style={{ color: 'var(--slate-500)' }}>Loading supplier profile...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">Supplier not found</div>
        <button className="btn btn-secondary" onClick={() => navigate('/suppliers')}>Back to Suppliers</button>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/suppliers')}
        >
          <ArrowLeft size={16} />
          Back to Suppliers
        </button>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(`/supplier-ledger?supplierId=${supplier._id}`)}
          >
            <FileText size={16} />
            View Full Ledger
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/supplier-bills')}
          >
            <Receipt size={16} />
            Record Supplier Bill
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Supplier Profile Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                {supplier.companyName}
              </h2>
              <span className="badge badge-info">{supplier.supplierCode}</span>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--slate-600)', fontSize: '0.9rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {supplier.contactPerson && (
                <div><strong>Contact:</strong> {supplier.contactPerson}</div>
              )}
              {supplier.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={14} className="text-teal" /> {supplier.email}
                </div>
              )}
              {supplier.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={14} className="text-teal" /> {supplier.phone}
                </div>
              )}
              {supplier.country && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} className="text-teal" /> {supplier.country}
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'var(--slate-50)', padding: '1.25rem 1.75rem', borderRadius: '8px', border: '1px solid var(--slate-200)', textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 600 }}>
              Balance Payable
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: supplier.balancePayable > 0 ? '#d97706' : 'var(--teal-600)', marginTop: '0.2rem' }}>
              {supplier.preferredCurrency} {supplier.balancePayable?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
              Terms: {supplier.paymentTerms}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--slate-200)', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'bills' ? 'active' : ''}`}
          style={{
            padding: '0.6rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'bills' ? '2px solid var(--teal-600)' : '2px solid transparent',
            color: activeTab === 'bills' ? 'var(--teal-600)' : 'var(--slate-500)',
          }}
          onClick={() => setActiveTab('bills')}
        >
          Vendor Bills ({bills.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          style={{
            padding: '0.6rem 1.25rem',
            border: 'none',
            background: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            borderBottom: activeTab === 'payments' ? '2px solid var(--teal-600)' : '2px solid transparent',
            color: activeTab === 'payments' ? 'var(--teal-600)' : 'var(--slate-500)',
          }}
          onClick={() => setActiveTab('payments')}
        >
          Payments Made ({payments.length})
        </button>
      </div>

      {/* Tab 1: Bills */}
      {activeTab === 'bills' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Vendor Bill #</th>
                  <th>Bill Date</th>
                  <th>Due Date</th>
                  <th>Shipment</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                      No bills recorded for this vendor yet.
                    </td>
                  </tr>
                ) : (
                  bills.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{b.billNumber}</td>
                      <td>{b.vendorBillNumber || '—'}</td>
                      <td>{new Date(b.billDate).toLocaleDateString()}</td>
                      <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                      <td>{b.shipment?.shipmentNumber || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {b.currency} {b.totalAmount?.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--teal-600)' }}>
                        {b.currency} {b.paidAmount?.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: b.balanceAmount > 0 ? '#d97706' : 'var(--slate-600)' }}>
                        {b.currency} {b.balanceAmount?.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Overdue' ? 'badge-danger' : 'badge-info'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments */}
      {activeTab === 'payments' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Reference #</th>
                  <th>Account</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-400)' }}>
                      No supplier payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, color: 'var(--teal-600)' }}>{p.paymentNumber}</td>
                      <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td>{p.paymentMode}</td>
                      <td>{p.referenceNumber || '—'}</td>
                      <td>{p.account?.accountName || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--teal-600)' }}>
                        {p.currency} {p.amount?.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${p.status === 'Recorded' ? 'badge-success' : 'badge-danger'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
