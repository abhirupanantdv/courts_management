# Courts Management Command Centre — Project Workflow & System Architecture

This document outlines the system architecture, balanced Python API workflows, data pipelines, session authentication lifecycle, access methods, and codebase structure for the **Courts Management Command Centre**.

---

## 1. Executive Summary & Project Purpose

**Courts Management Command Centre** is an enterprise-grade retail, wholesale, and branch warehouse operations dashboard developed with React 19, Vite, Recharts, and Lucide Icons, backed by a dedicated high-performance server-side Python API (`courts_management.api`) running on Frappe Framework.

### Core Value & Capabilities
- **Executive Operations View:** Live revenue KPIs, gross margin tracking, operating liquidity, and inventory asset valuation.
- **Sales Intelligence:** Real-time billing from verified invoices, branch store sales leaderboards, salesman POS registers, and time-series trends.
- **Inventory & Bin Intelligence:** Warehouse-level bin balances, valuation matrix, low stock alerts, and stock turnover analysis across all warehouses (POM, 8 MILE, LAE, CELLARMASTER).
- **Procurement & Accounts Payable:** Supplier invoice tracking, payables aging, and replenishment horizons.
- **Finance & General Ledger:** Live commercial profit & loss, cash inflow/outflow, and detailed GL transaction entries.
- **Operational Reporting Engine:** Cart-based execution matrix for Sales Register, Purchase Register, Stock Balance, Profit & Loss, and Salesman POS Register with 20-row pagination and CSV export.

---

## 2. How to Access the App After Installing in ERPNext

The application operates as a **standalone full-screen web portal**:

```
                              ┌─────────────────────────────────────────┐
                              │     ERPNext / Frappe Bench Server       │
                              │       (http://your-server-ip)           │
                              └────────────────────┬────────────────────┘
                                                   │
                                                   ▼
                                       [Standalone Web Portal]
                                            Route: /courts
                                                   │
                                  • Full-screen interactive dashboard
                                  • Wall displays, TVs, iPads, tablets
                                  • Pure session-based authentication
                                  • Operates outside ERPNext Desk layout
```

### Route: Standalone Web Portal (`/courts`)
Navigate directly in your browser:
```
http://<your-server-ip-or-domain>/courts
```
*(Example: `http://courts.anantdv.com/courts`)*

- **What it displays:** Full-screen Command Centre without ERPNext Desk top-bar or sidebar clutter.
- **Authentication:** Pure session-based authentication. If the user has an active session, the dashboard loads instantly. If the session is missing or expired, a clean login screen appears.
- **Desk Page Notice:** The Desk Page (`/app/courts-dashboard`) was intentionally removed to keep the Frappe Desk search and workspace clean.

---

## 3. End-to-End System Workflow

### Balanced Server-Side Python API Architecture

```
 ┌──────────────────────┐       ┌────────────────────────┐       ┌────────────────────────┐
 │   ERPNext Database   │ ───► │ Balanced Python API    │ ───► │ React 19 Frontend      │
 │  (MariaDB / Postgres)│       │ courts_management.api  │       │ (Pre-aggregated JSON)  │
 └──────────────────────┘       └────────────────────────┘       └────────────────────────┘
```

1. **Zero-Config Dynamic Origin Binding (`src/config/erpConfig.js`):**
   - The client dynamically evaluates `window.location.origin` and `window.location.hostname`.
   - All API calls use relative paths (`/api/...`), automatically routing to the current domain and port without hardcoded IPs.

2. **Session Authentication & CSRF Handshake (`src/api/erpnextClient.js`):**
   - Every API request is sent with `credentials: 'include'` to pass Frappe's native session cookie (`sid`).
   - The CSRF token is automatically extracted from `window.frappe.csrf_token` (injected via `courts.py` into `courts.html`) or the document `csrf_token` cookie.
   - Any 401 or 403 status automatically fires a `courts:session-expired` event, prompting the user to sign in again.

