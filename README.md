# FreightERP — Web Application & Customer Portal

> **Global Freight Forwarding & Logistics Management ERP — Frontend Client**  
> Built with React 18, Vite 6, Plain JavaScript (JSX), React Router 7, Axios, Lucide Icons, and i18next.

---

## 1. Overview

FreightERP Web is the user interface for both internal staff operations and external client self-service across 5 international hubs (Dubai HQ, Rotterdam, Singapore, Shanghai, Istanbul).

### Key Features
- **Operations Dashboard**: Real-time KPI summaries, active shipments, pipeline volume, and multi-branch overview.
- **Branch & User Management**: Role-based access control across 5 distinct permissions (`Super Admin`, `Branch Admin`, `Sales`, `Operations`, `Accounts`).
- **CRM & Quotations**: Lead progression pipeline, customer directory, tariff calculation engine, and branded PDF generation.
- **Freight & Milestone Execution**: Ocean, Air, Road, and Multimodal shipment tracking with 8 automated milestones and document repository.
- **Financial & Accounting Management**: Commercial invoicing, customer payment receipts, supplier bills, expenses, liquid cash/bank ledgers, AR/AP aging, and P&L.
- **Reports & Analytics (Phase 6A)**: Universal date/branch/mode filters, sales KPIs, trade lane corridors, customer ledger directory, and RFC-4180 CSV export.
- **System Settings (Phase 6B)**: 7-tab configuration center managing company profile, 5 branches, financial defaults, SMTP email with live test modal, storage abstraction, and security policies.
- **Customer Self-Service Portal (`/portal`)**: Secure client portal for online quotation approval, live cargo milestone tracking, and invoice downloads.
- **Multilingual & RTL**: Full native layout support for English (`en`), Arabic (`ar` with RTL mirroring), Turkish (`tr`), and Simplified Chinese (`zh`).

---

## 2. Technology Stack

- **Framework:** React 18 + Plain JavaScript/JSX (No TypeScript)
- **Bundler / Tooling:** Vite 6
- **Routing:** React Router 7 (SPA with client-side history)
- **HTTP Client:** Axios with dynamic JWT interceptors
- **Icons:** Lucide-React
- **Internationalization:** i18next with RTL DOM direction observer
- **Styling:** Custom CSS Design System (`#0F172A` Slate Navy, `#0D9488` Teal)

---

## 3. Project Structure

```
frontend/
├── public/
│   └── _redirects          # SPA client-side routing fallback for static hosts
├── src/
│   ├── assets/             # Brand logos and styles
│   ├── components/         # Reusable UI components, Modals, Tables, Navigation Sidebar, Header
│   ├── context/            # AuthContext (Staff ERP) & PortalAuthContext (Customer Portal)
│   ├── i18n/               # Localization locales (en.json, ar.json, tr.json, zh.json)
│   ├── pages/              # Internal ERP views (Dashboard, Leads, Quotes, Shipments, Invoices, Reports, Settings, etc.)
│   │   └── portal/         # Customer Self-Service Portal views
│   ├── services/           # Axios API configuration & request helpers
│   ├── App.jsx             # Top-level routing hierarchy & route guards
│   ├── index.css           # Global typography, color tokens, and layout styles
│   └── main.jsx            # React root mount & i18n boot
├── .env.example            # Environment configuration template
├── .gitignore              # Production git exclusion rules
├── index.html              # HTML shell
├── package.json            # Frontend dependencies & scripts
├── vite.config.js          # Vite build & development proxy configuration
└── README.md               # Frontend documentation
```

---

## 4. Setup & Local Development

### Prerequisites
- Node.js >= 18.x

### Installation Steps

1. **Clone repository and install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables (Optional in Dev):**
   ```bash
   cp .env.example .env
   ```
   In local development, leaving `VITE_API_URL` empty automatically proxies all `/api` calls to `http://localhost:5000` via Vite.

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will run at `http://localhost:5173`.

4. **Build for Production:**
   ```bash
   npm run build
   ```
   Generates optimized, minified production assets in the `dist/` directory.

---

## 5. Production Deployment (e.g. Render Static Site)

1. Connect the repository to **Render Static Site**.
2. Set **Build Command**: `npm run build`.
3. Set **Publish Directory**: `dist`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend API URL (e.g., `https://freighterp-backend.onrender.com/api`).
5. **SPA Routing**: The `public/_redirects` file automatically ensures all deep links (e.g. `/reports`, `/portal/dashboard`) route to `/index.html`.
