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

---

## 9. Store Drilldown, Business Logic Calculations & UI Fixes

### 1. Calculation Formulas & Business Logic

#### A. Invoiced Sales Movement:
- **Data Sources:** `tabSales Invoice Item` joined to `tabSales Invoice` (`docstatus = 1`).
- **Units Sold:**
  $$\text{Sales Movement Units} = \sum \text{sii.qty} \quad \text{(for the specified warehouse and item)}$$
- **Sales Revenue:**
  $$\text{Sales Movement Revenue} = \sum \text{sii.amount}$$
- **Velocity Categorization:**
  - `High Demand 🔥`: $> 20$ units sold.
  - `Fast Mover ⚡`: $> 6$ units sold.
  - `Steady 📈`: $\le 6$ units sold.

#### B. Stock-to-Sales Coverage Ratio:
- **Data Sources:** Available on-hand quantity from `tabBin.actual_qty` compared to the sales run-rate from `tabSales Invoice Item.qty`.
- **Formula:**
  $$\text{Stock Coverage Ratio} = \frac{\text{Current Stock Units}}{\text{Sales Units Sold (Run-rate)}}$$
- **Interpretation:** Indicates how many operational periods/months the current inventory on hand will sustain demand without replenishment. If a warehouse has 0 sales in the period, it is accurately designated as **"Stagnant / Non-moving"** rather than an arbitrary mock multiplier.

#### C. Stock Health Index ($\le 100$):
- **Scale:** Strictly normalized between **0 and 100**.
- **Formula:**
  $$\text{Stock Health Index} = \min\left(100, \max\left(0, \text{round}\left(\frac{\text{In-Stock Active SKUs}}{\text{Total Tracked SKUs}} \times 100\right)\right)\right)$$
- **UI Presentation:** Displayed across store performance, drilldowns, and inventory cards as **"Stock Health: XX/100 (Optimal $\le 100$)"**.

---

### 2. Elimination of Hardcoded / Mock Values
All artificial multipliers and fallback constants have been permanently removed and replaced with direct MariaDB queries:
- **`* 0.35` multiplier on bin sales** $\rightarrow$ Replaced with actual item sales from `tabSales Invoice Item`.
- **`* 0.25` multiplier on warehouse sales units** $\rightarrow$ Replaced with genuine warehouse units sold.
- **`* 0.30` multiplier on warehouse revenue** $\rightarrow$ Replaced with genuine warehouse revenue.
- **Fallback `"4.2"` coverage ratio** $\rightarrow$ Replaced with live mathematical calculation or `"N/A" / "Stagnant"`.
- **`"Home Appliances"` group** $\rightarrow$ Replaced with live `item_group` from `tabItem`.
- **`50` on-hand stock** $\rightarrow$ Replaced with real sum of `actual_qty` from `tabBin`.
- **`"Main Warehouse"`** $\rightarrow$ Replaced with actual top warehouse holding the highest on-hand stock.
- **`todaySales * 1.8` (MTD) & `todaySales * 3.2` (YTD)** $\rightarrow$ Replaced with authentic store sales aggregated across MTD and YTD calendar ranges.
- **Global `LIMIT 100` on bins** $\rightarrow$ Expanded to `LIMIT 1000` (covering all 812 bins across Courts warehouses).

---

### 3. Store Drilldown Interactivity
- **Row Click Interactivity:** Clicking any store row in `StorePerformance` automatically activates the selected store, highlights the active row, and smoothly scrolls to the `StoreDetails` drilldown card.
- **Dynamic Time Horizons:** Time-range filter (`Today`, `This Month / MTD`, `This Year / YTD`, `All Time`) dynamically updates store revenue.
- **Store-Specific Top Items:** Switching stores in the dropdown or table updates the Top Items tab to display that specific warehouse's top revenue items.

---

### 4. UI / CSS Styling Repairs

#### Screenshot 1 Fix: Top Suppliers by Spend (`PurchasesPage.jsx` & `SalesPage.jsx`)
- Added flexbox rules for `.top-entities-list`, `.top-entity-item`, `.entity-rank`, `.entity-info`, and `.entity-value`.
- Displays rank as a distinctive colored badge (`#1`, `#2`, `#3`), stacks supplier name and invoice count cleanly, and aligns the PGK amount neatly on the right.

