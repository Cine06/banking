// API service layer - handles API calls and endpoint configuration
import { $, $$ } from './utils/dom.js';

// API base URL and endpoints
const API_BASE = '';
const ENDPOINTS = {
  register: `${API_BASE}/api/auth/register`,
  login: `${API_BASE}/api/auth/login`,
  changePassword: `${API_BASE}/api/auth/change-password`,
  me: `${API_BASE}/api/users/me`,
  accounts: `${API_BASE}/api/accounts`,
  deposit: (id) => `${API_BASE}/api/accounts/deposit/${id}`,
  withdraw: (id) => `${API_BASE}/api/accounts/withdraw/${id}`,
  transfer: (id) => `${API_BASE}/api/transfers/${id}`,
  transactions: (id) => `${API_BASE}/api/transactions/account/${id}`,
};

// Generic API fetcher with automatic token handling and error processing
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('nevaeh_jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  // Auto logout on 401
  if (res.status === 401 && token) {
    localStorage.removeItem('nevaeh_jwt_token');
    // These will be set via setter injection
    if (apiFetch.__showView) {
      apiFetch.__showView('landing');
    }
    if (apiFetch.__showToast) {
      apiFetch.__showToast('error', 'Session Expired', 'Please sign in again to continue.');
    }
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.message || data.error || `Server error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// Initialize API module with state and UI dependencies
function initApi(state) {
  return {
    apiFetch,
    ENDPOINTS,
    // Setters for UI functions (to avoid circular dependencies)
    setUiFunctions: (showViewFn, showToastFn) => {
      apiFetch.__showView = showViewFn;
      apiFetch.__showToast = showToastFn;
    }
  };
}

export { initApi };