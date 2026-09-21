# Courts Management Command Centre — Project Handover & AI Knowledge Base

> **Target Audience:** Any AI assistant, LLM, or software engineer continuing work on this codebase. This document outlines the complete architectural state, chart implementations, data pipelines, and design decisions.

---

## 1. Project Overview & Context

**Courts Management Command Centre** is a real-time enterprise management, analytics, and operational dashboard built for retail, wholesale, and branch warehouse operations. 

- **Primary Stack:** React 19, Vite, Recharts, Lucide Icons, Vanilla CSS (Design Tokens & Glassmorphism).
- **Backend Platform:** Frappe Framework & ERPNext (compatible with v14, v15, and v16+).
- **Deployment Model:** Packaged as a standard installable Frappe App named `courts_management`.
- **Pre-Built Assets:** Production bundles are pre-compiled and committed in `courts_management/public/courts/`, meaning the host Frappe server does not need Node.js or Vite installed to deploy the app.

---

## 2. Directory Layout & Key Files

```
courts_management/ (Repository Root)
├── setup.py                                <-- Python package installer (PEP compliant)
├── pyproject.toml                          <-- Build system definitions (dependencies = [])
├── requirements.txt                        <-- Empty by design (avoids uv/pip resolver conflicts)
├── README.md                               <-- Server installation summary
├── license.txt                             <-- MIT license
├── INSTALLATION_GUIDE.md                   <-- Step-by-step Frappe bench deployment guide
├── PROJECT_WORKFLOW_AND_ARCHITECTURE.md    <-- Detailed data pipeline & system architecture
├── PROJECT_HANDOVER.md                     <-- (This file) AI handover & chart reference
│
├── courts_management/                      <-- THE FRAPPE APP PYTHON MODULE
│   ├── __init__.py                         <-- Package version
│   ├── hooks.py                            <-- App metadata & website route rules (/courts)
│   ├── modules.txt                         <-- Module declaration ("Courts Management")
│   ├── patches.txt                         <-- Database patches (if needed)
│   ├── public/courts/                      <-- Pre-compiled production React build (JS, CSS, images)
│   │   ├── index.html
│   │   └── assets/ (index-*.js, index-*.css, courts-reference-hero.jpg)
│   ├── www/
│   │   ├── courts.py                       <-- Portal route controller (no_cache=1, injects CSRF)
│   │   └── courts.html                     <-- Portal template that mounts the React app at /courts
│   └── page/courts_dashboard/              <-- Frappe Desk Page (/app/courts-dashboard)
│       ├── courts_dashboard.json
│       ├── courts_dashboard.js
│       └── courts_dashboard.css
│
└── frontend/                               <-- REACT 19 FRONTEND SOURCE CODE
    ├── package.json                        <-- Frontend dependencies & scripts
    ├── vite.config.js                      <-- Vite config with relative base: './'
    ├── erpnext.config.json                 <-- Optional local dev reverse-proxy URL
    ├── scripts/
    │   └── package-frappe.js               <-- Build & sync script into ../courts_management/
    └── src/
        ├── App.jsx                         <-- Master application state & navigation router
        ├── main.jsx                        <-- React entry point
        ├── api/
        │   ├── erpnextClient.js            <-- Fetch wrapper with automatic CSRF & origin binding
        │   ├── dashboardApi.js             <-- ERPNext DocType REST query endpoints
        │   └── erpnextDashboardMapper.js   <-- Data normalization & KPI aggregation logic
        ├── config/
        │   └── erpConfig.js                <-- Dynamic window.location.origin auto-detection
        ├── components/
        │   ├── auth/LoginRequired.jsx      <-- Clean enterprise login gate
        │   ├── charts/                     <-- ALL RECHARTS & CUSTOM DATA VISUALIZATIONS
        │   ├── commandCentre/              <-- Executive command centre & Hero banner
        │   ├── dashboard/                  <-- Overview cards, Store performance, Quick actions
        │   ├── sales/                      <-- Sales invoices, Salesman leaderboard
        │   ├── inventory/                  <-- Warehouse overview, stock bins, valuation
        │   ├── purchases/                  <-- Procurement invoices & supplier payables
        │   ├── finance/                    <-- Profit & loss statement & General Ledger
        │   ├── reports/                    <-- Cart-based interactive reporting engine
        │   └── salesInventory/             <-- Hexagonal stock vs sales correlation module
        ├── data/
        │   ├── courtsLiveErpSnapshot.js    <-- Offline demo snapshot for standalone testing
        │   └── salesmanPosRegisterData.js  <-- Sample POS register dataset
        └── styles/
            ├── global.css                  <-- Global tokens & typography
            ├── layout.css                  <-- App grid, header, nav
            └── components.css              <-- Cards, tables, modals, hex-badges
```

---

## 3. Comprehensive Catalog of All Charts & Visualizations

Every chart component is responsive, styled with custom CSS tokens, and supports real-time data feeds:

