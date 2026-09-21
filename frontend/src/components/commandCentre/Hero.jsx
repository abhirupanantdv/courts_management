const HERO_IMAGE_URL = '/assets/courts_management/courts/assets/courts-reference-hero.jpg';

export function Hero({ data = {}, onNavigate }) {
  const stores = data?.heroMetrics?.stores ?? 0;
  const salesToday = data?.heroMetrics?.salesToday ?? 0;
  const inventoryQty = data?.kpis?.inventoryQty?.value ?? 0;
  const customersToday = data?.heroMetrics?.customersToday ?? 0;
  const totalPurchase = data?.kpis?.totalPurchase?.value ?? 0;

  return (
    <section className="hero-courts-banner" aria-label="Courts Stronger Together Command Centre">
      <div className="hero-courts-banner__container">
        <img
          src={HERO_IMAGE_URL}
          alt="Courts Stronger Together - Stores, Warehouses, People, Performance - Better Homes, Brighter Lives"
          className="hero-courts-banner__img"
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.dataset.fallback = '1';
              e.currentTarget.src = '/assets/courts-reference-hero.jpg';
            } else if (e.currentTarget.dataset.fallback === '1') {
              e.currentTarget.dataset.fallback = '2';
              e.currentTarget.src = './assets/courts-reference-hero.jpg';
            }
          }}
        />


        {/* Interactive Honeycomb Hotspot Navigation & Telemetry Tooltips */}
        <div className="hero-courts-banner__hotspots" aria-label="Interactive operational hotspots">
          {/* 1. Stores (Top) */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--stores"
            title={`Stores & Warehouses: ${stores} Locations active (Click to view)`}
            onClick={() => onNavigate && onNavigate('inventory')}
            aria-label="Navigate to Stores & Warehouses"
          />

          {/* 2. Sales (Upper-Left) */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--sales"
            title={`Sales Performance: PGK ${(Number(salesToday) / 1000000).toFixed(2)}M Today (Click to view)`}
            onClick={() => onNavigate && onNavigate('sales')}
            aria-label="Navigate to Sales Analytics"
          />

          {/* 3. Central Courts Logo */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--center"
            title="Courts Central Command Centre (Click to return to overview)"
            onClick={() => onNavigate && onNavigate('dashboard')}
            aria-label="Courts Central Command"
          />

          {/* 4. Inventory (Upper-Right) */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--inventory"
            title={`Inventory: ${Number(inventoryQty).toLocaleString()} units in stock (Click to view)`}
            onClick={() => onNavigate && onNavigate('inventory')}
            aria-label="Navigate to Inventory & Warehouses"
          />

          {/* 5. People / Customers (Lower-Left) */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--people"
            title={`Customers & People: ${customersToday} customers today (Click to view)`}
            onClick={() => onNavigate && onNavigate('sales')}
            aria-label="Navigate to Customers & Sales"
          />

          {/* 6. Finance (Lower-Right) */}
          <button
            type="button"
            className="hero-banner-hotspot hotspot--finance"
            title={`Finance & Spend: PGK ${(Number(totalPurchase) / 1000).toFixed(1)}K procurement (Click to view)`}
            onClick={() => onNavigate && onNavigate('finance')}
            aria-label="Navigate to Finance & Accounts"
          />
        </div>
      </div>
    </section>
  );
}
