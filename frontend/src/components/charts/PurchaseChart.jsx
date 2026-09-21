import {
  Area,
  Bar,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatters.js';

export function PurchaseChart({ data }) {
  return (
    <article className="panel chart-panel">
      <div className="panel__header">
        <div>
          <p className="eyebrow">Purchase Performance</p>
          <h3>Procurement Flow</h3>
        </div>
        <span className="status-chip">Within controls</span>
      </div>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#e3eaf4" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#62708a', fontSize: 12 }} />
            <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} tick={{ fill: '#62708a', fontSize: 12 }} width={56} />
            <Tooltip formatter={(value) => [`K ${value.toLocaleString()}`, 'Purchase']} labelStyle={{ color: '#16243d' }} />
            <Bar dataKey="purchase" fill="#27a1a1" radius={[6, 6, 0, 0]} barSize={28} />
            <Area type="monotone" dataKey="forecast" stroke="#f2a23a" fill="#f2a23a22" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
