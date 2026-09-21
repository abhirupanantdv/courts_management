import { useState, useMemo } from 'react';
import { 
  ArrowDown,
  ArrowDownRight, 
  ArrowUpRight, 
  Building2, 
  CalendarDays, 
  CheckCircle,
  Coins, 
  CreditCard, 
  DollarSign, 
  Download,
  FileSpreadsheet,
  FileText, 
  PieChart, 
  Scale, 
  TrendingUp 
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';

export function FinancePage({ data, onNavigate }) {
  const [period, setPeriod] = useState('All');
  const [visibleCount, setVisibleCount] = useState(20);

  const totalSales = Number(data?.kpis?.totalSales?.value ?? data?.heroMetrics?.salesToday ?? 0);
  const totalPurchases = Number(data?.kpis?.totalPurchase?.value || 0);
  const inventoryValue = Number(data?.kpis?.inventoryValue?.value || 0);
  const netMargin = totalSales - totalPurchases;
  const marginPercent = totalSales > 0 ? ((netMargin / totalSales) * 100).toFixed(1) : '0.0';

  const rawGlEntries = data?.glEntries || [];

  // Map real GL Entries from ERPNext
  const ledgerEntries = useMemo(() => {
    return rawGlEntries.map((row) => ({
      id: row.name,
      account: row.account || 'Accounts',
      party: row.party || '—',
      voucher: row.voucher_no || row.voucher_type || 'Ledger Entry',
      debit: Number(row.debit || 0),
      credit: Number(row.credit || 0),
      date: row.posting_date || '2026-04-28',
    }));
  }, [rawGlEntries]);

  // CSV Export for Ledger
  const handleExportCsv = () => {
    const headers = ['Posting Date', 'Account', 'Party', 'Voucher', 'Debit (PGK)', 'Credit (PGK)'];
    const rows = ledgerEntries.map((row) => [
      row.date,
      `"${row.account.replace(/"/g, '""')}"`,
      `"${row.party.replace(/"/g, '""')}"`,
      `"${row.voucher}"`,
      row.debit.toFixed(2),
      row.credit.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'courts-general-ledger.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="module-page">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-green">
            <Coins size={15} />
            <span>Finance & General Ledger &bull; Live Accounting Stream</span>
          </div>
          <h1>Financial Performance & General Ledger</h1>
          <p>Commercial profit & loss, accounts receivable/payable balances, cash liquidity, and ledger transactions.</p>
        </div>
        <div className="module-page__actions">
          <button 
            className="action-btn action-btn--secondary"
            onClick={() => onNavigate && onNavigate('reports', { reportId: 'profit-and-loss' })}
            title="Open In-App Profit & Loss Statement"
          >
            <PieChart size={16} />
            <span>Profit & Loss Statement</span>
          </button>
          <button 
            className="action-btn action-btn--primary"
            onClick={handleExportCsv}
            title="Export general ledger to CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Export GL CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="module-kpis-grid">
        <div className="module-kpi-card">
          <span className="kpi-icon is-green"><TrendingUp size={22} /></span>
          <div>
            <p>Gross Operating Revenue</p>
            <strong><MoneyAmount value={totalSales} /></strong>
            <small>Total customer sales billing</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-amber"><DollarSign size={22} /></span>
          <div>
            <p>Procurement Cost (COGS)</p>
            <strong><MoneyAmount value={totalPurchases} /></strong>
            <small>Direct inventory purchases</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-blue"><Scale size={22} /></span>
          <div>
            <p>Operating Surplus / Margin</p>
            <strong style={{ color: netMargin >= 0 ? '#15803d' : '#dc2626' }}>
              <MoneyAmount value={netMargin} /> ({marginPercent}%)
            </strong>
            <small>Gross commercial surplus</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-teal"><Building2 size={22} /></span>
          <div>
            <p>Inventory Balance Asset</p>
            <strong><MoneyAmount value={inventoryValue} /></strong>
            <small>Total warehouse stock assets</small>
          </div>
        </div>
      </div>

      {/* Working Capital & Operating Horizons Banner */}
      <div className="finance-horizons-card">
        <div className="card-header">
          <div>
            <h3>Working Capital & Operating Horizons</h3>
            <span className="header-subtitle">Liquidity allocation based on active ERPNext ledgers</span>
          </div>
          <span className={`horizon-status-pill ${netMargin >= 0 ? 'is-positive' : 'is-negative'}`}>
            {netMargin >= 0 ? <TrendingUp size={14} /> : <ArrowDownRight size={14} />}
            <span>{netMargin >= 0 ? `Operating Surplus: +${marginPercent}%` : `Procurement Deficit: ${marginPercent}%`}</span>
          </span>
        </div>

        <div className="horizon-metrics-row">
          {/* 1. Gross Revenue Billed */}
          <div className="horizon-metric">
            <div className="horizon-metric-top">
              <div className="horizon-metric-title-wrap">
                <span className="horizon-metric-icon is-green">
                  <TrendingUp size={18} />
                </span>
                <span className="horizon-label">Gross Revenue Billed</span>
              </div>
              <span className="horizon-badge is-green">100% Baseline</span>
            </div>

            <div className="horizon-value-wrap">
              <strong><MoneyAmount value={totalSales} /></strong>
            </div>

            <div className="horizon-bar-wrap">
              <div className="horizon-bar is-green" style={{ width: '100%' }} />
            </div>
            <p className="horizon-desc">Total recognized revenue from verified billed customer invoices</p>
          </div>

          {/* 2. Payables & Procurement Commitments */}
          <div className="horizon-metric">
            <div className="horizon-metric-top">
              <div className="horizon-metric-title-wrap">
                <span className="horizon-metric-icon is-amber">
                  <CreditCard size={18} />
                </span>
                <span className="horizon-label">Payables & Commitments</span>
              </div>
              <span className="horizon-badge is-amber">
                {totalSales > 0 ? `${Math.round((totalPurchases / totalSales) * 100)}% of Rev` : 'Procurement'}
              </span>
            </div>

            <div className="horizon-value-wrap">
              <strong><MoneyAmount value={totalPurchases} /></strong>
            </div>

            <div className="horizon-bar-wrap">
              <div 
                className="horizon-bar is-amber" 
                style={{ width: totalSales > 0 ? `${Math.min(100, Math.round((totalPurchases / totalSales) * 100))}%` : '0%' }} 
              />
            </div>
            <p className="horizon-desc">Billed supplier obligations and inventory procurement spend</p>
          </div>

          {/* 3. Operating Surplus Realization */}
          <div className="horizon-metric">
            <div className="horizon-metric-top">
              <div className="horizon-metric-title-wrap">
                <span className={`horizon-metric-icon ${netMargin >= 0 ? 'is-teal' : 'is-red'}`}>
                  <Scale size={18} />
                </span>
                <span className="horizon-label">Operating Surplus</span>
              </div>
              <span className={`horizon-badge ${netMargin >= 0 ? 'is-teal' : 'is-red'}`}>
                {netMargin >= 0 ? `+${marginPercent}% Margin` : `${marginPercent}% Deficit`}
              </span>
            </div>

            <div className="horizon-value-wrap">
              <strong className={netMargin < 0 ? 'is-negative' : ''}>
                <MoneyAmount value={netMargin} />
              </strong>
            </div>

            <div className="horizon-bar-wrap">
              <div 
                className={`horizon-bar ${netMargin >= 0 ? 'is-teal' : 'is-red'}`} 
                style={{ width: totalSales > 0 ? `${Math.min(100, Math.max(4, Math.round((Math.abs(netMargin) / totalSales) * 100)))}%` : '0%' }} 
              />
            </div>
            <p className="horizon-desc">
              {netMargin >= 0 
                ? 'Net commercial operational surplus retained after vendor expenses' 
                : 'Net operational cash deficit requiring working capital replenishment'}
            </p>
          </div>
        </div>
      </div>

      {/* General Ledger Table */}
      <div className="module-table-card">
        <div className="card-header">
          <h3>General Ledger Stream ({ledgerEntries.length} Postings)</h3>
          <button 
            className="text-btn"
            onClick={() => onNavigate && onNavigate('reports', { reportId: 'general-ledger' })}
          >
            Open in Full Reports Suite
          </button>
        </div>

        <div className="table-responsive">
          <table className="module-data-table">
            <thead>
              <tr>
                <th>Posting Date</th>
                <th>GL Account Code</th>
                <th>Party / Subsidiary</th>
                <th>Voucher Reference</th>
                <th style={{ textAlign: 'right' }}>Debit (PGK)</th>
                <th style={{ textAlign: 'right' }}>Credit (PGK)</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.length ? ledgerEntries.slice(0, visibleCount).map((row) => (
                <tr key={row.id}>
                  <td>{row.date}</td>
                  <td>
                    <code>{row.account}</code>
                  </td>
                  <td>{row.party}</td>
                  <td>
                    <span className="category-chip">{row.voucher}</span>
                  </td>
                  <td style={{ textAlign: 'right' }} className="money-cell">
                    {row.debit > 0 ? <MoneyAmount value={row.debit} /> : '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: row.credit > 0 ? '#15803d' : 'inherit' }} className="money-cell">
                    {row.credit > 0 ? <MoneyAmount value={row.credit} /> : '—'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-row">No general ledger postings returned from live system.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {ledgerEntries.length > 0 && (
          <div className="report-pagination-bar">
            <span className="pagination-count-label">
              Showing <strong>{Math.min(visibleCount, ledgerEntries.length)}</strong> of <strong>{ledgerEntries.length}</strong> postings
            </span>
            {visibleCount < ledgerEntries.length ? (
              <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                <ArrowDown size={15} />
                <span>Load More (+20 Postings)</span>
              </button>
            ) : (
              <span className="all-loaded-tag">
                <CheckCircle size={14} /> All {ledgerEntries.length} postings loaded
              </span>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