### 1. Sales Trend Area Chart
* **File:** [`frontend/src/components/charts/SalesChart.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/charts/SalesChart.jsx)
* **Library:** Recharts (`ResponsiveContainer`, `AreaChart`, `Area`, `XAxis`, `YAxis`, `Tooltip`).
* **Features:**
  * Interactive time aggregation selector: **Daily Sales**, **Weekly Sales**, and **Monthly Sales**.
  * Smooth cubic spline curve (`type="monotone"`) with a gradient fill (`#1264d8` to transparent).
  * Real-time currency tooltips formatted with local symbols.
  * Displays total sales volume and average transaction size metrics beside the chart.

### 2. Warehouse Distribution Conic Donut Chart
* **File:** [`frontend/src/components/charts/DashboardDonut.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/charts/DashboardDonut.jsx)
* **Technology:** Pure CSS `conic-gradient` with dynamic stop calculation.
* **Features:**
  * Computes dynamic percentage stops from live inventory data.
  * Interactive warehouse filter dropdown (`All Warehouses`, or filter by specific branch warehouse).
  * Central metric counter displaying total inventory quantity or asset valuation.
  * Interactive legend list with color swatches, item names, and percentage share.

### 3. Inventory Stock Valuation & Bin Quantity Bar Chart
* **File:** [`frontend/src/components/charts/InventoryChart.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/charts/InventoryChart.jsx)
* **Library:** Recharts (`BarChart`, `Bar`, `Cell`, `XAxis`, `YAxis`, `Tooltip`).
* **Features:**
  * Compares stock levels across multiple branch warehouses.
  * Dynamic color-coding for warehouse capacity and reorder levels.
  * Hover cards detailing stock valuation per warehouse.

### 4. Procurement & Supplier Spend Chart
* **File:** [`frontend/src/components/charts/PurchaseChart.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/charts/PurchaseChart.jsx)
* **Library:** Recharts (`AreaChart` / `BarChart`).
* **Features:**
  * Visualizes procurement outflows over the last 30/60/90 days.
  * Top suppliers ranked by spend with payables aging metrics.

### 5. Hexagonal Cart & Stock vs Sales Intelligence
* **File:** [`frontend/src/components/salesInventory/SalesInventoryPage.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/salesInventory/SalesInventoryPage.jsx)
* **Design Pattern:** Hexagonal badge layout with interactive 3D cards.
* **Features:**
  * **Stock vs Sales Correlation Matrix:** Cross-analyzes how much stock exists in each warehouse versus recent sales velocity.
  * **Top Revenue Drivers vs Dead Stock:** Highlights items with zero sales in the last 30 days but high asset valuation.
  * **Hexagonal KPI Indicators:** Visual health badges for Fast Moving, Moderate, and Stagnant items.
  * View toggles: Hexagonal Grid view, Detailed Data Table, and High-Impact Card view.

### 6. Interactive Cart Reporting Engine
* **File:** [`frontend/src/components/reports/ReportsPage.jsx`](file:///c:/Users/galac/OneDrive/Desktop/abhirup/Courts%20Management%202/frontend/src/components/reports/ReportsPage.jsx)
* **Design Pattern:** Modular "Cart" selector cards with full execution panels.
* **Available Reports:**
  1. **Sales Register:** Invoiced revenue, taxes, customer codes, payment status.
  2. **Purchase Register:** Supplier invoices, billed totals, trade replenishment.
  3. **Stock Balance Ledger:** Real-time warehouse bin balances, in/out movements, valuation rate.
  4. **Commercial Profit & Loss:** Revenue vs Cost of Goods Sold (COGS), operating gross margin.
  5. **Salesman Wise POS Register:** POS register breakdown by cashier/salesperson, invoice number, and tender total.
* **Execution Workflow:**
  * Clicking any Cart opens the report matrix.
  * Click **Execute Report** to compile the live query and compute ledger totals.
  * **20-row pagination** with a "Load More" action button.
  * **Export to CSV** button for immediate spreadsheet download.

---

## 4. Key Architectural Mechanisms

### 1. Zero-Config Origin Detection (`frontend/src/config/erpConfig.js`)
```javascript
export const ERPNEXT_URL = (() => {
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    // When served by Frappe server on ports 80, 443, 8000, 8080, etc.
    if (port !== '5173' && port !== '5174' && port !== '3000') {
      return normalizeErpNextUrl(window.location.origin);
    }
  }
  return normalizeErpNextUrl(import.meta.env.VITE_ERPNEXT_URL || 'http://192.168.101.125:8080');
})();
```
* **Why this matters:** When installed on any ERPNext server (e.g. `192.168.1.50`, `erp.mycompany.com`), the app targets that exact host automatically without editing any configuration files.

### 2. Native Session Cookie & CSRF Handshake (`frontend/src/api/erpnextClient.js`)
* All requests pass `credentials: 'include'` to inherit the browser's active Frappe session cookie (`sid`).
* Injects `X-Frappe-CSRF-Token` from `window.frappe.csrf_token` or document cookies.
* When visited directly from Frappe Desk, users are already authenticated — zero login modal is displayed.

### 3. ERPNext Word Elimination
* All visible UI text, placeholders, labels, badges, charts, and empty-state messages use neutral enterprise terms:
  * `Courts Central Command Centre`
  * `Courts Server Login`
  * `System Account`
  * `Live System Sync Active`
  * `Finance & General Ledger • Live Accounting Stream`
  * `Inventory Intelligence • Live Stock, Bins & Warehouses`

---

## 5. How to Access the App After Installation

| Route | Type | URL Format |
|---|---|---|
| **Standalone Portal** | Full-screen app | `http://<server-ip-or-dns>/courts` |
| **Desk Page** | Embedded in Desk | `http://<server-ip-or-dns>/app/courts-dashboard` |

---

## 6. How to Make Changes & Re-package

If you (or another AI assistant) modify any frontend code inside `frontend/`:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Re-compile and package into the Frappe app
npm run package:frappe

# 3. Commit and push to GitHub
cd ..
git add .
git commit -m "feat: updated analytics charts"
git push origin main
```

### On the ERPNext Server:
```bash
cd ~/courts-frappe
bench update --pull
bench build --app courts_management
bench --site [your-site-name] clear-cache
bench restart
```
