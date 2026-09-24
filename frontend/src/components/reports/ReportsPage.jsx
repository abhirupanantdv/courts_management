import { useState, useMemo, useEffect } from 'react';
import { 
  ArrowDown, 
  ArrowLeft,
  ArrowRight,
  Boxes, 
  Calendar, 
  CheckCircle, 
  Clock,
  Coins, 
  CreditCard,
  Download, 
  FileSpreadsheet, 
  FileText, 
  Filter, 
  Play, 
  Printer, 
  RefreshCw, 
  RotateCcw,
  Search, 
  ShoppingCart, 
  Store, 
  Truck,
  UserCheck
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';
import { canAccessReport } from '../../utils/rolePermissions.js';

export function ReportsPage({ data, onNavigate, initialReportId = null }) {
  const userRoles = data?.userRoles || data?.user?.roles || [];
  const [openedReportId, setOpenedReportId] = useState(initialReportId || null);
  const [activeReportId, setActiveReportId] = useState(initialReportId || 'sales-register');
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [posProfileFilter, setPosProfileFilter] = useState('All');
  const [salesPersonFilter, setSalesPersonFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [returnTypeFilter, setReturnTypeFilter] = useState('All');

  // Synchronize when initialReportId prop changes
  useEffect(() => {
    if (initialReportId) {
      setOpenedReportId(initialReportId);
      setActiveReportId(initialReportId);
      setIsExecuted(true);
      setVisibleCount(20);
    }
  }, [initialReportId]);

  // Explicit Report Execution state: only execute when user clicks Execute Report
  const [isExecuted, setIsExecuted] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Pagination state: 20 rows at a time
  const [visibleCount, setVisibleCount] = useState(20);

  const salesInvoices = data?.salesInvoices || [];
  const purchaseInvoices = data?.purchaseInvoices || [];
  const bins = data?.bins || [];
  const items = data?.items || [];
  const warehousesList = data?.warehousesList || [];
  const glEntries = data?.glEntries || [];
  const salesmanPosRegister = data?.salesmanPosRegister || [];

  const totalSalesCount = data?.counts?.salesInvoices || salesInvoices.length;
  const totalPurchaseCount = data?.counts?.purchaseInvoices || purchaseInvoices.length;
  const totalBinsCount = data?.counts?.bins || bins.length;
  const totalGlCount = data?.counts?.glEntries || glEntries.length;

  const itemMap = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      map.set(item.name, {
        name: item.item_name || item.name,
        group: item.item_group || 'Merchandise',
      });
    });
    return map;
  }, [items]);

  const reportDefinitions = [
    {
      id: 'sales-register',
      title: 'Sales Register & Analytics',
      category: 'Sales',
      icon: ShoppingCart,
      color: 'green',
      doctype: 'Sales Invoice',
      description: 'Comprehensive itemized ledger of all retail and commercial customer invoices.',
    },
    {
      id: 'stock-balance',
      title: 'Stock Balance & Valuation',
      category: 'Inventory',
      icon: Boxes,
      color: 'teal',
      doctype: 'Bin / Item',
      description: 'Real-time stock ledger, available units, asset valuation rates, and warehouse balances.',
    },
    {
      id: 'purchase-register',
      title: 'Purchase Register & Vendor Invoices',
      category: 'Purchases',
      icon: Truck,
      color: 'amber',
      doctype: 'Purchase Invoice',
      description: 'Procurement expenditures, supplier invoices, liabilities, and billing statuses.',
    },
    {
      id: 'profit-and-loss',
      title: 'Profit and Loss Statement (P&L)',
      category: 'Finance',
      icon: Coins,
      color: 'blue',
      doctype: 'GL Entry',
      description: 'Corporate operating statement: gross sales, procurement cost, margin, and net surplus.',
    },
    {
      id: 'store-matrix',
      title: 'Multi-Store Performance Matrix',
      category: 'Retail Stores',
      icon: Store,
      color: 'purple',
      doctype: 'Warehouse',
      description: 'Comparative operational metrics across all physical Courts branch warehouses.',
    },
    {
      id: 'general-ledger',
      title: 'General Ledger Audit Stream',
      category: 'Finance',
      icon: FileSpreadsheet,
      color: 'blue',
      doctype: 'GL Entry',
      description: 'Full double-entry ledger stream with chronological debit/credit postings.',
    },
    {
      id: 'salesman-pos-register',
      title: 'Salesman wise POS Register',
      category: 'Point of Sale',
      icon: UserCheck,
      color: 'indigo',
      doctype: 'POS Invoice',
      description: 'Retail POS sales register with salesperson attribution, counter cashiers, payment breakdown, and return tracking.',
    },
  ];

  const permissions = data?.permissions;

  // Role-Based Access Control: filter catalog strictly to reports the user's ERPNext roles authorize
  const effectiveReports = useMemo(() => {
    return reportDefinitions.filter((r) => canAccessReport(userRoles, r.id, permissions));
  }, [reportDefinitions, userRoles, permissions]);

  // Gracefully synchronize active report if unauthorized report was previously selected
  useEffect(() => {
    if (effectiveReports.length > 0 && !effectiveReports.some((r) => r.id === activeReportId)) {
      setActiveReportId(effectiveReports[0].id);
      if (openedReportId) {
        setOpenedReportId(effectiveReports[0].id);
      }
    } else if (effectiveReports.length === 0) {
      setActiveReportId(null);
      setOpenedReportId(null);
    }
  }, [effectiveReports, activeReportId, openedReportId]);

  const activeReport = effectiveReports.find((r) => r.id === activeReportId) || effectiveReports[0] || null;

  // Trigger Execution
  const handleExecuteReport = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setIsExecuted(true);
      setVisibleCount(20);
    }, 280);
  };

  const handleOpenReport = (reportId) => {
    setActiveReportId(reportId);
    setOpenedReportId(reportId);
    setSearchQuery('');
    setVisibleCount(20);
    setIsExecuted(false);
  };

  const handleSelectReport = (reportId) => {
    setActiveReportId(reportId);
    setOpenedReportId(reportId);
    setSearchQuery('');
    setVisibleCount(20);
    setIsExecuted(false);
  };

  // Report 1: Sales Register Rows with Authentic ERPNext Columns
  const salesRegisterRows = useMemo(() => {
    return salesInvoices.filter((inv) => {
      const matchSearch =
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [salesInvoices, searchQuery, statusFilter]);

  // Report 2: Stock Balance Rows with Authentic ERPNext Item and Valuation Data
  const stockBalanceRows = useMemo(() => {
    return bins
      .filter((bin) => {
        const meta = itemMap.get(bin.item_code) || { 
          name: bin.item_name || bin.item_code, 
          group: bin.item_group || 'Merchandise' 
        };
        const matchSearch =
          bin.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          meta.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchWarehouse = warehouseFilter === 'All' || bin.warehouse === warehouseFilter;
        return matchSearch && matchWarehouse;
      })
      .map((bin) => {
        const meta = itemMap.get(bin.item_code) || { 
          name: bin.item_name || bin.item_code, 
          group: bin.item_group || 'Merchandise' 
        };
        const qty = Number(bin.actual_qty || 0);
        const val = Number(bin.stock_value || 0);
        const rate = Number(bin.valuation_rate || (qty > 0 ? val / qty : 0));
        return {
          code: bin.item_code,
          name: meta.name,
          group: meta.group,
          warehouse: bin.warehouse,
          qty,
          rate,
          value: val,
          projected: Number(bin.projected_qty || 0),
        };
      });
  }, [bins, itemMap, searchQuery, warehouseFilter]);

  // Report 3: Purchase Register Rows with Authentic ERPNext Columns
  const purchaseRegisterRows = useMemo(() => {
    return purchaseInvoices.filter((inv) => {
      const matchSearch =
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.supplier || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.supplier_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.bill_no || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseInvoices, searchQuery, statusFilter]);

  // Report 4: Profit and Loss Summary
  const pnlData = useMemo(() => {
    const grossSales = salesInvoices.reduce((t, i) => t + Number(i.grand_total || 0), 0);
    const purchases = purchaseInvoices.reduce((t, i) => t + Number(i.grand_total || 0), 0);
    const grossMargin = grossSales - purchases;
    const marginPct = grossSales > 0 ? (grossMargin / grossSales) * 100 : 0;
    return { grossSales, purchases, grossMargin, marginPct };
  }, [salesInvoices, purchaseInvoices]);

  // Report 5: Store Matrix Rows
  const storeMatrixRows = useMemo(() => {
    return (warehousesList.length ? warehousesList : data?.warehouses || []).map((wh) => {
      const whName = wh.name || wh.warehouse_name;
      const whBins = bins.filter((b) => b.warehouse === whName);
      const totalQty = whBins.reduce((t, b) => t + Number(b.actual_qty || 0), 0);
      const totalVal = whBins.reduce((t, b) => t + Number(b.stock_value || 0), 0);
      return {
        name: whName,
        company: wh.company || 'Courts',
        skus: whBins.length,
        units: totalQty,
        stockValue: totalVal,
        avgItemVal: totalQty > 0 ? totalVal / totalQty : 0,
        status: wh.disabled ? 'Disabled' : 'Operational',
      };
    });
  }, [warehousesList, data?.warehouses, bins]);

  // Report 6: Salesman wise POS Register Options & Rows
  const posProfilesList = useMemo(() => {
    return ['All', ...new Set(salesmanPosRegister.map((r) => r.pos_profile).filter(Boolean))];
  }, [salesmanPosRegister]);

  const salesPersonsList = useMemo(() => {
    return ['All', ...new Set(salesmanPosRegister.map((r) => r.sales_person).filter(Boolean))];
  }, [salesmanPosRegister]);

  const paymentMethodsList = useMemo(() => {
    return ['All', 'BSP Card', 'Kina Card', 'Cash', 'Other Cards', 'Card - Lae', 'Cash - Lae', 'Voucher'];
  }, []);

  const salesmanPosRegisterRows = useMemo(() => {
    return salesmanPosRegister.filter((row) => {
      const matchSearch =
        !searchQuery ||
        row.pos_invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.sales_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.cashier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProfile = posProfileFilter === 'All' || row.pos_profile === posProfileFilter;
      const matchPerson = salesPersonFilter === 'All' || row.sales_person === salesPersonFilter;
      const matchPayment = paymentMethodFilter === 'All' || row.payment_method.includes(paymentMethodFilter);
      const matchReturn =
        returnTypeFilter === 'All' ||
        (returnTypeFilter === 'Return' && row.is_return === 1) ||
        (returnTypeFilter === 'Sale' && row.is_return === 0);

      return matchSearch && matchProfile && matchPerson && matchPayment && matchReturn;
    });
  }, [salesmanPosRegister, searchQuery, posProfileFilter, salesPersonFilter, paymentMethodFilter, returnTypeFilter]);

  const posKpiSummary = useMemo(() => {
    const totalCount = salesmanPosRegisterRows.length;
    const totalRevenue = salesmanPosRegisterRows.reduce((t, r) => t + Number(r.grand_total || 0), 0);
    const totalPaid = salesmanPosRegisterRows.reduce((t, r) => t + Number(r.paid_amount || 0), 0);
    const returns = salesmanPosRegisterRows.filter((r) => r.is_return === 1);
    const returnTotal = returns.reduce((t, r) => t + Number(r.grand_total || 0), 0);
    const uniqueReps = new Set(salesmanPosRegisterRows.map((r) => r.sales_person).filter((p) => p && !p.includes('Counter'))).size;
    return { totalCount, totalRevenue, totalPaid, returnCount: returns.length, returnTotal, uniqueReps };
  }, [salesmanPosRegisterRows]);

  // Export Active Report to CSV
  const handleExportCsv = () => {
    let headers = [];
    let rows = [];
    let filename = `${activeReport.id}.csv`;

    if (activeReport.id === 'sales-register') {
      headers = ['Invoice ID', 'Posting Date', 'Customer Name', 'Due Date', 'Net Total (PGK)', 'Taxes (PGK)', 'Grand Total (PGK)', 'Outstanding (PGK)', 'Status'];
      rows = salesRegisterRows.map((r) => [r.name, r.posting_date, `"${r.customer_name || r.customer}"`, r.due_date || '', r.net_total || r.grand_total, r.total_taxes_and_charges || 0, r.grand_total, r.outstanding_amount || 0, r.status]);
    } else if (activeReport.id === 'stock-balance') {
      headers = ['Item Code', 'Product Name', 'Category', 'Warehouse', 'Stock Qty', 'Valuation Rate', 'Total Value', 'Projected Qty'];
      rows = stockBalanceRows.map((r) => [r.code, `"${r.name}"`, `"${r.group}"`, `"${r.warehouse}"`, r.qty, r.rate.toFixed(2), r.value.toFixed(2), r.projected]);
    } else if (activeReport.id === 'purchase-register') {
      headers = ['Purchase Invoice ID', 'Posting Date', 'Supplier Name', 'Bill No', 'Due Date', 'Net Total (PGK)', 'Taxes (PGK)', 'Grand Total (PGK)', 'Outstanding (PGK)', 'Status'];
      rows = purchaseRegisterRows.map((r) => [r.name, r.posting_date, `"${r.supplier_name || r.supplier}"`, `"${r.bill_no || ''}"`, r.due_date || '', r.net_total || r.grand_total, r.total_taxes_and_charges || 0, r.grand_total, r.outstanding_amount || 0, r.status]);
    } else if (activeReport.id === 'store-matrix') {
      headers = ['Warehouse', 'Company', 'Active SKUs', 'Stock Units', 'Stock Value', 'Status'];
      rows = storeMatrixRows.map((r) => [`"${r.name}"`, `"${r.company}"`, r.skus, r.units, r.stockValue.toFixed(2), r.status]);
    } else if (activeReport.id === 'general-ledger') {
      headers = ['Posting Date', 'Account', 'Party', 'Voucher Type', 'Voucher No', 'Against Account', 'Debit (PGK)', 'Credit (PGK)'];
      rows = glEntries.map((r) => [r.posting_date, `"${r.account}"`, `"${r.party || ''}"`, `"${r.voucher_type || ''}"`, `"${r.voucher_no || ''}"`, `"${r.against || ''}"`, r.debit || 0, r.credit || 0]);
    } else if (activeReport.id === 'salesman-pos-register') {
      headers = ['POS Profile', 'Posting Date', 'POS Invoice', 'Customer', 'Cashier', 'Sales Person', 'Grand Total', 'Paid Amount', 'Payment Method', 'Is Return', 'Company'];
      rows = salesmanPosRegisterRows.map((r) => [
        `"${r.pos_profile}"`,
        r.posting_date,
        r.pos_invoice,
        `"${r.customer}"`,
        `"${r.cashier}"`,
        `"${r.sales_person}"`,
        r.grand_total,
        r.paid_amount,
        `"${r.payment_method}"`,
        r.is_return,
        `"${r.company}"`,
      ]);
    }

    if (!headers.length) return;
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courts_${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Empty state if user has no authorized reports
  if (effectiveReports.length === 0) {
    return (
      <main className="module-page report-cards-hub">
        <div className="module-page__header">
          <div>
            <div className="module-badge is-blue">
              <FileSpreadsheet size={15} />
              <span>Courts Financial & Operational Intelligence</span>
            </div>
            <h1>Executive Reports & Ledgers Directory</h1>
            <p>Access restricted based on your assigned ERPNext system roles.</p>
          </div>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '30px 0' }}>
          <FileText size={48} style={{ color: '#94a3b8', margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '8px' }}>No Reports Authorized</h3>
          <p style={{ color: '#64748b', maxWidth: '520px', margin: '0 auto 20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            Your ERPNext account does not have read permissions for Sales, Purchases, Inventory, or Financial ledgers. If you need access to specific reports, please contact your system administrator.
          </p>
          <button className="action-btn action-btn--primary" onClick={() => onNavigate('dashboard')}>
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // CARD FORM: Render Cards Hub if no report card is currently opened
  if (!openedReportId) {
    return (
      <main className="module-page report-cards-hub">
        {/* Header */}
        <div className="module-page__header">
          <div>
            <div className="module-badge is-blue">
              <FileSpreadsheet size={15} />
              <span>Courts Financial & Operational Intelligence</span>
            </div>
            <h1>Executive Reports & Ledgers Directory</h1>
            <p>Select any report card below to open its dedicated ledger, configure store filters, and execute live data queries.</p>
          </div>
          <div className="module-page__actions">
            <button className="action-btn action-btn--secondary" onClick={() => window.print()} title="Print reports directory">
              <Printer size={16} />
              <span>Print Directory</span>
            </button>
          </div>
        </div>

        {/* Directory Highlights (Role-Gated) */}
        <div className="module-kpis-grid">
          {canAccessReport(userRoles, 'sales-register', permissions) && (
            <div className="module-kpi-card">
              <span className="kpi-icon is-green"><ShoppingCart size={22} /></span>
              <div>
                <p>Sales Invoices</p>
                <strong>{formatNumber(totalSalesCount)} Records</strong>
                <small>Customer retail ledger</small>
              </div>
            </div>
          )}
          {canAccessReport(userRoles, 'stock-balance', permissions) && (
            <div className="module-kpi-card">
              <span className="kpi-icon is-teal"><Boxes size={22} /></span>
              <div>
                <p>Stock Valuation</p>
                <strong>{formatNumber(totalBinsCount)} Tracked Bins</strong>
                <small>Warehouse balances</small>
              </div>
            </div>
          )}
          {canAccessReport(userRoles, 'purchase-register', permissions) && (
            <div className="module-kpi-card">
              <span className="kpi-icon is-amber"><Truck size={22} /></span>
              <div>
                <p>Supplier Accounts</p>
                <strong>{formatNumber(totalPurchaseCount)} Bills</strong>
                <small>Procurement expenditures</small>
              </div>
            </div>
          )}
          {canAccessReport(userRoles, 'store-matrix', permissions) && (
            <div className="module-kpi-card">
              <span className="kpi-icon is-purple"><Store size={22} /></span>
              <div>
                <p>Branch Network</p>
                <strong>{formatNumber(warehousesList.length || 4)} Stores</strong>
                <small>Multi-location performance</small>
              </div>
            </div>
          )}
        </div>

        {/* Report Cards Grid (Filtered to Authorized Reports) */}
        <div className="report-cards-grid">
          {effectiveReports.map((report) => {
            const Icon = report.icon;
            let statText = '';
            if (report.id === 'sales-register') statText = `${formatNumber(totalSalesCount)} live customer invoices`;
            else if (report.id === 'stock-balance') statText = `${formatNumber(totalBinsCount)} inventory bins & rates`;
            else if (report.id === 'purchase-register') statText = `${formatNumber(totalPurchaseCount)} vendor procurement bills`;
            else if (report.id === 'profit-and-loss') statText = 'Real-time revenue, COGS & margin';
            else if (report.id === 'store-matrix') statText = `${warehousesList.length || 4} synchronized branch warehouses`;
            else if (report.id === 'general-ledger') statText = `${formatNumber(totalGlCount)} double-entry ledger postings`;
            else if (report.id === 'salesman-pos-register') statText = `${formatNumber(salesmanPosRegister.length)} retail POS transactions`;

            return (
              <div 
                key={report.id} 
                className="report-catalog-card"
                onClick={() => handleOpenReport(report.id)}
                role="button"
                tabIndex={0}
              >
                <div className="report-card-top">
                  <div className={`report-card-icon-wrap is-${report.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="report-card-cat-badge">{report.category}</span>
                </div>

                <h3 className="report-card-title">{report.title}</h3>
                <span className="report-card-doctype">DocType: {report.doctype}</span>
                <p className="report-card-desc">{report.description}</p>

                <div className="report-card-footer">
                  <span className="report-card-stat">
                    <CheckCircle size={13} style={{ color: '#16a34a' }} />
                    {statText}
                  </span>
                  <span className="report-card-action-btn">
                    <span>Open Report</span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    );
  }

  return (
    <main className="module-page">
      {/* Opened Report Card Navigation Bar */}
      <div className="opened-report-nav-bar">
        <button className="back-to-cards-btn" onClick={() => setOpenedReportId(null)} title="Return to All Report Cards">
          <ArrowLeft size={16} />
          <span>All Report Cards</span>
        </button>
        <span className="category-chip">Report Card: {activeReport.title}</span>
      </div>

      {/* Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-blue">
            <FileSpreadsheet size={15} />
            <span>Courts Live Reporting Engine &bull; In-App Viewer</span>
          </div>
          <h1>Standard Operational & Financial Reports</h1>
          <p>Interactive reporting suite running on live records with real-time export and pagination.</p>
        </div>
        <div className="module-page__actions">
          <button
            className="action-btn"
            style={{ background: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }}
            onClick={handleExecuteReport}
            disabled={isExecuting}
            title="Execute or re-query active report from server"
          >
            {isExecuting ? (
              <>
                <RefreshCw size={16} className="is-spinning" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Execute Report</span>
              </>
            )}
          </button>
          <button className="action-btn action-btn--secondary" onClick={() => window.print()} title="Print active report">
            <Printer size={16} />
            <span>Print Report</span>
          </button>
          <button className="action-btn action-btn--primary" onClick={handleExportCsv} title="Export active report as CSV">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs (Filtered to Authorized Reports) */}
      <div className="reports-catalog-bar">
        {effectiveReports.map((report) => {
          const Icon = report.icon;
          const isActive = report.id === activeReportId;
          return (
            <button
              key={report.id}
              className={`report-tab-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => handleSelectReport(report.id)}
            >
              <Icon size={16} className={`is-${report.color}`} />
              <span>{report.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Report Header & KPI Summary */}
      <div className="active-report-banner">
        <div className="active-report-meta">
          <h2>{activeReport.title}</h2>
          <p>{activeReport.description}</p>
          <span className="category-chip">DocType: {activeReport.doctype}</span>
        </div>

        {/* Dynamic KPI summary for active report */}
        <div className="active-report-kpis">
          {!isExecuted ? (
            <div className="report-kpi" style={{ borderLeftColor: '#f59e0b' }}>
              <small>Execution State</small>
              <strong style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> Awaiting Execution
              </strong>
            </div>
          ) : (
            <>
              {activeReport.id === 'sales-register' && (
                <>
                  <div className="report-kpi">
                    <small>Total Invoices</small>
                    <strong>{salesRegisterRows.length}</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Total Billed Revenue</small>
                    <strong>
                      <MoneyAmount value={salesRegisterRows.reduce((t, i) => t + Number(i.grand_total || 0), 0)} />
                    </strong>
                  </div>
                </>
              )}

              {activeReport.id === 'stock-balance' && (
                <>
                  <div className="report-kpi">
                    <small>Total Stock Units</small>
                    <strong>{formatNumber(stockBalanceRows.reduce((t, r) => t + r.qty, 0))}</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Total Valuation</small>
                    <strong>
                      <MoneyAmount value={stockBalanceRows.reduce((t, r) => t + r.value, 0)} />
                    </strong>
                  </div>
                </>
              )}

              {activeReport.id === 'purchase-register' && (
                <>
                  <div className="report-kpi">
                    <small>Total Invoices</small>
                    <strong>{purchaseRegisterRows.length}</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Total Spend</small>
                    <strong>
                      <MoneyAmount value={purchaseRegisterRows.reduce((t, i) => t + Number(i.grand_total || 0), 0)} />
                    </strong>
                  </div>
                </>
              )}

              {activeReport.id === 'profit-and-loss' && (
                <>
                  <div className="report-kpi">
                    <small>Gross Sales</small>
                    <strong style={{ color: '#15803d' }}><MoneyAmount value={pnlData.grossSales} /></strong>
                  </div>
                  <div className="report-kpi">
                    <small>COGS / Procurement</small>
                    <strong style={{ color: '#dc2626' }}><MoneyAmount value={pnlData.purchases} /></strong>
                  </div>
                  <div className="report-kpi">
                    <small>Net Operating Surplus</small>
                    <strong><MoneyAmount value={pnlData.grossMargin} /> ({pnlData.marginPct.toFixed(1)}%)</strong>
                  </div>
                </>
              )}

              {activeReport.id === 'store-matrix' && (
                <>
                  <div className="report-kpi">
                    <small>Total Warehouses</small>
                    <strong>{storeMatrixRows.length}</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Network Stock Value</small>
                    <strong>
                      <MoneyAmount value={storeMatrixRows.reduce((t, r) => t + r.stockValue, 0)} />
                    </strong>
                  </div>
                </>
              )}

              {activeReport.id === 'general-ledger' && (
                <>
                  <div className="report-kpi">
                    <small>Total Postings</small>
                    <strong>{glEntries.length}</strong>
                  </div>
                </>
              )}

              {activeReport.id === 'salesman-pos-register' && (
                <>
                  <div className="report-kpi">
                    <small>Total POS Invoices</small>
                    <strong>{formatNumber(posKpiSummary.totalCount)}</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Total Billed Sales</small>
                    <strong style={{ color: '#15803d' }}>
                      <MoneyAmount value={posKpiSummary.totalRevenue} />
                    </strong>
                  </div>
                  <div className="report-kpi">
                    <small>Active Sales Reps</small>
                    <strong>{posKpiSummary.uniqueReps} Reps</strong>
                  </div>
                  <div className="report-kpi">
                    <small>Customer Returns</small>
                    <strong style={{ color: posKpiSummary.returnCount > 0 ? '#dc2626' : 'inherit' }}>
                      {posKpiSummary.returnCount} <small>({formatNumber(posKpiSummary.returnTotal)})</small>
                    </strong>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      {activeReport.id !== 'profit-and-loss' && (
        <div className="module-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder={`Search in ${activeReport.title}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(20);
              }}
            />
          </div>

          <div className="filter-group">
            {activeReport.id === 'stock-balance' && (
              <div className="filter-item">
                <Filter size={15} />
                <span>Warehouse:</span>
                <select
                  value={warehouseFilter}
                  onChange={(e) => {
                    setWarehouseFilter(e.target.value);
                    setVisibleCount(20);
                  }}
                >
                  <option value="All">All Warehouses</option>
                  {warehousesList.map((w) => (
                    <option key={w.name} value={w.name}>{w.warehouse_name || w.name}</option>
                  ))}
                </select>
              </div>
            )}

            {(activeReport.id === 'sales-register' || activeReport.id === 'purchase-register') && (
              <div className="filter-item">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setVisibleCount(20);
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Draft">Draft</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            )}

            {activeReport.id === 'salesman-pos-register' && (
              <>
                <div className="filter-item">
                  <Filter size={15} />
                  <span>POS Profile:</span>
                  <select
                    value={posProfileFilter}
                    onChange={(e) => {
                      setPosProfileFilter(e.target.value);
                      setVisibleCount(20);
                    }}
                  >
                    {posProfilesList.map((p) => (
                      <option key={p} value={p}>{p === 'All' ? 'All POS Profiles' : p}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <span>Sales Person:</span>
                  <select
                    value={salesPersonFilter}
                    onChange={(e) => {
                      setSalesPersonFilter(e.target.value);
                      setVisibleCount(20);
                    }}
                  >
                    {salesPersonsList.map((sp) => (
                      <option key={sp} value={sp}>{sp === 'All' ? 'All Sales Reps' : sp}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <span>Payment:</span>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => {
                      setPaymentMethodFilter(e.target.value);
                      setVisibleCount(20);
                    }}
                  >
                    {paymentMethodsList.map((pm) => (
                      <option key={pm} value={pm}>{pm === 'All' ? 'All Payment Methods' : pm}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-item">
                  <span>Type:</span>
                  <select
                    value={returnTypeFilter}
                    onChange={(e) => {
                      setReturnTypeFilter(e.target.value);
                      setVisibleCount(20);
                    }}
                  >
                    <option value="All">All Invoices</option>
                    <option value="Sale">Sales Only</option>
                    <option value="Return">Returns Only</option>
                  </select>
                </div>
              </>
            )}

            <button
              className="action-btn"
              style={{ background: '#16a34a', borderColor: '#16a34a', color: '#ffffff', padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={handleExecuteReport}
              disabled={isExecuting}
            >
              <Play size={14} fill="currentColor" />
              <span>Run Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Data Rendering with 20-row Pagination & Load More */}
      {!isExecuted ? (
        <div className="execute-prompt-card">
          <FileSpreadsheet size={42} style={{ color: '#1264d8', opacity: 0.7 }} />
          <h3>Ready to Execute {activeReport.title}</h3>
          <p>Click Execute Report to compile the query matrix and calculate live ledger figures.</p>
          <button className="execute-btn-large" onClick={handleExecuteReport} disabled={isExecuting}>
            {isExecuting ? (
              <>
                <RefreshCw size={18} className="spin-icon" />
                <span>Compiling Report...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Execute Report Now</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="module-table-card">
          {activeReport.id === 'sales-register' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Posting Date</th>
                      <th>Customer Name</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Net Total</th>
                      <th style={{ textAlign: 'right' }}>Taxes</th>
                      <th style={{ textAlign: 'right' }}>Grand Total</th>
                      <th style={{ textAlign: 'right' }}>Outstanding</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesRegisterRows.length ? (
                      salesRegisterRows.slice(0, visibleCount).map((inv) => (
                        <tr key={inv.name}>
                          <td><code className="record-code">{inv.name}</code></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{inv.posting_date}</td>
                          <td><strong>{inv.customer_name || inv.customer}</strong></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{inv.due_date || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <MoneyAmount value={inv.net_total || inv.grand_total} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <MoneyAmount value={inv.total_taxes_and_charges || 0} />
                          </td>
                          <td style={{ textAlign: 'right' }} className="money-cell">
                            <strong><MoneyAmount value={inv.grand_total} /></strong>
                          </td>
                          <td style={{ textAlign: 'right', color: Number(inv.outstanding_amount) > 0 ? '#dc2626' : '#15803d' }}>
                            <MoneyAmount value={inv.outstanding_amount || 0} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-badge is-${(inv.status || 'paid').toLowerCase()}`}>{inv.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="9" className="empty-row">No sales invoices found matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {salesRegisterRows.length > 0 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, salesRegisterRows.length)}</strong> of <strong>{salesRegisterRows.length}</strong> invoices
                  </span>
                  {visibleCount < salesRegisterRows.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {salesRegisterRows.length} records loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeReport.id === 'stock-balance' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Product Description</th>
                      <th>Category</th>
                      <th>Warehouse</th>
                      <th style={{ textAlign: 'right' }}>In-Stock Qty</th>
                      <th style={{ textAlign: 'right' }}>Valuation Rate</th>
                      <th style={{ textAlign: 'right' }}>Balance Value</th>
                      <th style={{ textAlign: 'right' }}>Projected Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockBalanceRows.length ? (
                      stockBalanceRows.slice(0, visibleCount).map((row) => (
                        <tr key={`${row.code}-${row.warehouse}`}>
                          <td><code className="record-code">{row.code}</code></td>
                          <td><strong>{row.name}</strong></td>
                          <td><span className="category-chip">{row.group}</span></td>
                          <td>{row.warehouse}</td>
                          <td style={{ textAlign: 'right' }}><strong>{formatNumber(row.qty)}</strong></td>
                          <td style={{ textAlign: 'right' }}><MoneyAmount value={row.rate} /></td>
                          <td style={{ textAlign: 'right' }} className="money-cell"><MoneyAmount value={row.value} /></td>
                          <td style={{ textAlign: 'right' }}>{formatNumber(row.projected)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="8" className="empty-row">No stock records found matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {stockBalanceRows.length > 0 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, stockBalanceRows.length)}</strong> of <strong>{stockBalanceRows.length}</strong> items
                  </span>
                  {visibleCount < stockBalanceRows.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {stockBalanceRows.length} records loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeReport.id === 'purchase-register' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Posting Date</th>
                      <th>Supplier Name</th>
                      <th>Bill / Ref No</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Net Total</th>
                      <th style={{ textAlign: 'right' }}>Taxes</th>
                      <th style={{ textAlign: 'right' }}>Grand Total</th>
                      <th style={{ textAlign: 'right' }}>Outstanding</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRegisterRows.length ? (
                      purchaseRegisterRows.slice(0, visibleCount).map((inv) => (
                        <tr key={inv.name}>
                          <td><code className="record-code">{inv.name}</code></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{inv.posting_date}</td>
                          <td><strong>{inv.supplier_name || inv.supplier}</strong></td>
                          <td><span className="category-chip">{inv.bill_no || '—'}</span></td>
                          <td style={{ whiteSpace: 'nowrap' }}>{inv.due_date || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <MoneyAmount value={inv.net_total || inv.grand_total} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <MoneyAmount value={inv.total_taxes_and_charges || 0} />
                          </td>
                          <td style={{ textAlign: 'right' }} className="money-cell">
                            <strong><MoneyAmount value={inv.grand_total} /></strong>
                          </td>
                          <td style={{ textAlign: 'right', color: Number(inv.outstanding_amount) > 0 ? '#dc2626' : '#15803d' }}>
                            <MoneyAmount value={inv.outstanding_amount || 0} />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`status-badge is-${(inv.status || 'paid').toLowerCase()}`}>{inv.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="10" className="empty-row">No purchase records found matching filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {purchaseRegisterRows.length > 0 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, purchaseRegisterRows.length)}</strong> of <strong>{purchaseRegisterRows.length}</strong> invoices
                  </span>
                  {visibleCount < purchaseRegisterRows.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {purchaseRegisterRows.length} records loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeReport.id === 'profit-and-loss' && (
            <div className="pnl-report-view" style={{ padding: '24px' }}>
              <table className="module-data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Financial Category</th>
                    <th style={{ textAlign: 'right' }}>Amount (PGK)</th>
                    <th style={{ textAlign: 'right' }}>% of Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td>1. Operating Revenue (Sales Invoices)</td>
                    <td style={{ textAlign: 'right' }}><MoneyAmount value={pnlData.grossSales} /></td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Gross Invoiced Sales</td>
                    <td style={{ textAlign: 'right' }}><MoneyAmount value={pnlData.grossSales} /></td>
                    <td style={{ textAlign: 'right' }}>100.0%</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td>2. Cost of Goods Sold & Procurement</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>
                      <MoneyAmount value={pnlData.purchases} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {pnlData.grossSales > 0 ? ((pnlData.purchases / pnlData.grossSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '32px' }}>Vendor Purchase Invoices</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}><MoneyAmount value={pnlData.purchases} /></td>
                    <td style={{ textAlign: 'right' }}>
                      {pnlData.grossSales > 0 ? ((pnlData.purchases / pnlData.grossSales) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr style={{ background: '#f0fdf4', fontWeight: 'bold', fontSize: '1.05rem' }}>
                    <td>3. Gross Profit / Operating Surplus</td>
                    <td style={{ textAlign: 'right', color: '#15803d' }}>
                      <MoneyAmount value={pnlData.grossMargin} />
                    </td>
                    <td style={{ textAlign: 'right', color: '#15803d' }}>
                      {pnlData.marginPct.toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeReport.id === 'store-matrix' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th>Warehouse / Store</th>
                      <th>Operating Entity</th>
                      <th style={{ textAlign: 'right' }}>Active SKUs</th>
                      <th style={{ textAlign: 'right' }}>Stock Units</th>
                      <th style={{ textAlign: 'right' }}>Asset Valuation</th>
                      <th style={{ textAlign: 'right' }}>Avg Unit Val</th>
                      <th style={{ textAlign: 'center' }}>Branch Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeMatrixRows.slice(0, visibleCount).map((wh) => (
                      <tr key={wh.name}>
                        <td><strong>{wh.name}</strong></td>
                        <td>{wh.company}</td>
                        <td style={{ textAlign: 'right' }}>{formatNumber(wh.skus)}</td>
                        <td style={{ textAlign: 'right' }}><strong>{formatNumber(wh.units)}</strong></td>
                        <td style={{ textAlign: 'right' }} className="money-cell">
                          <MoneyAmount value={wh.stockValue} />
                        </td>
                        <td style={{ textAlign: 'right' }}><MoneyAmount value={wh.avgItemVal} /></td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="status-chip is-success">◆ {wh.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {storeMatrixRows.length > 20 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, storeMatrixRows.length)}</strong> of <strong>{storeMatrixRows.length}</strong> warehouses
                  </span>
                  {visibleCount < storeMatrixRows.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {storeMatrixRows.length} warehouses loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeReport.id === 'general-ledger' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th>Posting Date</th>
                      <th>Account Code</th>
                      <th>Party</th>
                      <th>Voucher Type & No</th>
                      <th>Against Account</th>
                      <th style={{ textAlign: 'right' }}>Debit (PGK)</th>
                      <th style={{ textAlign: 'right' }}>Credit (PGK)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glEntries.length ? (
                      glEntries.slice(0, visibleCount).map((row, idx) => (
                        <tr key={`${row.name || idx}`}>
                          <td style={{ whiteSpace: 'nowrap' }}>{row.posting_date}</td>
                          <td><code>{row.account}</code></td>
                          <td>{row.party || '—'}</td>
                          <td><span className="category-chip">{row.voucher_type ? `${row.voucher_type} ` : ''}{row.voucher_no || ''}</span></td>
                          <td style={{ fontSize: '0.82rem', color: '#64748b' }}>{row.against || '—'}</td>
                          <td style={{ textAlign: 'right' }} className="money-cell">
                            {row.debit > 0 ? <MoneyAmount value={row.debit} /> : '—'}
                          </td>
                          <td style={{ textAlign: 'right', color: row.credit > 0 ? '#15803d' : 'inherit' }} className="money-cell">
                            {row.credit > 0 ? <MoneyAmount value={row.credit} /> : '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" className="empty-row">No general ledger entries found in live system.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {glEntries.length > 0 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, glEntries.length)}</strong> of <strong>{glEntries.length}</strong> postings
                  </span>
                  {visibleCount < glEntries.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {glEntries.length} records loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeReport.id === 'salesman-pos-register' && (
            <>
              <div className="table-responsive">
                <table className="module-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th>POS Profile</th>
                      <th>Posting Date</th>
                      <th>POS Invoice</th>
                      <th>Customer</th>
                      <th>Cashier</th>
                      <th>Sales Person</th>
                      <th style={{ textAlign: 'right' }}>Grand Total</th>
                      <th style={{ textAlign: 'right' }}>Paid Amount</th>
                      <th>Payment Method</th>
                      <th style={{ textAlign: 'center' }}>Is Return</th>
                      <th>Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanPosRegisterRows.length ? (
                      salesmanPosRegisterRows.slice(0, visibleCount).map((row, idx) => (
                        <tr key={`${row.pos_invoice}-${idx}`} className={row.is_return === 1 ? 'is-return-row' : ''}>
                          <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td>
                            <span className="category-chip" style={{ fontSize: '0.78rem' }}>
                              {row.pos_profile}
                            </span>
                          </td>
                          <td>{row.posting_date}</td>
                          <td>
                            <strong><code>{row.pos_invoice}</code></strong>
                          </td>
                          <td>
                            <span title={row.customer}>{row.customer}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {row.cashier}
                          </td>
                          <td>
                            {row.sales_person ? (
                              <strong style={{ color: '#0f172a' }}>{row.sales_person}</strong>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Direct Counter / Unassigned</span>
                            )}
                          </td>
                          <td 
                            style={{ 
                              textAlign: 'right', 
                              fontWeight: 600,
                              color: row.is_return === 1 ? '#dc2626' : '#0f172a' 
                            }} 
                            className="money-cell"
                          >
                            <MoneyAmount value={row.grand_total} />
                          </td>
                          <td style={{ textAlign: 'right' }} className="money-cell">
                            <MoneyAmount value={row.paid_amount} />
                          </td>
                          <td>
                            <span className="payment-method-tag">
                              {row.payment_method}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {row.is_return === 1 ? (
                              <span className="status-badge is-return" title="Customer Return">
                                1
                              </span>
                            ) : (
                              <span className="status-badge is-sale" title="Standard Sale">
                                0
                              </span>
                            )}
                          </td>
                          <td>{row.company}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="empty-row">
                          No POS invoice records match the selected filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {salesmanPosRegisterRows.length > 0 && (
                <div className="report-pagination-bar">
                  <span className="pagination-count-label">
                    Showing <strong>{Math.min(visibleCount, salesmanPosRegisterRows.length)}</strong> of <strong>{formatNumber(salesmanPosRegisterRows.length)}</strong> transactions
                  </span>
                  {visibleCount < salesmanPosRegisterRows.length ? (
                    <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                      <ArrowDown size={15} />
                      <span>Load More (+20 Rows)</span>
                    </button>
                  ) : (
                    <span className="all-loaded-tag">
                      <CheckCircle size={14} /> All {formatNumber(salesmanPosRegisterRows.length)} POS transactions loaded
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Return to Report Cards Hub */}
      <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-start' }}>
        <button className="back-to-cards-btn" onClick={() => setOpenedReportId(null)} title="Return to Report Cards Directory">
          <ArrowLeft size={16} />
          <span>Back to All Report Cards</span>
        </button>
      </div>
    </main>
  );
}
