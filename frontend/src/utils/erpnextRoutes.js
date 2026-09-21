import { ERPNEXT_URL } from '../config/erpConfig.js';
export { ERPNEXT_URL };

export const erpNextRoutes = {
  dashboard: 'dashboard',
  sales: 'sales',
  inventory: 'inventory',
  purchases: 'purchases',
  finance: 'finance',
  reports: 'reports',
  salesReport: 'reports',
  purchaseReport: 'reports',
  inventoryReport: 'reports',
  profitLoss: 'finance',
  storePerformance: 'salesInventory',
  warehouseAnalysis: 'salesInventory',
};

export function redirectToErpNext(route) {
  // Prevent external redirect so the user always sticks with this UI
  console.warn('[Courts Management] External redirect intercepted to maintain in-app context:', route);
}
