# Courts Management - Frappe / ERPNext App

Modern, real-time enterprise command centre, POS register, stock ledger, sales intelligence, and financial analytics dashboard.

## Installation on Frappe Bench:
```bash
cd ~/frappe-bench
bench get-app https://github.com/abhirupanantdv/courts_management.git
bench --site [your-site-name] install-app courts_management
bench --site [your-site-name] migrate
bench build --app courts_management
bench restart
```

## Direct Route after Installation:
- **Standalone Command Centre:** `http://<your-server-ip-or-dns>/courts`

## Features:
- **Dynamic origin detection:** Dynamically reads `window.location.origin` from the browser.
- **Session-Based Authentication:** Standard secure session cookie authentication.
