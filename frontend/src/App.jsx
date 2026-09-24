import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header.jsx';
import { CommandCentre } from './components/commandCentre/CommandCentre.jsx';
import { LoginRequired } from './components/auth/LoginRequired.jsx';
import { getErpNextDashboardData } from './api/dashboardApi.js';
import { getLoggedInUser, loginToErpNext, logoutFromErpNext } from './api/erpnextClient.js';
import { canAccessModule } from './utils/rolePermissions.js';

export default function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [activeReportId, setActiveReportId] = useState('sales-register');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [auth, setAuth] = useState({
    status: 'checking',
    user: null,
    error: '',
  });

  // Verify session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await getLoggedInUser();
        if (user && user !== 'Guest') {
          setAuth({ status: 'authenticated', user, error: '' });
          const erpData = await getErpNextDashboardData();
          setDashboardData(erpData);
        } else {
          setAuth({ status: 'guest', user: null, error: '' });
        }
      } catch (err) {
        setAuth({ status: 'guest', user: null, error: '' });
      }
    }

    checkSession();
  }, []);

  // Listen for session expiry from API calls
  useEffect(() => {
    const handleSessionExpired = () => {
      setDashboardData(null);
      setAuth({
        status: 'guest',
        user: null,
        error: 'Your session has expired. Please sign in again.',
      });
    };

    window.addEventListener('courts:session-expired', handleSessionExpired);
    return () => window.removeEventListener('courts:session-expired', handleSessionExpired);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (auth.status === 'authenticated') {
        const nextData = await getErpNextDashboardData();
        setDashboardData(nextData);
      } else {
        const user = await getLoggedInUser();
        if (user && user !== 'Guest') {
          setAuth({ status: 'authenticated', user, error: '' });
          const nextData = await getErpNextDashboardData();
          setDashboardData(nextData);
        } else {
          setAuth({ status: 'guest', user: null, error: 'Please sign in to view data.' });
        }
      }
    } catch (error) {
      setAuth((current) => ({ ...current, error: error.message }));
    } finally {
      window.setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogin = async (credentials) => {
    setAuth({ status: 'loading', user: null, error: '' });
    try {
      const session = await loginToErpNext(credentials);
      setAuth({ status: 'authenticated', user: session.user, error: '' });
      setIsLoginOpen(false);
      const erpData = await getErpNextDashboardData();
      setDashboardData(erpData);
    } catch (error) {
      let errMsg = error.message || 'Login failed';
      if (
        errMsg.includes('Invalid') ||
        errMsg.includes('Incorrect') ||
        errMsg.includes('Password') ||
        errMsg.includes('usr') ||
        errMsg.includes('401')
      ) {
        errMsg = 'Invalid username or password.';
      }
      setAuth({ status: 'guest', user: null, error: errMsg });
    }
  };

  const handleLogout = async () => {
    setAuth({ status: 'loading', user: null, error: '' });
    try {
      await logoutFromErpNext();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setDashboardData(null);
      setAuth({ status: 'guest', user: null, error: '' });
    }
  };

  const userRoles = dashboardData?.userRoles || dashboardData?.user?.roles || [];
  const permissions = dashboardData?.permissions;

  // Guard active page if user roles change or do not permit the current module
  useEffect(() => {
    if (dashboardData && !canAccessModule(userRoles, activePage, permissions)) {
      setActivePage('dashboard');
    }
  }, [dashboardData, userRoles, activePage, permissions]);

  const handleNavigate = (page, options = {}) => {
    const targetPage = canAccessModule(userRoles, page, permissions) ? page : 'dashboard';
    setActivePage(targetPage);
    setActiveReportId(options.reportId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = auth.status === 'authenticated' && dashboardData !== null;

  // Render clean login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <LoginRequired
          auth={auth}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header
        data={dashboardData}
        auth={auth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        activePage={activePage}
        onNavigate={handleNavigate}
        isLoginOpen={isLoginOpen}
        onToggleLogin={setIsLoginOpen}
      />

      <CommandCentre
        data={dashboardData}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        activePage={activePage}
        activeReportId={activeReportId}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
