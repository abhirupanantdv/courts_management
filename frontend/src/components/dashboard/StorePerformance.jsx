import { useState } from 'react';
import { ArrowRight, ShieldCheck, Store, Tag, Users, Activity } from 'lucide-react';
import { formatNumber } from '../../utils/formatters.js';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function StorePerformance({ stores = [], selectedStore, onSelectStore, onNavigate }) {
  const [timeRange, setTimeRange] = useState('today');

  const getStoreSales = (store) => {
    if (timeRange === 'today') return Number(store.salesToday || 0);
    if (timeRange === 'month') return Number(store.salesMTD || 0);
    if (timeRange === 'year') return Number(store.salesYTD || store.salesTotal || 0);
    return Number(store.salesTotal || store.salesYTD || store.salesToday || 0);
  };

  const getStoreTransactions = (store) => {
    if (timeRange === 'today') return Number(store.transactionsToday || (store.salesToday > 0 ? 1 : 0));
    if (timeRange === 'month') return Number(store.transactionsMTD || (store.salesMTD > 0 ? Math.ceil(store.salesMTD / 350) : 0));
    if (timeRange === 'year') return Number(store.transactionsYTD || (store.salesYTD > 0 ? Math.ceil(store.salesYTD / 450) : 0));
    return Number(store.transactionsTotal || store.transactions || 0);
  };

  const totalSales = stores.reduce((total, store) => total + getStoreSales(store), 0);
  const totalTransactions = stores.reduce((total, store) => total + getStoreTransactions(store), 0);
  const averageSale = totalTransactions ? totalSales / totalTransactions : (totalSales > 0 ? totalSales : 0);

  return (
    <article className="panel dashboard-panel">
      <div className="panel__header">
        <h3>Store Performance</h3>
        <select
          className="dashboard-select-ctrl"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          aria-label="Filter store performance time"
        >
          <option value="today">Today</option>
          <option value="month">This Month (MTD)</option>
          <option value="year">This Year (YTD)</option>
          <option value="all">All Time</option>
        </select>
      </div>
      <div className="mini-stats">
        <span>
          <Store size={20} />
          <div className="mini-stat-info">
            <strong>{formatNumber(stores.length)}</strong>
            <small>Total Stores</small>
          </div>
        </span>
        <span>
          <ShieldCheck size={20} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={totalSales} /></strong>
            <small>
              {timeRange === 'today' ? 'Today' : timeRange === 'month' ? 'MTD' : timeRange === 'year' ? 'YTD' : 'Total'} Sales
            </small>
          </div>
        </span>
        <span>
          <Users size={20} />
          <div className="mini-stat-info">
            <strong>{formatNumber(totalTransactions)}</strong>
            <small>
              {timeRange === 'today' ? 'Today' : timeRange === 'month' ? 'MTD' : timeRange === 'year' ? 'YTD' : 'Total'} Invoices
            </small>
          </div>
        </span>
        <span>
          <Tag size={20} />
          <div className="mini-stat-info">
            <strong><MoneyAmount value={averageSale} /></strong>
            <small>Avg. Ticket</small>
          </div>
        </span>
      </div>
      <div className="table-scroll compact-table">
        <table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Location</th>
              <th>Sales</th>
              <th>Trans.</th>
              <th>Stock Health</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stores.length ? stores.map((store) => {
              const isSelected = selectedStore === store.store;
              const salesVal = getStoreSales(store);
              const txVal = getStoreTransactions(store);
              const healthScore = Math.min(100, Math.max(0, store.stockHealth ?? 95));
              const healthClass = healthScore >= 80 ? 'is-healthy' : healthScore >= 50 ? 'is-moderate' : 'is-critical';

              return (
                <tr 
                  key={store.store}
                  className={`store-clickable-row ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectStore && onSelectStore(store.store)}
                  title="Click to drill down into store details"
                >
                  <td><strong>{store.store.split(' - ')[0]}</strong></td>
                  <td>{store.location}</td>
                  <td className="money"><MoneyAmount value={salesVal} /></td>
                  <td>{formatNumber(txVal)}</td>
                  <td>
                    <span className={`stock-health-tag ${healthClass}`} title={`Health score <= 100`}>
                      {healthScore}/100
                    </span>
                  </td>
                  <td><ArrowRight size={15} color={isSelected ? '#2563eb' : '#94a3b8'} /></td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" className="empty-cell">No store or warehouse records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        className="link-button"
        onClick={() => onNavigate && onNavigate('salesInventory')}
        title="View detailed warehouse performance"
      >
        Show all stores <ArrowRight size={16} />
      </button>
    </article>
  );
}
