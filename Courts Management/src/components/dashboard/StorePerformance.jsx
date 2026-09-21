import { useState } from 'react';
import { ArrowRight, ShieldCheck, Store, Tag, Users } from 'lucide-react';
import { formatNumber } from '../../utils/formatters.js';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function StorePerformance({ stores = [], onNavigate }) {
  const [timeRange, setTimeRange] = useState('today');

  const totalSales = stores.reduce((total, store) => total + Number(store.salesToday || 0), 0);
  const totalTransactions = stores.reduce((total, store) => total + Number(store.transactions || 0), 0);
  const averageSale = totalTransactions ? totalSales / totalTransactions : 0;

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
          <option value="week">This Week</option>
          <option value="month">This Month</option>
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
            <small>Total Sales</small>
          </div>
        </span>
        <span>
          <Users size={20} />
          <div className="mini-stat-info">
            <strong>{formatNumber(totalTransactions)}</strong>
            <small>Transactions</small>
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
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stores.length ? stores.map((store) => (
              <tr key={store.store}>
                <td><strong>{store.store}</strong></td>
                <td>{store.location}</td>
                <td className="money"><MoneyAmount value={store.salesToday} /></td>
                <td>{formatNumber(store.transactions)}</td>
                <td><span className="status-chip is-success">◆ {store.status}</span></td>
                <td><ArrowRight size={15} /></td>
              </tr>
            )) : (
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
