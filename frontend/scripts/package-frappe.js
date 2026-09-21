import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..'); // frontend directory
const distDir = path.join(projectRoot, 'dist');
const frappeAppRoot = path.resolve(projectRoot, '..'); // Repository root (where bench looks for setup.py)
const frappeModuleDir = path.join(frappeAppRoot, 'courts_management');
const frappePublicCourtsDir = path.join(frappeModuleDir, 'public', 'courts');
const frappeWwwDir = path.join(frappeModuleDir, 'www');
const frappePageDir = path.join(frappeModuleDir, 'page', 'courts_dashboard');
const frappeModulePageDir = path.join(frappeModuleDir, 'courts_management', 'page', 'courts_dashboard');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyRecursive(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Packaging Courts Management for Frappe / ERPNext ---');

// 1. Verify dist exists
if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory not found! Run "npm run build" first.');
  process.exit(1);
}

// 2. Create Frappe App Directory Tree
ensureDir(frappeAppRoot);
ensureDir(frappeModuleDir);
ensureDir(frappePublicCourtsDir);
ensureDir(frappeWwwDir);
ensureDir(frappePageDir);
ensureDir(frappeModulePageDir);

// 3. Copy compiled dist into public/courts
console.log('Copying dist/ -> courts_management/public/courts/ ...');
copyRecursive(distDir, frappePublicCourtsDir);

// 4. Create setup.py & pyproject.toml at repository root
const setupPy = `from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = [line.strip() for line in f.read().splitlines() if line.strip() and not line.startswith("#")]

setup(
    name="courts_management",
    version="1.0.0",
    description="Courts Management Command Centre - Real-time ERP Intelligence Dashboard",
    author="Courts Management Team",
    author_email="admin@courts.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires
)
`;
fs.writeFileSync(path.join(frappeAppRoot, 'setup.py'), setupPy, 'utf-8');

const pyprojectToml = `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "courts_management"
version = "1.0.0"
description = "Courts Management Command Centre for Frappe / ERPNext"
readme = "README.md"
authors = [{ name = "Courts Team", email = "admin@courts.com" }]
dependencies = []
`;
fs.writeFileSync(path.join(frappeAppRoot, 'pyproject.toml'), pyprojectToml, 'utf-8');

fs.writeFileSync(path.join(frappeAppRoot, 'requirements.txt'), "# Frappe custom app dependencies\n", 'utf-8');
fs.writeFileSync(path.join(frappeAppRoot, 'license.txt'), "MIT\n", 'utf-8');

// 5. Frappe App __init__.py & modules.txt
fs.writeFileSync(path.join(frappeModuleDir, '__init__.py'), '__version__ = "1.0.0"\n', 'utf-8');
fs.writeFileSync(path.join(frappeModuleDir, 'modules.txt'), "Courts Management\n", 'utf-8');
fs.writeFileSync(path.join(frappeModuleDir, 'patches.txt'), "", 'utf-8');

// 6. Frappe hooks.py
const hooksPy = `app_name = "courts_management"
app_title = "Courts Management"
app_publisher = "Courts Management Team"
app_description = "Courts Management Command Centre - Live Enterprise Intelligence Dashboard"
app_email = "admin@courts.com"
app_license = "MIT"
app_version = "1.0.0"

# Website routing: Maps /courts to the standalone full-screen web portal
website_route_rules = [
    {"from_route": "/courts/<path:app_path>", "to_route": "courts"},
    {"from_route": "/courts", "to_route": "courts"},
]

# Ensure assets are served
app_include_js = []
app_include_css = []
`;
fs.writeFileSync(path.join(frappeModuleDir, 'hooks.py'), hooksPy, 'utf-8');

// 7. www/courts.py
const wwwCourtsPy = `import frappe

no_cache = 1

def get_context(context):
    context.no_cache = 1
    context.show_sidebar = False
    csrf_token = ""
    try:
        csrf_token = frappe.sessions.get_csrf_token()
    except Exception:
        pass
    context.csrf_token = csrf_token
    return context
`;
fs.writeFileSync(path.join(frappeWwwDir, 'courts.py'), wwwCourtsPy, 'utf-8');

// 8. www/courts.html (Find generated asset names from dist)
const distIndexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const jsMatch = distIndexHtml.match(/src=["']\.\/assets\/([^"']+)["']/);
const cssMatch = distIndexHtml.match(/href=["']\.\/assets\/([^"']+)["']/);

