import { useState, useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Boxes, ChevronLeft, ShieldCheck, Store, Tag, Users } from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function StoreDetails({ data, onNavigate }) {
  const stores = data.storePerformance || [];
  const [selectedStoreName, setSelectedStoreName] = useState(stores[0]?.store || '');
  const [activeTab, setActiveTab] = useState('Summary');
  const [period, setPeriod] = useState('today');

  const currentStore = useMemo(() => {
    return stores.find((s) => s.store === selectedStoreName) || stores[0];
  }, [stores, selectedStoreName]);

  const bins = data.bins || [];
  const storeBins = useMemo(() => {
    if (!currentStore) return [];
    return bins.filter((b) => b.warehouse === currentStore.store);
  }, [bins, currentStore]);

  const todaySales = currentStore?.salesToday || 0;
  const transactions = currentStore?.transactions || storeBins.length || 0;
  const averageSale = transactions ? todaySales / transactions : 0;

  const salesComparison = [
    ['Today', todaySales, todaySales ? 40 : 0],
    ['MTD', todaySales * 1.8, 65],
    ['YTD', todaySales * 3.2, 90],
  ];

  return (
    <article className="panel dashboard-panel">
      <div className="panel__header">
        <h3>
          <ChevronLeft size={18} />
          {currentStore ? `${currentStore.store.split(' - ')[0]} Details` : 'Store Details'}
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {stores.length > 1 && (
            <select
              className="dashboard-select-ctrl"
              value={selectedStoreName || currentStore?.store}
              onChange={(e) => setSelectedStoreName(e.target.value)}
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
        <div>
          <strong>{currentStore?.store || 'No store selected'}</strong>
          <small>{currentStore?.location || 'Courts Retail Outlet'}</small>
        </div>
        <span className="status-chip is-success">◆ {currentStore?.status || 'Open'}</span>
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
            <strong><MoneyAmount value={todaySales} /></strong>
            <small>Sales Horizon</small>
          </div>
        </span>
        <span>
          <Boxes size={20} />
          <div className="mini-stat-info">
            <strong>{transactions.toLocaleString()}</strong>
            <small>Active Bins</small>
          </div>
        </span>
        <span>
          <Tag size={20} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={averageSale} /></strong>
            <small>Avg. Item Val</small>
          </div>
        </span>
        <span>
          <Users size={20} />
          <div className="mini-stat-info">
            <strong>{data.heroMetrics.customersToday.toLocaleString()}</strong>
            <small>Accounts</small>
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
                    <i style={{ width: `${percentage}%` }} />
                  </span>
                  <strong><MoneyAmount value={value} /></strong>
                </div>
              ))}
            </div>
          </div>
          <div className="summary-column">
            <h4>Inventory Distribution</h4>
            <div className="chart-frame chart-frame--mini">
              <ResponsiveContainer width="100%" height={110}>
                <BarChart data={storeBins.slice(0, 6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="item_code" hide />
                  <YAxis hide />
                  <Bar dataKey="actual_qty" fill="#1264d8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Stock Balances' && (
        <div className="table-scroll compact-table" style={{ maxHeight: '140px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Item Code</th>
                <th style={{ textAlign: 'right' }}>Stock Qty</th>
                <th style={{ textAlign: 'right' }}>Valuation</th>
              </tr>
            </thead>
            <tbody>
              {storeBins.slice(0, 8).map((b) => (
                <tr key={b.name}>
                  <td><strong>{b.item_code}</strong></td>
                  <td style={{ textAlign: 'right' }}>{Number(b.actual_qty || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}><MoneyAmount value={b.stock_value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(activeTab === 'Sales Analysis' || activeTab === 'Top Items') && (
        <div className="table-scroll compact-table" style={{ maxHeight: '140px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.topSellingItems.slice(0, 5).map((item) => (
                <tr key={item.item}>
                  <td><strong>{item.item}</strong></td>
                  <td style={{ textAlign: 'right' }}>{item.qty.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}><MoneyAmount value={item.sales} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
