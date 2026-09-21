import { BarChart3, Boxes, ChartPie, FilePlus2, Store, TrendingUp } from 'lucide-react';

const actions = [
  { label: 'Sales Report', icon: TrendingUp, tone: 'green', page: 'reports', reportId: 'sales-register' },
  { label: 'Purchase Report', icon: FilePlus2, tone: 'orange', page: 'reports', reportId: 'purchase-register' },
  { label: 'Inventory Report', icon: Boxes, tone: 'blue', page: 'inventory', reportId: 'stock-balance' },
  { label: 'Profit & Loss', icon: ChartPie, tone: 'purple', page: 'finance', reportId: 'profit-and-loss' },
  { label: 'Store Performance', icon: Store, tone: 'pink', page: 'reports', reportId: 'store-matrix' },
  { label: 'Warehouse Analysis', icon: BarChart3, tone: 'green', page: 'salesInventory' },
];

export function QuickActions({ onNavigate }) {
  const handleClick = (action) => {
    if (onNavigate) {
      onNavigate(action.page, { reportId: action.reportId });
    }
  };

  return (
    <article className="panel dashboard-panel">
      <div className="panel__header">
        <h3>Quick Actions</h3>
      </div>
      <div className="quick-actions">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              className="quick-action"
              key={action.label}
              onClick={() => handleClick(action)}
              title={`Open ${action.label} in Command Centre`}
            >
              <Icon className={`quick-action__icon is-${action.tone}`} size={28} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