#### Screenshot 2 Fix: Sales Horizon & Inventory Distribution (`StoreDetails.jsx`)
- Added `.bars-list` and `.bar-row` using CSS grid (`55px 1fr auto`).
- Resolves the text squash issue (`TodayPGK 1.59M`), placing the period label on the left, an animated progress track in the center, and the formatted PGK currency on the right.
- Enhanced `.chart-frame--mini` with responsive padding and tooltips.

---

### 5. Category Revenue Card & Store Drilldown Redesign

#### A. Replacement of Warehouse Item Distribution Donut:
- Replaced the repetitive `DashboardDonut` (Warehouse Item Distribution) with `CategoryPerformanceCard.jsx`.
- Queries genuine product group revenue directly from `tabSales Invoice Item`:
  - **Home Appliances:** PGK 156.6K (31% share)
  - **TV & Entertainment:** PGK 112.0K (22% share)
  - **Tools & Equipments:** PGK 101.1K (20% share)
  - **Furniture:** PGK 49.6K (10% share)
  - **Bedding:** PGK 45.6K (9% share)
  - **Kitchen Items:** PGK 35.3K (7% share)
- Eliminates redundant warehouse dropdowns in the top grid and provides clean executive retail intelligence.

#### B. Redesigned Store Drilldown:
- **No Redundant Warehouse Sidebar:** Replaced the cramped multi-column layout with a top selector strip (`.drilldown-selector-strip`) that clearly highlights the active warehouse.
- **Authentic Item Names:** Fixed undefined item names by properly mapping `sku.name || sku.item || sku.item_name`.
- **Live On-Hand Stock:** Fixed the "unit 0" issue by querying real on-hand stock from `tabBin` (`sku.onHandStock`). Items now accurately display e.g. `23 units in stock`, `306 units in stock`, `5,495 units in stock` alongside units sold.

#### C. Quick Actions Auto-Execution & Route Mapping:
- In `QuickActions.jsx`, mapped all 6 direct operations shortcuts:
  1. **Sales Register:** Navigates to Sales Register report with immediate automatic table execution.
  2. **Purchase Register:** Navigates to Purchase Register report with immediate automatic table execution.
  3. **Stock Balance:** Navigates to Stock Balance report with immediate automatic table execution.
  4. **Finance & GL:** Navigates directly to the Financial Ledger module with CSV export.
  5. **Store Matrix:** Navigates to Store Performance Matrix report with immediate automatic table execution.
  6. **Stock Movement:** Navigates to Sales vs Stock Movement Run-Rate.
- In `ReportsPage.jsx`, fixed `initialReportId` to set `isExecuted: true`, eliminating the blank unexecuted screen.

---

### 6. Comprehensive Responsive Design Architecture (Mobile, Tablet & Laptop)

Implemented a robust, unified 3-tier responsive CSS design system in `frontend/src/styles/layout.css` and `frontend/src/styles/components.css`:

#### A. Laptop & Desktop Screens (`>= 1025px`):
- **Dashboard Grids:** 3-column unified grid layout (`repeat(3, minmax(0, 1fr))`) ensuring SalesChart, CategoryPerformanceCard, QuickActions, StorePerformance, StoreDetails, and WarehouseAnalysis stretch and align equally.
- **Executive Overview:** 4-column cards grid (`repeat(4, minmax(0, 1fr))`).
- **Management Overview:** 6-column KPI cards grid (`repeat(6, minmax(0, 1fr))`).
- **Revenue Intelligence Leaderboard:**
  - Warehouses: Responsive grid (`repeat(auto-fit, minmax(320px, 1fr))`).
  - Best-selling Products: Responsive grid (`repeat(auto-fit, minmax(300px, 1fr))`).
  - Store Drilldown: Full-width hero with 5-column metric tiles and 2-column SKU cards.
- **Module Pages:** 2-column layout (`1fr 340px`) with primary table and detail sidebar.
- **Quick Operations:** 3-column grid (`repeat(3, minmax(0, 1fr))`).
- **Sales vs Inventory:** Cards grid (`repeat(auto-fit, minmax(360px, 1fr))`).

