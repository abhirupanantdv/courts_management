import { Lock, ShieldAlert } from 'lucide-react';

/**
 * PermissionGate: Renders live content if authorized, or dynamically blurs content
 * with a frosted glassmorphic lock shield if the authenticated ERPNext user lacks
 * read/select permission on the underlying DocType.
 */
export function PermissionGate({
  permitted = false,
  doctype = 'DocType',
  title = '',
  blurAmount = '8px',
  children,
}) {
  if (permitted) {
    return children;
  }

  return (
    <div className="permission-gate-wrapper is-blurred" aria-hidden="true">
      <div
        className="permission-gate-content"
        style={{
          filter: `blur(${blurAmount}) saturate(0.55)`,
          opacity: 0.35,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>
      <div className="permission-gate-overlay" role="alert">
        <div className="permission-gate-card">
          <div className="permission-gate-icon">
            <Lock size={24} />
          </div>
          <h4 className="permission-gate-title">{title || 'Access Restricted'}</h4>
          <p className="permission-gate-desc">
            ERPNext <strong>read</strong> or <strong>select</strong> permission on{' '}
            <code className="permission-doctype-code">{doctype}</code> is required.
          </p>
          <span className="permission-gate-badge">
            <ShieldAlert size={13} />
            <span>ERPNext Role Permission Enforced</span>
          </span>
        </div>
      </div>
    </div>
  );
}
