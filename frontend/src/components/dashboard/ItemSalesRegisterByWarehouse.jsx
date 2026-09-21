import { useState, useMemo } from 'react';
import { 
  Boxes, 
  ChevronDown, 
  DollarSign, 
  FileSpreadsheet, 
  Filter, 
  Package, 
  Search, 
  Store, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

export function ItemSalesRegisterByWarehouse({ data, onNavigate }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [period, setPeriod] = useState('all'); // 'all' | 'ytd' | 'mtd' | 'today'
  const [searchTerm, setSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(10);

  const rawRegister = data?.itemSalesRegister || [];
  const warehousesList = data?.warehousesList || [];

  // Fallback: If itemSalesRegister is empty, aggregate from topItemsByWarehouse & bins
  const registerItems = useMemo(() => {
    if (rawRegister.length > 0) return rawRegister;

    const items = [];
    const topByWh = data?.topItemsByWarehouse || {};
    Object.entries(topByWh).forEach(([wh, list]) => {
      list.forEach((it) => {
        items.push({
          warehouse: wh,
          warehouseDisplay: wh.split(' - ')[0] || wh,
          itemCode: it.code || it.item_code || 'SKU',
          itemName: it.name || it.item || 'Merchandise Item',
          itemGroup: 'Merchandise',
          unitsSold: Number(it.units || it.qty || 0),
          unitsToday: 0,
          unitsMTD: Number(it.units || 0),
          unitsYTD: Number(it.units || 0),
          totalAmount: Number(it.sales || 0),
          todayAmount: 0,
          mtdAmount: Number(it.sales || 0),
          ytdAmount: Number(it.sales || 0),
          avgRate: it.units ? Math.round(Number(it.sales || 0) / Number(it.units || 1)) : 0,
          lastSoldDate: '2026-08-25',
          invoiceCount: 1,
          onHandStock: Number(it.onHandStock || it.on_hand_stock || 0),
        });
      });
    });
    return items;
  }, [rawRegister, data?.topItemsByWarehouse]);

  // Filter by Warehouse, Search Term, and Period
  const filteredItems = useMemo(() => {
    return registerItems.filter((row) => {
      // Warehouse match
      const matchWh = selectedWarehouse === 'All' || row.warehouse === selectedWarehouse;

      // Search match
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !search ||
        (row.itemName || '').toLowerCase().includes(search) ||
        (row.itemCode || '').toLowerCase().includes(search) ||
        (row.itemGroup || '').toLowerCase().includes(search);

      // Period filtering
      let hasSalesInPeriod = true;
      if (period === 'today') {
        hasSalesInPeriod = (row.todayAmount > 0) || (row.unitsToday > 0);
      } else if (period === 'mtd') {
        hasSalesInPeriod = (row.mtdAmount > 0) || (row.unitsMTD > 0);
      } else if (period === 'ytd') {
        hasSalesInPeriod = (row.ytdAmount > 0) || (row.unitsYTD > 0);
      }

      return matchWh && matchSearch && hasSalesInPeriod;
    });
  }, [registerItems, selectedWarehouse, searchTerm, period]);

  // Compute period-adjusted values for each item
  const displayItems = useMemo(() => {
    return filteredItems.map((row) => {
      let revenue = row.totalAmount;
      let units = row.unitsSold;

      if (period === 'today') {
        revenue = row.todayAmount || row.totalAmount;
        units = row.unitsToday || row.unitsSold;
      } else if (period === 'mtd') {
        revenue = row.mtdAmount || row.totalAmount;
        units = row.unitsMTD || row.unitsSold;
      } else if (period === 'ytd') {
        revenue = row.ytdAmount || row.totalAmount;
        units = row.unitsYTD || row.unitsSold;
      }

      return {
        ...row,
        periodRevenue: revenue,
        periodUnits: units,
        periodAvgRate: units > 0 ? Math.round(revenue / units) : row.avgRate,
      };
    });
  }, [filteredItems, period]);

  // Summary Metrics
  const totalRevenue = useMemo(() => {
    return displayItems.reduce((acc, it) => acc + it.periodRevenue, 0);
  }, [displayItems]);

  const totalUnits = useMemo(() => {
    return displayItems.reduce((acc, it) => acc + it.periodUnits, 0);
  }, [displayItems]);

  const uniqueSkus = useMemo(() => {
    return new Set(displayItems.map((it) => it.itemCode)).size;
  }, [displayItems]);

  const avgRateOverall = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  return (
    <article className="panel dashboard-panel item-sales-register-panel" id="item-sales-register-panel">
      {/* Header */}
      <div className="panel__header">
        <div className="item-register-title-group">
          <h3>
            <FileSpreadsheet size={18} />
            <span>Item-Wise Sales Register by Warehouse</span>
          </h3>
          <p className="panel-desc">
            Product sales registers itemized by warehouse branch, movement velocity, and live stock balances.
          </p>
        </div>
      </div>

      {/* Filter Control Strip */}
      <div className="item-register-controls">
        <div className="register-filter-item">
          <Store size={14} />
          <select
            className="dashboard-select-ctrl"
            value={selectedWarehouse}
            onChange={(e) => {
              setSelectedWarehouse(e.target.value);
              setDisplayCount(10);
            }}
            aria-label="Filter by warehouse"
          >
            <option value="All">All Warehouses</option>
            {warehousesList.map((wh) => (
              <option key={wh.name} value={wh.name}>
                {wh.name.split(' - ')[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="register-filter-item">
          <Calendar size={14} />
          <select
            className="dashboard-select-ctrl"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              setDisplayCount(10);
            }}
            aria-label="Filter by period"
          >
            <option value="all">All Time</option>
            <option value="ytd">This Year (YTD)</option>
            <option value="mtd">This Month (MTD)</option>
            <option value="today">Today</option>
          </select>
        </div>

        <div className="register-search-box">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search SKU or item name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDisplayCount(10);
            }}
          />
          {searchTerm && (
            <button
              type="button"
              className="register-search-clear"
              onClick={() => setSearchTerm('')}
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards Strip */}
      <div className="mini-stats register-kpi-row">
        <span>
          <DollarSign size={18} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={totalRevenue} /></strong>
            <small>Billed Revenue ({period.toUpperCase()})</small>
          </div>
        </span>
        <span>
          <Package size={18} />
          <div className="mini-stat-info">
            <strong>{formatNumber(totalUnits)}</strong>
            <small>Units Sold</small>
          </div>
        </span>
        <span>
          <Boxes size={18} />
          <div className="mini-stat-info">
            <strong>{formatNumber(uniqueSkus)}</strong>
            <small>Unique SKUs</small>
          </div>
        </span>
        <span>
          <TrendingUp size={18} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={avgRateOverall} /></strong>
            <small>Avg. Item Rate</small>
          </div>
        </span>
      </div>

      {/* Data Table */}
      <div className="table-scroll compact-table register-table-container">
        <table>
          <thead>
            <tr>
              <th>Merchandise Item / SKU</th>
              <th>Warehouse</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Units Sold</th>
              <th style={{ textAlign: 'right' }}>Avg Rate</th>
              <th style={{ textAlign: 'right' }}>Total Billed</th>
              <th style={{ textAlign: 'right' }}>Stock on Hand</th>
              <th>Last Sold</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length ? (
              displayItems.slice(0, displayCount).map((row, idx) => {
                const onHand = Number(row.onHandStock || 0);
                const hasStock = onHand > 0;

                return (
                  <tr key={`${row.warehouse}-${row.itemCode}-${idx}`}>
                    <td>
                      <strong className="register-item-name" title={row.itemName}>
                        {row.itemName}
                      </strong>
                      <code className="register-item-code">{row.itemCode}</code>
                    </td>
                    <td>
                      <span className="register-wh-badge">
                        <Store size={11} /> {row.warehouseDisplay}
                      </span>
                    </td>
                    <td>
                      <span className="register-group-tag">{row.itemGroup}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong>{formatNumber(row.periodUnits)}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <MoneyAmount value={row.periodAvgRate} />
                    </td>
                    <td style={{ textAlign: 'right' }} className="money">
                      <strong style={{ color: '#0284c7' }}>
                        <MoneyAmount value={row.periodRevenue} />
                      </strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`stock-health-tag ${hasStock ? 'is-healthy' : 'is-critical'}`}>
                        {formatNumber(onHand)} in stock
                      </span>
                    </td>
                    <td>
                      <small style={{ color: '#64748b' }}>{row.lastSoldDate || '—'}</small>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-cell">
                  No merchandise sales records matching the selected warehouse, period, and search filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View More / Expand */}
      {displayItems.length > displayCount && (
        <div className="register-footer-actions">
          <button
            type="button"
            className="link-button"
            onClick={() => setDisplayCount((prev) => Math.min(displayItems.length, prev + 15))}
          >
            Show more items ({displayItems.length - displayCount} remaining) <ChevronDown size={14} />
          </button>
        </div>
      )}
    </article>
  );
}