#### B. Tablet Screens (`641px - 1024px`):
- **Top Navigation:** Brand logo and action chips on top row; primary module navigation switches to a touch-optimized, smooth horizontal scrollable pill bar (`overflow-x: auto; -webkit-overflow-scrolling: touch`).
- **Hero Banner:** Proportional aspect ratio (`1536 / 320`) with 150px min-height to maintain Courts branding visual fidelity.
- **Dashboard Grids:** Balanced 2-column grid (`repeat(2, minmax(0, 1fr))`):
  - Top grid: Sales Trend chart spans full width (2 columns); Category Revenue and Quick Operations sit side-by-side in 2 columns.
  - Bottom grid: Store Performance and Store Drilldown sit side-by-side in 2 columns; Warehouse Analysis spans full width (2 columns).
- **Executive Overview:** Balanced 2x2 grid (`repeat(2, minmax(0, 1fr))`).
- **Management Overview:** Balanced 2x3 grid (`repeat(3, minmax(0, 1fr))`).
- **Leaderboard:** 2-column warehouses and 2-column product cards. Drilldown hero metrics arranged in 3 columns.
- **Module Pages:** Single-column content grid (`1fr`), stacking sidebars cleanly beneath primary tables. Module KPIs arranged in 2 columns.
- **Modals & Overlays:** Adaptive modal width `width: min(90vw, 560px)`.

#### C. Mobile Phone Screens (`<= 640px`):
- **App Shell & Padding:** Compact touch-friendly padding (`padding: 8px 10px 20px;`).
- **Mobile Header & Navigation:**
  - Sticky 58px header with Courts brand logo, quick alert indicator, user avatar chip, and hamburger menu button (`.mobile-only`).
  - Smooth floating mobile menu (`.mobile-nav-panel`) positioned directly below header with tap-friendly 42px touch buttons.
- **Hero Banner:** Dedicated mobile aspect ratio (`16 / 7; min-height: 125px; object-fit: cover; object-position: center; border-radius: 10px;`) preventing the Courts reference banner from collapsing into an unreadable ribbon. Compact live status pill (`font-size: 0.64rem; padding: 3px 8px;`).
- **Overview Cards:** Single-column list (`grid-template-columns: 1fr`) with 52px icon, 1.25rem values, and quick action refresh buttons. Prevents large PGK figures (e.g. `PGK 1,420,500.00`) from clipping or awkward wrapping.
- **Management Overview:** Ergonomic 2x3 grid (`repeat(2, minmax(0, 1fr)); gap: 8px;`) with 120px min-height, 36px icons, and clean truncated descriptions. Decorative background blur removed to avoid text collisions.
- **Revenue Intelligence Leaderboard:**
  - Header: Vertical stack with centered flame badge and compact 1.2rem title.
  - Tab Switcher: Full-width horizontal touch-scrolling bar (`overflow-x: auto; scrollbar-width: none`) with 3 touch buttons (Top Warehouses, Top Selling Products, Store Drilldown).
  - Search & Sorting: Full-width search input and 100% segmented sort pills.
  - Cards: Single-column full-width warehouse and product cards with touch-friendly 14px padding.
  - Store Drilldown: Horizontal touch-scrolling warehouse selector strip (`.strip-pills-row`); 2x2 hero metric tiles; single-column SKU cards with separate stock badges and sales figures.
- **Dashboard Panels (Top & Bottom):** Single-column stack (`1fr; gap: 12px;`):
  - Category Revenue: Vertical label-to-value wrap preventing long group names from crowding currency amounts.
  - Quick Operations: 2-column grid (`repeat(2, minmax(0, 1fr)); gap: 8px;`) with 68px touch buttons.
  - Store Details: Horizontal scrollable tab buttons; 2x2 mini-stats (`repeat(2, minmax(0, 1fr))`); single-column sales horizon and inventory bar.
  - Warehouse Analysis: 3-column compact mini-grid (`repeat(3, minmax(0, 1fr)); font-size: 0.6rem;`).
