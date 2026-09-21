import { Boxes, RefreshCw, ShoppingCart, Store, Users } from 'lucide-react';
import { formatNumber } from '../../utils/formatters.js';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { erpNextRoutes, redirectToErpNext } from '../../utils/erpnextRoutes.js';

const cards = [
  {
    key: 'sales',
    icon: ShoppingCart,
    tone: 'green',
    label: 'Total Sales Today',
    renderValue: (data) => <MoneyAmount value={data.heroMetrics.salesToday} />,
    note: 'From verified sales invoices',
  },
  {
    key: 'stores',
    icon: Store,
    tone: 'blue',
    label: 'Total Number of Stores',
    getValue: (data) => formatNumber(data.heroMetrics.stores),
    note: 'Operational branch stores',
  },
  {
    key: 'warehouses',
    icon: Boxes,
    tone: 'orange',
    label: 'Total Warehouses',
    getValue: (data) => formatNumber(data.heroMetrics.warehouses),
    note: 'Active branch warehouses',
  },
  {
    key: 'customers',
    icon: Users,
    tone: 'purple',
    label: 'Total Customers Today',
    getValue: (data) => formatNumber(data.heroMetrics.customersToday),
    note: 'Active customer accounts',
  },
];

export function OverviewCards({ data, isRefreshing, onRefresh }) {
  return (
    <section className="overview-grid" aria-label="Daily overview">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <article className="overview-card" key={card.key}>
            <span className={`overview-card__icon is-${card.tone}`}>
              <Icon size={34} />
            </span>
            <div>
              <p>{card.label}</p>
              <strong>{card.renderValue ? card.renderValue(data) : card.getValue(data)}</strong>
              <small>
                {card.note}
              </small>
            </div>
            {index === 1 ? (
              <button className="round-action" aria-label="Refresh dashboard data" onClick={onRefresh}>
                <RefreshCw size={18} className={isRefreshing ? 'is-spinning' : ''} />
              </button>
            ) : index === 2 ? (
              <button className="round-action" aria-label="View warehouses in Command Centre" onClick={() => onNavigate && onNavigate('salesInventory')}>→</button>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
