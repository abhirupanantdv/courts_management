import { RefreshCw } from 'lucide-react';

export function DashboardFilters({ data, isRefreshing, onRefresh }) {
  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      <label>
        <span>Company</span>
        <select defaultValue={data.company}>
          <option>Courts</option>
        </select>
      </label>
      <label>
        <span>From Date</span>
        <input type="date" defaultValue={data.period.from} />
      </label>
      <label>
        <span>To Date</span>
        <input type="date" defaultValue={data.period.to} />
      </label>
      <label>
        <span>Warehouse</span>
        <select defaultValue="All Warehouses">
          {data.filters.warehouses.map((warehouse) => (
            <option key={warehouse}>{warehouse}</option>
          ))}
        </select>
      </label>
      <label>
        <span>View</span>
        <select defaultValue="Management Summary">
          {data.filters.views.map((view) => (
            <option key={view}>{view}</option>
          ))}
        </select>
      </label>
      <button className="refresh-button" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw size={18} className={isRefreshing ? 'is-spinning' : ''} />
        <span>{isRefreshing ? 'Refreshing' : 'Refresh'}</span>
      </button>
    </section>
  );
}
