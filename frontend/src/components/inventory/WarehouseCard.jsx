import { formatCurrency, formatNumber } from '../../utils/formatters.js';

export function WarehouseCard({ warehouse }) {
  return (
    <article className="warehouse-card">
      <div>
        <h3>{warehouse.name}</h3>
        <p>{formatNumber(warehouse.qty)} qty</p>
      </div>
      <div>
        <strong>{formatCurrency(warehouse.value)}</strong>
        <span>{warehouse.utilization}% utilized</span>
      </div>
      <div className="progress-track" aria-label={`${warehouse.name} utilization ${warehouse.utilization}%`}>
        <span style={{ width: `${warehouse.utilization}%` }} />
      </div>
    </article>
  );
}
