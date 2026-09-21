# Courts Management Command Centre — Project Handover & System Reference

> **Target Audience:** Engineers, AI assistants, and system administrators developing, configuring, or maintaining this codebase. This document outlines the system architecture, balanced Python API pipeline, session authentication lifecycle, chart implementations, and deployment workflows.

---

## 1. Project Overview & Context

**Courts Management Command Centre** is an enterprise-grade management, analytics, and operational dashboard built for retail, wholesale, and multi-location branch warehouse operations.

- **Frontend Tech Stack:** React 19, Vite, Recharts, Lucide Icons, Vanilla CSS Design System with Glassmorphism.
- **Backend Architecture:** Native Frappe App (`courts_management`) with a dedicated, balanced server-side Python API (`courts_management/api.py`).
- **Deployment Model:** Packaged as an installable Frappe application with pre-compiled production assets committed directly in `courts_management/public/courts/`. The production server does not require Node.js or Vite installed to deploy the dashboard.
- **Access Route:** Standalone full-screen web portal at `http://<server-ip-or-domain>/courts`. The ERPNext Desk Page has been completely removed to keep the Desk interface clean and unencumbered.

---

## 2. Directory Layout & Key Files

```
courts_management/ (Repository Root)
├── setup.py                                <-- Python package installer (PEP compliant)
├── pyproject.toml                          <-- Build system definitions
├── requirements.txt                        <-- Python dependencies
├── README.md                               <-- Server installation summary
├── license.txt                             <-- MIT license
├── INSTALLATION_GUIDE.md                   <-- Bench installation and setup guide
├── PROJECT_WORKFLOW_AND_ARCHITECTURE.md    <-- System workflow documentation
├── PROJECT_HANDOVER.md                     <-- (This file) Complete technical handover
│
├── courts_management/                      <-- THE FRAPPE APP PYTHON MODULE
│   ├── __init__.py                         <-- Package version
│   ├── hooks.py                            <-- App metadata & portal route (/courts)
│   ├── modules.txt                         <-- Module declaration ("Courts Management")
│   ├── patches.txt                         <-- Database patches (if needed)
│   ├── api.py                              <-- HIGH-PERFORMANCE SERVER-SIDE PYTHON API
│   │                                           • get_dashboard_data() [MariaDB SQL analytics]
│   │                                           • get_report_rows() [Paginated report queries]
│   ├── public/courts/                      <-- Pre-compiled production React build
│   │   ├── index.html                      <-- Mount point
│   │   └── assets/                         <-- JS bundle, CSS tokens, and hero banner image
│   │       ├── index-*.js                  <-- Minified React 19 application (741 KB)
│   │       ├── index-*.css                 <-- Design system CSS tokens
│   │       └── courts-reference-hero.jpg   <-- Honeycomb visual command centre banner
│   └── www/
│       ├── courts.py                       <-- Portal controller (disables cache, injects CSRF)
│       └── courts.html                     <-- Portal HTML template mounting the React app
│
└── frontend/                               <-- REACT 19 FRONTEND SOURCE CODE
    ├── package.json                        <-- Frontend dependencies & scripts
    ├── vite.config.js                      <-- Vite config with relative base: './'
    ├── erpnext.config.json                 <-- Dev proxy configuration
    ├── scripts/
    │   └── package-frappe.js               <-- Build & sync script into courts_management/
    └── src/
        ├── App.jsx                         <-- Master state, session router & auth gate
        ├── main.jsx                        <-- React entry point & ErrorBoundary
        ├── api/
        │   ├── erpnextClient.js            <-- Fetch client with dynamic CSRF & origin binding
        │   ├── dashboardApi.js             <-- Calls Python backend (get_dashboard_data)
        │   └── erpnextDashboardMapper.js   <-- Data normalization utilities
        ├── config/
        │   └── erpConfig.js                <-- Zero-config window.location.origin detection
        ├── components/
        │   ├── auth/
        │   │   └── LoginRequired.jsx       <-- Clean, dedicated Courts Dashboard login screen
        │   ├── commandCentre/              <-- Hero banner & operational hubs
        │   ├── dashboard/                  <-- KPI overview cards & store performance
        │   ├── sales/                      <-- Sales invoices & salesman leaderboards
        │   ├── inventory/                  <-- Stock bins, valuation & warehouse matrix
        │   ├── purchases/                  <-- Procurement invoices & supplier spend
        │   ├── finance/                    <-- Profit & loss statement & General Ledger
        │   ├── reports/                    <-- 7 Cart-based interactive paginated reports
        │   └── salesInventory/             <-- Stock vs sales correlation matrix
        └── styles/                         <-- Design tokens, layouts & glassmorphic badges
```

