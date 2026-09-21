import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/formatters.js';

const colors = ['#1264d8', '#27a1a1', '#f2a23a', '#7a8aa3'];

export function InventoryChart({ warehouses }) {
  return (
    <div className="inventory-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={warehouses} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3}>
            {warehouses.map((warehouse, index) => (
              <Cell key={warehouse.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatCurrency(value), 'Inventory value']} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
