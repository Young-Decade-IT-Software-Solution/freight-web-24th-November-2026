import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  AlertCircle,
  Building2,
  CheckCircle2,
  ArrowRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import LanguageSwitcher from '../../components/Common/LanguageSwitcher';
import portalApi from '../../services/portalApi';

export default function PortalLogin() {
  const navigate = useNavigate();
  const { login } = usePortalAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/portal/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    const res = await login(demoEmail, demoPassword);
    setLoading(false);

    if (res.success) {
      navigate('/portal/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg('');
    try {
      const res = await portalApi.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMsg(res.data?.message || 'Password reset link sent to your registered email.');
    } catch (err) {
      setForgotMsg(err.response?.data?.message || 'Failed to request password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {/* Top Bar with Language Selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #0D9488 0%, #0284C7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            F
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem' }}>FreightERP</div>
            <div style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Customer Self-Service Portal</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <LanguageSwitcher />
          <Link
            to="/login"
            style={{
              color: '#94A3B8',
              fontSize: '0.85rem',
              textDecoration: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            Staff ERP Login <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main Login Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: 440,
            width: '100%',
            backgroundColor: '#1E293B',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                color: '#38BDF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#F8FAFC', margin: '0 0 0.5rem 0' }}>
              Customer Portal Login
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', margin: 0 }}>
              Secure 24/7 access to your freight shipments, quotations, and commercial documents
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#FCA5A5',
                padding: '0.75rem 1rem',
                borderRadius: 8,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                Account Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: 12,
                    color: '#64748B',
                  }}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@company.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.4rem',
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#F8FAFC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 500, color: '#CBD5E1' }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#38BDF8',
                    fontSize: '0.775rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    left: 12,
                    color: '#64748B',
                  }}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.4rem',
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    color: '#F8FAFC',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
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
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.15s',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Customer Sign-in buttons */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', textAlign: 'center', marginBottom: '0.75rem' }}>
              Quick Demo Access
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemoLogin('sarah@apexglobal.com', 'Freight123!')}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#38BDF8',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Demo Customer: Apex Global</span>
                <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>1-Click Login →</span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('alex@orienttrades.com', 'Freight123!')}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#38BDF8',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Demo Customer: Orient Trades</span>
                <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>1-Click Login →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: 400,
              width: '100%',
              backgroundColor: '#1E293B',
              borderRadius: 12,
              padding: '1.75rem',
              border: '1px solid #334155',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#F8FAFC', fontSize: '1.15rem' }}>
              Reset Portal Password
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Enter your registered portal email to receive a password reset link.
            </p>

            {forgotMsg && (
              <div
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'rgba(13, 148, 136, 0.2)',
                  border: '1px solid #0D9488',
                  color: '#5EEAD4',
                  borderRadius: 6,
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {forgotMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="registered@customer.com"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: 6,
                  color: '#F8FAFC',
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #475569',
                    color: '#94A3B8',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#0284C7',
                    border: 'none',
                    color: '#FFFFFF',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {forgotLoading ? 'Sending...' : 'Request Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
