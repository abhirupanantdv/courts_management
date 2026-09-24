/**
 * Role-Based Access Control (RBAC) definitions and helpers for Courts ERPNext Dashboard.
 * Maps authenticated user roles and authentic ERPNext DocType permissions to permitted dashboard modules and operational reports.
 */

export const SUPER_ADMIN_ROLES = [
  'System Manager',
  'Administrator',
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
 * Prioritizes authentic DocType permissions returned directly by ERPNext backend.
 */
export function canAccessModule(userRoles = [], moduleName, permissions = null) {
  if (isSuperAdmin(userRoles) || permissions?.isAdmin) return true;

  switch (moduleName) {
    case 'dashboard':
      return true;

    case 'sales':
      if (permissions && typeof permissions.sales === 'boolean') {
        return permissions.sales;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.sales);

    case 'salesInventory':
      if (permissions && typeof permissions.sales === 'boolean' && typeof permissions.inventory === 'boolean') {
        return permissions.sales || permissions.inventory;
      }
      return hasAnyRole(userRoles, [...ROLE_GROUPS.sales, ...ROLE_GROUPS.inventory]);

    case 'inventory':
      if (permissions && typeof permissions.inventory === 'boolean') {
        return permissions.inventory;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.inventory);

    case 'purchases':
      if (permissions && typeof permissions.purchases === 'boolean') {
        return permissions.purchases;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.purchases);

    case 'finance':
      if (permissions && typeof permissions.finance === 'boolean') {
        return permissions.finance;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.finance);

    case 'reports':
      return (
        canAccessModule(userRoles, 'sales', permissions) ||
        canAccessModule(userRoles, 'inventory', permissions) ||
        canAccessModule(userRoles, 'purchases', permissions) ||
        canAccessModule(userRoles, 'finance', permissions)
      );

    default:
      return false;
  }
}

/**
 * Checks if the user is authorized to view a specific report in the Reports Suite.
 * Prioritizes authentic DocType permissions returned directly by ERPNext backend.
 */
export function canAccessReport(userRoles = [], reportId, permissions = null) {
  if (isSuperAdmin(userRoles) || permissions?.isAdmin) return true;

  switch (reportId) {
    case 'sales-register':
    case 'salesman-pos-register':
      if (permissions && typeof permissions.sales === 'boolean') {
        return permissions.sales;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.sales);

    case 'stock-balance':
      if (permissions && typeof permissions.inventory === 'boolean') {
        return permissions.inventory;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.inventory);

    case 'purchase-register':
      if (permissions && typeof permissions.purchases === 'boolean') {
        return permissions.purchases;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.purchases);

    case 'profit-and-loss':
    case 'general-ledger':
      if (permissions && typeof permissions.finance === 'boolean') {
        return permissions.finance;
      }
      return hasAnyRole(userRoles, ROLE_GROUPS.finance);

    case 'store-matrix':
      if (permissions && typeof permissions.sales === 'boolean' && typeof permissions.inventory === 'boolean') {
        return permissions.sales || permissions.inventory;
      }
      return hasAnyRole(userRoles, [...ROLE_GROUPS.inventory, ...ROLE_GROUPS.sales]);

    default:
      return false;
  }
}
