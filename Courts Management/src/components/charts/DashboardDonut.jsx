const colors = ['#2d91f2', '#8b99bd', '#ff9c2f', '#29c7a1', '#63a6f7', '#7650de'];

export function DashboardDonut({
  title,
  data = [],
  total,
  subtitle,
  warehouses = [],
  selectedWarehouse = 'all',
  onWarehouseChange,
  control,
  bare = false,
}) {
  const Tag = bare ? 'div' : 'article';
  let cursor = 0;
  const chartData = data.length ? data : [{ name: 'No data', value: 100, qty: 0 }];
  const stops = chartData.map((item, index) => {
    const start = cursor;
    cursor += item.value;
    return `${data.length ? colors[index % colors.length] : '#e8f1fb'} ${start}% ${cursor}%`;
  }).join(', ');

  return (
    <Tag className={bare ? 'dashboard-donut' : 'panel dashboard-panel'}>
      <div className="panel__header">
        <h3>{title}</h3>
        {warehouses.length > 0 ? (
          <select
            className="dashboard-select-ctrl"
            value={selectedWarehouse}
            onChange={(e) => onWarehouseChange && onWarehouseChange(e.target.value)}
            aria-label="Filter warehouse distribution"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((wh) => {
              const name = typeof wh === 'string' ? wh : (wh.warehouse_name || wh.name);
              const val = typeof wh === 'string' ? wh : wh.name;
              return <option key={val} value={val}>{name}</option>;
            })}
          </select>
        ) : control ? (
          <span className="control-tag">{control}</span>
        ) : null}
      </div>
      <div className="donut-layout">
        <div className="donut-chart">
          <div className="donut-ring" style={{ background: `conic-gradient(${stops})` }} />
          <div className="donut-center">
            <strong>{total}</strong>
            <span>{subtitle}</span>
          </div>
        </div>
        <ul className="legend-list">
          {data.length ? data.map((item, index) => (
            <li key={item.name}>
              <i style={{ backgroundColor: colors[index % colors.length] }} />
              <span>{item.name}</span>
              <strong>{item.value}%</strong>
            </li>
          )) : <li><i style={{ backgroundColor: '#e8f1fb' }} /><span>No data</span><strong>0%</strong></li>}
        </ul>
      </div>
    </Tag>
  );
}
