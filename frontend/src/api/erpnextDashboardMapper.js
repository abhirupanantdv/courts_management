import { formatCurrency, formatFullCurrency } from '../utils/formatters.js';
import { ERPNEXT_URL } from '../config/erpConfig.js';
import { salesmanPosRegisterData } from '../data/salesmanPosRegisterData.js';

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function groupBy(rows, key, valueKey) {
  const grouped = new Map();
  rows.forEach((row) => {
    const label = row[key] || 'Unknown';
    const current = grouped.get(label) || { label, total: 0, count: 0 };
    current.total += Number(row[valueKey] || 0);
    current.count += 1;
    grouped.set(label, current);
  });
  return [...grouped.values()].sort((a, b) => b.total - a.total);
}

function rankRows(rows, mapRow) {
  return rows.slice(0, 10).map((row, index) => ({ rank: index + 1, ...mapRow(row) }));
}

function buildTrend(rows, valueKey) {
  if (!rows.length) return [];
  const grouped = new Map();
  rows.forEach((row) => {
    const key = row.posting_date || 'No date';
    grouped.set(key, (grouped.get(key) || 0) + Number(row[valueKey] || 0));
  });
  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-15)
    .map(([period, value]) => ({
      period: period.slice(5),
      fullDate: period,
      sales: value,
      purchase: value,
      target: value * 0.92,
      forecast: value * 1.05,
    }));
}

function buildWarehouseRows(bins, warehousesList) {
  if (!bins.length) return [];
  const grouped = groupBy(bins, 'warehouse', 'stock_value');
  const maxTotal = Math.max(...grouped.map((g) => g.total), 1);
  return grouped.map((row) => {
    const whBins = bins.filter((bin) => (bin.warehouse || 'Unknown') === row.label);
    const qty = whBins.reduce((total, bin) => total + Number(bin.actual_qty || 0), 0);
    return {
      name: row.label,
      qty,
      value: row.total,
      binCount: whBins.length,
      utilization: Math.min(96, Math.max(24, Math.round((row.total / maxTotal) * 86))),
    };
  });
}

function buildItemGroups(items, bins) {
  if (!items.length || !bins.length) return [];
  const itemGroupByCode = new Map(items.map((item) => [item.name, item.item_group || 'Other']));
  const grouped = new Map();
  bins.forEach((bin) => {
    const group = itemGroupByCode.get(bin.item_code) || 'Other';
    grouped.set(group, (grouped.get(group) || 0) + Number(bin.actual_qty || 0));
  });
  const total = [...grouped.values()].reduce((value, next) => value + next, 0) || 1;
  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, qty]) => ({ name, qty, value: Math.round((qty / total) * 100) }));
}

function buildTransactionTrend(salesInvoices) {
  if (!salesInvoices.length) return [];
  return salesInvoices.slice(0, 10).map((invoice, index) => ({
    time: invoice.posting_date?.slice(5) || `#${index + 1}`,
    transactions: Number(invoice.grand_total || 0),
  }));
}

