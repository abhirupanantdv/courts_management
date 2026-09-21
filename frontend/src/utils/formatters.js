export function formatFullCurrency(value, currency = 'PGK') {
  const num = Number(value || 0);
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatApproxCurrency(value, currency = 'PGK') {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${currency} ${sign}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 100_000) {
    return `${currency} ${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  if (abs >= 10_000) {
    return `${currency} ${sign}${(abs / 1_000).toFixed(1)}K`;
  }
  if (abs >= 1_000) {
    return `${currency} ${sign}${(abs / 1_000).toFixed(2)}K`;
  }
  return formatFullCurrency(value, currency);
}

export function formatCurrency(value, approx = false, currency = 'PGK') {
  if (approx) {
    return formatApproxCurrency(value, currency);
  }
  return formatFullCurrency(value, currency);
}

export function formatCompactCurrency(value, currency = 'PGK') {
  return formatApproxCurrency(value, currency);
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

export function formatCompactNumber(value) {
  const num = Number(value || 0);
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return Number(value || 0).toLocaleString();
}

