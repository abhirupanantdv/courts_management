import { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ArrowDown,
  Boxes, 
  CheckCircle, 
  Filter, 
  Layers, 
  Plus, 
  Search, 
  Store, 
  Tag,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

export function InventoryPage({ data, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const rawBins = data?.bins || [];
  const rawItems = data?.items || [];
  const warehousesList = data?.warehousesList || [];

  // Map item names & groups from Item DocType
  const itemMap = useMemo(() => {
    const map = new Map();
    rawItems.forEach((item) => {
      map.set(item.name, {
        name: item.item_name || item.name,
        group: item.item_group || 'General Goods',
      });
    });
    return map;
  }, [rawItems]);

  // Build unified inventory records exclusively from ERPNext Bins
  const inventoryList = useMemo(() => {
    return rawBins.map((bin) => {
      const meta = itemMap.get(bin.item_code) || { name: bin.item_code, group: 'Merchandise' };
      const qty = Number(bin.actual_qty || 0);
      const value = Number(bin.stock_value || 0);
      const rate = qty > 0 ? value / qty : 0;
      return {
        code: bin.item_code,
        name: meta.name,
        group: meta.group,
        warehouse: bin.warehouse || 'POM Warehouse - CTS',
        qty,
        projectedQty: Number(bin.projected_qty || 0),
        reservedQty: Number(bin.reserved_qty || 0),
        reorderLevel: 25,
        valuationRate: rate,
        totalValue: value,
        status: qty <= 0 ? 'Out of Stock' : qty <= 25 ? 'Low Stock' : 'Healthy',
      };
    });
  }, [rawBins, itemMap]);

  // Non-group active warehouses for dropdown
  const warehouseOptions = useMemo(() => {
    if (warehousesList.length > 0) {
      return warehousesList.map((w) => w.name);
    }
    return [...new Set(inventoryList.map((item) => item.warehouse))];
  }, [warehousesList, inventoryList]);

  // 1. DYNAMICALLY FILTER BY SELECTED WAREHOUSE
  const warehouseItems = useMemo(() => {
    if (warehouseFilter === 'All') {
      return inventoryList;
    }
    return inventoryList.filter((item) => item.warehouse === warehouseFilter);
  }, [inventoryList, warehouseFilter]);

  // 2. RECALCULATE THE 4 CARDS SPECIFICALLY FOR THE SELECTED WAREHOUSE
  const totalStockUnits = useMemo(() => {
    return warehouseItems.reduce((acc, cur) => acc + cur.qty, 0);
  }, [warehouseItems]);

  const totalStockValuation = useMemo(() => {
    return warehouseItems.reduce((acc, cur) => acc + cur.totalValue, 0);
  }, [warehouseItems]);

  const activeWarehouseMetric = useMemo(() => {
    if (warehouseFilter === 'All') {
      return {
        value: warehouseOptions.length,
        label: 'Active Warehouses',
        note: 'All physical distribution hubs',
      };
    }
    return {
      value: warehouseItems.length,
      label: 'Stocked SKUs',
      note: `In ${warehouseFilter.split(' - ')[0]}`,
    };
  }, [warehouseFilter, warehouseOptions, warehouseItems]);

  const lowStockCount = useMemo(() => {
    return warehouseItems.filter((item) => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  }, [warehouseItems]);

  // 3. APPLY SEARCH AND STATUS FILTERS TO TABLE
  const filteredItems = useMemo(() => {
    return warehouseItems.filter((item) => {
      const matchSearch =
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.group.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [warehouseItems, searchTerm, statusFilter]);

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Item Code', 'Product Description', 'Category', 'Warehouse', 'Available Qty', 'Valuation Rate', 'Total Stock Value', 'Status'];
    const rows = filteredItems.map((item) => [
      `"${item.code}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.group}"`,
      `"${item.warehouse}"`,
      item.qty,
      item.valuationRate.toFixed(2),
      item.totalValue.toFixed(2),
      `"${item.status}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `courts-inventory-${warehouseFilter.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="module-page">
      {/* Page Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-teal">
            <Boxes size={15} />
            <span>Inventory Intelligence &bull; Live Stock, Bins & Warehouses</span>
          </div>
          <h1>Multi-Location Inventory & Stock Management</h1>
          <p>Real-time stock ledger, warehouse stock balances, and dynamic valuation.</p>
        </div>
        <div className="module-page__actions">
          <button 
            className="action-btn action-btn--secondary"
            onClick={() => onNavigate && onNavigate('reports', { reportId: 'stock-balance' })}
            title="Open In-App Stock Balance Report"
          >
            <Layers size={16} />
            <span>Stock Balance Report</span>
          </button>
          <button 
            className="action-btn action-btn--primary"
            onClick={handleExportCsv}
            title="Export CSV of filtered inventory"
          >
            <FileSpreadsheet size={16} />
            <span>Export Stock CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - DYNAMICALLY FILTERED BY SELECTED WAREHOUSE */}
      <div className="module-kpis-grid">
        <div className="module-kpi-card">
          <span className="kpi-icon is-teal"><Boxes size={22} /></span>
          <div>
            <p>Total Stock Units</p>
            <strong>{formatNumber(totalStockUnits)}</strong>
            <small>{warehouseFilter === 'All' ? 'Units across all stores' : `Units in ${warehouseFilter.split(' - ')[0]}`}</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-green"><Tag size={22} /></span>
          <div>
            <p>Stock Valuation</p>
            <strong><MoneyAmount value={totalStockValuation} /></strong>
            <small>{warehouseFilter === 'All' ? 'Total asset valuation' : `Asset value in ${warehouseFilter.split(' - ')[0]}`}</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-blue"><Store size={22} /></span>
          <div>
            <p>{activeWarehouseMetric.label}</p>
            <strong>{formatNumber(activeWarehouseMetric.value)}</strong>
            <small>{activeWarehouseMetric.note}</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-amber"><AlertTriangle size={22} /></span>
          <div>
            <p>Low Stock Alerts</p>
            <strong style={{ color: lowStockCount > 0 ? '#d97706' : '#15803d' }}>
              {lowStockCount} Items
            </strong>
            <small>{warehouseFilter === 'All' ? 'Across all warehouses' : `In ${warehouseFilter.split(' - ')[0]}`}</small>
          </div>
        </div>
      </div>

      {/* Operations Toolbar */}
      <div className="module-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input 
            type="text" 
            placeholder="Search SKU code, product description, or category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={15} />
            <span>Warehouse:</span>
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              aria-label="Filter by warehouse"
            >
              <option value="All">All Warehouses ({rawBins.length} bins)</option>
              {warehouseOptions.map((wh) => (
                <option value={wh} key={wh}>
                  {wh} ({rawBins.filter((b) => b.warehouse === wh).length} items)
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span>Stock Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by stock status"
            >
              <option value="All">All Levels</option>
              <option value="Healthy">Healthy Stock</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="module-table-card">
        <div className="card-header">
          <h3>
            Stock Ledger Inventory ({filteredItems.length} Records)
            {warehouseFilter !== 'All' && <span className="category-chip" style={{ marginLeft: '8px' }}>{warehouseFilter}</span>}
          </h3>
          <span className="header-subtitle">Click any item row for live bin details</span>
        </div>

        <div className="table-responsive">
          <table className="module-data-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Product Description</th>
                <th>Category</th>
                <th>Assigned Warehouse</th>
                <th style={{ textAlign: 'right' }}>Available Qty</th>
                <th style={{ textAlign: 'right' }}>Valuation Rate</th>
                <th style={{ textAlign: 'right' }}>Total Stock Value</th>
                <th style={{ textAlign: 'center' }}>Stock Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length ? filteredItems.slice(0, visibleCount).map((item) => (
                <tr
                  key={`${item.code}-${item.warehouse}`}
                  onClick={() => setSelectedItemModal(item)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view item details"
                >
                  <td>
                    <code className="record-code">{item.code}</code>
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <span className="category-chip">{item.group}</span>
                  </td>
                  <td>{item.warehouse}</td>
                  <td style={{ textAlign: 'right' }} className="number-cell">
                    <strong>{formatNumber(item.qty)}</strong>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <MoneyAmount value={item.valuationRate} />
                  </td>
                  <td style={{ textAlign: 'right' }} className="money-cell">
                    <MoneyAmount value={item.totalValue} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`stock-badge is-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status === 'Healthy' && <CheckCircle size={13} />}
                      {item.status === 'Low Stock' && <AlertTriangle size={13} />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="empty-row">No item inventory records found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredItems.length > 0 && (
          <div className="report-pagination-bar">
            <span className="pagination-count-label">
              Showing <strong>{Math.min(visibleCount, filteredItems.length)}</strong> of <strong>{filteredItems.length}</strong> items
            </span>
            {visibleCount < filteredItems.length ? (
              <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                <ArrowDown size={15} />
                <span>Load More (+20 Items)</span>
              </button>
            ) : (
              <span className="all-loaded-tag">
                <CheckCircle size={14} /> All {filteredItems.length} items loaded
              </span>
            )}
          </div>
        )}
      </div>

      {/* In-App Item Detail Modal (Stays inside this UI!) */}
      {selectedItemModal && (
        <div className="erp-modal-overlay" onClick={() => setSelectedItemModal(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <div>
                <span className="category-chip">{selectedItemModal.group}</span>
                <h3>{selectedItemModal.name}</h3>
                <code>{selectedItemModal.code}</code>
              </div>
              <button className="erp-modal-close" onClick={() => setSelectedItemModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-grid">
              <div className="modal-metric">
                <small>Assigned Warehouse</small>
                <strong>{selectedItemModal.warehouse}</strong>
              </div>
              <div className="modal-metric">
                <small>Available Stock Qty</small>
                <strong>{formatNumber(selectedItemModal.qty)} Units</strong>
              </div>
              <div className="modal-metric">
                <small>Valuation Rate</small>
                <strong><MoneyAmount value={selectedItemModal.valuationRate} /></strong>
              </div>
              <div className="modal-metric">
                <small>Total Inventory Value</small>
                <strong><MoneyAmount value={selectedItemModal.totalValue} /></strong>
              </div>
              <div className="modal-metric">
                <small>Projected Quantity</small>
                <strong>{formatNumber(selectedItemModal.projectedQty)} Units</strong>
              </div>
              <div className="modal-metric">
                <small>Stock Health</small>
                <strong className={`stock-badge is-${selectedItemModal.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedItemModal.status}
                </strong>
              </div>
            </div>

            <div className="erp-modal-footer">
              <button 
                className="action-btn action-btn--secondary"
                onClick={() => {
                  setSelectedItemModal(null);
                  onNavigate && onNavigate('reports', { reportId: 'stock-balance' });
                }}
              >
                View in Stock Balance Report
              </button>
              <button className="action-btn action-btn--primary" onClick={() => setSelectedItemModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
