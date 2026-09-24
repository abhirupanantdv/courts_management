import { BarChart3, Boxes, ChartPie, FilePlus2, Store, TrendingUp } from 'lucide-react';
import { canAccessModule, canAccessReport } from '../../utils/rolePermissions.js';

const actions = [
  { label: 'Sales Register', desc: 'Invoices & revenue', icon: TrendingUp, tone: 'green', page: 'reports', reportId: 'sales-register' },
  { label: 'Purchase Register', desc: 'Supplier bills & spend', icon: FilePlus2, tone: 'orange', page: 'reports', reportId: 'purchase-register' },
  { label: 'Stock Balance', desc: 'Bin inventory & valuation', icon: Boxes, tone: 'blue', page: 'reports', reportId: 'stock-balance' },
  { label: 'Finance & GL', desc: 'Balance sheet & ledger', icon: ChartPie, tone: 'purple', page: 'finance', reportId: null },
  { label: 'Store Matrix', desc: 'Branch outlets breakdown', icon: Store, tone: 'pink', page: 'reports', reportId: 'store-matrix' },
  { label: 'Stock Movement', desc: 'Run-rate & velocity', icon: BarChart3, tone: 'teal', page: 'salesInventory', reportId: null },
];

export function QuickActions({ data = {}, onNavigate }) {
  const userRoles = data?.userRoles || data?.user?.roles || [];
  const permissions = data?.permissions;

  const permittedActions = actions.filter((act) => {
    if (act.reportId) {
      return canAccessReport(userRoles, act.reportId, permissions);
    }
    return canAccessModule(userRoles, act.page, permissions);
  });

  const handleClick = (action) => {
    if (onNavigate) {
      onNavigate(action.page, { reportId: action.reportId });
    }
  };

  return (
    <article className="panel dashboard-panel">
      <div className="panel__header">
        <div>
          <h3>Quick Operations</h3>
          <small className="panel-subtitle">Direct shortcuts to operational ledgers and reports</small>
        </div>
      </div>
      <div className="quick-actions">
        {permittedActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              type="button"
              className="quick-action"
              key={action.label}
              onClick={() => handleClick(action)}
              title={`Open ${action.label}`}
            >
              <Icon className={`quick-action__icon is-${action.tone}`} size={26} />
              <div className="quick-action__text">
                <span className="quick-action__label">{action.label}</span>
                <small className="quick-action__desc">{action.desc}</small>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
