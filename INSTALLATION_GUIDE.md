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

## 3. Application Routes After Installation

Once installed on your server, the app is available via two distinct routes:

| Route | Type | Description |
|---|---|---|
| `http://<server-ip-or-domain>/courts` | **Standalone Web Portal** | Full-screen command centre optimized for wall displays, executive tablets, and operational stations without ERPNext sidebar overhead. |
| `http://<server-ip-or-domain>/app/courts-dashboard` | **Desk Page** | Native ERPNext Desk page embedded inside the Desk layout with search bar and workspace navigation. |

---

## 4. Frappe App Structure (`courts_management`)

The Frappe app is located in the repository at:
```
courts_management/ (Repository Root)
├── setup.py                        <-- Standard setuptools package installer
├── pyproject.toml                  <-- PEP 621 package metadata
├── requirements.txt                <-- Python dependencies (frappe)
├── package.json                    <-- Root npm build scripts
├── README.md                       <-- App overview
├── license.txt                     <-- MIT license
│
├── courts_management/              <-- Python Frappe package directory
│   ├── __init__.py
│   ├── hooks.py                    <-- App hooks & route rules (/courts)
│   ├── modules.txt
│   ├── patches.txt
│   ├── public/
│   │   └── courts/                 <-- Pre-compiled production bundle (JS, CSS, assets)
│   │       ├── index.html
│   │       └── assets/
│   ├── www/
│   │   ├── courts.py               <-- Portal route controller (disables cache, injects CSRF)
│   │   └── courts.html             <-- Portal entry template for /courts
│   └── page/
│       └── courts_dashboard/       <-- Frappe Desk Page (/app/courts-dashboard)
│           ├── courts_dashboard.json
│           ├── courts_dashboard.js
│           └── courts_dashboard.css
│
└── frontend/                       <-- React 19 + Vite Frontend Source Code
    ├── package.json
    ├── vite.config.js
    └── src/
```

---

## 5. Step-by-Step Installation on ERPNext Server

Follow these steps on your Frappe / ERPNext bench server (Ubuntu / Debian / Docker):

> [!IMPORTANT]
> If a previous `bench get-app` attempt failed, first remove any partial folder:
> ```bash
> cd ~/courts-frappe  # or your bench directory
> rm -rf apps/courts_management
> ```

### Step 1: Clone the App via Bench
```bash
cd ~/courts-frappe  # (or ~/frappe-bench)
bench get-app https://github.com/abhirupanantdv/courts_management.git
```

### Step 2: Install the App onto your Target Site
Replace `[your-site-name]` with your actual site name (e.g. `site1.local` or `frontend.local`):
```bash
bench --site [your-site-name] install-app courts_management
```

### Step 4: Run Migrations and Build Assets
```bash
bench --site site1.local migrate
bench build --app courts_management
bench --site site1.local clear-cache
```

### Step 5: Restart Bench Services
```bash
# If running production with Supervisor & NGINX:
sudo supervisorctl restart all
sudo systemctl reload nginx

# If running local bench development server:
bench restart
```

---

## 6. Verifying the Installation

1. Open your browser and navigate to:
   ```
   http://<your-server-ip-or-domain>/courts
   ```
   *The Courts Management Command Centre will load immediately, detect the server origin, authenticate your session, and pull live ledger, inventory, and sales data.*

2. Alternatively, log into ERPNext Desk and go to:
   ```
   http://<your-server-ip-or-domain>/app/courts-dashboard
   ```
   Or type **Courts Command Centre** into the ERPNext Awesomebar search (Ctrl + K / Cmd + K).

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
