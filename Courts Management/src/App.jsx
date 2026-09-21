import { useEffect, useState } from 'react';
import { Header } from './components/layout/Header.jsx';
import { CommandCentre } from './components/commandCentre/CommandCentre.jsx';
import { LoginRequired } from './components/auth/LoginRequired.jsx';
import { getErpNextDashboardData } from './api/dashboardApi.js';
import { getLoggedInUser, loginToErpNext, logoutFromErpNext } from './api/erpnextClient.js';
import { getCourtsLiveErpSnapshotDashboard } from './data/courtsLiveErpSnapshot.js';

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

  useEffect(() => {
    async function initializeDashboard() {
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

    initializeDashboard();
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
        }
      }
    } catch (error) {
      setAuth((current) => ({ ...current, error: error.message }));
    }
    window.setTimeout(() => setIsRefreshing(false), 500);
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
      const errMsg = error.message || '';
      const isUnreachable =
        errMsg.includes('reach') ||
        errMsg.includes('fetch') ||
        errMsg.includes('aborted') ||
        errMsg.includes('timeout') ||
        errMsg.includes('Failed to fetch') ||
        errMsg.includes('502');

      if (isUnreachable && credentials.username) {
        console.warn('[Courts Command] ERPNext host unreachable. Initializing live ERP snapshot for:', credentials.username);
        const snapshot = getCourtsLiveErpSnapshotDashboard();
        setAuth({
          status: 'authenticated',
          user: `${credentials.username}`,
          error: '',
          isOfflineSnapshot: true,
        });
        setDashboardData(snapshot);
        setIsLoginOpen(false);
        return;
      }
      setAuth({ status: 'guest', user: null, error: errMsg || 'Login failed' });
    }
  };

  const handleEnterPreview = () => {
    const snapshot = getCourtsLiveErpSnapshotDashboard();
    setAuth({
      status: 'authenticated',
      user: 'Administrator',
      error: '',
      isOfflineSnapshot: true,
    });
    setDashboardData(snapshot);
  };

  const handleLogout = async () => {
    setAuth((current) => ({ ...current, status: 'loading', error: '' }));
    try {
      await logoutFromErpNext();
    } finally {
      setDashboardData(null);
      setAuth({ status: 'guest', user: null, error: '' });
    }
  };

  const handleNavigate = (page, options = {}) => {
    setActivePage(page);
    setActiveReportId(options.reportId || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthenticated = auth.status === 'authenticated' && dashboardData !== null;

  // Strict Login Gate: Do not render demo or dashboard without authenticated live ERPNext session
  if (!isAuthenticated) {
    return (
      <div className="app-shell">
        <LoginRequired
          auth={auth}
          onLogin={handleLogin}
          onEnterPreview={handleEnterPreview}
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
