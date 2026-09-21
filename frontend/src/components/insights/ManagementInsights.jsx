import { AlertTriangle, Boxes, ChartNoAxesCombined, Warehouse } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters.js';

function buildInsights(data) {
  const totalValue = data.warehouses.reduce((sum, warehouse) => sum + warehouse.value, 0);
  const leadWarehouse = data.warehouses.reduce((best, warehouse) => (warehouse.value > best.value ? warehouse : best));
  const ageingRisk = data.stockAgeing.filter((row) => row.averageAge > 100);
  const urgentLowStock = data.lowStock.filter((row) => row.status === 'Urgent');
  const salesAboveTarget = data.salesTrend.reduce((sum, row) => sum + row.sales - row.target, 0);

  return [
    {
      title: 'Inventory concentration',
      text: `${leadWarehouse.name} holds ${Math.round((leadWarehouse.value / totalValue) * 100)}% of stock value at ${formatCurrency(leadWarehouse.value)}.`,
      icon: Warehouse,
      tone: 'blue',
    },
    {
      title: 'Stock ageing warning',
      text: `${ageingRisk.length} item groups are averaging more than 100 days in stock.`,
      icon: AlertTriangle,
      tone: 'amber',
    },
    {
      title: 'Low stock warning',
      text: `${urgentLowStock.length} urgent replenishment items are below reorder level.`,
      icon: Boxes,
      tone: 'red',
    },
    {
      title: 'Sales performance',
      text: `Sales are ${formatCurrency(Math.abs(salesAboveTarget))} ${salesAboveTarget >= 0 ? 'above' : 'below'} target for the selected period.`,
      icon: ChartNoAxesCombined,
      tone: 'green',
    },
  ];
}

export function ManagementInsights({ data }) {
  const insights = buildInsights(data);

  return (
    <section className="insights-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management Insights</p>
          <h2>Rule-Based Executive Signals</h2>
        </div>
        <span className="summary-note">{formatNumber(data.lowStock.length)} replenishment checks</span>
      </div>
      <div className="insights-grid">
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <article className={`insight-card insight-card--${insight.tone}`} key={insight.title}>
              <span>
                <Icon size={20} />
              </span>
              <div>
                <h3>{insight.title}</h3>
                <p>{insight.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
