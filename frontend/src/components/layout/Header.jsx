import {
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  Coins,
  FileText,
  Home,
  LogIn,
  LogOut,
  Menu,
  PackageSearch,
  ShoppingCart,
} from 'lucide-react';
import { useState } from 'react';
import { erpNextRoutes, redirectToErpNext } from '../../utils/erpnextRoutes.js';
import { canAccessModule } from '../../utils/rolePermissions.js';

const nav = [
  { label: 'Dashboard', icon: Home, page: 'dashboard' },
  { label: 'Sales vs Inventory', icon: PackageSearch, page: 'salesInventory' },
  { label: 'Sales', icon: BarChart3, page: 'sales' },
  { label: 'Inventory', icon: Boxes, page: 'inventory' },
  { label: 'Purchases', icon: ShoppingCart, page: 'purchases' },
  { label: 'Finance', icon: Coins, page: 'finance' },
  { label: 'Reports', icon: FileText, page: 'reports' },
];

export function Header({
  data = {},
  auth,
  onLogin,
  onLogout,
  activePage,
  onNavigate,
  isLoginOpen: controlledLoginOpen,
  onToggleLogin,
}) {
  const userRoles = data?.userRoles || data?.user?.roles || [];
  const permissions = data?.permissions;
  const effectiveNav = nav.filter((item) => canAccessModule(userRoles, item.page, permissions));

  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const isLoginOpen = controlledLoginOpen !== undefined ? controlledLoginOpen : internalLoginOpen;
  const setIsLoginOpen = onToggleLogin || setInternalLoginOpen;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAuthenticated = auth?.status === 'authenticated';
  const isLoading = auth?.status === 'loading';

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const weekday = today.toLocaleDateString('en-GB', { weekday: 'long' });

  const notificationsCount = data?.notifications ?? (data?.source?.warnings?.length || 0);

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <div className="brand-logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
          <strong>COURTS</strong>
          <span><i /> Bringing Value Home</span>
        </div>

        <button
          className="icon-button mobile-only"
          aria-label="Open navigation"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          <Menu size={20} />
        </button>

        <nav className="topnav__links" aria-label="Primary navigation">
          {effectiveNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={`topnav__item ${item.page === activePage ? 'is-active' : ''}`}
                key={item.label}
                onClick={() => onNavigate(item.page || 'dashboard')}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="topnav__actions">
          <button className="company-select" onClick={() => onNavigate('salesInventory')} title="View Courts multi-location stores">
            <CalendarDays size={18} />
            <span>{data?.company || 'Courts'}</span>
            <ChevronDown size={16} />
          </button>
          <div className="date-chip">
            <CalendarDays size={18} />
            <span><strong>{dateFormatted}</strong>{weekday}</span>
          </div>
          <button className="notification-button" aria-label="Notifications" title={notificationsCount ? `${notificationsCount} alerts` : 'All systems operational'}>
            <Bell size={21} />
            {notificationsCount > 0 ? <b>{notificationsCount}</b> : null}
          </button>
          <div className="login-menu">
            <button className="user-chip" onClick={() => setIsLoginOpen((value) => !value)}>
              <span>{isAuthenticated ? auth.user.slice(0, 2).toUpperCase() : 'CM'}</span>
              <p>
                <strong>{isAuthenticated ? auth.user : 'System Account'}</strong>
                {isAuthenticated ? 'Connected' : 'Login'}
              </p>
              <ChevronDown size={15} />
            </button>

            {isLoginOpen ? (
              <UserProfileDropdown
                auth={auth}
                userRoles={userRoles}
                isLoading={isLoading}
                onLogout={onLogout}
              />
            ) : null}
          </div>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="mobile-nav-panel">
          {effectiveNav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={item.page === activePage ? 'is-active' : ''}
                key={item.label}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate(item.page || 'dashboard');
                }}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
          <button onClick={() => {
            setIsMobileMenuOpen(false);
            onNavigate('salesInventory');
          }}>
            <CalendarDays size={19} />
            {data?.company || 'Courts'}
          </button>
          <button onClick={() => {
            setIsMobileMenuOpen(false);
            onLogout();
          }}>
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      ) : null}

      {isLoginOpen ? (
        <UserProfileDropdown
          auth={auth}
          userRoles={userRoles}
          className="login-dropdown--mobile"
          isLoading={isLoading}
          onLogout={onLogout}
        />
      ) : null}
    </header>
  );
}

function UserProfileDropdown({
  auth,
  userRoles = [],
  className = '',
  isLoading,
  onLogout,
}) {
  const displayRole = userRoles.length > 0 
    ? userRoles.find((r) => !['All', 'Guest', 'Desk User'].includes(r)) || userRoles[0]
    : 'Authorized Staff';

  return (
    <div className={`login-dropdown ${className}`}>
      <div className="login-dropdown__header">
        <strong>Courts ERPNext</strong>
        <span className="category-chip" style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8' }}>
          {displayRole}
        </span>
      </div>

      <div className="login-status">
        <p>Signed in as <strong>{auth?.user}</strong></p>
        <button className="login-submit" onClick={onLogout} disabled={isLoading}>
          <LogOut size={16} />
          {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
