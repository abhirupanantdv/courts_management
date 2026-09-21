import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Database, Eye, LockKeyhole, LogIn, RefreshCw } from 'lucide-react';
import { ERPNEXT_HOST, ERPNEXT_URL } from '../../config/erpConfig.js';

export function LoginRequired({ auth, onLogin, onEnterPreview }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = auth.status === 'loading';
  const isChecking = auth.status === 'checking';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return;
    onLogin({ username, password });
  };

  return (
    <main className="login-screen-wrap">
      <div className="login-screen-card">
        {/* Brand Banner */}
        <div className="login-screen-brand">
          <div className="login-brand-title">
            <strong>COURTS</strong>
            <span><i></i> Bringing Value Home</span>
          </div>
          <p className="login-brand-tagline">
            Executive Retail Operations & Multi-Location Management Command Centre
          </p>
        </div>

        {/* Form Panel */}
        <div className="login-screen-body">
          <div className="login-target-badge">
            <Database size={15} />
            <span>Target Server:</span>
            <strong>{ERPNEXT_HOST}</strong>
          </div>

          <h2>Sign In to Courts Central</h2>
          <p className="login-subtitle">
            Enter your credentials to load live real-time store performance, inventory balances, and sales data.
          </p>

          {isChecking && (
            <div className="login-status-msg is-checking">
              <RefreshCw size={15} className="is-spinning" />
              <span>Verifying active session...</span>
            </div>
          )}

          {auth.error && (
            <div className="login-status-msg is-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{auth.error}</span>
              </div>
              {onEnterPreview && (
                <button
                  type="button"
                  onClick={onEnterPreview}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '4px',
                  }}
                >
                  Explore Dashboard via Cached Live Snapshot &rarr;
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-card-form">
            <div className="form-group">
              <label htmlFor="erp-username">Username or Email</label>
              <input
                id="erp-username"
                type="text"
                autoComplete="username"
                placeholder="e.g. user@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="erp-password">Password</label>
              <input
                id="erp-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="login-btn-primary" disabled={isLoading || isChecking}>
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="is-spinning" />
                  <span>Connecting & Syncing...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Login & Sync Live Dashboard</span>
                </>
              )}
            </button>

            {onEnterPreview && (
              <button
                type="button"
                className="action-btn action-btn--secondary"
                onClick={onEnterPreview}
                style={{ width: '100%', marginTop: '10px', justifyContent: 'center', fontSize: '0.84rem' }}
              >
                <span>Launch with Live System Snapshot</span>
                <ArrowRight size={15} />
              </button>
            )}
          </form>
        </div>

        {/* Server Target Footer */}
        <div className="login-screen-footer">
          <span>Configured URL: <code>{ERPNEXT_URL}</code></span>
          <span className="config-hint">Auto-detected server host &bull; Dynamic origin sync active</span>
        </div>
      </div>
    </main>
  );
}