---

## 3. Balanced Server-Side Python API Architecture

### Architectural Evolution
Previously, the frontend queried 9 separate raw Frappe REST DocType endpoints (`/api/resource/Sales Invoice`, `/Bin`, `/Item`, `/GL Entry`, etc.) in parallel, downloading thousands of un-aggregated rows over HTTP and doing heavy client-side JavaScript math in the browser. This capped data at 1,000 records, created high network latency, and increased client CPU usage.

### The New Balanced Pipeline
All business intelligence aggregations are now executed on the MariaDB database server via **`courts_management.api.get_dashboard_data`**:

```
 ┌────────────────────────────────────────────────────────┐
 │            MariaDB Database Server (ERPNext)           │
 │  • Fast SUM(grand_total) over all 1,400+ invoices     │
 │  • Multi-warehouse Bin & Stock Valuation grouping      │
 │  • Daily/Weekly sales time-series aggregation          │
 └───────────────────────────┬────────────────────────────┘
                             │ (Fast SQL subqueries < 150ms)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │        Python Backend: courts_management.api           │
 │  • get_dashboard_data()                                │
 │  • get_report_rows(report_id, start, limit)            │
 └───────────────────────────┬────────────────────────────┘
                             │ (Single lightweight JSON payload)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │             React 19 Frontend Client                   │
 │  • 1 single API call via dashboardApi.js               │
 │  • Bundle size dropped from 1,036 KB to 741 KB         │
 │  • Immediate rendering with zero calculation lag       │
 └────────────────────────────────────────────────────────┘
```

#### Key API Methods in `courts_management/api.py`:
1. **`get_dashboard_data()`**:
   - **Sales Intelligence:** Aggregates total gross revenue, invoice count, today's sales, and daily trend time-series across all submitted invoices.
   - **Procurement & Payables:** Aggregates total purchase spend, purchase invoice count, and supplier totals.
   - **Inventory & Bins:** Calculates total stock units and asset valuation across all 800+ bins and leaf warehouses (POM, 8 MILE, LAE, CELLARMASTER).
   - **Leaderboards:** Computes top customers, top suppliers, top selling items, and warehouse revenue shares directly in SQL.
   - **Stock vs Sales:** Generates store-level stock velocity and coverage ratios.
2. **`get_report_rows(report_id, start=0, limit=20, filters=None)`**:
   - Provides server-side pagination (`LIMIT` and `OFFSET`) for the 7 cart-based operational reports.

---

## 4. Hero Banner & Visual Asset Architecture

The dashboard starting page features the **Courts Stronger Together** interactive operations hub:
- **Visual Asset:** `courts-reference-hero.jpg` (displays the Courts exterior with palm trees, "Stronger Together", and "Better Homes, Brighter Lives").
- **Interactive Honeycomb Hubs:** Six interactive hotspot badges surrounding the central Courts logo:
  1. **Stores** (Top): Navigates to Warehouse & Store performance.
  2. **Sales** (Upper-Left): Displays today's live revenue and routes to Sales Analytics.
  3. **Inventory** (Upper-Right): Displays active stock units and routes to Inventory.
  4. **People** (Lower-Left): Displays active customer count and routes to Customer Intelligence.
  5. **Finance** (Lower-Right): Displays procurement totals and routes to Finance & GL.
  6. **Center Hub**: Resets to Command Centre overview.