- **Sales vs Inventory Page:** Single-column warehouse cards (`1fr`); 2-column card metrics banner (`repeat(2, 1fr)`) preventing metric overcrowding.
- **Module Pages & Reports:** Vertically stacked header and action buttons; full-width toolbar with touch-friendly search and select filters; horizontal touch-scrolling report selector tabs (`.reports-catalog-bar`); 2-column report KPI tiles.
- **Universal Touch Tables:** All tabular interfaces wrapped in `.table-scroll` with `overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%;` allowing smooth native gesture scrolling without causing page-level horizontal blowout.
- **Login & ERP Modals:** Edge-to-edge modal layout with `width: 100%; max-height: 92vh; border-radius: 12px;` on small viewports.

---

### 7. Resolution of Minified React Error #300 (Route Navigation Failure)

- **Issue Reported:** Clicking any module route (Sales, Inventory, Purchases, Finance, Reports, or Sales vs Inventory) caused an application crash:
  `Minified React error #300: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
- **Root Cause Identified:** In `frontend/src/components/commandCentre/CommandCentre.jsx`, `const [selectedStore, setSelectedStore] = useState(...)` and `handleSelectStore` were positioned *below* the conditional early return statements (`if (activePage === 'sales') return ...`). When switching routes, the component returned early, skipping `useState(selectedStore)`. React detected a mismatch in the hook call count and threw invariant error #300.
- **Solution Applied:** Moved `useState(selectedStore)` and `handleSelectStore` to the top level of `CommandCentre.jsx` before any conditional return statements. All React hooks now execute unconditionally on every render cycle, ensuring stable navigation across all routes and shortcuts.

---

### 8. Working Capital & Operating Horizons Redesign (`FinancePage.jsx`)

- **Issue Reported:** The Working Capital & Operating Horizons section on the Finance page was unstyled, rendering as plain stacked text with browser dotted underlines, zero progress bars, and an inaccurate negative operating surplus caused by comparing Today's sales against All-Time purchases.
- **Root Cause:**
  1. CSS classes `.finance-horizons-card`, `.horizon-metrics-row`, `.horizon-metric`, `.horizon-label`, `.horizon-bar-wrap`, and `.horizon-bar` were missing in `components.css`.
  2. The revenue metric was falling back to `data?.heroMetrics?.salesToday` (PGK 55.00) rather than genuine total billed revenue (`data?.kpis?.totalSales?.value`).
  3. `MoneyAmount` applied dotted underlines (`text-decoration: underline dotted`) by default.
- **Solution Applied:**
  1. **Executive Card Styling:** Created `.finance-horizons-card` with clean white surface, 16px radius, subtle elevation shadow, and a gradient header.
  2. **Interactive Metric Tiles:** Implemented 3 dedicated metric cards (`Gross Revenue Billed`, `Payables & Procurement Commitments`, and `Operating Surplus Realization`) featuring:
     - Distinctive icon badges (`TrendingUp` in emerald, `CreditCard` in amber, `Scale` in cyan/red).
     - Clean uppercase category titles with percentage contribution pills (`100% Baseline`, `% of Rev`, `Margin Ratio`).
     - Distinctive headline typography (1.65rem bold) with dotted underlines removed.
     - Smooth 8px animated horizontal progress bars (`.horizon-bar.is-green`, `.horizon-bar.is-amber`, `.horizon-bar.is-teal / is-red`).
     - Clear explanatory captions for each liquidity metric.
  3. **Accurate Financial Precedence:** Updated `totalSales` to prioritize `data?.kpis?.totalSales?.value` so procurement spend is evaluated against genuine total billed revenue.
  4. **Multi-Device Responsive Architecture:**
     - **Laptop & Desktop (`>= 1025px`):** 3 balanced horizontal columns.
     - **Tablet (`641px - 1024px`):** 3 columns with adapted padding and 1.35rem typography.
     - **Mobile (`<= 640px`):** Single-column stack with 100% full-width cards and touch-optimized padding.

---

### 9. Left-Sidebar Warehouse Selector, Clean Store Drilldown, Item-Wise Sales Register & Period Filters

#### A. Sales Performance Leaderboard Left-Sidebar Drilldown (`SalesPerformanceLeaderboard.jsx`)
- **Left-Sidebar Architecture:** Migrated the Store Drilldown view from a horizontal top pill strip to an executive **two-column split layout** (`.drilldown-layout-split` with `grid-template-columns: 290px 1fr`):
  - **Left Sidebar (`.drilldown-left-sidebar`):** Vertical list of warehouse cards displaying numeric rank badge (`#1`, `#2`...), store name, location, revenue in the active period, and units sold. Includes clear active state styling, cyan highlights, and active chevron indicators.
  - **Right Content Pane (`.drilldown-content-pane`):** Hero metric tiles (Billed Revenue, Units Sold, Stock on Hand, Stock Health, Network Share) and fast-moving velocity merchandise items with live bin on-hand stock counts.
  - **Period-Aware Ranking:** Added period filtering control pills (`All Time`, `This Year (YTD)`, `This Month (MTD)`, `Today`) to dynamically sort both warehouses and products based on period sales.
  - **Responsive Adaptation:** Automatically collapses into a single stacked column on mobile devices (`<= 768px`).

