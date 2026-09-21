# Courts Management Command Centre — Project Workflow & System Architecture

This document outlines the complete system architecture, operational workflows, data pipelines, authentication lifecycle, access methods, and codebase structure for the **Courts Management Command Centre**.

---

## 1. Executive Summary & Project Purpose

**Courts Management Command Centre** is an enterprise-grade retail and wholesale operations dashboard developed with React 19, Vite, Recharts, and Lucide Icons, packaged as a native Frappe/ERPNext app (`courts_management`).

### Core Value & Capabilities
- **Executive Operations View:** Live revenue KPIs, gross margin tracking, operating liquidity, and inventory asset valuation.
- **Sales Intelligence:** Real-time billing from verified invoices, branch store sales leaderboards, salesman POS registers, and time-series trends.
- **Inventory & Bin Intelligence:** Warehouse-level bin balances, valuation matrix, low stock alerts, and stock turnover analysis.
- **Procurement & Accounts Payable:** Supplier invoice tracking, payables aging, and replenishment horizons.
- **Finance & General Ledger:** Live commercial profit & loss, cash inflow/outflow, and detailed GL transaction entries.
- **Operational Reporting Engine:** Cart-based execution matrix for Sales Register, Purchase Register, Stock Balance, Profit & Loss, and Salesman POS Register with 20-row pagination and CSV export.

---

## 2. How to Access the App After Installing in ERPNext

Once the `courts_management` app is installed on your Frappe/ERPNext bench site (`bench --site <site-name> install-app courts_management`), the dashboard can be accessed via **three primary methods**:

```
                              ┌─────────────────────────────────────────┐
                              │     ERPNext / Frappe Bench Server       │
                              │       (http://your-server-ip)           │
                              └────────────────────┬────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
       [Method 1: Standalone Web Portal]                               [Method 2: ERPNext Desk Page]
             Route: /courts                                                Route: /app/courts-dashboard
                   │                                                               │
  • Full-screen interactive dashboard                                • Embedded inside ERPNext Desk
  • Wall displays, TVs, iPads, tablets                               • Retains ERPNext top navigation & Awesomebar
  • Automatic cookie authentication                                  • Accessible via Desk search & workspace
```

### Method 1: Standalone Web Portal (`/courts`)
Navigate directly in your browser:
```
http://<your-server-ip-or-domain>/courts
```
*(Example: `http://192.168.1.100/courts` or `https://erp.yourcompany.com/courts`)*

- **What it displays:** Full-screen Command Centre without the ERPNext Desk top-bar or sidebar clutter.
- **Ideal for:** Executive review rooms, retail store manager tablets, wall monitors, and operational dashboards.
- **Authentication:** If you are already logged into ERPNext in your browser, it automatically inherits your session cookie and opens immediately without asking for credentials. If not logged in, a clean login modal appears.

---

### Method 2: ERPNext Desk Page (`/app/courts-dashboard`)
1. Log into your ERPNext Desk: `http://<your-server-ip-or-domain>/app`
2. In the top search bar (Awesomebar, press `Ctrl + K` or `Cmd + K`), type:
   ```
   Courts Command Centre
   ```
   Or navigate directly to:
   ```
   http://<your-server-ip-or-domain>/app/courts-dashboard
   ```
- **What it displays:** The Command Centre mounted directly inside the Desk page wrapper.
- **User Roles:** Accessible to any user with `System Manager`, `Accounts Manager`, `Stock Manager`, or `Sales Manager` roles.

---

### Method 3: Adding to Desk Workspace Shortcut (Optional)
To pin the Command Centre as a tile on your ERPNext Home Workspace:
1. Open your ERPNext Workspace (e.g. **Retail** or **Accounting**).
2. Click **Edit** (top right of the workspace).
3. Click **Add Shortcut** -> select **Page** -> choose **Courts Command Centre** (`courts-dashboard`).
4. Click **Save**.

---

## 3. End-to-End System Workflow

```
 ┌──────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
 │   ERPNext Database   │ ───► │ Frappe REST API      │ ───► │ Dynamic Client Mapper  │
 │  (MariaDB / Postgres)│       │ (/api/resource/...)  │       │ (erpnextDashboardMapper│
 └──────────────────────┘       └──────────────────────┘       └───────────┬────────────┘
                                                                           │
                                                                           ▼
 ┌──────────────────────┐       ┌──────────────────────┐       ┌────────────────────────┐
 │   Interactive UI     │ ◄─── │ Unified State Store  │ ◄─── │ Live KPI Calculation   │
 │   & Cart Reports     │       │ (React 19 Dashboard) │       │ (Revenue, Stock, GL)   │
 └──────────────────────┘       └──────────────────────┘       └────────────────────────┘
```

### 1. Zero-Config Dynamic Host Detection (`src/config/erpConfig.js`)
- When the dashboard is accessed in a web browser, the client dynamically evaluates `window.location.origin`.
- On production ports (`80`, `443`, `8000`, `8080`) or domain names, it automatically binds all API calls to the server host.
- **No hardcoded IP addresses or domain names are required.** Moving the site to a new server or domain will work automatically.

