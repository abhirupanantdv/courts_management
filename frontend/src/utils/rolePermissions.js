/**
 * Role-Based Access Control (RBAC) definitions and helpers for Courts ERPNext Dashboard.
 * Maps authenticated user roles to permitted dashboard modules and operational reports.
 */

export const SUPER_ADMIN_ROLES = [
  'System Manager',
  'Administrator',
  'Workspace Manager',
  'Dashboard Manager',
  'Report Manager',
  'President',
  'GM',
  'CFO',
  'adv developer',
];

export const ROLE_GROUPS = {
  sales: [
    'Sales User',
    'Sales Manager',
    'Sales Master Manager',
    'Sales Person',
    'AI Command Center User',
    'AI Command Center Manager',
  ],
  inventory: [
    'Stock User',
    'Stock Manager',
    'Item Manager',
  ],
  purchases: [
    'Purchase User',
    'Purchase Manager',
    'Purchase Master Manager',
  ],
  finance: [
    'Accounts User',
    'Accounts Manager',
    'Auditor',
  ],
};

/**
 * Returns true if the user has any of the super-admin or system manager roles.
 */
export function isSuperAdmin(userRoles = []) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) return false;
  return userRoles.some((role) => SUPER_ADMIN_ROLES.includes(role));
}

/**
 * Returns true if the user possesses at least one role from the required list.
 */
export function hasAnyRole(userRoles = [], requiredRoles = []) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) return false;
  if (isSuperAdmin(userRoles)) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Checks if the user is authorized to view a primary dashboard module.
 */
export function canAccessModule(userRoles = [], moduleName) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    // If roles are not yet loaded, default to open for dashboard to prevent locking out
    return moduleName === 'dashboard';
  }

  if (isSuperAdmin(userRoles)) return true;

  switch (moduleName) {
    case 'dashboard':
      // The executive overview is accessible to all logged-in staff
      return true;

    case 'sales':
      return hasAnyRole(userRoles, ROLE_GROUPS.sales);

    case 'salesInventory':
      // Requires either sales or stock roles
      return hasAnyRole(userRoles, [...ROLE_GROUPS.sales, ...ROLE_GROUPS.inventory]);

    case 'inventory':
      return hasAnyRole(userRoles, ROLE_GROUPS.inventory);

    case 'purchases':
      return hasAnyRole(userRoles, ROLE_GROUPS.purchases);

    case 'finance':
      return hasAnyRole(userRoles, ROLE_GROUPS.finance);

    case 'reports':
      // Accessible if user has access to at least one report category
      return (
        hasAnyRole(userRoles, ROLE_GROUPS.sales) ||
        hasAnyRole(userRoles, ROLE_GROUPS.inventory) ||
        hasAnyRole(userRoles, ROLE_GROUPS.purchases) ||
        hasAnyRole(userRoles, ROLE_GROUPS.finance)
      );

    default:
      return true;
  }
}

/**
 * Checks if the user is authorized to view a specific report in the Reports Suite.
 */
export function canAccessReport(userRoles = [], reportId) {
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    // Safe default before roles load: sales register
    return reportId === 'sales-register';
  }

  if (isSuperAdmin(userRoles)) return true;

  switch (reportId) {
    case 'sales-register':
    case 'salesman-pos-register':
      return hasAnyRole(userRoles, ROLE_GROUPS.sales);

    case 'stock-balance':
      return hasAnyRole(userRoles, ROLE_GROUPS.inventory);

    case 'purchase-register':
      return hasAnyRole(userRoles, ROLE_GROUPS.purchases);

    case 'profit-and-loss':
    case 'general-ledger':
      return hasAnyRole(userRoles, ROLE_GROUPS.finance);

    case 'store-matrix':
      return hasAnyRole(userRoles, [...ROLE_GROUPS.inventory, ...ROLE_GROUPS.sales]);

    default:
      return false;
  }
}
