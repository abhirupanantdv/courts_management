import { useState, useMemo } from 'react';
import { Boxes, ChevronLeft } from 'lucide-react';
import { DashboardDonut } from '../charts/DashboardDonut.jsx';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function WarehouseAnalysis({ data, onNavigate }) {
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');

  const warehousesList = data.warehousesList || [];
  const bins = data.bins || [];
  const items = data.items || [];

  // Dynamically compute item group distribution for selected warehouse
  const filteredData = useMemo(() => {
    if (selectedWarehouse === 'all') {
      const total = data.warehouseAnalysis.reduce((t, item) => t + Number(item.qty || 0), 0);
      return {
        distribution: data.warehouseAnalysis,
        total,
      };
    }

    const filteredBins = bins.filter((bin) => bin.warehouse === selectedWarehouse);
    const itemGroupByCode = new Map(items.map((item) => [item.name, item.item_group || 'Other']));
    const grouped = new Map();
    filteredBins.forEach((bin) => {
      const group = itemGroupByCode.get(bin.item_code) || 'Other';
      grouped.set(group, (grouped.get(group) || 0) + Number(bin.actual_qty || 0));
    });

    const totalQty = [...grouped.values()].reduce((sum, qty) => sum + qty, 0) || 1;
    const distribution = [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({
        name,
        qty,
        value: Math.round((qty / totalQty) * 100),
      }));

    return {
      distribution,
      total: totalQty,
    };
  }, [selectedWarehouse, data.warehouseAnalysis, bins, items]);

  const topWarehouses = data.warehouses.slice(0, 3);
  const currentWarehouseObj = warehousesList.find((w) => w.name === selectedWarehouse);

  return (
    <article className="panel dashboard-panel warehouse-analysis">
      <div className="panel__header">
        <h3><ChevronLeft size={18} /> Warehouse Analysis</h3>
        <select
          className="dashboard-select-ctrl"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          aria-label="Select warehouse for analysis"
        >
          <option value="all">All Warehouses</option>
          {warehousesList.map((wh) => (
            <option key={wh.name} value={wh.name}>
              {wh.warehouse_name || wh.name}
            </option>
          ))}
        </select>
      </div>

      <DashboardDonut
        title="Item Quantity by Item Group"
        data={filteredData.distribution}
        total={Math.round(filteredData.total).toLocaleString()}
        subtitle="Items"
        bare
      />

      <div className="warehouse-mini-grid">
        {selectedWarehouse === 'all' ? (
          topWarehouses.length ? (
            topWarehouses.map((warehouse) => (
              <span key={warehouse.name} onClick={() => onNavigate && onNavigate('inventory')} style={{ cursor: 'pointer' }}>
                <Boxes size={22} />
                <small>{warehouse.name.split(' - ')[0]}</small>
                <strong>{Math.round(warehouse.qty).toLocaleString()}</strong>
                Items
              </span>
            ))
          ) : (
            <span>
              <Boxes size={22} />
              <small>No warehouse quantity</small>
              <strong>0</strong>
              Items
            </span>
          )
        ) : (
          <>
            <span>
              <Boxes size={22} />
              <small>Units in Stock</small>
              <strong>{Math.round(filteredData.total).toLocaleString()}</strong>
              Items
            </span>
            <span>
              <Boxes size={22} />
              <small>Active Bins</small>
              <strong>{bins.filter((b) => b.warehouse === selectedWarehouse).length}</strong>
              Item Types
            </span>
            <span>
              <Boxes size={22} />
              <small>Stock Valuation</small>
              <strong>
                <MoneyAmount
                  value={bins
                    .filter((b) => b.warehouse === selectedWarehouse)
                    .reduce((t, b) => t + Number(b.stock_value || 0), 0)}
                />
              </strong>
              Value
            </span>
          </>
        )}
      </div>
    </article>
  );
}
