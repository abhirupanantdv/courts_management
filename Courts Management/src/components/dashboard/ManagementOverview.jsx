import { ArrowUpRight, CircleDot, Columns3, Hexagon, Square, Triangle } from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

const icons = {
  blue: Square,
  green: ArrowUpRight,
  purple: Columns3,
  amber: Triangle,
  teal: Hexagon,
  pink: CircleDot,
};

export function ManagementOverview({ cards }) {
  return (
    <section className="management-overview" aria-label="Management overview">
      <div className="management-overview__header">
        <h2>Management Overview</h2>
        <p>Command Centre is connected to React.</p>
      </div>
      <div className="management-overview__grid">
        {cards.map((card) => {
          const Icon = icons[card.tone] ?? Square;
          return (
            <article className="management-card" key={card.label}>
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
