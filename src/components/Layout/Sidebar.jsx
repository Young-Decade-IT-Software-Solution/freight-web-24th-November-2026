import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  Users,
  Compass,
  UserCheck,
  Calendar,
  FileSpreadsheet,
  Ship,
  Receipt,
  CreditCard,
  Truck,
  Wallet,
  Landmark,
  FileText,
  FileBarChart,
  PieChart,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const coreNavItems = [
    {
      to: '/',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard,
      roles: ['Super Admin', 'Branch Admin', 'Sales', 'Operations', 'Accounts'],
    },
    {
      to: '/branches',
      label: t('nav.branches', 'Branch Management'),
      icon: Building2,
      roles: ['Super Admin', 'Branch Admin'],
    },
    {
      to: '/users',
      label: t('nav.users', 'User Management'),
      icon: Users,
      roles: ['Super Admin', 'Branch Admin'],
    },
    {
      to: '/leads',
      label: t('nav.leads', 'Leads (CRM)'),
      icon: Compass,
      roles: ['Super Admin', 'Branch Admin', 'Sales'],
    },
    {
      to: '/customers',
      label: t('nav.customers', 'Customers'),
      icon: UserCheck,
      roles: ['Super Admin', 'Branch Admin', 'Sales', 'Operations', 'Accounts'],
    },
    {
      to: '/follow-ups',
      label: t('nav.followups', 'Follow-Ups'),
      icon: Calendar,
      roles: ['Super Admin', 'Branch Admin', 'Sales', 'Operations'],
    },
    {
      to: '/portal-accounts',
      label: t('nav.portalAccounts', 'Portal Accounts'),
      icon: Users,
      roles: ['Super Admin', 'Branch Admin', 'Sales'],
    },
    {
      to: '/quotations',
      label: t('nav.quotations', 'Quotations'),
      icon: FileSpreadsheet,
      roles: ['Super Admin', 'Branch Admin', 'Sales'],
    },
    {
      to: '/shipments',
      label: t('nav.shipments', 'Freight & Shipments'),
      icon: Ship,
      roles: ['Super Admin', 'Branch Admin', 'Operations', 'Sales', 'Accounts'],
    },
    {
      to: '/settings',
      label: t('nav.settings', 'System Settings'),
      icon: SettingsIcon,
      roles: ['Super Admin', 'Branch Admin'],
    },
  ];

  const financialNavItems = [
    {
      to: '/invoices',
      label: t('nav.invoices', 'Invoices'),
      icon: Receipt,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/receipts',
      label: t('nav.receipts', 'Customer Receipts'),
      icon: CreditCard,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/suppliers',
      label: t('nav.suppliers', 'Suppliers / Vendors'),
      icon: Truck,
      roles: ['Super Admin', 'Branch Admin', 'Accounts', 'Operations'],
    },
    {
      to: '/supplier-bills',
      label: t('nav.supplierBills', 'Supplier Bills'),
      icon: Receipt,
      roles: ['Super Admin', 'Branch Admin', 'Accounts', 'Operations'],
    },
    {
      to: '/supplier-payments',
      label: t('nav.supplierPayments', 'Supplier Payments'),
      icon: CreditCard,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/expenses',
      label: t('nav.expenses', 'Expenses'),
      icon: Wallet,
      roles: ['Super Admin', 'Branch Admin', 'Accounts', 'Operations'],
    },
    {
      to: '/cash-bank',
      label: t('nav.cashBank', 'Cash & Bank'),
      icon: Landmark,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
  ];

  const reportNavItems = [
    {
      to: '/reports',
      label: t('nav.reports', 'Reports & Analytics'),
      icon: BarChart3,
      roles: ['Super Admin', 'Branch Admin', 'Sales', 'Operations', 'Accounts'],
    },
    {
      to: '/customer-ledger',
      label: t('nav.customerLedger', 'Customer Ledger'),
      icon: FileText,
      roles: ['Super Admin', 'Branch Admin', 'Accounts', 'Sales'],
    },
    {
      to: '/supplier-ledger',
      label: t('nav.supplierLedger', 'Supplier Ledger'),
      icon: FileText,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/accounts-receivable',
      label: t('nav.arAging', 'AR Aging'),
      icon: FileBarChart,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/accounts-payable',
      label: t('nav.apAging', 'AP Aging'),
      icon: FileBarChart,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
    {
      to: '/profit-loss',
      label: t('nav.profitLoss', 'Profit & Loss'),
      icon: PieChart,
      roles: ['Super Admin', 'Branch Admin', 'Accounts'],
    },
  ];

  const filterAllowed = (items) => items.filter((item) => user?.role ? item.roles.includes(user.role) : false);

  const allowedCore = filterAllowed(coreNavItems);
  const allowedFinancial = filterAllowed(financialNavItems);
  const allowedReports = filterAllowed(reportNavItems);

  return (
    <>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">
              <Ship size={20} />
            </div>
            <div className="brand-text">
              Freight<span>ERP</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'none', color: '#fff' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Core Operations Section */}
          <div className="nav-section-title">Core Operations</div>
          {allowedCore.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* Financial Management Section */}
          {allowedFinancial.length > 0 && (
            <>
              <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>Financial Management</div>
              {allowedFinancial.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}

          {/* Financial Reports Section */}
          {allowedReports.length > 0 && (
            <>
              <div className="nav-section-title" style={{ marginTop: '1.25rem' }}>Financial Reports</div>
              {allowedReports.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={18} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* User Footer Card */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ERP'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role-badge">
                <ShieldCheck size={11} style={{ marginRight: '3px' }} />
                {user?.role || 'User'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-logout"
            onClick={logout}
            title={t('nav.logout', 'Sign Out')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
