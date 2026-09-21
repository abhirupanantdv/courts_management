import { DataTable } from './DataTable.jsx';

export function LowStock({ rows }) {
  return (
    <DataTable
      title="Low Stock Items"
      eyebrow="Replenishment"
      rows={rows}
      columns={[
        { key: 'item', label: 'Item' },
        { key: 'warehouse', label: 'Warehouse' },
        { key: 'currentQty', label: 'Current' },
        { key: 'reorderLevel', label: 'Reorder' },
        { key: 'status', label: 'Status' },
      ]}
      renderCell={(row, key) => {
        if (key === 'status') return <span className={`status-chip ${row.status === 'Urgent' ? 'is-danger' : ''}`}>{row.status}</span>;
        return row[key];
      }}
    />
  );
}
