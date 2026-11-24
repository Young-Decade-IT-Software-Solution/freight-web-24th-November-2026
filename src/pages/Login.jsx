import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Ship, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/Common/LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@freighterp.com');
  const [password, setPassword] = useState('Freight123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Freight123!');
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--navy-950)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      {/* Top right language switcher */}
      <div style={{ position: 'absolute', top: '1.5rem', insetInlineEnd: '1.5rem' }}>
        <LanguageSwitcher />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
            padding: '2rem 2rem 1.75rem 2rem',
            textAlign: 'center',
            color: '#fff',
            borderBottom: '3px solid var(--teal-500)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--teal-500) 0%, var(--teal-600) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.85rem',
              boxShadow: '0 6px 16px rgba(13, 148, 136, 0.4)',
            }}
          >
            <Ship size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.25rem' }}>
            Freight<span style={{ color: 'var(--teal-400)' }}>ERP</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)' }}>
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'var(--rose-50)',
                border: '1px solid #FECDD3',
                color: 'var(--rose-600)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingInlineStart: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    insetInlineStart: '0.85rem',
                    color: 'var(--slate-400)',
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{t('auth.password')}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingInlineStart: '2.4rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    insetInlineStart: '0.85rem',
                    color: 'var(--slate-400)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
              disabled={loading}
            >
              {loading ? t('auth.signingIn') : t('auth.signInBtn')}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Logins Helper */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-200)' }}>
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--slate-500)',
                marginBottom: '0.75rem',
                letterSpacing: '0.04em',
              }}
            >
              {t('auth.demoAccounts')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin@freighterp.com')}
                className="btn btn-outline btn-sm demo-account-btn"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <ShieldCheck size={14} color="var(--teal-600)" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('manager.rotterdam@freighterp.com')}
                className="btn btn-outline btn-sm demo-account-btn"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <UserCheck size={14} color="var(--blue-600)" />
                <span>Branch Admin (RTM)</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('sales.hq@freighterp.com')}
                className="btn btn-outline btn-sm demo-account-btn"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span>💼 Sales HQ</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('ops.hq@freighterp.com')}
                className="btn btn-outline btn-sm demo-account-btn"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                <span>📦 Ops HQ</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('accounts.hq@freighterp.com')}
                className="btn btn-outline btn-sm demo-account-btn"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start', gridColumn: 'span 2' }}
              >
                <span>💳 Accounts HQ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
