import { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Award, 
  Boxes, 
  ChevronRight, 
  Crown, 
  Flame, 
  Layers, 
  Package, 
  Search, 
  Sparkles, 
  Store, 
  TrendingUp, 
  Zap,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

export function SalesPerformanceLeaderboard({ data, onNavigate }) {
  const [activeTab, setActiveTab] = useState('warehouses'); // 'warehouses' | 'items' | 'drilldown'
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' | 'units'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    data?.warehouseSalesLeaderboard?.[0]?.id || ''
  );

  const rawWarehouses = data?.warehouseSalesLeaderboard || [];
  const rawItems = (data?.itemSalesLeaderboard || []).filter(
    (i) => i.code && i.code !== 'Unknown' && i.name !== 'Unknown'
  );

  // Filtered & Sorted Warehouses
  const warehouses = useMemo(() => {
    let list = rawWarehouses.filter((wh) =>
      (wh.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wh.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wh.location || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === 'units') {
      list = [...list].sort((a, b) => b.unitsSold - a.unitsSold);
    } else {
      list = [...list].sort((a, b) => b.revenue - a.revenue);
    }
    return list;
  }, [rawWarehouses, searchQuery, sortBy]);

  // Filtered & Sorted Products
  const items = useMemo(() => {
    let list = rawItems.filter((item) =>
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.group || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === 'units') {
      list = [...list].sort((a, b) => b.unitsSold - a.unitsSold);
    } else {
      list = [...list].sort((a, b) => b.revenue - a.revenue);
    }
    return list;
  }, [rawItems, searchQuery, sortBy]);

  // Selected Warehouse for Drilldown
  const activeDrilldownWarehouse = useMemo(() => {
    return (
      rawWarehouses.find((wh) => wh.id === selectedWarehouseId) ||
      rawWarehouses[0] ||
      null
    );
  }, [rawWarehouses, selectedWarehouseId]);

  return (
    <section className="sales-leaderboard-section">
      {/* Header with Title & Modern Tab Switcher */}
      <div className="sales-leaderboard-header">
        <div className="leaderboard-title-group">
          <div className="leaderboard-badge">
            <Flame size={15} className="flame-icon" />
            <span>Revenue Intelligence Champions</span>
          </div>
          <h2>Sales Performance Leaderboard</h2>
          <p>
            Real-time attribution discovering which retail warehouse and merchandise items drive top commercial sales.
          </p>
        </div>

        {/* Modern Segmented Navigation Tabs */}
        <div className="leaderboard-tabs-bar">
          <button
            type="button"
            className={`leaderboard-tab-btn ${activeTab === 'warehouses' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('warehouses')}
          >
            <Store size={15} />
            <span>Top Warehouses</span>
            <span className="tab-pill-count">{rawWarehouses.length}</span>
          </button>

          <button
            type="button"
            className={`leaderboard-tab-btn ${activeTab === 'items' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            <Package size={15} />
            <span>Top Selling Products</span>
            <span className="tab-pill-count">{rawItems.length}</span>
          </button>

          <button
            type="button"
            className={`leaderboard-tab-btn ${activeTab === 'drilldown' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('drilldown')}
          >
            <Zap size={15} />
            <span>Store Drilldown</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search Input + Modern Segmented Sort Pills */}
      <div className="leaderboard-controls-bar">
        <div className="leaderboard-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={
              activeTab === 'warehouses'
                ? 'Search warehouse name or location...'
                : activeTab === 'items'
                ? 'Search product description, SKU code, or category...'
                : 'Search store drilldown...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              &times;
            </button>
          )}
        </div>

        <div className="leaderboard-sort-group">
          <span className="sort-label">Rank by:</span>
          <div className="sort-segmented-control">
            <button
              type="button"
              className={`sort-pill ${sortBy === 'revenue' ? 'is-active' : ''}`}
              onClick={() => setSortBy('revenue')}
            >
              <TrendingUp size={13} />
              <span>Highest Revenue (PGK)</span>
            </button>
            <button
              type="button"
              className={`sort-pill ${sortBy === 'units' ? 'is-active' : ''}`}
              onClick={() => setSortBy('units')}
            >
              <Boxes size={13} />
              <span>Units Sold</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: BEST PERFORMING WAREHOUSES (CARD-WISE GRID) */}
      {activeTab === 'warehouses' && (
        <div className="leaderboard-warehouses-grid">
          {warehouses.map((wh, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            return (
              <div
                key={wh.id}
                className={`leaderboard-card warehouse-card ${isTop1 ? 'is-rank-1' : ''}`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {/* Top Card Row: Medal & Live Pulse */}
                <div className="card-top-row">
                  <div className="rank-indicator">
                    {isTop1 ? (
                      <span className="medal-badge gold">
                        <Crown size={14} /> #1 Champion
                      </span>
                    ) : isTop2 ? (
                      <span className="medal-badge silver">
                        🥈 #2 Runner-Up
                      </span>
                    ) : isTop3 ? (
                      <span className="medal-badge bronze">
                        🥉 #3 Ranked
                      </span>
                    ) : (
                      <span className="medal-badge regular">
                        #{index + 1} Ranked
                      </span>
                    )}
                  </div>
                  <span className="wh-status-chip">
                    <span className="pulse-dot" /> Operational
                  </span>
                </div>

                {/* Warehouse Name & Location */}
                <div className="wh-info-block">
                  <div className="wh-icon-wrap">
                    <Store size={22} />
                  </div>
                  <div>
                    <h3 className="wh-name">{wh.displayName || wh.name}</h3>
                    <small className="wh-location">{wh.location}</small>
                  </div>
                </div>

                {/* Primary Revenue Display */}
                <div className="wh-revenue-block">
                  <span className="metric-caption">Total Billed Revenue</span>
                  <div className="revenue-val">
                    <MoneyAmount value={wh.revenue} />
                  </div>
                </div>

                {/* Animated Sales Share Progress Bar */}
                <div className="wh-progress-wrap">
                  <div className="progress-labels">
                    <span>Company Sales Contribution</span>
                    <strong className="share-percent">{wh.salesShare}%</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.max(8, wh.salesShare)}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="wh-metrics-strip">
                  <div className="strip-item">
                    <small>Units Sold</small>
                    <strong>{formatNumber(wh.unitsSold)}</strong>
                  </div>
                  <div className="strip-item">
                    <small>Active SKUs</small>
                    <strong>{formatNumber(wh.activeSkus)}</strong>
                  </div>
                  <div className="strip-item">
                    <small>Stock Units</small>
                    <strong>{formatNumber(wh.stockUnits)}</strong>
                  </div>
                </div>

                {/* Top Selling Item in this Store */}
                {wh.topItem && (
                  <div className="wh-top-item-banner">
                    <span className="top-item-label">
                      <Sparkles size={12} /> Store Best Seller:
                    </span>
                    <strong className="top-item-name" title={wh.topItem.name}>
                      {wh.topItem.name}
                    </strong>
                    <span className="top-item-amount">
                      <MoneyAmount value={wh.topItem.sales} />
                    </span>
                  </div>
                )}

                {/* Card Action Button */}
                <button
                  type="button"
                  className="wh-card-action-btn"
                  onClick={() => {
                    setSelectedWarehouseId(wh.id);
                    setActiveTab('drilldown');
                  }}
                >
                  <span>Inspect Store Items</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TOP SELLING PRODUCTS (CARD-WISE GRID) */}
      {activeTab === 'items' && (
        <div className="leaderboard-products-grid">
          {items.map((item, index) => {
            const isTop1 = index === 0;
            const isTop2 = index === 1;
            const isTop3 = index === 2;

            return (
              <div
                key={item.code}
                className={`product-card-box ${isTop1 ? 'is-first' : ''}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Product Card Header */}
                <div className="product-card-top">
                  <div className="product-rank-tag">
                    {isTop1 ? (
                      <span className="rank-chip gold">🥇 #1 Best Seller</span>
                    ) : isTop2 ? (
                      <span className="rank-chip silver">🥈 #2 Rank</span>
                    ) : isTop3 ? (
                      <span className="rank-chip bronze">🥉 #3 Rank</span>
                    ) : (
                      <span className="rank-chip">#{index + 1} Rank</span>
                    )}
                  </div>
                  <span className="product-velocity-pill">{item.velocity}</span>
                </div>

                {/* Product Title & Identifiers */}
                <div className="product-title-section">
                  <h4 className="product-title" title={item.name}>{item.name}</h4>
                  <div className="product-meta-row">
                    <code className="sku-badge">{item.code}</code>
                    <span className="category-tag">{item.group}</span>
                    <span className="store-pill">
                      <Store size={12} /> {item.topWarehouse}
                    </span>
                  </div>
                </div>

                {/* Product Revenue & Quantity Grid */}
                <div className="product-metrics-grid">
                  <div className="p-metric-item highlight">
                    <small>Total Revenue</small>
                    <strong className="p-rev-val">
                      <MoneyAmount value={item.revenue} />
                    </strong>
                  </div>
                  <div className="p-metric-item">
                    <small>Units Sold</small>
                    <strong>{formatNumber(item.unitsSold)} <span className="unit-label">Units</span></strong>
                  </div>
                  <div className="p-metric-item">
                    <small>Stock on Hand</small>
                    <strong className={`stock-status ${item.onHandStock > 20 ? 'healthy' : 'low'}`}>
                      {formatNumber(item.onHandStock)} <span className="unit-label">Avail</span>
                    </strong>
                  </div>
                </div>

                {/* Contribution Share Bar */}
                <div className="product-share-section">
                  <div className="share-labels">
                    <span>Revenue Share</span>
                    <strong>{item.salesShare}%</strong>
                  </div>
                  <div className="share-track">
                    <div
                      className="share-fill"
                      style={{ width: `${Math.max(12, item.salesShare * 2.2)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 3: STORE DRILLDOWN SHOWCASE */}
      {activeTab === 'drilldown' && (
        <div className="drilldown-showcase-card">
          {/* Left Store Selector List */}
          <div className="drilldown-sidebar">
            <h4>Select Branch Warehouse</h4>
            <div className="drilldown-sidebar-list">
              {rawWarehouses.map((wh, idx) => {
                const isActive = wh.id === selectedWarehouseId;
                return (
                  <button
                    key={wh.id}
                    type="button"
                    className={`drilldown-wh-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedWarehouseId(wh.id)}
                  >
                    <div className="wh-btn-left">
                      <span className="wh-btn-rank">#{idx + 1}</span>
                      <span className="wh-btn-name">{wh.displayName || wh.name}</span>
                    </div>
                    <span className="wh-btn-rev">
                      <MoneyAmount value={wh.revenue} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detailed Performance Panel */}
          {activeDrilldownWarehouse ? (
            <div className="drilldown-content-panel">
              {/* Header Banner */}
              <div className="drilldown-hero-banner">
                <div className="drilldown-hero-title">
                  <div className="store-tag">
                    <Store size={15} />
                    <span>Courts Branch Operations</span>
                  </div>
                  <h3>{activeDrilldownWarehouse.displayName || activeDrilldownWarehouse.name}</h3>
                  <p>{activeDrilldownWarehouse.location} &bull; Active Commercial Center</p>
                </div>
                <div className="drilldown-hero-metrics">
                  <div className="drilldown-hero-stat">
                    <small>Total Billed Revenue</small>
                    <strong style={{ color: '#0284c7' }}>
                      <MoneyAmount value={activeDrilldownWarehouse.revenue} />
                    </strong>
                  </div>
                  <div className="drilldown-hero-stat">
                    <small>Units Sold</small>
                    <strong>{formatNumber(activeDrilldownWarehouse.unitsSold)}</strong>
                  </div>
                  <div className="drilldown-hero-stat">
                    <small>Network Share</small>
                    <strong style={{ color: '#16a34a' }}>{activeDrilldownWarehouse.salesShare}%</strong>
                  </div>
                </div>
              </div>

              {/* Itemized Fast Sellers in this Branch */}
              <div className="drilldown-sku-list-section">
                <div className="section-head">
                  <Sparkles size={16} style={{ color: '#d97706' }} />
                  <h4>Top Velocity Merchandise at this Location</h4>
                </div>
                <div className="drilldown-skus-grid">
                  {activeDrilldownWarehouse.topItems?.length ? (
                    activeDrilldownWarehouse.topItems.map((sku, i) => (
                      <div key={`${activeDrilldownWarehouse.id}-${sku.code}`} className="drilldown-sku-card">
                        <div className="sku-rank-pill">#{i + 1}</div>
                        <div className="sku-info">
                          <strong>{sku.name}</strong>
                          <code>{sku.code}</code>
                        </div>
                        <div className="sku-sales-stats">
                          <strong><MoneyAmount value={sku.sales} /></strong>
                          <small>{formatNumber(sku.units)} units</small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-drilldown-note">
                      No fast-moving item records attributed to this store yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-drilldown-state">
              Please select a warehouse from the left list.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
