import { Boxes, HandCoins, PackageCheck, ShoppingCart } from 'lucide-react';
import { KPICard } from './KPICard.jsx';

const kpiConfig = [
  ['totalSales', ShoppingCart, 'sales'],
  ['totalPurchase', HandCoins, 'purchase'],
  ['inventoryQty', PackageCheck, 'inventory'],
  ['inventoryValue', Boxes, 'value'],
];

export function KPISection({ kpis }) {
  return (
    <section className="kpi-grid" aria-label="Key performance indicators">
      {kpiConfig.map(([key, icon, tone]) => (
        <KPICard key={key} metric={kpis[key]} icon={icon} tone={tone} />
      ))}
    </section>
  );
}
