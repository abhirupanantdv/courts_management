import { request } from './erpnextClient.js';

/**
 * High-performance, balanced server-side analytics API.
 * Calls Python backend endpoint: courts_management.api.get_dashboard_data
 */
export async function getErpNextDashboardData() {
  const payload = await request('/api/method/courts_management.api.get_dashboard_data');
  return payload.message || payload;
}

/**
 * Paginated report rows from the server
 */
export async function getReportRows(reportId, start = 0, limit = 20, filters = {}) {
  const payload = await request('/api/method/courts_management.api.get_report_rows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      report_id: reportId,
      start,
      limit,
      filters,
    }),
  });
  return payload.message || payload;
}