### 2. Authentication & CSRF Handshake (`src/api/erpnextClient.js`)
- Every API request is sent with `credentials: 'include'`.
- The CSRF token is automatically extracted from `window.frappe.csrf_token` (injected via `courts.py` into `courts.html`) or the document `csrf_token` cookie.
- **Zero hardcoded usernames, passwords, or API secrets exist in the source code.**

### 3. Live Data Ingestion & Transformation (`src/api/dashboardApi.js`)
The application fetches live data from standard ERPNext DocTypes in parallel:
- `Sales Invoice`: Aggregates gross sales, daily/weekly trends, item quantities, and customer orders.
- `Purchase Invoice`: Aggregates procurement spending, supplier totals, and outstanding balances.
- `Bin`: Computes real-time warehouse inventory quantities, valuation rates, and bin stock balances.
- `GL Entry`: Extracts general ledger postings for real-time commercial profit, accounts receivable, and cash flow.
- `Warehouse`, `Customer`, `Supplier`, `Item`: Enriches store locations, master item codes, and trade partners.

### 4. Cart-Based Reporting Suite (`src/components/reports/ReportsPage.jsx`)
- Reports are organized as interactive cards ("carts").
- Clicking any report cart opens a dedicated configuration and execution view.
- Supports live execution, column sort, filter, 20-row pagination with "Load More", and CSV data export.

---

## 4. Repository Structure

```
courts_management/ (Repository Root)
├── setup.py                            <-- Standard setuptools package installer
├── pyproject.toml                      <-- PEP 621 package metadata
├── requirements.txt                    <-- Python dependencies (frappe)
├── package.json                        <-- Root build convenience scripts
├── README.md                           <-- App documentation
├── license.txt                         <-- MIT license
├── INSTALLATION_GUIDE.md               <-- Step-by-step bench install guide
├── PROJECT_WORKFLOW_AND_ARCHITECTURE.md<-- Architecture & workflow documentation
│
├── courts_management/                  <-- Python Frappe package directory
│   ├── __init__.py
│   ├── hooks.py                        <-- App configuration & website route rules (/courts)
│   ├── modules.txt                     <-- Module registration
│   ├── patches.txt
│   ├── public/courts/                  <-- Pre-compiled production React assets
│   │   ├── index.html
│   │   └── assets/ (JS, CSS, images)
│   ├── www/
│   │   ├── courts.py                   <-- Controller: no_cache=1, injects CSRF token
│   │   └── courts.html                 <-- HTML entry point for /courts
│   └── page/
│       └── courts_dashboard/           <-- Desk Page definition (/app/courts-dashboard)
│           ├── courts_dashboard.json
│           ├── courts_dashboard.js
│           └── courts_dashboard.css
│
└── frontend/                           <-- REACT 19 FRONTEND SOURCE
    ├── package.json                    <-- Node dependencies & scripts
    ├── vite.config.js                  <-- Vite bundler with relative base ('./')
    ├── erpnext.config.json             <-- Optional dev proxy override
    ├── scripts/
    │   └── package-frappe.js           <-- Automates build & sync into courts_management/
    └── src/
        ├── App.jsx                     <-- Master state, authentication, and routing
        ├── api/
        │   ├── erpnextClient.js        <-- Dynamic fetch client with CSRF injection
        │   ├── dashboardApi.js         <-- DocType query endpoints
        │   └── erpnextDashboardMapper.js<-- Raw data transformation pipeline
        ├── components/
        │   ├── auth/LoginRequired.jsx  <-- Clean login gate (no hardcoded credentials)
        │   ├── commandCentre/          <-- Executive Command Centre & Hero
        │   ├── dashboard/              <-- KPIs, Store Performance, Overview
        │   ├── sales/                  <-- Sales invoices & salesman registers
        │   ├── inventory/              <-- Stock bins, warehouses, and valuation
        │   ├── purchases/              <-- Procurement & supplier invoices
        │   ├── finance/                <-- Profit & loss and GL entries
        │   └── reports/                <-- Cart-based interactive reporting engine
        ├── config/
        │   └── erpConfig.js            <-- Origin auto-detection logic
        └── styles/                     <-- Modular CSS design system
```

---

## 5. Security & Credential Compliance

- **No Hardcoded Passwords:** There are **zero** hardcoded passwords in this codebase.
- **No Hardcoded Usernames:** All login fields, placeholders, and fallbacks use neutral enterprise labels (`user@company.com`, `Preview User`, `System Account`).
- **No API Secrets:** Authentication uses ERPNext's native session cookies and CSRF tokens. Users authenticate with their own role-based accounts.

---

## 6. How to Build & Update the App

Whenever you make frontend changes inside `Courts Management/`:
```bash
# 1. Inside Courts Management directory, run:
npm run package:frappe

# 2. Push changes to Git:
git add .
git commit -m "feat: updated dashboard features"
git push origin main

# 3. On your ERPNext server:
cd ~/frappe-bench
bench update --pull
bench build --app courts_management
bench --site [site-name] clear-cache
bench restart
```
