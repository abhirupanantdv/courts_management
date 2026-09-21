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

## Direct Routes after Installation:
- **Standalone Command Centre:** `http://<your-server-ip-or-dns>/courts`
- **Frappe Desk Page:** `http://<your-server-ip-or-dns>/app/courts-dashboard`

## Features:
- **Automatic IP/DNS detection:** Dynamically reads `window.location.origin` - zero IP configuration needed.
- **CSRF & Cookie Authentication:** Automatically inherits active session from Frappe.