#### B. Store Drilldown Header De-duplication & Clean Alignment (`StoreDetails.jsx`)
- **De-duplication:** Replaced the cluttered layout where the warehouse name was repeated 4 times ("POM Warehouse Drilldown" in header, "POM Warehouse" in dropdown, "POM Warehouse - CTS" in body, and "CTS" in tag).
- **Streamlined Layout:**
  - Header displays a clean `<h3><Store size={18} /> Store Drilldown</h3>` with aligned Store and Period selectors on the top-right.
  - Store identity card (`.store-drilldown-header-card`) cleanly presents the warehouse name once, accompanied by the location subtitle (`Courts Retail Outlet`), stock health badge (`<Activity size={13} /> Stock Health: 91/100`), and live status chip (`Open`).
- **Period Filter Calculation:** Correctly bound `transactions` to the active period (`transactionsToday`, `transactionsMTD`, `transactionsYTD`, `transactionsTotal`) instead of displaying all-time transaction counts (e.g. 1,330) for daily views.
- **Accurate Average Ticket:** Computed `averageSale` as `periodSales / transactions` for the selected timeframe.

#### C. Replacement of Warehouse Analysis with Item-Wise Sales Register by Warehouse (`ItemSalesRegisterByWarehouse.jsx`)
- **Component Replacement:** Removed the deprecated donut chart (`WarehouseAnalysis.jsx`) from the Command Centre bottom grid and implemented `ItemSalesRegisterByWarehouse.jsx`.
- **Server-Side API (`courts_management/api.py`):** Added `item_sales_register_raw` query joining `tabSales Invoice Item`, `tabSales Invoice`, `tabItem`, and `tabBin` grouped by warehouse and item code.
- **Component Capabilities:**
  - **Branch Switcher:** Filter by All Warehouses or specific branch locations (POM Warehouse, Lae Warehouse, 8 Mile Warehouse, Cellarmaster).
  - **Period Filter:** Switch between All Time, YTD, MTD, and Today.
  - **Live Search:** Instant filtering across Item Name, SKU Code, or Item Category.
  - **Executive KPI Strip:** Four live metric cards displaying Billed Revenue, Units Sold, Unique SKUs, and Average Item Rate.
  - **Interactive Data Table:** Item Name, SKU Code, Branch Badge, Category Tag, Units Sold, Avg Selling Rate, Total Billed, Stock on Hand Badge (in-stock vs critical), and Last Sold Date.
  - **Pagination / Expandable View:** Clean progressive loading of rows.

#### D. System-Wide Period Filter Verification (`Today`, `MTD`, `YTD`, `All Time`)
- **Backend API (`courts_management/api.py`):**
  - Updated `wh_sales_summary_raw` to aggregate period-specific invoices (`today_invoices`, `mtd_invoices`, `ytd_invoices`) and units (`today_units`, `mtd_units`, `ytd_units`).
  - Added period fields to `store_performance`, `warehouse_sales_leaderboard`, and `item_sales_leaderboard`.
- **Store Performance (`StorePerformance.jsx`):** Dynamically computes period-specific transaction counts and average tickets based on the selected period.
- **Sales Page (`SalesPage.jsx`):** Added a Period dropdown (`All Time`, `YTD`, `MTD`, `Today`) filtering invoices by posting date.
- **Finance Page (`FinancePage.jsx`):** Wired up the Period dropdown to filter General Ledger stream entries by date.
