import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Branches from './pages/Branches';
import Users from './pages/Users';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import FollowUps from './pages/FollowUps';
import Quotations from './pages/Quotations';
import QuotationDetail from './pages/QuotationDetail';
import Shipments from './pages/Shipments';
import ShipmentDetail from './pages/ShipmentDetail';

// Phase 4 Financial Pages
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import CreateInvoice from './pages/CreateInvoice';
import CustomerReceipts from './pages/CustomerReceipts';
import Suppliers from './pages/Suppliers';
import SupplierDetail from './pages/SupplierDetail';
import SupplierBills from './pages/SupplierBills';
import SupplierPayments from './pages/SupplierPayments';
import Expenses from './pages/Expenses';
import CashBank from './pages/CashBank';
import CustomerLedger from './pages/CustomerLedger';
import SupplierLedger from './pages/SupplierLedger';
import AccountsReceivable from './pages/AccountsReceivable';
import AccountsPayable from './pages/AccountsPayable';
import ProfitLoss from './pages/ProfitLoss';

// Phase 6: Reports & Settings
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Phase 5 Customer Portal Pages
import { PortalAuthProvider, usePortalAuth } from './context/PortalAuthContext';
import PortalLayout from './pages/portal/PortalLayout';
import PortalLogin from './pages/portal/PortalLogin';
import PortalDashboard from './pages/portal/PortalDashboard';
import MyQuotations from './pages/portal/MyQuotations';
import PortalQuotationDetail from './pages/portal/PortalQuotationDetail';
import MyShipments from './pages/portal/MyShipments';
import PortalShipmentDetail from './pages/portal/PortalShipmentDetail';
import MyDocuments from './pages/portal/MyDocuments';
import MyInvoices from './pages/portal/MyInvoices';
import PortalInvoiceDetail from './pages/portal/PortalInvoiceDetail';
import PortalProfile from './pages/portal/PortalProfile';
import PortalAcceptInvitation from './pages/portal/PortalAcceptInvitation';
import PortalResetPassword from './pages/portal/PortalResetPassword';
import PortalAccountsAdmin from './pages/PortalAccountsAdmin';

import NotFound from './pages/NotFound';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          color: 'var(--slate-600)',
        }}
      >
        Loading FreightERP Workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Portal Protected Route wrapper
function PortalProtectedRoute({ children }) {
  const { portalUser, loading } = usePortalAuth();

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-ui)',
          color: 'var(--slate-600)',
        }}
      >
        Loading FreightERP Customer Portal...
      </div>
    );
  }

  if (!portalUser) {
    return <Navigate to="/portal/login" replace />;
  }

  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <PortalAuthProvider>
      <Routes>
        {/* ========================================================= */}
        {/* PHASE 5: CUSTOMER SELF-SERVICE PORTAL ROUTES             */}
        {/* ========================================================= */}
        <Route path="/portal/login" element={<PortalLogin />} />
        <Route path="/portal/accept-invitation" element={<PortalAcceptInvitation />} />
        <Route path="/portal/reset-password" element={<PortalResetPassword />} />

        <Route
          path="/portal"
          element={
            <PortalProtectedRoute>
              <PortalLayout />
            </PortalProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/portal/dashboard" replace />} />
          <Route path="dashboard" element={<PortalDashboard />} />
          <Route path="quotations" element={<MyQuotations />} />
          <Route path="quotations/:id" element={<PortalQuotationDetail />} />
          <Route path="shipments" element={<MyShipments />} />
          <Route path="shipments/:id" element={<PortalShipmentDetail />} />
          <Route path="documents" element={<MyDocuments />} />
          <Route path="invoices" element={<MyInvoices />} />
          <Route path="invoices/:id" element={<PortalInvoiceDetail />} />
          <Route path="profile" element={<PortalProfile />} />
        </Route>

        {/* ========================================================= */}
        {/* INTERNAL FREIGHTERP STAFF OPERATIONS ROUTES               */}
        {/* ========================================================= */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="branches" element={<Branches />} />
          <Route path="users" element={<Users />} />
          
          {/* Phase 2: CRM & Quotation Management Live Routes */}
          <Route path="leads" element={<Leads />} />
          <Route path="customers" element={<Customers />} />
          <Route path="follow-ups" element={<FollowUps />} />
          <Route path="portal-accounts" element={<PortalAccountsAdmin />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/:id" element={<QuotationDetail />} />
          <Route path="crm" element={<Navigate to="/leads" replace />} />

          {/* Phase 3: Freight & Shipment Management Live Routes */}
          <Route path="shipments" element={<Shipments />} />
          <Route path="shipments/:id" element={<ShipmentDetail />} />

          {/* Phase 4: Invoicing & Financial Management Live Routes */}
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="receipts" element={<CustomerReceipts />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/:id" element={<SupplierDetail />} />
          <Route path="supplier-bills" element={<SupplierBills />} />
          <Route path="supplier-payments" element={<SupplierPayments />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="cash-bank" element={<CashBank />} />
          
          {/* Phase 4 Financial Reports */}
          <Route path="customer-ledger" element={<CustomerLedger />} />
          <Route path="supplier-ledger" element={<SupplierLedger />} />
          <Route path="accounts-receivable" element={<AccountsReceivable />} />
          <Route path="accounts-payable" element={<AccountsPayable />} />
          <Route path="profit-loss" element={<ProfitLoss />} />

          {/* Phase 6: Reports & System Settings */}
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />

          {/* Redirect aliases */}
          <Route path="invoicing" element={<Navigate to="/invoices" replace />} />
          <Route path="accounting" element={<Navigate to="/cash-bank" replace />} />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalAuthProvider>
  );
}