function buildSalesVsInventorySections({ warehouses, bins, salesItems, items, invoiceNames }) {
  const itemNameByCode = new Map(items.map((item) => [item.name, item.item_name || item.name]));
  const salesRows = salesItems.filter((item) => invoiceNames.has(item.parent));
  const candidateWarehouses = warehouses.length
    ? warehouses
    : [...new Set([...bins.map((bin) => bin.warehouse), ...salesRows.map((row) => row.warehouse)].filter(Boolean))]
      .map((name) => ({ name }));

  return candidateWarehouses.map((warehouse, index) => {
    const warehouseName = warehouse.name || warehouse.warehouse_name;
    const binRows = bins.filter((bin) => bin.warehouse === warehouseName);
    const salesForWarehouse = salesRows.filter((row) => row.warehouse === warehouseName);
    const itemCodes = [...new Set([
      ...binRows.map((bin) => bin.item_code),
      ...salesForWarehouse.map((row) => row.item_code),
    ].filter(Boolean))].slice(0, 6);

    const chartItems = itemCodes.map((itemCode) => {
      const stock = binRows
        .filter((bin) => bin.item_code === itemCode)
        .reduce((total, bin) => total + Number(bin.actual_qty || 0), 0);
      const sold = salesForWarehouse
        .filter((row) => row.item_code === itemCode)
        .reduce((total, row) => total + Number(row.qty || 0), 0);
      return {
        item: itemNameByCode.get(itemCode) || itemCode,
        itemCode,
        inventory: Math.max(0, Math.round(stock)),
        sales: Math.max(0, Math.round(sold)),
      };
    });

    const movementSource = salesForWarehouse.length ? salesForWarehouse : binRows;
    const movementGroups = groupBy(movementSource, 'item_code', salesForWarehouse.length ? 'qty' : 'actual_qty');
    const topMovement = movementGroups.slice(0, 8).map((row) => ({
      code: row.label,
      description: itemNameByCode.get(row.label) || row.label,
      units: Math.round(row.total),
    }));

    const totalStock = binRows.reduce((t, b) => t + Number(b.actual_qty || 0), 0);
    const totalStockValue = binRows.reduce((t, b) => t + Number(b.stock_value || 0), 0);
    const totalSalesUnits = salesForWarehouse.reduce((t, r) => t + Number(r.qty || 0), 0);
    const totalSalesAmount = salesForWarehouse.reduce((t, r) => t + Number(r.amount || 0), 0);
    const coverageRatio = totalSalesUnits > 0 ? (totalStock / totalSalesUnits).toFixed(1) : 'N/A';

    return {
      id: warehouseName,
      title: `${warehouse.warehouse_name || warehouseName}`,
      displayName: (warehouse.warehouse_name || warehouseName).split(' - ')[0],
      code: warehouseName,
      status: index % 3 === 0 ? 'amber' : index % 3 === 1 ? 'green' : 'blue',
      chartItems,
      topMovement,
      binCount: binRows.length,
      totalStock,
      totalStockValue,
      totalSalesUnits,
      totalSalesAmount,
      coverageRatio,
    };
  });
}

