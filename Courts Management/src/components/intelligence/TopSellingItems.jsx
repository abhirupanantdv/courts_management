import { formatCurrency, formatNumber } from '../../utils/formatters.js';
import { DataTable } from './DataTable.jsx';

export function TopSellingItems({ items }) {
  return (
    <DataTable
      title="Top Selling Items"
      eyebrow="Product Movement"
      rows={items}
      columns={[
        { key: 'rank', label: 'Rank' },
        { key: 'item', label: 'Item' },
        { key: 'qty', label: 'Qty' },
        { key: 'sales', label: 'Sales' },
      ]}
      renderCell={(row, key) => {
        if (key === 'sales') return formatCurrency(row.sales);
        if (key === 'qty') return formatNumber(row.qty);
        return row[key];
      }}
    />
  );
}
