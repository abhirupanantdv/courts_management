import { formatCurrency } from '../../utils/formatters.js';
import { DataTable } from './DataTable.jsx';

export function TopCustomers({ customers }) {
  return (
    <DataTable
      title="Top Customers"
      eyebrow="Revenue"
      rows={customers}
      columns={[
        { key: 'rank', label: 'Rank' },
        { key: 'customer', label: 'Customer' },
        { key: 'sales', label: 'Sales' },
        { key: 'invoiceCount', label: 'Invoices' },
      ]}
      renderCell={(row, key) => (key === 'sales' ? formatCurrency(row.sales) : row[key])}
    />
  );
}
