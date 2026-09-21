# Courts Management Command Centre — Server Installation & Configuration Guide

This document contains complete, step-by-step instructions for installing, configuring, and running the **Courts Management Command Centre** directly on an ERPNext / Frappe server (compatible with Frappe v14, v15, and v16+).

---

## 1. System Overview & Architecture

**Courts Management Command Centre** is a high-performance enterprise analytics and operations suite designed for retail, wholesale, and branch warehouse management.

### Key Capabilities
- **Command Centre Executive View:** Live gross revenue, gross margin, cash inflow, and inventory valuation KPIs.
- **Sales Intelligence:** Sales invoices, item-wise breakdown, store performance, salesman analytics, and POS registers.
- **Inventory & Bin Intelligence:** Real-time bin stock levels, warehouse stock distribution, stock valuation, and stock balance matrix.
- **Procurement & Accounts Payable:** Purchase invoices, supplier billing, and replenishment horizons.
- **Financial Performance & General Ledger:** Real-time profit & loss, operating cash horizons, and GL entry transaction ledger.
- **Reporting Engine:** Interactive cart-based execution suite for Sales Register, Purchase Register, Stock Balance, Profit & Loss, and Salesman POS Register with pagination and CSV export.

---

## 2. Automatic IP / DNS Detection & Zero-Config Routing

When installed on a Frappe / ERPNext server, **no manual IP or DNS configuration is needed**.

### How Dynamic Origin Binding Works
- **Dynamic Origin Auto-Detection (`src/config/erpConfig.js`):**
  When accessed via any browser, the client reads `window.location.origin`. If the app is accessed on standard ports (`80`, `443`, `8000`, `8080`) or via any domain name (e.g. `http://192.168.1.50`, `http://erp.yourdomain.com`, `https://courts.enterprise.org`), the app automatically targets that exact server IP/domain for all API requests.
- **Native Session & CSRF Handshake (`src/api/erpnextClient.js`):**
  - Uses native HTTP cookies (`credentials: 'include'`).
  - Automatically fetches the active Frappe CSRF token from `window.frappe.csrf_token` or document cookies (`csrf_token`).
  - No API secrets or tokens need to be stored in configuration files.
- **Local Development Override:**
  If running locally on Vite dev ports (`5173`, `5174`, `3000`), the app reads `erpnext.config.json` or `VITE_ERPNEXT_URL` and routes through the Vite reverse proxy.

---

## 3. Application Route After Installation

Once installed on your server, the dashboard is accessed via the standalone portal route:

| Route | Type | Description |
|---|---|---|
| `http://<server-ip-or-domain>/courts` | **Standalone Web Portal** | Full-screen command centre optimized for wall displays, executive stations, tablets, and store managers without ERPNext sidebar overhead. |

> [!NOTE]
> The Desk Page (`/app/courts-dashboard`) was intentionally removed to keep ERPNext Desk clean and unencumbered.

---

## 4. Frappe App Structure (`courts_management`)

The Frappe app is located in the repository at:
```
courts_management/ (Repository Root)
├── setup.py                        <-- Standard setuptools package installer
├── pyproject.toml                  <-- PEP 621 package metadata
├── requirements.txt                <-- Python dependencies
├── package.json                    <-- Root npm build scripts
├── README.md                       <-- App overview
├── license.txt                     <-- MIT license
│
├── courts_management/              <-- Python Frappe package directory
│   ├── __init__.py
│   ├── hooks.py                    <-- App hooks & route rules (/courts)
│   ├── modules.txt
│   ├── patches.txt
│   ├── api.py                      <-- High-performance server-side Python API (get_dashboard_data)
│   ├── public/
│   │   └── courts/                 <-- Pre-compiled production bundle (JS, CSS, assets)
│   │       ├── index.html
│   │       └── assets/
│   └── www/
│       ├── courts.py               <-- Portal route controller (disables cache, injects CSRF)
│       └── courts.html             <-- Portal entry template for /courts
│
└── frontend/                       <-- React 19 + Vite Frontend Source Code
    ├── package.json
    ├── vite.config.js
    └── src/
```

