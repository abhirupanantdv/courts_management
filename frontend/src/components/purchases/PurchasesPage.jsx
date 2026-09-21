import { useState, useMemo } from 'react';
import { 
  ArrowDown,
  Building2, 
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
  Truck, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { MoneyAmount } from '../common/MoneyAmount.jsx';
import { formatNumber } from '../../utils/formatters.js';

export function PurchasesPage({ data, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const rawPurchases = data?.purchaseInvoices || [];
  const topSuppliers = data?.topSuppliers || [];

  // Map ERPNext purchase invoices purely from live data
  const invoices = useMemo(() => {
    return rawPurchases.map((inv) => ({
      id: inv.name,
      supplier: inv.supplier || 'Vendor Account',
      date: inv.posting_date || '2026-04-28',
      company: inv.company || 'Courts',
      amount: Number(inv.grand_total || 0),
      status: inv.status || 'Paid',
    }));
  }, [rawPurchases]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || inv.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalFilteredPurchases = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [filteredInvoices]);

  const totalSpend = data?.kpis?.totalPurchase?.value || totalFilteredPurchases;
  const unpaidCount = invoices.filter((inv) => inv.status === 'Unpaid' || inv.status === 'Overdue').length;

  // CSV Export
  const handleExportCsv = () => {
    const headers = ['Purchase Invoice ID', 'Date', 'Supplier', 'Status', 'Grand Total (PGK)'];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      inv.date,
      `"${inv.supplier.replace(/"/g, '""')}"`,
      inv.status,
      inv.amount.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `courts-purchase-invoices.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="module-page">
      {/* Header */}
      <div className="module-page__header">
        <div>
          <div className="module-badge is-amber">
            <Truck size={15} />
            <span>Procurement & Accounts Payable &bull; Live Supply Chain Feed</span>
          </div>
          <h1>Procurement & Supplier Invoices</h1>
          <p>Tracking supplier payables, trade replenishment, and wholesale purchase accounts.</p>
        </div>
        <div className="module-page__actions">
          <button 
            className="action-btn action-btn--secondary"
            onClick={() => onNavigate && onNavigate('reports', { reportId: 'purchase-register' })}
            title="Open In-App Purchase Register"
          >
            <CalendarDays size={16} />
            <span>Purchase Register Report</span>
          </button>
          <button 
            className="action-btn action-btn--primary"
            onClick={handleExportCsv}
            title="Export purchase invoices to CSV"
          >
            <FileSpreadsheet size={16} />
            <span>Export Purchases CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="module-kpis-grid">
        <div className="module-kpi-card">
          <span className="kpi-icon is-amber"><Receipt size={22} /></span>
          <div>
            <p>Total Procurement Spend</p>
            <strong><MoneyAmount value={totalSpend} /></strong>
            <small>Live billed total</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-blue"><CreditCard size={22} /></span>
          <div>
            <p>Total Invoices</p>
            <strong>{formatNumber(rawPurchases.length)}</strong>
            <small>Supplier bills logged</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-teal"><Building2 size={22} /></span>
          <div>
            <p>Active Approved Vendors</p>
            <strong>{topSuppliers.length || (data?.suppliers || []).length}</strong>
            <small>Vendors on file</small>
          </div>
        </div>

        <div className="module-kpi-card">
          <span className="kpi-icon is-purple"><Clock size={22} /></span>
          <div>
            <p>Outstanding Payables</p>
            <strong style={{ color: unpaidCount > 0 ? '#d97706' : '#15803d' }}>
              {unpaidCount} Bills
            </strong>
            <small>Awaiting remittance</small>
          </div>
        </div>
      </div>

      {/* Operations Toolbar */}
      <div className="module-toolbar">
        <div className="search-box">
          <Search size={17} />
          <input 
            type="text" 
            placeholder="Search invoice number, supplier company, or terms..." 
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

      {/* Content Grid */}
      <div className="module-content-grid">
        <div className="module-table-card">
          <div className="card-header">
            <h3>Supplier Invoices ({filteredInvoices.length})</h3>
            <span className="header-subtitle">Click invoice for full breakdown</span>
          </div>

          <div className="table-responsive">
            <table className="module-data-table">
              <thead>
                <tr>
                  <th>Purchase Invoice</th>
                  <th>Posting Date</th>
                  <th>Supplier Account</th>
                  <th>Operating Entity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total Amount</th>
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
                      <strong>{inv.supplier}</strong>
                    </td>
                    <td>{inv.company}</td>
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
                    <td colSpan="6" className="empty-row">No purchase invoices found matching your criteria.</td>
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

        {/* Top Suppliers */}
        <div className="module-sidebar-card">
          <div className="card-header">
            <h3>Top Suppliers by Spend</h3>
          </div>
          <div className="top-entities-list">
            {topSuppliers.length ? topSuppliers.map((supp) => (
              <div className="top-entity-item" key={supp.supplier}>
                <span className="entity-rank">#{supp.rank}</span>
                <div className="entity-info">
                  <strong>{supp.supplier}</strong>
                  <small>{supp.invoiceCount} invoices settled</small>
                </div>
                <div className="entity-value">
                  <strong><MoneyAmount value={supp.purchase} /></strong>
                </div>
              </div>
            )) : (
              <div className="empty-row" style={{ padding: '16px' }}>No supplier rankings available.</div>
            )}
          </div>
        </div>
      </div>

      {/* In-App Purchase Invoice Modal */}
      {selectedInvoiceModal && (
        <div className="erp-modal-overlay" onClick={() => setSelectedInvoiceModal(null)}>
          <div className="erp-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="erp-modal-header">
              <div>
                <span className={`status-badge is-${selectedInvoiceModal.status.toLowerCase()}`}>
                  {selectedInvoiceModal.status}
                </span>
                <h3>Purchase Invoice Details</h3>
                <code>{selectedInvoiceModal.id}</code>
              </div>
              <button className="erp-modal-close" onClick={() => setSelectedInvoiceModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="erp-modal-grid">
              <div className="modal-metric">
                <small>Supplier Vendor</small>
                <strong>{selectedInvoiceModal.supplier}</strong>
              </div>
              <div className="modal-metric">
                <small>Net Payable</small>
                <strong style={{ color: '#dc2626' }}>
                  <MoneyAmount value={selectedInvoiceModal.amount} />
                </strong>
              </div>
              <div className="modal-metric">
                <small>Posting Date</small>
                <strong>{selectedInvoiceModal.date}</strong>
              </div>
              <div className="modal-metric">
                <small>Company Entity</small>
                <strong>{selectedInvoiceModal.company}</strong>
              </div>
            </div>

            <div className="erp-modal-footer">
              <button
                className="action-btn action-btn--secondary"
                onClick={() => {
                  setSelectedInvoiceModal(null);
                  onNavigate && onNavigate('reports', { reportId: 'purchase-register' });
                }}
              >
                View in Purchase Register Report
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
