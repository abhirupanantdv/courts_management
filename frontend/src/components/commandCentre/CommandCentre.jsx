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

  const userRoles = data?.userRoles || data?.user?.roles || [];

  if (activePage === 'salesInventory' && canAccessModule(userRoles, 'salesInventory')) {
    return <SalesInventoryPage data={data} onNavigate={onNavigate} />;
  }
  if (activePage === 'sales' && canAccessModule(userRoles, 'sales')) {
    return <SalesPage data={data} onNavigate={onNavigate} />;
  }
  if (activePage === 'inventory' && canAccessModule(userRoles, 'inventory')) {
    return <InventoryPage data={data} onNavigate={onNavigate} />;
  }
  if (activePage === 'purchases' && canAccessModule(userRoles, 'purchases')) {
    return <PurchasesPage data={data} onNavigate={onNavigate} />;
  }
  if (activePage === 'finance' && canAccessModule(userRoles, 'finance')) {
    return <FinancePage data={data} onNavigate={onNavigate} />;
  }
  if (activePage === 'reports' && canAccessModule(userRoles, 'reports')) {
    return <ReportsPage data={data} onNavigate={onNavigate} initialReportId={activeReportId} />;
  }

  return (
    <main className="dashboard-main">
      <Hero data={data} onNavigate={onNavigate} />
      <OverviewCards data={data} isRefreshing={isRefreshing} onRefresh={onRefresh} onNavigate={onNavigate} />
      <ManagementOverview cards={data.managementOverview} />

      {/* Modern Multi-Option Sales Intelligence Leaderboard (Warehouses & Items) */}
      <SalesPerformanceLeaderboard data={data} onNavigate={onNavigate} />

      <section className="dashboard-grid dashboard-grid--top">
        <SalesChart
          data={data.salesTrend}
          todayTotal={data.heroMetrics.salesToday}
          onNavigate={onNavigate}
        />
        <CategoryPerformanceCard
          categories={data.categorySales || []}
          onNavigate={onNavigate}
        />
        <QuickActions onNavigate={onNavigate} />
      </section>

      <section className="dashboard-grid dashboard-grid--bottom">
        <StorePerformance 
          stores={data.storePerformance} 
          selectedStore={selectedStore}
          onSelectStore={handleSelectStore}
          onNavigate={onNavigate} 
        />
        <StoreDetails 
          data={data} 
          selectedStore={selectedStore}
          onSelectStore={setSelectedStore}
          onNavigate={onNavigate} 
        />
        <ItemSalesRegisterByWarehouse data={data} onNavigate={onNavigate} />
      </section>
      <AppFooter />
    </main>
  );
}
