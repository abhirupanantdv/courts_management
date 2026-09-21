import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function KPICard({ metric, icon: Icon, tone }) {
  const TrendIcon = metric.trend === 'down' ? ArrowDownRight : ArrowUpRight;

  return (
    <article className={`kpi-card kpi-card--${tone}`}>
      <div className="kpi-card__top">
        <span className="kpi-card__icon">
          <Icon size={21} />
        </span>
        <span className={`change-pill is-${metric.trend}`}>
          <TrendIcon size={15} />
          {metric.change}
        </span>
      </div>
      <p>{metric.label.toUpperCase()}</p>
      <strong>{metric.display}</strong>
      <span>{metric.description}</span>
    </article>
  );
}
