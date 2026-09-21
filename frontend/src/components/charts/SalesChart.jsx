import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCompactCurrency } from '../../utils/formatters.js';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function SalesChart({ data = [], todayTotal = 0, onNavigate }) {
  const [viewMode, setViewMode] = useState('daily');

  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    if (viewMode === 'monthly') {
      // Group by month (e.g., 2026-04, 2026-05)
      const monthlyMap = new Map();
      data.forEach((d) => {
        const month = d.fullDate ? d.fullDate.slice(0, 7) : d.period;
        const current = monthlyMap.get(month) || { period: month, sales: 0, target: 0 };
        current.sales += Number(d.sales || 0);
        current.target += Number(d.target || 0);
        monthlyMap.set(month, current);
      });
      return [...monthlyMap.values()];
    }
    if (viewMode === 'weekly') {
      // Group every 7 points
      const weekly = [];
      for (let i = 0; i < data.length; i += 7) {
        const chunk = data.slice(i, i + 7);
        const totalSales = chunk.reduce((sum, item) => sum + Number(item.sales || 0), 0);
        const totalTarget = chunk.reduce((sum, item) => sum + Number(item.target || 0), 0);
        weekly.push({
          period: `W${Math.floor(i / 7) + 1} (${chunk[0].period})`,
          sales: totalSales,
          target: totalTarget,
        });
      }
      return weekly.length ? weekly : data;
    }
    return data;
  }, [data, viewMode]);

  return (
    <article className="panel dashboard-panel chart-panel">
      <div className="panel__header">
        <h3>Sales Trend (Live Feed)</h3>
        <select
          className="dashboard-select-ctrl"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          aria-label="Select sales trend time aggregation"
        >
          <option value="daily">Daily Sales</option>
          <option value="weekly">Weekly Sales</option>
          <option value="monthly">Monthly Sales</option>
        </select>
      </div>
      <div className="sales-total">
        <strong><MoneyAmount value={todayTotal} /></strong>
        <span>Period Total</span>
      </div>
      <div className="chart-frame">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#1264d8" stopOpacity={0.26} />
                <stop offset="95%" stopColor="#1264d8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e3eaf4" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: '#62708a', fontSize: 12 }} />
            <YAxis tickFormatter={formatCompactCurrency} tickLine={false} axisLine={false} tick={{ fill: '#62708a', fontSize: 12 }} width={56} />
            <Tooltip
              formatter={(value) => [`PGK ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Sales']}
              labelStyle={{ color: '#16243d' }}
            />
            <Area type="monotone" dataKey="sales" stroke="#12b985" fill="url(#salesFill)" strokeWidth={3} dot={{ r: 4, fill: '#10aeb5' }} />
            <Line type="monotone" dataKey="sales" stroke="#11b887" dot={{ r: 4, fill: '#10aeb5', stroke: '#ffffff', strokeWidth: 2 }} strokeWidth={3} />
            <Line type="monotone" dataKey="target" stroke="#9eb1c7" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
