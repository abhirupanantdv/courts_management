/**
 * Dynamic ERPNext DocType Permission Helpers.
 * Zero hardcoded roles or static configurations.
 * Evaluates access based entirely on authentic ERPNext tabDocPerm resolution from the server.
 */

/**
 * Checks if the user has read or select permission on a specific ERPNext DocType or category.
 * @param {Object} permissions - doctypePermissions dictionary from ERPNext backend
 * @param {string|string[]} doctype - DocType name(s), e.g. 'Sales Invoice', ['Bin', 'Item']
 * @returns {boolean}
 */
export function hasDocTypePermission(permissions = {}, doctype) {
  if (!permissions) return false;
  let p = permissions;
  if (p.doctypePermissions) p = p.doctypePermissions;
  else if (p.permissions) p = p.permissions;

  if (p.isAdmin) return true;

  if (Array.isArray(doctype)) {
    return doctype.some((dt) => Boolean(p[dt]));
  }
  return Boolean(p[doctype]);
}

/**
 * Checks if the user is authorized to view a primary dashboard module tab.
 * Supports both:
 *   canAccessModule(permissions, moduleName)
 *   canAccessModule(userRoles, moduleName, permissions)
 *   canAccessModule(moduleName, permissions)
 */
export function canAccessModule(arg1, arg2, arg3) {
  let perms = {};
  let moduleName = '';

  if (typeof arg2 === 'string') {
    moduleName = arg2;
    if (arg3 && typeof arg3 === 'object') {
      perms = arg3;
    } else if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
      perms = arg1;
    }
  } else if (typeof arg1 === 'string') {
    moduleName = arg1;
    perms = (arg2 && typeof arg2 === 'object') ? arg2 : {};
  } else if (arg1 && typeof arg1 === 'object' && typeof arg2 === 'string') {
    perms = arg1;
    moduleName = arg2;
  }

  if (perms?.doctypePermissions) perms = perms.doctypePermissions;
  else if (perms?.permissions) perms = perms.permissions;

  if (!perms) return false;
  if (perms.isAdmin) return true;

  switch (moduleName) {
    case 'dashboard':
      return true;

    case 'sales':
      return hasDocTypePermission(perms, ['Sales Invoice', 'POS Invoice', 'sales']);

    case 'salesInventory':
      return (
        hasDocTypePermission(perms, ['Sales Invoice', 'POS Invoice', 'sales']) ||
        hasDocTypePermission(perms, ['Bin', 'Item', 'Warehouse', 'inventory'])
      );

    case 'inventory':
      return hasDocTypePermission(perms, ['Bin', 'Item', 'Warehouse', 'inventory']);

    case 'purchases':
      return hasDocTypePermission(perms, ['Purchase Invoice', 'purchases']);

    case 'finance':
      return hasDocTypePermission(perms, ['GL Entry', 'Account', 'finance']);

    case 'reports':
      return (
        hasDocTypePermission(perms, ['Sales Invoice', 'POS Invoice', 'sales']) ||
        hasDocTypePermission(perms, ['Bin', 'Item', 'Warehouse', 'inventory']) ||
        hasDocTypePermission(perms, ['Purchase Invoice', 'purchases']) ||
        hasDocTypePermission(perms, ['GL Entry', 'Account', 'finance'])
      );

    default:
      return hasDocTypePermission(perms, moduleName);
  }
}

/**
 * Checks if the user is authorized to view a specific report based on underlying ERPNext DocType.
 */
export function canAccessReport(arg1, arg2, arg3) {
  let perms = {};
  let reportId = '';

  if (typeof arg2 === 'string') {
    reportId = arg2;
    if (arg3 && typeof arg3 === 'object') {
      perms = arg3;
    } else if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
      perms = arg1;
    }
  } else if (typeof arg1 === 'string') {
    reportId = arg1;
    perms = (arg2 && typeof arg2 === 'object') ? arg2 : {};
  } else if (arg1 && typeof arg1 === 'object' && typeof arg2 === 'string') {
    perms = arg1;
    reportId = arg2;
  }

  if (perms?.doctypePermissions) perms = perms.doctypePermissions;
  else if (perms?.permissions) perms = perms.permissions;

  if (!perms) return false;
  if (perms.isAdmin) return true;

  switch (reportId) {
    case 'sales-register':
      return hasDocTypePermission(perms, 'Sales Invoice');

    case 'salesman-pos-register':
      return hasDocTypePermission(perms, ['POS Invoice', 'Sales Invoice']);

    case 'stock-balance':
      return hasDocTypePermission(perms, ['Bin', 'Item']);

    case 'purchase-register':
      return hasDocTypePermission(perms, 'Purchase Invoice');

    case 'profit-and-loss':
      return hasDocTypePermission(perms, ['GL Entry', 'Sales Invoice']);

    case 'general-ledger':
      return hasDocTypePermission(perms, 'GL Entry');

    case 'store-matrix':
      return hasDocTypePermission(perms, ['Warehouse', 'Bin', 'Sales Invoice']);

    default:
      return false;
  }
}

/**
 * Returns the human-readable ERPNext DocType for display in permission alerts.
 */
export function getRequiredDocType(key) {
  const map = {
    sales: 'Sales Invoice',
    'sales-register': 'Sales Invoice',
    'salesman-pos-register': 'POS Invoice',
    purchases: 'Purchase Invoice',
    'purchase-register': 'Purchase Invoice',
    inventory: 'Bin / Item',
    'stock-balance': 'Bin / Item',
    'store-matrix': 'Warehouse',
    finance: 'GL Entry',
    'profit-and-loss': 'GL Entry',
    'general-ledger': 'GL Entry',
  };
  return map[key] || key;
}