---

## 5. Step-by-Step Installation on ERPNext Server

Follow these steps on your Frappe / ERPNext bench server:

> [!IMPORTANT]
> If a previous `bench get-app` attempt failed, first remove any partial folder:
> ```bash
> cd ~/courts-frappe  # or your bench directory
> rm -rf apps/courts_management
> ```

### Step 1: Clone the App via Bench
```bash
cd ~/courts-frappe
bench get-app https://github.com/abhirupanantdv/courts_management.git
```

### Step 2: Install the App onto your Target Site
Replace `[your-site-name]` with your actual site name (e.g. `courts.anantdv.com`):
```bash
bench --site [your-site-name] install-app courts_management
```

### Step 3: Run Migrations and Build Assets
```bash
bench --site [your-site-name] migrate
bench build --app courts_management
bench --site [your-site-name] clear-cache
```

### Step 4: Restart Web Workers
```bash
# Reload gunicorn to pick up the Python API (courts_management/api.py):
ps -ef | grep "/env/bin/gunicorn" | grep -v grep | head -n 1 | awk '{print $2}' | xargs kill
```

---

## 6. Verifying the Installation

Open your browser and navigate to:
```
http://<your-server-ip-or-domain>/courts
```
*(Example: `http://courts.anantdv.com/courts`)*

*The Courts Management Command Centre will load, check your session, and pull live database analytics from `courts_management.api.get_dashboard_data`.*

---

## 7. How to Update & Recompile Frontend Changes

If you make frontend code changes inside `Courts Management/`:

1. **Rebuild and Sync the Bundle:**
   Inside `Courts Management/`, run:
   ```bash
   npm run package:frappe
   ```
   *This automatically runs `vite build`, copies the minified bundle to `courts_management/courts_management/public/courts/`, and generates `courts.html` with updated cache-busted asset hashes.*

2. **Update the Server:**
   Push the updated `courts_management` directory to your server, then run:
   ```bash
   bench build --app courts_management
   bench --site site1.local clear-cache
   bench restart
   ```

---

## 8. Required DocTypes and User Permissions

Users accessing the Command Centre should have read access to the following standard ERPNext DocTypes:
- **Sales Invoice** (DocType: `Sales Invoice`)
- **Purchase Invoice** (DocType: `Purchase Invoice`)
- **Stock Bin** (DocType: `Bin`)
- **Stock Ledger** (DocType: `Stock Ledger Entry`)
- **General Ledger** (DocType: `GL Entry`)
- **Payment Entry** (DocType: `Payment Entry`)
- **Warehouse** (DocType: `Warehouse`)
- **Customer** (DocType: `Customer`)
- **Supplier** (DocType: `Supplier`)
- **Item** (DocType: `Item`)

### Standard User Roles Compatible:
- `System Manager`
- `Accounts Manager` / `Accounts User`
- `Stock Manager` / `Stock User`
- `Sales Manager` / `Sales User`

---

## 9. Troubleshooting & FAQ

### Q: Visiting `/courts` displays a 404 or Frappe page not found.
- Verify the app is installed on the site: `bench --site site1.local list-apps`
- Re-run database migration to register route rules: `bench --site site1.local migrate`
- Clear the website cache: `bench --site site1.local clear-cache`
- Restart bench: `bench restart`

### Q: Page loads but styles/assets fail to load.
- Ensure the assets are built: `bench build --app courts_management`
- Verify that `sites/assets/courts_management` symlink exists in your bench folder.
- If using NGINX, ensure `nginx.conf` correctly proxies `/assets/` to `sites/assets/`.

### Q: The dashboard shows "Sign In to Courts Central".
- If not already logged into ERPNext, log in using your ERPNext username and password directly on the screen.
- If logged in through Desk, the session cookie and CSRF token will automatically log you in without credentials.
