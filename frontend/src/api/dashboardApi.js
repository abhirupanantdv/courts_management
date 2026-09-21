import { getResource } from './erpnextClient.js';
import { buildDashboardDataFromErpNext } from './erpnextDashboardMapper.js';

export async function getErpNextDashboardData() {
  const submittedFilter = [['docstatus', '=', 1]];

  const requests = {
    salesInvoices: getResource('Sales Invoice', {
      fields: ['name', 'customer', 'grand_total', 'posting_date', 'company', 'status', 'due_date'],
      filters: submittedFilter,
      order_by: 'posting_date desc',
      limit: 1000,
    }),
    purchaseInvoices: getResource('Purchase Invoice', {
      fields: ['name', 'supplier', 'grand_total', 'posting_date', 'company', 'status', 'due_date'],
      filters: submittedFilter,
      order_by: 'posting_date desc',
      limit: 1000,
    }),
    bins: getResource('Bin', {
      fields: ['name', 'item_code', 'warehouse', 'actual_qty', 'stock_value', 'reserved_qty', 'projected_qty'],
      limit: 1000,
    }),
    warehouses: getResource('Warehouse', {
      fields: ['name', 'warehouse_name', 'company', 'is_group', 'disabled'],
      filters: [['disabled', '=', 0]],
      limit: 500,
    }),
    customers: getResource('Customer', {
      fields: ['name', 'customer_name', 'customer_group', 'territory'],
      limit: 500,
    }),
    suppliers: getResource('Supplier', {
      fields: ['name', 'supplier_name', 'supplier_group'],
      limit: 500,
    }),
    salesItems: getResource('Sales Invoice Item', {
      fields: ['parent', 'item_code', 'item_name', 'warehouse', 'qty', 'amount'],
      limit: 1000,
    }),
    items: getResource('Item', {
      fields: ['name', 'item_name', 'item_group', 'disabled', 'stock_uom', 'standard_rate'],
      filters: [['disabled', '=', 0]],
      limit: 1000,
    }),
    glEntries: getResource('GL Entry', {
      fields: ['name', 'posting_date', 'account', 'party', 'debit', 'credit', 'voucher_type', 'voucher_no'],
      order_by: 'posting_date desc',
      limit: 200,
    }),
  };

  const entries = await Promise.allSettled(
    Object.entries(requests).map(async ([key, promise]) => [key, await promise]),
  );

  const erpData = {};
  const warnings = [];

  entries.forEach((entry) => {
    if (entry.status === 'fulfilled') {
      const [key, value] = entry.value;
      erpData[key] = value;
    } else {
      warnings.push(entry.reason.message);
    }
  });

  return buildDashboardDataFromErpNext(erpData, warnings);
}
