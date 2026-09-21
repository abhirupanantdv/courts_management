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
import { ERPNEXT_HOST, ERPNEXT_URL } from '../../config/erpConfig.js';

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
  const [internalLoginOpen, setInternalLoginOpen] = useState(false);
  const isLoginOpen = controlledLoginOpen !== undefined ? controlledLoginOpen : internalLoginOpen;
  const setIsLoginOpen = onToggleLogin || setInternalLoginOpen;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isAuthenticated = auth?.status === 'authenticated';
  const isLoading = auth?.status === 'loading';

  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const weekday = today.toLocaleDateString('en-GB', { weekday: 'long' });

  const notificationsCount = data?.notifications ?? (data?.source?.warnings?.length || 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ username, password });
  };

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
          {nav.map((item) => {
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
              <span>{isAuthenticated ? auth.user.slice(0, 2).toUpperCase() : 'AG'}</span>
              <p>
                <strong>{isAuthenticated ? auth.user : 'System Account'}</strong>
                {isAuthenticated ? 'Connected' : 'Login'}
              </p>
              <ChevronDown size={15} />
            </button>

            {isLoginOpen ? (
              <LoginDropdown
                auth={auth}
                isAuthenticated={isAuthenticated}
                isLoading={isLoading}
                username={username}
                password={password}
                onUsernameChange={setUsername}
                onPasswordChange={setPassword}
                onSubmit={handleSubmit}
                onLogout={onLogout}
              />
            ) : null}
          </div>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="mobile-nav-panel">
          {nav.map((item) => {
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
            setIsLoginOpen(true);
          }}>
            <LogIn size={19} />
            System Login
          </button>
        </div>
      ) : null}

      {isLoginOpen ? (
        <LoginDropdown
          auth={auth}
          className="login-dropdown--mobile"
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onLogout={onLogout}
        />
      ) : null}
    </header>
  );
}

function LoginDropdown({
  auth,
  className = '',
  isAuthenticated,
  isLoading,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onLogout,
}) {
  return (
    <div className={`login-dropdown ${className}`}>
      <div className="login-dropdown__header">
        <strong>Courts Server Login</strong>
        <span>{ERPNEXT_HOST}</span>
      </div>

      {isAuthenticated ? (
        <div className="login-status">
          <p>Logged in as <strong>{auth.user}</strong></p>
          <button className="login-submit" onClick={onLogout} disabled={isLoading}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <label>
            Username or Email
            <input
              autoComplete="username"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              placeholder="administrator@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="Account password"
              required
            />
          </label>
          {auth.error ? <p className="login-error">{auth.error}</p> : null}
          <button className="login-submit" type="submit" disabled={isLoading}>
            <LogIn size={16} />
            {isLoading ? 'Connecting...' : 'Login & Sync'}
          </button>
        </form>
      )}
    </div>
  );
}