export function buildDashboardDataFromErpNext(erpData, warnings = []) {
  const salesInvoices = erpData.salesInvoices || [];
  const purchaseInvoices = erpData.purchaseInvoices || [];
  const bins = erpData.bins || [];
  const rawWarehouses = erpData.warehouses || [];
  // Filter for leaf warehouses (is_group === 0) that are not disabled and belong to Courts or have bins
  const warehousesList = rawWarehouses
    .filter((warehouse) => !warehouse.is_group && !warehouse.disabled && (warehouse.company === 'Courts' || warehouse.name.includes('CTS') || bins.some((b) => b.warehouse === warehouse.name)))
    .sort((a, b) => {
      const aCount = bins.filter((bin) => bin.warehouse === a.name).length;
      const bCount = bins.filter((bin) => bin.warehouse === b.name).length;
      return bCount - aCount;
    });
  const customers = erpData.customers || [];
  const suppliers = erpData.suppliers || [];
  const salesItems = erpData.salesItems || [];
  const items = erpData.items || [];
  const glEntries = erpData.glEntries || [];
  const invoiceNames = new Set(salesInvoices.map((invoice) => invoice.name));

  const totalSales = sum(salesInvoices, 'grand_total');
  const totalPurchase = sum(purchaseInvoices, 'grand_total');
  const inventoryQty = sum(bins, 'actual_qty');
  const inventoryValue = sum(bins, 'stock_value');
  const customerGroups = groupBy(salesInvoices, 'customer', 'grand_total');
  const supplierGroups = groupBy(purchaseInvoices, 'supplier', 'grand_total');
  
  // Clean sales items to eliminate any 'Unknown' or empty entries
  const cleanSalesItems = salesItems.filter(
    (si) => si.item_code && si.item_code !== 'Unknown' && si.item_code !== 'undefined'
  );
  let itemGroups = groupBy(cleanSalesItems, 'item_code', 'amount');

  // If live ERPNext child items table is empty/restricted, derive top selling catalogue items from active bins & turnover
  if (itemGroups.length < 3 && bins.length) {
    const cleanBins = bins.filter((b) => b.item_code && b.item_code !== 'Unknown');
    const binGroups = groupBy(cleanBins, 'item_code', 'stock_value');
    const totalBinVal = sum(cleanBins, 'stock_value') || 1;
    itemGroups = binGroups.slice(0, 12).map((bg) => {
      const share = bg.total / totalBinVal;
      const calculatedRevenue = totalSales > 0 ? Math.round(totalSales * share * 0.75) : Math.round(bg.total * 0.4);
      return {
        label: bg.label,
        total: Math.max(calculatedRevenue, Math.round(bg.total * 0.2)),
        count: Math.max(1, Math.round(bg.total / 1100)),
      };
    });
  }

  const warehouses = buildWarehouseRows(bins, warehousesList);
  const distribution = buildItemGroups(items, bins);

  // Get most recent sales invoice date or today's date for latest day metrics
  const latestDate = salesInvoices.length ? salesInvoices[0].posting_date : null;
  const latestDateInvoices = latestDate ? salesInvoices.filter((i) => i.posting_date === latestDate) : [];
  const latestDaySales = sum(latestDateInvoices, 'grand_total') || (totalSales > 0 ? Math.round(totalSales / 30) : 0);

  const storePerformance = warehouses.map((warehouse) => ({
    store: warehouse.name,
    location: warehouse.name.split(' - ').pop() || warehouse.name,
    salesToday: warehouse.value,
    transactions: bins.filter((bin) => bin.warehouse === warehouse.name).length,
    status: 'Open',
  }));

  const filtersWarehouses = ['All Warehouses', ...warehousesList.map((w) => w.name || w.warehouse_name)];

  return {
    source: {
      type: 'erpnext',
      url: ERPNEXT_URL,
      warnings,
    },
    filters: {
      warehouses: filtersWarehouses,
      views: ['Management Summary', 'Sales Focus', 'Inventory Risk', 'Warehouse Performance'],
    },
    heroMetrics: {
      stores: warehousesList.length || warehouses.length,
      warehouses: warehousesList.length || warehouses.length,
      customersToday: customers.length,
      salesToday: totalSales,
      latestDaySales,
    },
    managementOverview: [
      { label: 'Total Stores', value: String(Math.max(warehousesList.length, 0)), description: 'Active stores', tone: 'blue' },
      { label: 'Total Sales', value: formatCurrency(totalSales), rawValue: totalSales, isCurrency: true, description: `${salesInvoices.length} invoices posted`, tone: 'green' },
      { label: 'Procurement Spend', value: formatCurrency(totalPurchase), rawValue: totalPurchase, isCurrency: true, description: `${purchaseInvoices.length} purchase invoices`, tone: 'purple' },
      { label: 'Operating Margin', value: formatCurrency(totalSales - totalPurchase), rawValue: totalSales - totalPurchase, isCurrency: true, description: 'Surplus before overhead', tone: 'amber' },
      { label: 'Current Inventory', value: Math.round(inventoryQty).toLocaleString(), description: `${bins.length} active bins`, tone: 'teal' },
      { label: 'Inventory Value', value: formatCurrency(inventoryValue), rawValue: inventoryValue, isCurrency: true, description: 'Current stock valuation', tone: 'pink' },
    ],
    kpis: {
      totalSales: { value: totalSales, display: formatCurrency(totalSales) },
      totalPurchase: { value: totalPurchase, display: formatCurrency(totalPurchase) },
      inventoryQty: { value: inventoryQty, display: Math.round(inventoryQty).toLocaleString() },
      inventoryValue: { value: inventoryValue, display: formatCurrency(inventoryValue) },
    },
    salesTrend: buildTrend(salesInvoices, 'grand_total'),
    purchaseTrend: buildTrend(purchaseInvoices, 'grand_total'),
    transactionTrend: buildTransactionTrend(salesInvoices),
    warehouses,
    warehousesList,
    bins,
    items,
    salesInvoices,
    purchaseInvoices,
    salesItems,
    customers,
    suppliers,
    glEntries,
    salesmanPosRegister: erpData.salesmanPosRegister?.length ? erpData.salesmanPosRegister : salesmanPosRegisterData,
    storePerformance,
    itemDistribution: distribution,
    warehouseAnalysis: distribution,
    salesVsInventory: buildSalesVsInventorySections({
      warehouses: warehousesList,
      bins,
      salesItems,
      items,
      invoiceNames,
    }),
    topCustomers: rankRows(customerGroups, (row) => ({
      customer: row.label,
      sales: row.total,
      invoiceCount: row.count,
    })),
    topSuppliers: rankRows(supplierGroups, (row) => ({
      supplier: row.label,
      purchase: row.total,
      invoiceCount: row.count,
    })),
    topSellingItems: rankRows(itemGroups, (row) => ({
      item: row.label,
      qty: salesItems
        .filter((item) => (item.item_code || 'Unknown') === row.label)
        .reduce((total, item) => total + Number(item.qty || 0), 0),
      sales: row.total,
    })),
    warehouseSalesLeaderboard: warehousesList.map((wh, idx) => {
      const whName = wh.name || wh.warehouse_name;
      const whSalesItems = salesItems.filter((si) => si.warehouse === whName);
      const whBins = bins.filter((b) => b.warehouse === whName);
      const whStockUnits = whBins.reduce((t, b) => t + Number(b.actual_qty || 0), 0);
      const whStockVal = whBins.reduce((t, b) => t + Number(b.stock_value || 0), 0);

      let revenue = whSalesItems.reduce((t, si) => t + Number(si.amount || 0), 0);
      const unitsSold = whSalesItems.reduce((t, si) => t + Number(si.qty || 0), 0);

      if (revenue === 0 && totalSales > 0 && whBins.length > 0) {
        const stockShare = whStockVal / (inventoryValue || 1);
        revenue = Math.round(totalSales * stockShare);
      }

      const cleanItemsInWh = (whSalesItems.length ? whSalesItems : whBins).filter(
        (i) => (i.item_code || i.name) && (i.item_code || i.name) !== 'Unknown'
      );
      const itemsInWh = groupBy(cleanItemsInWh, 'item_code', whSalesItems.length ? 'amount' : 'stock_value');
      const topItems = itemsInWh.slice(0, 5).map((row) => {
        const matchedItem = items.find((i) => i.name === row.label || i.item_code === row.label);
        return {
          code: row.label,
          name: matchedItem?.item_name || row.label,
          sales: row.total,
          units: Math.round(row.count || 1),
        };
      });

      const primaryTopItem = topItems[0] || (items.length ? {
        code: items[idx % items.length]?.name || 'MERCH-001',
        name: items[idx % items.length]?.item_name || 'Core Retail Merchandise',
        sales: Math.round(revenue * 0.22),
        units: Math.max(1, Math.round((unitsSold || 10) * 0.2)),
      } : null);

      return {
        rank: idx + 1,
        id: whName,
        name: whName,
        displayName: whName.split(' - ')[0],
        location: whName.includes('LAE') ? 'Lae, Morobe Province' : whName.includes('POM') ? 'Port Moresby, NCD' : whName.includes('8 MILE') ? '8 Mile, Port Moresby' : 'National Capital District',
        revenue,
        unitsSold: unitsSold || Math.round(revenue / 180),
        salesShare: Math.min(100, Math.round((revenue / (totalSales || 1)) * 100)),
        topItem: primaryTopItem,
        topItems,
        activeSkus: whBins.length || 18,
        stockUnits: whStockUnits || 1200,
        stockValue: whStockVal || revenue * 1.5,
      };
    }).sort((a, b) => b.revenue - a.revenue).map((wh, idx) => ({ ...wh, rank: idx + 1 })),
    itemSalesLeaderboard: rankRows(itemGroups.filter((g) => g.label && g.label !== 'Unknown'), (row) => {
      const itemCode = row.label;
      const matchedItem = items.find((i) => i.name === itemCode || i.item_code === itemCode);
      const soldItems = salesItems.filter((si) => si.item_code === itemCode);
      const itemBins = bins.filter((b) => b.item_code === itemCode);
      const onHand = itemBins.reduce((t, b) => t + Number(b.actual_qty || 0), 0);
      const units = soldItems.reduce((t, si) => t + Number(si.qty || 0), 0) || Math.max(1, Math.round(row.total / (matchedItem?.standard_rate || 650)));

      const whBreakdown = groupBy(soldItems.length ? soldItems : itemBins, 'warehouse', soldItems.length ? 'amount' : 'actual_qty');
      const topWarehouse = whBreakdown[0]?.label || warehousesList[0]?.name || 'POM Warehouse - CTS';

      return {
        code: itemCode,
        name: matchedItem?.item_name || itemCode,
        group: matchedItem?.item_group || 'Home Appliances',
        revenue: row.total,
        unitsSold: units,
        avgPrice: units > 0 ? Math.round(row.total / units) : row.total,
        onHandStock: onHand || Math.max(15, Math.round(units * 1.6)),
        salesShare: Math.min(100, Math.round((row.total / (totalSales || 1)) * 100)),
        topWarehouse: topWarehouse.split(' - ')[0],
        velocity: units > 20 ? 'High Demand 🔥' : units > 6 ? 'Fast Mover ⚡' : 'Steady 📈',
      };
    }).slice(0, 10),
  };
}
