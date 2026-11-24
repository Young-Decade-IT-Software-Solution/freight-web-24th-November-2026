import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Receipt,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Ship,
  DollarSign,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateInvoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shipmentParam = searchParams.get('shipmentId');

  const { user, isSuperAdmin } = useAuth();

  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    branchId: '',
    customerId: '',
    shipmentId: shipmentParam || '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    paymentTerms: 'Net 30',
    currency: 'USD',
    taxRate: 5,
    discount: 0,
    notes: 'Thank you for your business. Please remit payment according to terms.',
    termsAndConditions: 'All business transacted subject to standard freight forwarding conditions. Late payments incur 1.5% monthly interest.',
    lineItems: [
      { description: 'Freight Carriage Charges', quantity: 1, unitPrice: 0, amount: 0 },
    ],
    status: 'Issued',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchRes, custRes, shipRes] = await Promise.all([
          api.get('/branches'),
          api.get('/customers'),
          api.get('/shipments'),
        ]);
        setBranches(branchRes.data.data || []);
        setCustomers(custRes.data.data || []);
        setShipments(shipRes.data.data || []);

        if (shipmentParam) {
          const matchedShip = shipRes.data.data?.find(s => s._id === shipmentParam);
          if (matchedShip) {
            setFormData(prev => ({
              ...prev,
              shipmentId: matchedShip._id,
              customerId: matchedShip.customer?._id || matchedShip.customer || '',
              branchId: matchedShip.branch?._id || matchedShip.branch || '',
              lineItems: [
                {
                  description: `Freight Charges - ${matchedShip.freightType} (${matchedShip.origin} to ${matchedShip.destination})`,
                  quantity: 1,
                  unitPrice: matchedShip.totalCharges || 1000,
                  amount: matchedShip.totalCharges || 1000,
                },
              ],
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load dependencies', err);
      }
    };
    fetchData();
  }, [shipmentParam]);

  const handleLineItemChange = (index, field, value) => {
    const updated = [...formData.lineItems];
    updated[index][field] = value;

    const qty = Number(updated[index].quantity) || 0;
    const price = Number(updated[index].unitPrice) || 0;
    updated[index].amount = Math.round(qty * price * 100) / 100;

    setFormData({ ...formData, lineItems: updated });
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { description: '', quantity: 1, unitPrice: 0, amount: 0 },
      ],
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length === 1) return;
    const updated = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: updated });
  };

  // Financial calculations
  const subtotal = formData.lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const discountAmount = Math.min(Number(formData.discount) || 0, subtotal);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * ((Number(formData.taxRate) || 0) / 100) * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const handleSubmit = async (statusToSet = 'Issued') => {
    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }
    if (formData.lineItems.some(i => !i.description.trim() || Number(i.unitPrice) <= 0)) {
      setError('Please provide valid descriptions and unit prices for all line items');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...formData,
        status: statusToSet,
        discount: Number(formData.discount) || 0,
        taxRate: Number(formData.taxRate) || 0,
      };

      const res = await api.post('/invoices', payload);
      setSuccess('Invoice created successfully!');
      setTimeout(() => {
        navigate(`/invoices/${res.data.data._id}`);
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/invoices')}
            style={{ marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            Back to Invoices
          </button>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt className="text-teal" size={26} />
            Create Commercial Invoice
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit('Draft')}
            disabled={loading}
          >
            <Save size={16} />
            Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit('Issued')}
            disabled={loading}
          >
            <CheckCircle size={16} />
            Create & Issue Invoice
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '1.25rem' }}>
          Invoice Details & Customer Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {isSuperAdmin && (
            <div className="form-group">
              <label className="form-label">Branch *</label>
              <select
                className="input-select"
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
              >
                <option value="">Select Branch</option>
                {branches.map(b => (
                  <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className="input-select"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c._id} value={c._id}>{c.companyName} ({c.contactPerson})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Linked Shipment (Optional)</label>
            <select
              className="input-select"
              value={formData.shipmentId}
              onChange={(e) => {
                const sId = e.target.value;
                const ship = shipments.find(s => s._id === sId);
                setFormData(prev => ({
                  ...prev,
                  shipmentId: sId,
                  customerId: ship?.customer?._id || ship?.customer || prev.customerId,
                }));
              }}
            >
              <option value="">Standalone Invoice (No Shipment)</option>
              {shipments.map(s => (
                <option key={s._id} value={s._id}>{s.shipmentNumber} - {s.customer?.companyName || 'Shipment'}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Currency *</label>
            <select
              className="input-select"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="TRY">TRY - Turkish Lira</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Date *</label>
            <input
              type="date"
              className="input-text"
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input
              type="date"
              className="input-text"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <select
              className="input-select"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 7">Net 7 Days</option>
              <option value="Net 15">Net 15 Days</option>
              <option value="Net 30">Net 30 Days</option>
              <option value="Net 60">Net 60 Days</option>
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', margin: 0 }}>
              Invoice Line Items
            </h3>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={addLineItem}
            >
              <Plus size={14} />
              Add Item
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Description *</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Quantity</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Unit Price ({formData.currency})</th>
                  <th style={{ width: '15%', textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        className="input-text"
                        placeholder="e.g. Ocean Freight 40ft Container"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        className="input-text"
                        style={{ textAlign: 'right' }}
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-text"
                        style={{ textAlign: 'right' }}
                        value={item.unitPrice}
                        onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                        required
                      />
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formData.currency} {item.amount.toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon text-danger"
                          onClick={() => removeLineItem(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations / Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <div style={{ width: '340px', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--slate-600)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>{formData.currency} {subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--slate-600)' }}>Discount ({formData.currency}):</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-text"
                style={{ width: '100px', textAlign: 'right', padding: '0.25rem 0.5rem' }}
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--slate-600)' }}>Tax Rate (%):</span>
              <input
                type="number"
                step="0.1"
                min="0"
                className="input-text"
                style={{ width: '100px', textAlign: 'right', padding: '0.25rem 0.5rem' }}
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--slate-600)' }}>Tax Amount:</span>
              <span>{formData.currency} {taxAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--slate-300)', paddingTop: '0.75rem', fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              <span>Total:</span>
              <span>{formData.currency} {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
          <div className="form-group">
            <label className="form-label">Invoice Notes</label>
            <textarea
              className="input-textarea"
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Terms & Conditions</label>
            <textarea
              className="input-textarea"
              rows="3"
              value={formData.termsAndConditions}
              onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
