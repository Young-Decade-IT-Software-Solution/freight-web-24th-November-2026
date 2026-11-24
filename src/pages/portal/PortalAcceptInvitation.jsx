import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import portalApi from '../../services/portalApi';
import { usePortalAuth } from '../../context/PortalAuthContext';

export default function PortalAcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { loginWithSession } = usePortalAuth();

  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing in the URL.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await portalApi.get(`/auth/verify-invitation/${token}`);
        if (res.data?.success) {
          setInvitationData(res.data);
          setName(res.data.user?.name || '');
          setPhone(res.data.user?.phone || '');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Invitation is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (password.length < 6) {
      setSubmitError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await portalApi.post('/auth/accept-invitation', {
        token,
        name,
        phone,
        password,
      });

      if (res.data?.success) {
        loginWithSession(res.data.token, res.data.user, res.data.customer);
        navigate('/portal/dashboard');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to activate portal account');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Verifying your portal invitation...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: 'var(--font-ui)' }}>
      <div style={{ maxWidth: 460, width: '100%', backgroundColor: '#1E293B', borderRadius: 16, border: '1px solid #334155', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.5rem 0' }}>
            Activate Portal Access
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
            {invitationData ? (
              <>
                Invitation for <strong>{invitationData.customer?.companyName}</strong> ({invitationData.user?.email})
              </>
            ) : (
              'Customer Portal Onboarding'
            )}
          </p>
        </div>

        {error ? (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '1rem', borderRadius: 8, fontSize: '0.9rem', textAlign: 'center' }}>
            <AlertCircle size={20} style={{ display: 'block', margin: '0 auto 0.5rem auto' }} />
            {error}
            <div style={{ marginTop: '1rem' }}>
              <Link to="/portal/login" style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}>
                Go to Portal Login →
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {submitError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: 8, fontSize: '0.85rem' }}>
                {submitError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Set Account Password
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
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                style={{ width: '100%', padding: '0.75rem', backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: 8, color: '#F8FAFC', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '0.5rem',
                padding: '0.85rem',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Activating Account...' : 'Activate & Enter Portal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
