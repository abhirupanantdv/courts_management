import { InventoryChart } from '../charts/InventoryChart.jsx';
import { WarehouseCard } from './WarehouseCard.jsx';

export function WarehouseOverview({ warehouses, kpis }) {
  return (
    <section className="inventory-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Inventory Intelligence</p>
          <h2>Warehouse Distribution</h2>
        </div>
        <div className="summary-pair">
          <span>Total Inventory Qty <strong>{kpis.inventoryQty.display}</strong></span>
          <span>Total Inventory Value <strong>{kpis.inventoryValue.display}</strong></span>
        </div>
      </div>
      <div className="inventory-layout">
        <article className="panel inventory-visual">
          <InventoryChart warehouses={warehouses} />
          <div className="inventory-visual__center">
            <span>Inventory</span>
            <strong>{kpis.inventoryValue.display}</strong>
          </div>
        </article>
        <div className="warehouse-list">
          {warehouses.map((warehouse) => (
            <WarehouseCard key={warehouse.name} warehouse={warehouse} />
          ))}
        </div>
      </div>
    </section>
  );
}
