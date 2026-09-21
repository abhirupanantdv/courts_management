import { useState } from 'react';
import { AlertCircle, LockKeyhole, LogIn, RefreshCw, User } from 'lucide-react';

export function LoginRequired({ auth, onLogin }) {
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
            <span><i /> Bringing Value Home</span>
          </div>
          <p className="login-brand-tagline">
            Courts Management Dashboard
          </p>
        </div>

        {/* Form Panel */}
        <div className="login-screen-body">
          <h2>Sign In to Courts Dashboard</h2>
          <p className="login-subtitle">
            Enter your username and password to access the live operations dashboard.
          </p>

          {isChecking && (
            <div className="login-status-msg is-checking">
              <RefreshCw size={15} className="is-spinning" />
              <span>Verifying session...</span>
            </div>
          )}

          {auth.error && (
            <div className="login-status-msg is-error">
              <AlertCircle size={16} />
              <span>{auth.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-card-form">
            <div className="form-group">
              <label htmlFor="courts-username">Username or Email</label>
              <div className="input-with-icon">
                <input
                  id="courts-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="courts-password">Password</label>
              <div className="input-with-icon">
                <input
                  id="courts-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" className="login-btn-primary" disabled={isLoading || isChecking}>
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="is-spinning" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
