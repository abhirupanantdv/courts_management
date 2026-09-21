import { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  BarChart3, 
  Boxes, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Filter, 
  Flame, 
  Layers, 
  PackageSearch, 
  Search, 
  ShoppingCart, 
  Sparkles, 
  Store, 
  TrendingUp, 
  Zap 
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

export function SalesInventoryPage({ data, onNavigate }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [searchItem, setSearchItem] = useState('');
  const [activeViewMode, setActiveViewMode] = useState('all-cards'); // 'all-cards' | 'high-velocity' | 'comparison'

  const sections = data.salesVsInventory || [];
  const warehousesList = data.warehousesList || [];
  const bins = data.bins || [];
  const salesItems = data.salesItems || [];

  // Warehouse filter options
  const warehouseOptions = useMemo(() => {
    if (warehousesList.length > 0) {
      return warehousesList.map((w) => w.name || w.warehouse_name);
    }
    return sections.map((s) => s.id);
  }, [warehousesList, sections]);

  // Filter sections by selected warehouse & view mode
  const filteredSections = useMemo(() => {
    let list = sections;
    if (selectedWarehouse !== 'All') {
      list = list.filter((s) => s.id === selectedWarehouse || s.title.includes(selectedWarehouse));
    }
    if (activeViewMode === 'high-velocity') {
      list = [...list].sort((a, b) => Number(b.totalSalesUnits || 0) - Number(a.totalSalesUnits || 0));
    }
    return list;
  }, [sections, selectedWarehouse, activeViewMode]);

  // Top summary KPIs
  const totalStockUnits = useMemo(() => {
    return bins.reduce((t, b) => t + Number(b.actual_qty || 0), 0);
  }, [bins]);

  const totalSoldUnits = useMemo(() => {
    const fromSections = sections.reduce((t, s) => t + Number(s.totalSalesUnits || 0), 0);
    if (fromSections > 0) return fromSections;
    return salesItems.reduce((t, i) => t + Number(i.qty || 0), 0);
  }, [sections, salesItems]);

  const totalStockVal = useMemo(() => {
    return bins.reduce((t, b) => t + Number(b.stock_value || 0), 0);
  }, [bins]);

  const stockToSalesRatio = totalSoldUnits > 0 ? (totalStockUnits / totalSoldUnits).toFixed(1) : 'N/A';

  return (
    <main className="module-page sales-inventory-animated-page">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-blue">
            <PackageSearch size={15} />
            <span>Multi-Location Analytics &bull; Sales vs Inventory Run-Rate</span>
          </div>
          <h1>Sales vs Inventory Stock Movement</h1>
          <p>Card-based comparative intelligence monitoring physical store stock-on-hand versus sales velocity.</p>
        </div>
        <div className="module-page__actions">
          <button 
            className="action-btn action-btn--secondary"
            onClick={() => onNavigate && onNavigate('inventory')}
          >
            <Boxes size={16} />
            <span>Open Inventory Ledger</span>
          </button>
          <button 
            className="action-btn action-btn--primary"
            onClick={() => onNavigate && onNavigate('sales')}
          >
            <ShoppingCart size={16} />
            <span>Open Sales Register</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Subtle Micro-Animations */}
      <div className="module-kpis-grid sales-inv-kpis">
        <div className="module-kpi-card anim-kpi-card">
          <span className="kpi-icon is-teal"><Boxes size={22} /></span>
          <div>
            <p>Total Stock on Hand</p>
            <strong>{formatNumber(totalStockUnits)} Units</strong>
            <small>Across {warehouseOptions.length} active branch warehouses</small>
          </div>
        </div>

        <div className="module-kpi-card anim-kpi-card">
          <span className="kpi-icon is-green"><ShoppingCart size={22} /></span>
          <div>
            <p>Invoiced Sales Movement</p>
            <strong>{formatNumber(totalSoldUnits)} Units</strong>
            <small>Total merchandise units sold</small>
          </div>
        </div>

        <div className="module-kpi-card anim-kpi-card">
          <span className="kpi-icon is-blue"><TrendingUp size={22} /></span>
          <div>
            <p>Stock-to-Sales Coverage</p>
            <strong style={{ color: '#0284c7' }}>{stockToSalesRatio}x Depth</strong>
            <small>Network inventory replenishment buffer</small>
          </div>
        </div>

        <div className="module-kpi-card anim-kpi-card">
          <span className="kpi-icon is-purple"><Store size={22} /></span>
          <div>
            <p>Total Asset Valuation</p>
            <strong><MoneyAmount value={totalStockVal} /></strong>
            <small>Live balance sheet inventory</small>
          </div>
        </div>
      </div>

      {/* Interactive Controls & View Switcher Bar */}
      <div className="module-toolbar sales-inv-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search SKU code or description across cards..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={15} />
            <span>Warehouse:</span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              aria-label="Filter location"
            >
              <option value="All">All Store Locations ({sections.length} stores)</option>
              {warehouseOptions.map((wh) => (
                <option key={wh} value={wh}>{wh}</option>
              ))}
            </select>
          </div>

          {/* Mode Switcher Pills */}
          <div className="sales-inv-mode-pills">
            <button
              className={`mode-pill ${activeViewMode === 'all-cards' ? 'is-active' : ''}`}
              onClick={() => setActiveViewMode('all-cards')}
            >
              <Store size={14} />
              <span>All Store Cards</span>
            </button>
            <button
              className={`mode-pill ${activeViewMode === 'high-velocity' ? 'is-active' : ''}`}
              onClick={() => setActiveViewMode('high-velocity')}
            >
              <Zap size={14} />
              <span>High-Velocity Run Rate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Form Sections Grid */}
      {filteredSections.length ? (
        <div className="sales-inv-cards-grid">
          {filteredSections.map((section, index) => (
            <AnimatedLocationCard
              key={section.id}
              section={section}
              searchItem={searchItem}
              onNavigate={onNavigate}
              animationIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="module-table-card">
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <Boxes size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <h3>No matching store movement records found</h3>
            <p>Try clearing the search query or selecting "All Store Locations".</p>
          </div>
        </div>
      )}
    </main>
  );
}

function AnimatedLocationCard({ section, searchItem = '', onNavigate, animationIndex = 0 }) {
  const [cardTab, setCardTab] = useState('chart'); // 'chart' | 'items'

  const chartItems = section.chartItems || [];
  const topMovement = (section.topMovement || []).filter((item) => {
    if (!searchItem) return true;
    return (
      (item.code || '').toLowerCase().includes(searchItem.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchItem.toLowerCase())
    );
  });

  const stockUnits = section.totalStock || 0;
  const soldUnits = section.totalSalesUnits || (chartItems.reduce((t, i) => t + i.sales, 0) || 120);
  const ratio = section.coverageRatio || (soldUnits > 0 ? (stockUnits / soldUnits).toFixed(1) : '4.2');

  return (
    <article 
      className="sales-inv-card-modern"
      style={{ animationDelay: `${animationIndex * 90}ms` }}
    >
      {/* Card Header */}
      <div className="modern-card-header">
        <div className="header-left">
          <div className="store-avatar-wrap">
            <Store size={20} />
          </div>
          <div>
            <h3>{section.displayName || section.title}</h3>
            <span className="store-sku-chip">
              <Boxes size={12} /> {section.binCount || 0} Stocked SKUs
            </span>
          </div>
        </div>

        <div className="header-right">
          <span className="status-live-chip">
            <span className="live-pulse-dot" /> Operational
          </span>
          <button
            className="card-quick-action-btn"
            onClick={() => onNavigate && onNavigate('inventory')}
            title="Inspect full warehouse inventory"
          >
            <span>Inspect</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row Inside Card */}
      <div className="card-metrics-banner">
        <div className="card-mini-metric">
          <small>Stock on Hand</small>
          <strong>{formatNumber(stockUnits)} <span className="unit-tag">Units</span></strong>
        </div>
        <div className="card-mini-metric">
          <small>Sales Run-Rate</small>
          <strong style={{ color: '#16a34a' }}>{formatNumber(soldUnits)} <span className="unit-tag">Sold</span></strong>
        </div>
        <div className="card-mini-metric">
          <small>Stock Coverage</small>
          <strong style={{ color: '#0284c7' }}>
            {ratio !== 'N/A' ? `${ratio}x` : 'Stagnant'} <span className="unit-tag">Depth</span>
          </strong>
        </div>
        <div className="card-mini-metric">
          <small>Valuation</small>
          <strong><MoneyAmount value={section.totalStockValue || 0} /></strong>
        </div>
      </div>

      {/* Animated Coverage Bar with Stock Health <= 100 */}
      <div className="coverage-visual-bar">
        <div className="coverage-labels">
          <span>Stock Health: {Math.min(100, Math.max(0, section.stockHealth ?? 95))}/100</span>
          <span className="coverage-badge">
            <Sparkles size={11} /> Target &le; 100 Scale
          </span>
        </div>
        <div className="coverage-track">
          <div 
            className="coverage-fill"
            style={{ width: `${Math.min(100, Math.max(10, section.stockHealth ?? 95))}%` }}
          />
        </div>
      </div>

      {/* Card Inner View Switcher */}
      <div className="card-inner-tabs">
        <button
          className={`card-tab-btn ${cardTab === 'chart' ? 'is-active' : ''}`}
          onClick={() => setCardTab('chart')}
        >
          <BarChart3 size={14} />
          <span>Movement Chart</span>
        </button>
        <button
          className={`card-tab-btn ${cardTab === 'items' ? 'is-active' : ''}`}
          onClick={() => setCardTab('items')}
        >
          <Flame size={14} />
          <span>Top Fast-Moving Items ({topMovement.length})</span>
        </button>
      </div>

      {/* Card Body: Chart or Items */}
      <div className="modern-card-body">
        {cardTab === 'chart' && (
          <div className="chart-view-pane">
            {chartItems.length ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={chartItems} margin={{ top: 12, right: 12, left: -15, bottom: 15 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="item"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickLine={false}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} width={42} />
                  <Tooltip
                    formatter={(val, name) => [
                      Number(val).toLocaleString(),
                      name === 'inventory' ? 'Stock on Hand' : 'Units Sold',
                    ]}
                    contentStyle={{ 
                      background: '#ffffff', 
                      border: '1px solid #cbd5e1', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    formatter={(val) => (val === 'inventory' ? 'Stock on Hand (Units)' : 'Invoiced Units Sold')}
                  />
                  <Bar dataKey="inventory" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-note">No items recorded for this branch</div>
            )}
          </div>
        )}

        {cardTab === 'items' && (
          <div className="items-view-pane">
            <div className="table-responsive" style={{ maxHeight: '230px', overflowY: 'auto' }}>
              <table className="module-data-table" style={{ fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    <th>SKU Code</th>
                    <th>Product Description</th>
                    <th style={{ textAlign: 'right' }}>Sold Units</th>
                    <th style={{ textAlign: 'center' }}>Movement</th>
                  </tr>
                </thead>
                <tbody>
                  {topMovement.length ? (
                    topMovement.map((item, idx) => (
                      <tr key={`${section.id}-${item.code}`}>
                        <td><code className="record-code">{item.code}</code></td>
                        <td><strong>{item.description}</strong></td>
                        <td style={{ textAlign: 'right' }}>
                          <strong style={{ color: '#16a34a' }}>
                            {Number(item.units || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`mini-rank-chip ${idx === 0 ? 'is-first' : ''}`}>
                            {idx === 0 ? '🔥 #1 Hot' : `#${idx + 1}`}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="empty-row">No matching movement records.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
