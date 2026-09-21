import { formatApproxCurrency, formatFullCurrency } from '../../utils/formatters.js';

/**
 * MoneyAmount
 * Renders currency in a compact approximate form (e.g. PGK 2.85M)
 * and displays the full exact amount (e.g. PGK 2,847,672.81) on hover with a sleek tooltip.
 */
export function MoneyAmount({
  value,
  currency = 'PGK',
  approx = true,
  className = '',
  style = {},
}) {
  const exact = formatFullCurrency(value, currency);
  const display = approx ? formatApproxCurrency(value, currency) : exact;

  return (
    <span
      className={`money-amount ${approx ? 'money-amount--approx' : ''} ${className}`}
      title={`Exact: ${exact}`}
      data-exact={exact}
      style={style}
    >
      {display}
    </span>
  );
}
