import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Save,
  KeyRound,
} from 'lucide-react';
import portalApi from '../../services/portalApi';
import { usePortalAuth } from '../../context/PortalAuthContext';

export default function PortalProfile() {
  const { portalUser, portalCustomer, updateLocalProfile } = usePortalAuth();

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  useEffect(() => {
    if (portalUser) {
      setName(portalUser.name || '');
      setPhone(portalUser.phone || portalCustomer?.phone || '');
      setAddress(portalCustomer?.address || '');
    }
  }, [portalUser, portalCustomer]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const res = await portalApi.put('/profile', { name, phone, address });
      if (res.data?.success) {
        updateLocalProfile(res.data.data.user, res.data.data.customer);
        setProfileMsg({ type: 'success', text: 'Contact details updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setPwLoading(true);
    try {
      const res = await portalApi.put('/profile/password', { currentPassword, newPassword });
      if (res.data?.success) {
        setPwMsg({ type: 'success', text: 'Your password has been changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
          Customer Account & Security Profile
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>
          Manage your contact representative information and security credentials
        </p>
      </div>

      {/* Company Record Overview Card (Read-only company facts) */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Building size={20} color="#0284C7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Company Commercial Information
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Company Name</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{portalCustomer?.companyName}</span>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Customer Code</span>
            <span style={{ fontWeight: 700, color: '#0284C7' }}>{portalCustomer?.customerCode}</span>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Country / Region</span>
            <span style={{ fontWeight: 600, color: '#334155' }}>{portalCustomer?.country || 'United Arab Emirates'}</span>
          </div>
          <div>
            <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Account Currency</span>
            <span style={{ fontWeight: 600, color: '#334155' }}>{portalCustomer?.currency || 'USD'}</span>
          </div>
          {portalCustomer?.taxNumber && (
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Tax / VAT Registration</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{portalCustomer.taxNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Person Form */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <User size={20} color="#0284C7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Contact Representative Details
          </h2>
        </div>

        {profileMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              backgroundColor: profileMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
              color: profileMsg.type === 'success' ? '#166534' : '#991B1B',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Registered Email (Login ID)
            </label>
            <input
              type="email"
              disabled
              value={portalUser?.email || ''}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Direct Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Commercial Office Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, Street, City, Country"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={profileLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: profileLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <Save size={16} /> {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <KeyRound size={20} color="#0284C7" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Change Portal Password
          </h2>
        </div>

        {pwMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 8,
              backgroundColor: pwMsg.type === 'success' ? '#DCFCE7' : '#FEE2E2',
              color: pwMsg.type === 'success' ? '#166534' : '#991B1B',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
            }}
          >
            {pwMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{pwMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={pwLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: pwLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <Lock size={16} /> {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
