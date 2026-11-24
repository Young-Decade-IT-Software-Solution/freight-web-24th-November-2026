import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Ship,
  FolderOpen,
  Receipt,
  User,
  LogOut,
  Building2,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { usePortalAuth } from '../../context/PortalAuthContext';
import LanguageSwitcher from '../../components/Common/LanguageSwitcher';

export default function PortalLayout() {
  const { portalUser, portalCustomer, logout } = usePortalAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/portal/login');
  };

  const navItems = [
    { to: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/portal/quotations', label: 'My Quotations', icon: FileText },
    { to: '/portal/shipments', label: 'My Shipments', icon: Ship },
    { to: '/portal/documents', label: 'My Documents', icon: FolderOpen },
    { to: '/portal/invoices', label: 'Invoices & Statements', icon: Receipt },
    { to: '/portal/profile', label: 'My Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC', fontFamily: 'var(--font-ui)' }}>
      {/* Top Portal Header */}
      <header
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand & Customer Company */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/portal/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
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
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  FreightERP
                </div>
                <div style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 500 }}>
                  Customer Portal
                </div>
              </div>
            </Link>

            {/* Customer Company Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(255,255,255,0.08)',
                padding: '0.35rem 0.85rem',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Building2 size={15} color="#38BDF8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F1F5F9' }}>
                {portalCustomer?.companyName || 'Customer Account'}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  backgroundColor: 'rgba(56, 189, 248, 0.2)',
                  color: '#38BDF8',
                  padding: '0.15rem 0.45rem',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                {portalCustomer?.customerCode || 'PORTAL'}
              </span>
            </div>
          </div>

          {/* Right actions: Language, User Info, Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <LanguageSwitcher />

            {/* User Profile pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                paddingInlineStart: '0.75rem',
                borderInlineStart: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  color: '#38BDF8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                {portalUser?.name?.charAt(0) || 'C'}
              </div>
              <div style={{ display: 'none', md: 'block' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#F8FAFC', lineHeight: 1.2 }}>
                  {portalUser?.name || 'Customer User'}
                </div>
                <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                  {portalUser?.email || ''}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.8rem',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#F87171';
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#94A3B8';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Secondary Subnav Bar */}
        <div
          style={{
            backgroundColor: '#1E293B',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '0 1.5rem',
          }}
        >
          <div
            style={{
              maxWidth: 1400,
              margin: '0 auto',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/portal/dashboard'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1rem',
                    color: isActive ? '#38BDF8' : '#94A3B8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? '2px solid #38BDF8' : '2px solid transparent',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Page Outlet */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem' }}>
        <Outlet />
      </main>

      {/* Portal Footer */}
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '1.25rem 1.5rem',
          color: '#64748B',
          fontSize: '0.825rem',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <strong>FreightERP</strong> Customer Self-Service Portal • Authorized Customer Access Only
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Need assistance? Contact your designated operations manager.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