const jsFile = jsMatch ? jsMatch[1] : '';
const cssFile = cssMatch ? cssMatch[1] : '';

const wwwCourtsHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#1264d8" />
    <title>Courts Management Command Centre</title>
    <base href="/assets/courts_management/courts/" />
    ${cssFile ? `<link rel="stylesheet" crossorigin href="/assets/courts_management/courts/assets/${cssFile}">` : ''}
  </head>
  <body>
    <div id="root">
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f1f5f9; font-family: system-ui, -apple-system, sans-serif; color: #0b1e36;">
        <div style="width: 48px; height: 48px; border: 4px solid #cbd5e1; border-top-color: #1264d8; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;"></div>
        <div style="font-size: 18px; font-weight: 700; letter-spacing: 0.5px; color: #1264d8;">COURTS</div>
        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Connecting to Live Command Centre...</div>
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </div>
    <script>
      window.frappe = window.frappe || {};
      window.frappe.csrf_token = "{{ csrf_token }}";
    </script>
    ${jsFile ? `<script type="module" crossorigin src="/assets/courts_management/courts/assets/${jsFile}"></script>` : ''}
  </body>
</html>
`;
fs.writeFileSync(path.join(frappeWwwDir, 'courts.html'), wwwCourtsHtml, 'utf-8');

// 9. Create Desk Page: courts_dashboard
const deskPageJson = {
  "content": null,
  "creation": "2026-09-20 12:00:00.000000",
  "docstatus": 0,
  "doctype": "Page",
  "idx": 0,
  "modified": "2026-09-20 12:00:00.000000",
  "modified_by": "Administrator",
  "module": "Courts Management",
  "name": "courts-dashboard",
  "owner": "Administrator",
  "page_name": "courts-dashboard",
  "roles": [
    { "role": "System Manager" },
    { "role": "Accounts Manager" },
    { "role": "Stock Manager" },
    { "role": "Sales Manager" }
  ],
  "standard": "Yes",
  "system_page": 0,
  "title": "Courts Command Centre"
};

const deskPageJs = `frappe.pages['courts-dashboard'].on_page_load = function(wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: 'Courts Command Centre',
    single_column: true
  });

  // Render seamless full-height interactive iframe pointing to /courts
  var $container = $(wrapper).find('.layout-main-section');
  $container.empty();
  
  var $iframe = $('<iframe>', {
    src: '/courts',
    style: 'width: 100%; height: calc(100vh - 95px); min-height: 850px; border: none; display: block; border-radius: 8px;'
  });

  $container.append($iframe);
};
`;

const deskPageCss = `.layout-main-section {
  padding: 0 !important;
}
`;

// Write Desk Page to both locations for full Frappe compatibility
for (const dir of [frappePageDir, frappeModulePageDir]) {
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'courts_dashboard.json'), JSON.stringify(deskPageJson, null, 2), 'utf-8');
  fs.writeFileSync(path.join(dir, 'courts_dashboard.js'), deskPageJs, 'utf-8');
  fs.writeFileSync(path.join(dir, 'courts_dashboard.css'), deskPageCss, 'utf-8');
}

// 10. Write README.md at Frappe app repository root
const readmeMd = `# Courts Management - Frappe / ERPNext App

Modern, real-time enterprise command centre, POS register, stock ledger, sales intelligence, and financial analytics dashboard.

## Installation on Frappe Bench:
\`\`\`bash
cd ~/frappe-bench
bench get-app https://github.com/abhirupanantdv/courts_management.git
bench --site [your-site-name] install-app courts_management
bench --site [your-site-name] migrate
bench build --app courts_management
bench restart
\`\`\`

## Direct Routes after Installation:
- **Standalone Command Centre:** \`http://<your-server-ip-or-dns>/courts\`
- **Frappe Desk Page:** \`http://<your-server-ip-or-dns>/app/courts-dashboard\`

## Features:
- **Automatic IP/DNS detection:** Dynamically reads \`window.location.origin\` - zero IP configuration needed.
- **CSRF & Cookie Authentication:** Automatically inherits active session from Frappe.
`;
fs.writeFileSync(path.join(frappeAppRoot, 'README.md'), readmeMd, 'utf-8');

console.log('✓ Successfully created installable Frappe app at root: ' + frappeAppRoot);
console.log('✓ Public assets synced: ' + frappePublicCourtsDir);
console.log('✓ Web Portal route created: /courts (courts_management/www/courts.html)');
console.log('✓ Desk Page route created: /app/courts-dashboard');
