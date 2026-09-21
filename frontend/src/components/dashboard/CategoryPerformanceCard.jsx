import { Layers, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

const CATEGORY_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#d97706', // Amber
  '#e11d48', // Rose
  '#0891b2', // Cyan
];

export function CategoryPerformanceCard({ categories = [], onNavigate }) {
  const totalRevenue = categories.reduce((sum, c) => sum + Number(c.revenue || 0), 0);
  const totalUnits = categories.reduce((sum, c) => sum + Number(c.units || 0), 0);

  return (
    <article className="panel dashboard-panel category-performance-panel">
      <div className="panel__header">
        <div>
          <h3>
            <Layers size={18} style={{ color: '#2563eb' }} />
            Merchandise Category Revenue
          </h3>
          <small className="panel-subtitle">Top product group sales attribution across network</small>
        </div>
        <div className="panel-badge-pill">
          <Sparkles size={13} />
          <span>{categories.length} Categories</span>
        </div>
      </div>

      <div className="category-meta-summary">
        <div>
          <small>Total Category Sales</small>
          <strong><MoneyAmount value={totalRevenue} /></strong>
        </div>
        <div>
          <small>Total Volume Sold</small>
          <strong>{formatNumber(totalUnits)} Units</strong>
        </div>
      </div>

      <div className="category-bars-list">
        {categories.length > 0 ? (
          categories.map((cat, idx) => {
            const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
            const share = Number(cat.share || 0);

            return (
              <div className="category-bar-row" key={cat.name}>
                <div className="category-bar-info">
                  <div className="category-name-wrap">
                    <span className="category-color-dot" style={{ background: color }} />
                    <strong className="category-name" title={cat.name}>{cat.name}</strong>
                  </div>
                  <div className="category-val-wrap">
                    <strong><MoneyAmount value={cat.revenue} /></strong>
                    <small className="category-units">({formatNumber(cat.units)} sold &bull; {share}%)</small>
                  </div>
                </div>
                <div className="category-track">
                  <div 
                    className="category-fill" 
                    style={{ 
                      width: `${Math.max(4, share)}%`,
                      background: color,
                    }} 
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-row" style={{ padding: '24px', textAlign: 'center' }}>
            No category sales records found.
          </div>
        )}
      </div>

      <button
        type="button"
        className="link-button"
        onClick={() => onNavigate && onNavigate('sales')}
        title="View comprehensive sales attribution"
      >
        View full sales intelligence <ArrowRight size={15} />
      </button>
    </article>
  );
}
