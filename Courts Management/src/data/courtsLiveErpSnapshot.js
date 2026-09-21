import { buildDashboardDataFromErpNext } from '../api/erpnextDashboardMapper.js';
import { salesmanPosRegisterData } from './salesmanPosRegisterData.js';

export function getCourtsLiveErpRawData() {
  const warehouses = [
    { name: 'POM Warehouse - CTS', warehouse_name: 'POM Warehouse', company: 'Courts', is_group: 0, disabled: 0 },
    { name: 'LAE Warehouse - CTS', warehouse_name: 'LAE Warehouse', company: 'Courts', is_group: 0, disabled: 0 },
    { name: 'CELLARMASTER - POM - CTS', warehouse_name: 'CELLARMASTER - POM', company: 'Courts', is_group: 0, disabled: 0 },
    { name: '8 MILE Warehouse - CTS', warehouse_name: '8 MILE Warehouse', company: 'Courts', is_group: 0, disabled: 0 },
    { name: 'All Warehouses - CTS', warehouse_name: 'All Warehouses', company: 'Courts', is_group: 1, disabled: 0 },
  ];

  const items = [
    { name: 'FUR-SOF-001', item_name: 'Courts Milano 3-Piece Leather Lounge Suite', item_group: 'Living Room Furniture', disabled: 0, stock_uom: 'Set', standard_rate: 6499 },
    { name: 'TV-SAM-65', item_name: 'Samsung 65" Crystal UHD 4K Smart Television', item_group: 'Home Entertainment', disabled: 0, stock_uom: 'Nos', standard_rate: 4299 },
    { name: 'REF-LG-450', item_name: 'LG 450L Smart Inverter Frost-Free Refrigerator', item_group: 'Major Appliances', disabled: 0, stock_uom: 'Nos', standard_rate: 3899 },
    { name: 'BED-QS-002', item_name: 'Sealy Posturepedic Queen Pillowtop Mattress Set', item_group: 'Bedroom & Bedding', disabled: 0, stock_uom: 'Set', standard_rate: 3499 },
    { name: 'WM-PAN-10', item_name: 'Panasonic 10kg Front Load Inverter Washing Machine', item_group: 'Major Appliances', disabled: 0, stock_uom: 'Nos', standard_rate: 2799 },
    { name: 'LAP-HP-15', item_name: 'HP Pavilion 15.6" Core i7 Laptop 16GB / 512GB SSD', item_group: 'Computers & IT', disabled: 0, stock_uom: 'Nos', standard_rate: 3199 },
    { name: 'MW-PAN-32', item_name: 'Panasonic 32L Inverter Convection Microwave', item_group: 'Small Appliances', disabled: 0, stock_uom: 'Nos', standard_rate: 899 },
    { name: 'AC-MIS-18', item_name: 'Mitsubishi Electric 1.5HP Split Air Conditioner', item_group: 'Air Conditioning', disabled: 0, stock_uom: 'Nos', standard_rate: 2599 },
    { name: 'AUD-SON-BAR', item_name: 'Sony 5.1ch Dolby Atmos Soundbar with Subwoofer', item_group: 'Audio & Hi-Fi', disabled: 0, stock_uom: 'Nos', standard_rate: 1499 },
    { name: 'DIN-6S-WOOD', item_name: 'Kensington 6-Seater Hardwood Dining Table Set', item_group: 'Dining Furniture', disabled: 0, stock_uom: 'Set', standard_rate: 4899 },
  ];

  const customers = [
    { name: 'CUST-001', customer_name: 'Brian Bell Home Centre', customer_group: 'Commercial Client', territory: 'Port Moresby' },
    { name: 'CUST-002', customer_name: 'Steamships Trading Ltd', customer_group: 'Corporate Account', territory: 'Port Moresby' },
    { name: 'CUST-003', customer_name: 'PNG Ports Corporation', customer_group: 'Government / SOE', territory: 'National' },
    { name: 'CUST-004', customer_name: 'ExxonMobil PNG Operations', customer_group: 'Key Account', territory: 'Southern Region' },
    { name: 'CUST-005', customer_name: 'Papindo Trading Co', customer_group: 'Wholesale Partner', territory: 'Lae' },
    { name: 'CUST-006', customer_name: 'CPL Group Retail', customer_group: 'Retail Partner', territory: 'Port Moresby' },
    { name: 'CUST-007', customer_name: 'Digicel PNG Ltd', customer_group: 'Corporate Account', territory: 'Port Moresby' },
    { name: 'CUST-008', customer_name: 'Walk-in Retail Customer', customer_group: 'Cash Customer', territory: 'All Stores' },
  ];

  const suppliers = [
    { name: 'SUP-001', supplier_name: 'Samsung Electronics Australia', supplier_group: 'Direct Manufacturer' },
    { name: 'SUP-002', supplier_name: 'LG Electronics Pacific', supplier_group: 'Direct Manufacturer' },
    { name: 'SUP-003', supplier_name: 'Panasonic New Zealand / PNG', supplier_group: 'Direct Manufacturer' },
    { name: 'SUP-004', supplier_name: 'Courts Global Sourcing Singapore', supplier_group: 'Parent Entity' },
    { name: 'SUP-005', supplier_name: 'Sealy Bedding Asia Pacific', supplier_group: 'Authorized Vendor' },
  ];

  // Stock Bins for leaf warehouses
  const bins = [
    { name: 'BIN-POM-01', item_code: 'FUR-SOF-001', warehouse: 'POM Warehouse - CTS', actual_qty: 48, stock_value: 311952, reserved_qty: 6, projected_qty: 42 },
    { name: 'BIN-POM-02', item_code: 'TV-SAM-65', warehouse: 'POM Warehouse - CTS', actual_qty: 120, stock_value: 515880, reserved_qty: 12, projected_qty: 108 },
    { name: 'BIN-POM-03', item_code: 'REF-LG-450', warehouse: 'POM Warehouse - CTS', actual_qty: 85, stock_value: 331415, reserved_qty: 5, projected_qty: 80 },
    { name: 'BIN-POM-04', item_code: 'BED-QS-002', warehouse: 'POM Warehouse - CTS', actual_qty: 64, stock_value: 223936, reserved_qty: 4, projected_qty: 60 },
    { name: 'BIN-POM-05', item_code: 'WM-PAN-10', warehouse: 'POM Warehouse - CTS', actual_qty: 70, stock_value: 195930, reserved_qty: 8, projected_qty: 62 },
    { name: 'BIN-POM-06', item_code: 'LAP-HP-15', warehouse: 'POM Warehouse - CTS', actual_qty: 92, stock_value: 294308, reserved_qty: 15, projected_qty: 77 },
    { name: 'BIN-POM-07', item_code: 'MW-PAN-32', warehouse: 'POM Warehouse - CTS', actual_qty: 160, stock_value: 143840, reserved_qty: 10, projected_qty: 150 },
    { name: 'BIN-POM-08', item_code: 'AC-MIS-18', warehouse: 'POM Warehouse - CTS', actual_qty: 55, stock_value: 142945, reserved_qty: 3, projected_qty: 52 },

    { name: 'BIN-LAE-01', item_code: 'FUR-SOF-001', warehouse: 'LAE Warehouse - CTS', actual_qty: 32, stock_value: 207968, reserved_qty: 4, projected_qty: 28 },
    { name: 'BIN-LAE-02', item_code: 'TV-SAM-65', warehouse: 'LAE Warehouse - CTS', actual_qty: 75, stock_value: 322425, reserved_qty: 8, projected_qty: 67 },
    { name: 'BIN-LAE-03', item_code: 'REF-LG-450', warehouse: 'LAE Warehouse - CTS', actual_qty: 52, stock_value: 202748, reserved_qty: 4, projected_qty: 48 },
    { name: 'BIN-LAE-04', item_code: 'BED-QS-002', warehouse: 'LAE Warehouse - CTS', actual_qty: 45, stock_value: 157455, reserved_qty: 2, projected_qty: 43 },
    { name: 'BIN-LAE-05', item_code: 'WM-PAN-10', warehouse: 'LAE Warehouse - CTS', actual_qty: 48, stock_value: 134352, reserved_qty: 6, projected_qty: 42 },
    { name: 'BIN-LAE-06', item_code: 'LAP-HP-15', warehouse: 'LAE Warehouse - CTS', actual_qty: 60, stock_value: 191940, reserved_qty: 5, projected_qty: 55 },
    { name: 'BIN-LAE-07', item_code: 'MW-PAN-32', warehouse: 'LAE Warehouse - CTS', actual_qty: 110, stock_value: 98890, reserved_qty: 7, projected_qty: 103 },
    { name: 'BIN-LAE-08', item_code: 'DIN-6S-WOOD', warehouse: 'LAE Warehouse - CTS', actual_qty: 28, stock_value: 137172, reserved_qty: 2, projected_qty: 26 },

    { name: 'BIN-CLM-01', item_code: 'TV-SAM-65', warehouse: 'CELLARMASTER - POM - CTS', actual_qty: 42, stock_value: 180558, reserved_qty: 4, projected_qty: 38 },
    { name: 'BIN-CLM-02', item_code: 'REF-LG-450', warehouse: 'CELLARMASTER - POM - CTS', actual_qty: 36, stock_value: 140364, reserved_qty: 2, projected_qty: 34 },
    { name: 'BIN-CLM-03', item_code: 'AUD-SON-BAR', warehouse: 'CELLARMASTER - POM - CTS', actual_qty: 85, stock_value: 127415, reserved_qty: 9, projected_qty: 76 },
    { name: 'BIN-CLM-04', item_code: 'MW-PAN-32', warehouse: 'CELLARMASTER - POM - CTS', actual_qty: 94, stock_value: 84506, reserved_qty: 6, projected_qty: 88 },
    { name: 'BIN-CLM-05', item_code: 'AC-MIS-18', warehouse: 'CELLARMASTER - POM - CTS', actual_qty: 38, stock_value: 98762, reserved_qty: 3, projected_qty: 35 },

    { name: 'BIN-8M-01', item_code: 'FUR-SOF-001', warehouse: '8 MILE Warehouse - CTS', actual_qty: 58, stock_value: 376942, reserved_qty: 5, projected_qty: 53 },
    { name: 'BIN-8M-02', item_code: 'TV-SAM-65', warehouse: '8 MILE Warehouse - CTS', actual_qty: 90, stock_value: 386910, reserved_qty: 10, projected_qty: 80 },
    { name: 'BIN-8M-03', item_code: 'REF-LG-450', warehouse: '8 MILE Warehouse - CTS', actual_qty: 62, stock_value: 241738, reserved_qty: 4, projected_qty: 58 },
    { name: 'BIN-8M-04', item_code: 'BED-QS-002', warehouse: '8 MILE Warehouse - CTS', actual_qty: 75, stock_value: 262425, reserved_qty: 5, projected_qty: 70 },
    { name: 'BIN-8M-05', item_code: 'WM-PAN-10', warehouse: '8 MILE Warehouse - CTS', actual_qty: 54, stock_value: 151146, reserved_qty: 4, projected_qty: 50 },
    { name: 'BIN-8M-06', item_code: 'DIN-6S-WOOD', warehouse: '8 MILE Warehouse - CTS', actual_qty: 40, stock_value: 195960, reserved_qty: 3, projected_qty: 37 },
  ];

  // Invoices & Line Items (Attributed Sales)
  const salesInvoices = [];
  const salesItems = [];

  const invoiceSeeds = [
    { customer: 'Brian Bell Home Centre', wh: 'POM Warehouse - CTS', item: 'TV-SAM-65', qty: 6, rate: 4299, date: '2026-09-19' },
    { customer: 'Steamships Trading Ltd', wh: 'LAE Warehouse - CTS', item: 'FUR-SOF-001', qty: 4, rate: 6499, date: '2026-09-19' },
    { customer: 'PNG Ports Corporation', wh: 'POM Warehouse - CTS', item: 'LAP-HP-15', qty: 8, rate: 3199, date: '2026-09-18' },
    { customer: 'ExxonMobil PNG Operations', wh: '8 MILE Warehouse - CTS', item: 'AC-MIS-18', qty: 10, rate: 2599, date: '2026-09-18' },
    { customer: 'Papindo Trading Co', wh: 'LAE Warehouse - CTS', item: 'REF-LG-450', qty: 5, rate: 3899, date: '2026-09-18' },
    { customer: 'Walk-in Retail Customer', wh: 'CELLARMASTER - POM - CTS', item: 'AUD-SON-BAR', qty: 3, rate: 1499, date: '2026-09-17' },
    { customer: 'CPL Group Retail', wh: 'POM Warehouse - CTS', item: 'WM-PAN-10', qty: 6, rate: 2799, date: '2026-09-17' },
    { customer: 'Digicel PNG Ltd', wh: '8 MILE Warehouse - CTS', item: 'BED-QS-002', qty: 8, rate: 3499, date: '2026-09-17' },
    { customer: 'Walk-in Retail Customer', wh: 'POM Warehouse - CTS', item: 'MW-PAN-32', qty: 5, rate: 899, date: '2026-09-16' },
    { customer: 'Brian Bell Home Centre', wh: '8 MILE Warehouse - CTS', item: 'DIN-6S-WOOD', qty: 3, rate: 4899, date: '2026-09-16' },
    { customer: 'Steamships Trading Ltd', wh: 'LAE Warehouse - CTS', item: 'TV-SAM-65', qty: 5, rate: 4299, date: '2026-09-16' },
    { customer: 'Walk-in Retail Customer', wh: 'CELLARMASTER - POM - CTS', item: 'MW-PAN-32', qty: 4, rate: 899, date: '2026-09-15' },
    { customer: 'PNG Ports Corporation', wh: 'POM Warehouse - CTS', item: 'REF-LG-450', qty: 4, rate: 3899, date: '2026-09-15' },
    { customer: 'ExxonMobil PNG Operations', wh: '8 MILE Warehouse - CTS', item: 'LAP-HP-15', qty: 6, rate: 3199, date: '2026-09-14' },
    { customer: 'Papindo Trading Co', wh: 'LAE Warehouse - CTS', item: 'WM-PAN-10', qty: 5, rate: 2799, date: '2026-09-14' },
    { customer: 'CPL Group Retail', wh: 'POM Warehouse - CTS', item: 'FUR-SOF-001', qty: 3, rate: 6499, date: '2026-09-13' },
    { customer: 'Digicel PNG Ltd', wh: '8 MILE Warehouse - CTS', item: 'TV-SAM-65', qty: 4, rate: 4299, date: '2026-09-13' },
    { customer: 'Walk-in Retail Customer', wh: 'CELLARMASTER - POM - CTS', item: 'AC-MIS-18', qty: 2, rate: 2599, date: '2026-09-12' },
    { customer: 'Brian Bell Home Centre', wh: 'POM Warehouse - CTS', item: 'BED-QS-002', qty: 5, rate: 3499, date: '2026-09-12' },
    { customer: 'Steamships Trading Ltd', wh: 'LAE Warehouse - CTS', item: 'DIN-6S-WOOD', qty: 2, rate: 4899, date: '2026-09-11' },
    { customer: 'Walk-in Retail Customer', wh: 'POM Warehouse - CTS', item: 'TV-SAM-65', qty: 3, rate: 4299, date: '2026-09-11' },
    { customer: 'Walk-in Retail Customer', wh: '8 MILE Warehouse - CTS', item: 'REF-LG-450', qty: 2, rate: 3899, date: '2026-09-10' },
    { customer: 'PNG Ports Corporation', wh: 'LAE Warehouse - CTS', item: 'LAP-HP-15', qty: 4, rate: 3199, date: '2026-09-10' },
    { customer: 'CPL Group Retail', wh: 'CELLARMASTER - POM - CTS', item: 'AUD-SON-BAR', qty: 4, rate: 1499, date: '2026-09-09' },
    { customer: 'ExxonMobil PNG Operations', wh: 'POM Warehouse - CTS', item: 'AC-MIS-18', qty: 6, rate: 2599, date: '2026-09-09' },
    { customer: 'Papindo Trading Co', wh: '8 MILE Warehouse - CTS', item: 'WM-PAN-10', qty: 3, rate: 2799, date: '2026-09-08' },
    { customer: 'Digicel PNG Ltd', wh: 'LAE Warehouse - CTS', item: 'FUR-SOF-001', qty: 2, rate: 6499, date: '2026-09-08' },
    { customer: 'Brian Bell Home Centre', wh: 'POM Warehouse - CTS', item: 'TV-SAM-65', qty: 5, rate: 4299, date: '2026-09-07' },
    { customer: 'Steamships Trading Ltd', wh: '8 MILE Warehouse - CTS', item: 'BED-QS-002', qty: 4, rate: 3499, date: '2026-09-07' },
    { customer: 'Walk-in Retail Customer', wh: 'CELLARMASTER - POM - CTS', item: 'MW-PAN-32', qty: 3, rate: 899, date: '2026-09-06' },
    { customer: 'Walk-in Retail Customer', wh: 'POM Warehouse - CTS', item: 'DIN-6S-WOOD', qty: 2, rate: 4899, date: '2026-09-06' },
    { customer: 'CPL Group Retail', wh: 'LAE Warehouse - CTS', item: 'REF-LG-450', qty: 3, rate: 3899, date: '2026-09-05' },
    { customer: 'PNG Ports Corporation', wh: '8 MILE Warehouse - CTS', item: 'AC-MIS-18', qty: 4, rate: 2599, date: '2026-09-05' },
    { customer: 'ExxonMobil PNG Operations', wh: 'POM Warehouse - CTS', item: 'LAP-HP-15', qty: 5, rate: 3199, date: '2026-09-04' },
    { customer: 'Papindo Trading Co', wh: 'LAE Warehouse - CTS', item: 'TV-SAM-65', qty: 4, rate: 4299, date: '2026-09-04' },
    { customer: 'Digicel PNG Ltd', wh: 'CELLARMASTER - POM - CTS', item: 'AUD-SON-BAR', qty: 3, rate: 1499, date: '2026-09-03' },
    { customer: 'Brian Bell Home Centre', wh: '8 MILE Warehouse - CTS', item: 'FUR-SOF-001', qty: 2, rate: 6499, date: '2026-09-03' },
    { customer: 'Steamships Trading Ltd', wh: 'POM Warehouse - CTS', item: 'WM-PAN-10', qty: 4, rate: 2799, date: '2026-09-02' },
    { customer: 'Walk-in Retail Customer', wh: 'LAE Warehouse - CTS', item: 'MW-PAN-32', qty: 4, rate: 899, date: '2026-09-02' },
    { customer: 'Walk-in Retail Customer', wh: '8 MILE Warehouse - CTS', item: 'BED-QS-002', qty: 3, rate: 3499, date: '2026-09-01' },
    { customer: 'PNG Ports Corporation', wh: 'POM Warehouse - CTS', item: 'TV-SAM-65', qty: 3, rate: 4299, date: '2026-09-01' },
    { customer: 'CPL Group Retail', wh: 'CELLARMASTER - POM - CTS', item: 'REF-LG-450', qty: 2, rate: 3899, date: '2026-08-31' },
    { customer: 'ExxonMobil PNG Operations', wh: '8 MILE Warehouse - CTS', item: 'DIN-6S-WOOD', qty: 2, rate: 4899, date: '2026-08-31' },
    { customer: 'Papindo Trading Co', wh: 'LAE Warehouse - CTS', item: 'AC-MIS-18', qty: 3, rate: 2599, date: '2026-08-30' },
  ];

  invoiceSeeds.forEach((seed, idx) => {
    const invId = `ACC-SINV-2026-${String(45 - idx).padStart(5, '0')}`;
    const amount = seed.qty * seed.rate;
    salesInvoices.push({
      name: invId,
      customer: seed.customer,
      grand_total: amount,
      posting_date: seed.date,
      company: 'Courts',
      status: idx % 8 === 0 ? 'Overdue' : idx % 5 === 0 ? 'Unpaid' : 'Paid',
      due_date: seed.date,
      warehouse: seed.wh,
    });

    const itemMeta = items.find((i) => i.name === seed.item) || items[0];
    salesItems.push({
      parent: invId,
      item_code: seed.item,
      item_name: itemMeta.item_name,
      warehouse: seed.wh,
      qty: seed.qty,
      amount: amount,
    });
  });

  const purchaseInvoices = [
    { name: 'ACC-PINV-2026-0001', supplier: 'Samsung Electronics Australia', grand_total: 482000, posting_date: '2026-09-18', company: 'Courts', status: 'Paid', due_date: '2026-10-18' },
    { name: 'ACC-PINV-2026-0002', supplier: 'Courts Global Sourcing Singapore', grand_total: 625000, posting_date: '2026-09-15', company: 'Courts', status: 'Paid', due_date: '2026-10-15' },
    { name: 'ACC-PINV-2026-0003', supplier: 'LG Electronics Pacific', grand_total: 318000, posting_date: '2026-09-12', company: 'Courts', status: 'Unpaid', due_date: '2026-10-12' },
    { name: 'ACC-PINV-2026-0004', supplier: 'Sealy Bedding Asia Pacific', grand_total: 245000, posting_date: '2026-09-08', company: 'Courts', status: 'Paid', due_date: '2026-10-08' },
    { name: 'ACC-PINV-2026-0005', supplier: 'Panasonic New Zealand / PNG', grand_total: 198000, posting_date: '2026-09-02', company: 'Courts', status: 'Paid', due_date: '2026-10-02' },
  ];

  const glEntries = [
    { name: 'GL-2026-0891', posting_date: '2026-09-19', account: '4110 - Retail Sales Revenue', party: 'Brian Bell Home Centre', debit: 0, credit: 25794, voucher_type: 'Sales Invoice', voucher_no: 'ACC-SINV-2026-00045' },
    { name: 'GL-2026-0890', posting_date: '2026-09-19', account: '1110 - Bank South Pacific (BSP) Checking', party: 'BSP Current Account', debit: 25794, credit: 0, voucher_type: 'Payment Entry', voucher_no: 'PAY-2026-0045' },
    { name: 'GL-2026-0889', posting_date: '2026-09-18', account: '2110 - Creditors / Accounts Payable', party: 'Samsung Electronics Australia', debit: 0, credit: 482000, voucher_type: 'Purchase Invoice', voucher_no: 'ACC-PINV-2026-0001' },
    { name: 'GL-2026-0888', posting_date: '2026-09-18', account: '1410 - Stock in Hand (POM Warehouse)', party: 'Inventory Asset', debit: 482000, credit: 0, voucher_type: 'Purchase Receipt', voucher_no: 'PREC-2026-0012' },
    { name: 'GL-2026-0887', posting_date: '2026-09-17', account: '5110 - Freight & Logistics Clearing', party: 'Steamships Shipping PNG', debit: 34500, credit: 0, voucher_type: 'Journal Entry', voucher_no: 'JV-2026-0089' },
    { name: 'GL-2026-0886', posting_date: '2026-09-17', account: '4120 - Corporate Account Sales', party: 'PNG Ports Corporation', debit: 0, credit: 25592, voucher_type: 'Sales Invoice', voucher_no: 'ACC-SINV-2026-00043' },
  ];

  return {
    salesInvoices,
    purchaseInvoices,
    bins,
    warehouses,
    customers,
    suppliers,
    salesItems,
    items,
    glEntries,
    salesmanPosRegister: salesmanPosRegisterData,
  };
}

export function getCourtsLiveErpSnapshotDashboard() {
  const raw = getCourtsLiveErpRawData();
  return buildDashboardDataFromErpNext(raw, []);
}
