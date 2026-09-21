import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Command,
  Factory,
  HandCoins,
  ShoppingCart,
  Truck,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Command Centre', icon: Command, active: true },
  { label: 'Sales', icon: ShoppingCart },
  { label: 'Purchase', icon: HandCoins },
  { label: 'Inventory', icon: Boxes },
  { label: 'Warehouses', icon: Building2 },
  { label: 'Customers', icon: Users },
  { label: 'Suppliers', icon: Factory },
  { label: 'Reports', icon: ClipboardList },
];

export function Sidebar({ collapsed, drawerOpen, onCloseDrawer }) {
  return (
    <>
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${drawerOpen ? 'is-open' : ''}`}>
        <div className="sidebar__brand">
          <div className="brand-mark">
            <BarChart3 size={23} />
          </div>
          <div className="sidebar__brand-text">
            <strong>COURTS</strong>
            <span>PNG Command</span>
          </div>
          <button className="icon-button mobile-only" onClick={onCloseDrawer} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>
        <nav className="sidebar__nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={`nav-item ${item.active ? 'is-active' : ''}`} key={item.label}>
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      {drawerOpen ? <button className="drawer-scrim" onClick={onCloseDrawer} aria-label="Close navigation" /> : null}
    </>
  );
}
