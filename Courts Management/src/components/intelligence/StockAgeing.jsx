import { formatCurrency, formatNumber } from '../../utils/formatters.js';
import { DataTable } from './DataTable.jsx';

export function StockAgeing({ rows }) {
  return (
    <DataTable
      title="Stock Ageing"
      eyebrow="Risk"
      rows={rows}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'qty', label: 'Qty' },
        { key: 'value', label: 'Value' },
        { key: 'averageAge', label: 'Avg Age' },
      ]}
      renderCell={(row, key) => {
        if (key === 'value') return formatCurrency(row.value);
        if (key === 'qty') return formatNumber(row.qty);
        if (key === 'averageAge') return `${row.averageAge} days`;
        return row[key];
      }}
    />
  );
}
