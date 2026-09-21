// Dynamic origin detection directly from browser window.location
export const ERPNEXT_URL = (() => {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return '';
})();

export const ERPNEXT_HOST = (() => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return '';
})();
