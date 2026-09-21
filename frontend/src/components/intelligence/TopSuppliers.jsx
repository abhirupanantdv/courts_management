import { formatCurrency } from '../../utils/formatters.js';
import { DataTable } from './DataTable.jsx';

export function TopSuppliers({ suppliers }) {
  return (
    <DataTable
      title="Top Suppliers"
      eyebrow="Procurement"
      rows={suppliers}
      columns={[
        { key: 'rank', label: 'Rank' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'purchase', label: 'Purchase' },
        { key: 'invoiceCount', label: 'Invoices' },
      ]}
      renderCell={(row, key) => (key === 'purchase' ? formatCurrency(row.purchase) : row[key])}
    />
  );
}
