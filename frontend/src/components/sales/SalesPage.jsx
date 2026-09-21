import { useState, useMemo } from 'react';
import { 
  ArrowDown,
  ArrowUpRight, 
  CalendarDays, 
  CheckCircle, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Download,
  Filter, 
  Plus, 
  Receipt, 
  Search, 
  TrendingUp, 
  Users, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';
import { SalesPerformanceLeaderboard } from './SalesPerformanceLeaderboard.jsx';

export function SalesPage({ data, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const rawInvoices = data?.salesInvoices || [];
  const stores = data?.warehousesList || [];
  const topCustomers = data?.topCustomers || [];

  // Map ERPNext sales invoices purely from live data
  const invoices = useMemo(() => {
    return rawInvoices.map((inv) => ({
      id: inv.name,
      customer: inv.customer || 'Retail Cash Customer',
      date: inv.posting_date || '2026-04-28',
      dueDate: inv.due_date || inv.posting_date,
      store: inv.company || 'Courts',
      amount: Number(inv.grand_total || 0),
      status: inv.status || 'Paid',
    }));
  }, [rawInvoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalFilteredSales = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [filteredInvoices]);

  const todaySales = data?.heroMetrics?.salesToday || totalFilteredSales;
  const avgTicket = filteredInvoices.length ? totalFilteredSales / filteredInvoices.length : 0;

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Invoice ID', 'Date', 'Customer', 'Status', 'Grand Total (PGK)'];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      inv.date,
      `"${inv.customer.replace(/"/g, '""')}"`,
      inv.status,
      inv.amount.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courts-sales-invoices.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="module-page">
      {/* Page Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-green">
            <Receipt size={15} />
            <span>Sales & Commercial Intelligence &bull; Verified Invoices</span>
          </div>
          <h1>Sales Invoices & Revenue Management</h1>
          <p>Real-time monitoring of store checkout counters, retail tickets, and payment settlements.</p>
        </div>
        <div className="module-page__actions">
          <button 
            className="action-btn action-btn--secondary"
            onClick={() => onNavigate && onNavigate('reports', { reportId: 'sales-register' })}
            title="Open in-app Sales Register"
          >
            <CalendarDays size={16} />
            <span>Sales Register Report</span>
          </button>
          <button 
            className="action-btn action-btn--primary"
            onClick={handleExportCsv}
            title="Export invoices to CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Export Sales CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="module-kpis-grid">
        <div className="module-kpi-card">
          <span className="kpi-icon is-green"><TrendingUp size={22} /></span>
          <div>
            <p>Total Sales Revenue</p>
            <strong><MoneyAmount value={todaySales} /></strong>
            <small>Live database synchronized</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-blue"><CreditCard size={22} /></span>
          <div>
            <p>Total Invoices</p>
            <strong>{formatNumber(rawInvoices.length)}</strong>
            <small>Invoiced transactions</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-purple"><DollarSign size={22} /></span>
          <div>
            <p>Average Ticket Size</p>
            <strong><MoneyAmount value={avgTicket} /></strong>
            <small>Mean basket value</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-amber"><Users size={22} /></span>
          <div>
            <p>Active Customer Accounts</p>
            <strong>{data?.heroMetrics?.customersToday || topCustomers.length}</strong>
            <small>Accounts on file</small>
          </div>
        </div>
      </div>

      {/* Modern Animation-Based Sales Performance Leaderboard */}
      <SalesPerformanceLeaderboard data={data} onNavigate={onNavigate} />

      {/* Operations Toolbar */}
      <div className="module-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input 
            type="text" 
            placeholder="Search invoice number, client account, or company..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(20);
            }}
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter size={15} />
            <span>Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setVisibleCount(20);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Draft">Draft</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Table + Top Customers Sidebar */}
      <div className="module-content-grid">
        <div className="module-table-card">
          <div className="card-header">
            <h3>Sales Invoices ({filteredInvoices.length})</h3>
            <span className="header-subtitle">Click invoice for full breakdown</span>
          </div>

          <div className="table-responsive">
            <table className="module-data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Posting Date</th>
                  <th>Customer Account</th>
                  <th>Operating Entity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length ? filteredInvoices.slice(0, visibleCount).map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoiceModal(inv)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view invoice details"
                  >
                    <td>
                      <code className="record-code">{inv.id}</code>
                    </td>
                    <td>{inv.date}</td>
                    <td>
                      <strong>{inv.customer}</strong>
                    </td>
                    <td>{inv.store}</td>
                    <td>
                      <span className={`status-badge is-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="money-cell">
                      <MoneyAmount value={inv.amount} />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="empty-row">No sales invoices found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length > 0 && (
            <div className="report-pagination-bar">
              <span className="pagination-count-label">
                Showing <strong>{Math.min(visibleCount, filteredInvoices.length)}</strong> of <strong>{filteredInvoices.length}</strong> invoices
              </span>
              {visibleCount < filteredInvoices.length ? (
                <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + 20)}>
                  <ArrowDown size={15} />
                  <span>Load More (+20 Invoices)</span>
                </button>
              ) : (
                <span className="all-loaded-tag">
                  <CheckCircle size={14} /> All {filteredInvoices.length} invoices loaded
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top Performing Customers */}
        <div className="module-sidebar-card">
          <div className="card-header">
            <h3>Top Accounts by Volume</h3>
          </div>
          <div className="top-entities-list">
            {topCustomers.length ? topCustomers.map((cust) => (
              <div className="top-entity-item" key={cust.customer}>
                <span className="entity-rank">#{cust.rank}</span>
                <div className="entity-info">
                  <strong>{cust.customer}</strong>
                  <small>{cust.invoiceCount} invoices settled</small>
                </div>
                <div className="entity-value">
                  <strong><MoneyAmount value={cust.sales} /></strong>
                </div>
              </div>
            )) : (
              <div className="empty-row" style={{ padding: '16px' }}>No customer rankings available.</div>
            )}
          </div>
        </div>
      </div>

      {/* In-App Sales Invoice Detail Modal */}
      {selectedInvoiceModal && (
        <div className="erp-modal-overlay" onClick={() => setSelectedInvoiceModal(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <div>
                <span className={`status-badge is-${selectedInvoiceModal.status.toLowerCase()}`}>
                  {selectedInvoiceModal.status}
                </span>
                <h3>Sales Invoice Details</h3>
                <code>{selectedInvoiceModal.id}</code>
              </div>
              <button className="erp-modal-close" onClick={() => setSelectedInvoiceModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-grid">
              <div className="modal-metric">
                <small>Customer Account</small>
                <strong>{selectedInvoiceModal.customer}</strong>
              </div>
              <div className="modal-metric">
                <small>Grand Total</small>
                <strong style={{ color: '#15803d' }}>
                  <MoneyAmount value={selectedInvoiceModal.amount} />
                </strong>
              </div>
              <div className="modal-metric">
                <small>Posting Date</small>
                <strong>{selectedInvoiceModal.date}</strong>
              </div>
              <div className="modal-metric">
                <small>Operating Entity</small>
                <strong>{selectedInvoiceModal.store}</strong>
              </div>
            </div>

            <div className="erp-modal-footer">
              <button
                className="action-btn action-btn--secondary"
                onClick={() => {
                  setSelectedInvoiceModal(null);
                  onNavigate && onNavigate('reports', { reportId: 'sales-register' });
                }}
              >
                View in Sales Register Report
              </button>
              <button className="action-btn action-btn--primary" onClick={() => setSelectedInvoiceModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
