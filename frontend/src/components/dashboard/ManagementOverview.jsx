import { ArrowUpRight, CircleDot, Columns3, Hexagon, Lock, Square, Triangle } from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { hasDocTypePermission } from '../../utils/rolePermissions.js';

const icons = {
  blue: Square,
  green: ArrowUpRight,
  purple: Columns3,
  amber: Triangle,
  teal: Hexagon,
  pink: CircleDot,
};

export function ManagementOverview({ cards = [], data = {} }) {
  const permissions = data?.doctypePermissions || data?.permissions;

  return (
    <section className="management-overview" aria-label="Management overview">
      <div className="management-overview__header">
        <h2>Management Overview</h2>
        <p>Command Centre is connected to React.</p>
      </div>
      <div className="management-overview__grid">
        {cards.map((card) => {
          const Icon = icons[card.tone] ?? Square;
          const isPermitted = !card.doctype || hasDocTypePermission(permissions, card.doctype);

          return (
            <article
              className={`management-card ${isPermitted ? '' : 'is-restricted'}`}
              key={card.label}
            >
              <span className={`management-card__icon is-${card.tone}`}>
                <Icon size={24} />
              </span>
              <div>
                <p>{card.label.toUpperCase()}</p>
                <strong>
                  {card.isCurrency && card.rawValue !== undefined ? (
                    <MoneyAmount value={card.rawValue} />
                  ) : (
                    card.value
                  )}
                </strong>
                <small>{card.description}</small>
              </div>

              {!isPermitted && (
                <div
                  className="management-card-restricted-overlay"
                  title={`ERPNext ${card.doctype} read/select permission required`}
                >
                  <Lock size={14} />
                  <span>Restricted</span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