3. **High-Performance Server-Side Data Ingestion (`courts_management/api.py`):**
   - Instead of 9 separate client-side REST calls, the frontend makes **1 single call** to `courts_management.api.get_dashboard_data`.
   - Optimized SQL aggregates all 1,400+ sales invoices, 800+ stock bins, and 180+ purchase invoices directly inside MariaDB in under 150ms.
   - Eliminates client-side row limits and lowers network payload significantly.

4. **Cart-Based Reporting Engine (`src/components/reports/ReportsPage.jsx`):**
   - Reports are organized as modular interactive carts.
   - Clicking any report cart opens a dedicated configuration and execution view.
   - Supports live execution, column sort, filter, 20-row pagination with "Load More", and CSV data export.

---

## 4. Repository Structure

```
courts_management/ (Repository Root)
├── setup.py                            <-- Standard setuptools package installer
├── pyproject.toml                      <-- PEP 621 package metadata
├── requirements.txt                    <-- Python dependencies
├── README.md                           <-- App documentation
├── license.txt                         <-- MIT license
├── INSTALLATION_GUIDE.md               <-- Step-by-step bench install guide
├── PROJECT_WORKFLOW_AND_ARCHITECTURE.md<-- This document
├── PROJECT_HANDOVER.md                 <-- Handover & technical reference
│
├── courts_management/                  <-- Python Frappe package directory
│   ├── __init__.py
│   ├── hooks.py                        <-- App configuration & website route rules (/courts)
│   ├── modules.txt                     <-- Module registration
│   ├── patches.txt
│   ├── api.py                          <-- High-performance server-side Python API
│   ├── public/courts/                  <-- Pre-compiled production React assets
│   │   ├── index.html
│   │   └── assets/ (JS bundle, CSS, courts-reference-hero.jpg)
│   └── www/
│       ├── courts.py                   <-- Controller: no_cache=1, injects CSRF token
│       └── courts.html                 <-- HTML entry point for /courts
│
└── frontend/                           <-- REACT 19 FRONTEND SOURCE
    ├── package.json                    <-- Node dependencies & scripts
    ├── vite.config.js                  <-- Vite bundler with relative base ('./')
    ├── erpnext.config.json             <-- Dev proxy configuration
    ├── scripts/
    │   └── package-frappe.js           <-- Automates build & sync into courts_management/
    └── src/
        ├── App.jsx                     <-- Master state, authentication, and routing
        ├── api/
        │   ├── erpnextClient.js        <-- Dynamic fetch client with CSRF injection
        │   └── dashboardApi.js         <-- Calls Python backend (get_dashboard_data)
        ├── components/
        │   ├── auth/LoginRequired.jsx  <-- Clean login gate (username & password)
        │   ├── commandCentre/          <-- Executive Command Centre & Hero banner
        │   ├── dashboard/              <-- KPIs, Store Performance, Overview
        │   ├── sales/                  <-- Sales invoices & salesman registers
        │   ├── inventory/              <-- Stock bins, warehouses, and valuation
        │   ├── purchases/              <-- Procurement & supplier invoices
        │   ├── finance/                <-- Profit & loss and GL entries
        │   ├── reports/                <-- Cart-based interactive reporting engine
        │   └── salesInventory/         <-- Stock vs sales correlation matrix
        ├── config/
        │   └── erpConfig.js            <-- Origin auto-detection logic
        └── styles/                     <-- Modular CSS design system
```

---

## 5. Build & Deployment Commands

```bash
# 1. Inside frontend directory:
cd apps/courts_management/frontend
npm run build
node scripts/package-frappe.js

# 2. On your ERPNext bench server:
cd ~/courts-frappe
bench build --app courts_management
bench --site courts.anantdv.com clear-cache
# Reload gunicorn to pick up api.py changes:
ps -ef | grep "/home/adv/courts-frappe/env/bin/gunicorn" | grep -v grep | head -n 1 | awk '{print $2}' | xargs kill
```
