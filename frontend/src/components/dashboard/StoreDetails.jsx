import { useState, useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Boxes, ChevronLeft, ShieldCheck, Store, Tag, Users, Activity } from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function StoreDetails({ data, selectedStore, onSelectStore, onNavigate }) {
  const stores = data.storePerformance || [];
  const [internalStore, setInternalStore] = useState(stores[0]?.store || '');
  const activeStoreName = selectedStore || internalStore || stores[0]?.store || '';

  const handleStoreChange = (name) => {
    setInternalStore(name);
    if (onSelectStore) {
      onSelectStore(name);
    }
  };

  const [activeTab, setActiveTab] = useState('Summary');
  const [period, setPeriod] = useState('today');

  const currentStore = useMemo(() => {
    return stores.find((s) => s.store === activeStoreName) || stores[0];
  }, [stores, activeStoreName]);

  const bins = data.bins || [];
  const storeBins = useMemo(() => {
    if (!currentStore) return [];
    return bins.filter((b) => b.warehouse === currentStore.store);
  }, [bins, currentStore]);

  // Real store sales for horizons
  const todaySales = Number(currentStore?.salesToday || 0);
  const mtdSales = Number(currentStore?.salesMTD || todaySales || 0);
  const ytdSales = Number(currentStore?.salesYTD || currentStore?.salesTotal || mtdSales || 0);

  // Filtered sales metric based on period dropdown
  const periodSales = period === 'today' ? todaySales : period === 'mtd' ? mtdSales : ytdSales;
  const transactions = Number(currentStore?.transactions || storeBins.length || 0);
  const averageSale = transactions > 0 ? periodSales / transactions : 0;

  // Max horizon for proportional bar width
  const maxHorizon = Math.max(ytdSales, mtdSales, todaySales, 1);
  const salesComparison = [
    ['Today', todaySales, Math.round((todaySales / maxHorizon) * 100)],
    ['MTD', mtdSales, Math.round((mtdSales / maxHorizon) * 100)],
    ['YTD', ytdSales, Math.round((ytdSales / maxHorizon) * 100)],
  ];

  // Specific top items for this selected store
  const storeTopItems = useMemo(() => {
    if (!currentStore) return [];
    const whItems = data.topItemsByWarehouse?.[currentStore.store];
    if (whItems && whItems.length > 0) return whItems;
    return storeBins.slice(0, 6).map((b) => ({
      item: b.item_code,
      item_code: b.item_code,
      qty: Number(b.actual_qty || 0),
      sales: Number(b.stock_value || 0),
    }));
  }, [currentStore, data.topItemsByWarehouse, storeBins]);

  const stockHealth = Math.min(100, Math.max(0, currentStore?.stockHealth ?? 95));
  const healthStatus = stockHealth >= 80 ? 'Optimal' : stockHealth >= 50 ? 'Moderate' : 'Needs Restock';

  return (
    <article className="panel dashboard-panel" id="store-drilldown-panel">
      <div className="panel__header">
        <h3>
          <ChevronLeft size={18} />
          {currentStore ? `${currentStore.store.split(' - ')[0]} Drilldown` : 'Store Details'}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {stores.length > 1 && (
            <select
              className="dashboard-select-ctrl"
              value={activeStoreName}
              onChange={(e) => handleStoreChange(e.target.value)}
              aria-label="Select store to inspect"
            >
              {stores.map((s) => (
                <option key={s.store} value={s.store}>
                  {s.store.split(' - ')[0]}
                </option>
              ))}
            </select>
          )}
          <select
            className="dashboard-select-ctrl"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            aria-label="Filter store detail period"
          >
            <option value="today">Today</option>
            <option value="mtd">MTD</option>
            <option value="ytd">YTD</option>
          </select>
        </div>
      </div>

      <div className="store-title-row">
        <span className="square-icon is-blue"><Store size={22} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <strong>{currentStore?.store || 'No store selected'}</strong>
          <small>{currentStore?.location || 'Courts Retail Outlet'}</small>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span 
            className="stock-health-tag is-healthy" 
            title="Stock Health Score: Evaluated on a 0-100 scale (Optimal <= 100)"
          >
            <Activity size={12} /> Stock Health: {stockHealth}/100 ({healthStatus})
          </span>
          <span className="status-chip is-success">◆ {currentStore?.status || 'Open'}</span>
        </div>
      </div>

      <div className="tab-row">
        {['Summary', 'Sales Analysis', 'Top Items', 'Stock Balances'].map((tab) => (
          <button
            className={activeTab === tab ? 'is-active' : ''}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mini-stats mini-stats--details">
        <span>
          <ShieldCheck size={20} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={periodSales} /></strong>
            <small>{period.toUpperCase()} Revenue</small>
          </div>
        </span>
        <span>
          <Boxes size={20} />
          <div className="mini-stat-info">
            <strong>{storeBins.length.toLocaleString()}</strong>
            <small>Active Bins</small>
          </div>
        </span>
        <span>
          <Tag size={20} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={averageSale} /></strong>
            <small>Avg. Ticket</small>
          </div>
        </span>
        <span>
          <Users size={20} />
          <div className="mini-stat-info">
            <strong>{transactions.toLocaleString()}</strong>
            <small>Invoices</small>
          </div>
        </span>
      </div>

      {activeTab === 'Summary' && (
        <div className="summary-columns">
          <div className="summary-column">
            <h4>Sales Horizon</h4>
            <div className="bars-list">
              {salesComparison.map(([label, value, percentage]) => (
                <div className="bar-row" key={label}>
                  <label>{label}</label>
                  <span className="bar-track">
                    <i style={{ width: `${Math.max(4, percentage)}%` }} />
                  </span>
                  <strong><MoneyAmount value={value} /></strong>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-column">
            <h4>Inventory Distribution</h4>
            <div className="chart-frame chart-frame--mini">
              {storeBins.length > 0 ? (
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={storeBins.slice(0, 8)} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                    <XAxis dataKey="item_code" hide />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(val) => [`${Number(val).toLocaleString()} Units`, 'Stock Qty']}
                      labelFormatter={(idx) => storeBins[idx]?.item_code || 'Item'}
                    />
                    <Bar dataKey="actual_qty" fill="#2563eb" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-note" style={{ height: '110px' }}>
                  No active bin inventory found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Stock Balances' && (
        <div className="table-scroll compact-table" style={{ maxHeight: '170px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'right' }}>Stock Qty</th>
                <th style={{ textAlign: 'right' }}>Valuation</th>
              </tr>
            </thead>
            <tbody>
              {storeBins.length ? storeBins.slice(0, 10).map((b) => (
                <tr key={b.name || b.item_code}>
                  <td>
                    <strong style={{ display: 'block', fontSize: '0.86rem' }}>{b.item_name || b.item_code}</strong>
                    <code style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.item_code}</code>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="stock-health-tag is-healthy">{Number(b.actual_qty || 0).toLocaleString()}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}><MoneyAmount value={b.stock_value} /></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="empty-cell">No bin records for this store.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === 'Sales Analysis' || activeTab === 'Top Items') && (
        <div className="table-scroll compact-table" style={{ maxHeight: '170px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Merchandise Item</th>
                <th style={{ textAlign: 'right' }}>Sold</th>
                <th style={{ textAlign: 'right' }}>Stock on Hand</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {storeTopItems.length ? storeTopItems.slice(0, 6).map((item) => {
                const title = item.name || item.item || item.item_code || 'Product';
                const code = item.code || item.item_code || '';
                const onHand = Number(item.onHandStock ?? item.on_hand_stock ?? 0);
                const unitsSold = Number(item.qty ?? item.units ?? 0);

                return (
                  <tr key={code || title}>
                    <td title={title}>
                      <strong style={{ display: 'block', fontSize: '0.86rem' }}>{title}</strong>
                      <code style={{ fontSize: '0.72rem', color: '#64748b' }}>{code}</code>
                    </td>
                    <td style={{ textAlign: 'right' }}>{unitsSold.toLocaleString()} units</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`stock-health-tag ${onHand > 0 ? 'is-healthy' : 'is-critical'}`}>
                        {onHand.toLocaleString()} in stock
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}><MoneyAmount value={item.sales} /></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="empty-cell">No sales recorded for this warehouse yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