- **Multi-Route Path Resolution:**
  The image asset is served and verified across three routes:
  - `/assets/courts_management/courts/assets/courts-reference-hero.jpg`
  - `/assets/courts_management/courts-reference-hero.jpg`
  - `/assets/courts-reference-hero.jpg`
  [`Hero.jsx`](file:///home/adv/courts-frappe/apps/courts_management/frontend/src/components/commandCentre/Hero.jsx) implements automatic cascading fallbacks on error (`onError`) to ensure 100% reliable rendering under any reverse proxy or sub-path setup.

---

## 5. Security & Session-Based Authentication Lifecycle

The authentication system is strictly session-based and adheres to enterprise security standards:

### 1. Dedicated Courts Login Screen (`LoginRequired.jsx`)
- Clean, focused interface containing:
  - Courts branding
  - **Username or Email** field
  - **Password** field
  - **Sign In** button with a loading spinner
  - Real-time error alerts for invalid credentials or expired sessions
- **Removed Elements:**
  - Removed "Target Server" badge.
  - Removed "Configured URL" footer.
  - Removed "Launch with Live System Snapshot" and mock preview buttons.

### 2. Pure Session-Based Authentication Flow
- **Session Verification on Mount:**
  When `/courts` opens, the client checks `/api/method/frappe.auth.get_logged_user`.
  - If a valid session cookie exists and user is not `'Guest'`, the live dashboard loads immediately.
  - If no session exists or user is `'Guest'`, the clean login form is rendered.
- **Sign In:**
  Submitting credentials calls `/api/method/login` with `usr` and `pwd`. Frappe validates the account and sets the session cookie (`sid`). If credentials are invalid, an error is shown; no mock or bypass data is ever loaded.
- **Automatic Session Expiry Detection:**
  In [`erpnextClient.js`](file:///home/adv/courts-frappe/apps/courts_management/frontend/src/api/erpnextClient.js), if any request returns `401` or `403` (or `SessionExpired`), a `courts:session-expired` event is dispatched. [`App.jsx`](file:///home/adv/courts-frappe/apps/courts_management/frontend/src/App.jsx) catches this event, clears cached dashboard state, and redirects to the login screen with `"Your session has expired. Please sign in again."`
- **Logout:**
  Clicking "Sign Out" in the user profile menu calls `/api/method/logout`, destroys the session cookie, and resets the interface to the login screen.

### 3. Dynamic Browser Origin Binding (`erpConfig.js`)
- `ERPNEXT_URL` and `ERPNEXT_HOST` dynamically resolve directly from `window.location.origin` and `window.location.hostname`.
- All API requests use relative paths (`/api/...`), so moving the site to a new server IP, domain, or port requires **zero code or configuration changes**.

---

## 6. Comprehensive Catalog of All Charts & Reports

### Charts & Visualizations
1. **Sales Trend Spline Area Chart (`SalesChart.jsx`):**
   - Recharts cubic spline (`type="monotone"`) with gradient fill (`#1264d8` to transparent).
   - Time aggregation selector: Daily, Weekly, and Monthly sales.
2. **Warehouse Conic-Gradient Donut Chart (`DashboardDonut.jsx`):**
   - Pure CSS `conic-gradient` with dynamic stop calculation from live inventory.
   - Interactive warehouse filter dropdown (`All Warehouses` or branch-specific).
3. **Inventory Valuation & Bin Quantity Bar Chart (`InventoryChart.jsx`):**
   - Compares warehouse stock capacity and reorder levels.
4. **Procurement & Supplier Spend Chart (`PurchaseChart.jsx`):**
   - Visualizes procurement outflows over time.
5. **Hexagonal Stock vs Sales Correlation (`SalesInventoryPage.jsx`):**
   - 3D hexagonal badge layout comparing stock quantities versus sales velocity to highlight fast-moving vs dead stock.

### Cart-Based Operational Reports (`ReportsPage.jsx`)
Seven modular report carts with live execution, column sorting, filters, 20-row pagination, and **Export to CSV**:
1. **Sales Register:** Invoices, customer names, posting dates, payment status, grand total.
2. **Stock Balance Ledger:** Warehouse bin balances, actual quantities, valuation rates.
3. **Purchase Register:** Supplier invoices, billed totals, trade replenishment.
4. **Commercial Profit & Loss:** Income, COGS, and operating gross margin.
5. **Store Matrix:** Branch store sales, active bins, inventory valuation.
6. **General Ledger:** GL transaction entries, accounts, debits, credits, and vouchers.
7. **Salesman POS Register:** POS register breakdown by cashier/salesperson, invoice numbers, and payment tenders.

---

## 7. How to Access the App

| Route | Type | URL |
|---|---|---|
| **Standalone Command Centre** | Full-screen web application | `http://<server-ip-or-domain>/courts` |

> [!NOTE]
> The Desk Page (`/app/courts-dashboard`) was intentionally deleted so that ERPNext Desk remains clean. The entire application runs independently under the `/courts` portal route.

---

## 8. Build, Packaging & Server Deployment Guide

### Making Frontend Changes:
```bash
# 1. Navigate to the frontend directory
cd /home/adv/courts-frappe/apps/courts_management/frontend

# 2. Re-compile the React bundle with Vite
npm run build

# 3. Package assets and sync into the Frappe app
node scripts/package-frappe.js
```

### Deploying on the Bench Server:
```bash
cd /home/adv/courts-frappe

# 1. Build assets
bench build --app courts_management

# 2. Clear cache
bench --site courts.anantdv.com clear-cache

# 3. Reload gunicorn workers to pick up api.py changes
# (Killing the master gunicorn process triggers supervisor to restart it with preloaded code)
ps -ef | grep "/home/adv/courts-frappe/env/bin/gunicorn" | grep -v grep | head -n 1 | awk '{print $2}' | xargs kill
```
