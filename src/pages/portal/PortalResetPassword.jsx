import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import portalApi from '../../services/portalApi';

export default function PortalResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!token) {
      setMsg({ type: 'error', text: 'Password reset token is missing from the link.' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    if (password !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const res = await portalApi.post('/auth/reset-password', { token, password });
      setMsg({ type: 'success', text: res.data?.message || 'Password updated successfully!' });
      setTimeout(() => navigate('/portal/login'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to reset password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'var(--font-ui)' }}>
      <div style={{ maxWidth: 440, width: '100%', backgroundColor: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.5rem 0' }}>
            Reset Portal Password
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
            Enter your new secure password below to restore access
          </p>
        </div>

        {msg && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 8,
              backgroundColor: msg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: `1px solid ${msg.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: msg.type === 'success' ? '#6EE7B7' : '#FCA5A5',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
              New Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type password"
              style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/portal/login" style={{ color: '#94A3B8', fontSize: '0.85rem', textDecoration: 'none' }}>
            Back to Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}
