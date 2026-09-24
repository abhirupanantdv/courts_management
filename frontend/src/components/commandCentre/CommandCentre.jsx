import { useState, useMemo } from 'react';
import { Hero } from './Hero.jsx';
import { SalesChart } from '../charts/SalesChart.jsx';
import { CategoryPerformanceCard } from '../dashboard/CategoryPerformanceCard.jsx';
import { OverviewCards } from '../dashboard/OverviewCards.jsx';
import { ManagementOverview } from '../dashboard/ManagementOverview.jsx';
import { QuickActions } from '../dashboard/QuickActions.jsx';
import { StorePerformance } from '../dashboard/StorePerformance.jsx';
import { StoreDetails } from '../dashboard/StoreDetails.jsx';
import { ItemSalesRegisterByWarehouse } from '../dashboard/ItemSalesRegisterByWarehouse.jsx';
import { AppFooter } from '../layout/AppFooter.jsx';
import { SalesInventoryPage } from '../salesInventory/SalesInventoryPage.jsx';
import { SalesPage } from '../sales/SalesPage.jsx';
import { InventoryPage } from '../inventory/InventoryPage.jsx';
import { PurchasesPage } from '../purchases/PurchasesPage.jsx';
import { FinancePage } from '../finance/FinancePage.jsx';
import { ReportsPage } from '../reports/ReportsPage.jsx';
import { SalesPerformanceLeaderboard } from '../sales/SalesPerformanceLeaderboard.jsx';
import { canAccessModule } from '../../utils/rolePermissions.js';
import { PermissionGate } from '../common/PermissionGate.jsx';

export function CommandCentre({
  data,
  isRefreshing,
  onRefresh,
  activePage,
  activeReportId,
  onNavigate,
}) {
  const [donutWarehouse, setDonutWarehouse] = useState('all');

  const warehousesList = data.warehousesList || [];
  const bins = data.bins || [];
  const items = data.items || [];

  // Filter donut data dynamically by selected non-group warehouse
  const donutFiltered = useMemo(() => {
    if (donutWarehouse === 'all') {
      const total = data.itemDistribution.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      return {
        data: data.itemDistribution,
        total: Math.round(total).toLocaleString(),
      };
    }

    const filteredBins = bins.filter((b) => b.warehouse === donutWarehouse);
    const itemGroupByCode = new Map(items.map((i) => [i.name, i.item_group || 'Other']));
    const grouped = new Map();
    filteredBins.forEach((bin) => {
      const group = itemGroupByCode.get(bin.item_code) || 'Other';
      grouped.set(group, (grouped.get(group) || 0) + Number(bin.actual_qty || 0));
    });

    const totalQty = [...grouped.values()].reduce((sum, qty) => sum + qty, 0) || 1;
    const distribution = [...grouped.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, qty]) => ({
        name,
        qty,
        value: Math.round((qty / totalQty) * 100),
      }));

    return {
      data: distribution,
      total: Math.round(totalQty).toLocaleString(),
    };
  }, [donutWarehouse, data.itemDistribution, bins, items]);

  const [selectedStore, setSelectedStore] = useState(data.storePerformance?.[0]?.store || '');

  const handleSelectStore = (storeName) => {
    setSelectedStore(storeName);
    const el = document.getElementById('store-drilldown-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const permissions = data?.doctypePermissions || data?.permissions;
  const hasSalesAccess = canAccessModule(permissions, 'sales');
  const hasInventoryAccess = canAccessModule(permissions, 'inventory');

  if (activePage === 'salesInventory') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'salesInventory')}
        doctype="Sales Invoice / Bin"
        title="Sales vs Inventory Operations"
      >
        <SalesInventoryPage data={data} onNavigate={onNavigate} />
      </PermissionGate>
    );
  }
  if (activePage === 'sales') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'sales')}
        doctype="Sales Invoice"
        title="Sales Analytics & Register"
      >
        <SalesPage data={data} onNavigate={onNavigate} />
      </PermissionGate>
    );
  }
  if (activePage === 'inventory') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'inventory')}
        doctype="Bin / Item"
        title="Inventory Valuation & Stock"
      >
        <InventoryPage data={data} onNavigate={onNavigate} />
      </PermissionGate>
    );
  }
  if (activePage === 'purchases') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'purchases')}
        doctype="Purchase Invoice"
        title="Procurement & Purchases"
      >
        <PurchasesPage data={data} onNavigate={onNavigate} />
      </PermissionGate>
    );
  }
  if (activePage === 'finance') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'finance')}
        doctype="GL Entry / Account"
        title="Financial Ledgers & Statements"
      >
        <FinancePage data={data} onNavigate={onNavigate} />
      </PermissionGate>
    );
  }
  if (activePage === 'reports') {
    return (
      <PermissionGate
        permitted={canAccessModule(permissions, 'reports')}
        doctype="Reports Access"
        title="Reports Hub"
      >
        <ReportsPage data={data} onNavigate={onNavigate} initialReportId={activeReportId} />
      </PermissionGate>
    );
  }

  return (
    <main className="dashboard-main">
      <Hero data={data} onNavigate={onNavigate} />
      <OverviewCards data={data} isRefreshing={isRefreshing} onRefresh={onRefresh} onNavigate={onNavigate} />
      <ManagementOverview cards={data.managementOverview} data={data} />

      {/* Modern Multi-Option Sales Intelligence Leaderboard (Warehouses & Items) */}
      <PermissionGate
        permitted={hasSalesAccess}
        doctype="Sales Invoice"
        title="Sales Performance Leaderboard"
      >
        <SalesPerformanceLeaderboard data={data} onNavigate={onNavigate} />
      </PermissionGate>

      <section className="dashboard-grid dashboard-grid--top">
        <PermissionGate
          permitted={hasSalesAccess}
          doctype="Sales Invoice"
          title="Sales Trend Analytics"
        >
          <SalesChart
            data={data.salesTrend}
            todayTotal={data.heroMetrics.salesToday}
            onNavigate={onNavigate}
          />
        </PermissionGate>

        <PermissionGate
          permitted={hasSalesAccess}
          doctype="Sales Invoice"
          title="Category Performance"
        >
          <CategoryPerformanceCard
            categories={data.categorySales || []}
            onNavigate={onNavigate}
          />
        </PermissionGate>

        <QuickActions data={data} onNavigate={onNavigate} />
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <PermissionGate
          permitted={hasInventoryAccess}
          doctype="Warehouse"
          title="Store Performance"
        >
          <StorePerformance 
            stores={data.storePerformance} 
            selectedStore={selectedStore}
            onSelectStore={handleSelectStore}
            onNavigate={onNavigate} 
          />
        </PermissionGate>

        <PermissionGate
          permitted={hasInventoryAccess}
          doctype="Warehouse / Bin"
          title="Store Inventory Details"
        >
          <StoreDetails 
            data={data} 
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
            onNavigate={onNavigate} 
          />
        </PermissionGate>

        <PermissionGate
          permitted={hasSalesAccess}
          doctype="Sales Invoice"
          title="Item Sales Register"
        >
          <ItemSalesRegisterByWarehouse data={data} onNavigate={onNavigate} />
        </PermissionGate>
      </section>
      <AppFooter />
    </main>
  );
}
