// Main application entry point - coordinates all modules and manages state
import { $, $$ } from './modules/utils/dom.js';
import { initApi } from './modules/api.js';
import { initUi } from './modules/ui.js';
import { initAuth } from './modules/auth.js';
import { initDashboard } from './modules/dashboard.js';
import { initFinancial } from './modules/financial.js';
import { initEvents } from './modules/events.js';
import { loadTemplates } from './modules/template.js';

// Application state
const state = {
  // User and auth
  currentUser: null,

  // Transactions and filtering
  transactionsCache: [],
  currentTxnFilter: 'ALL',
  currentTxnPage: 1,
  txnStartDate: '',
  txnEndDate: '',
  txnDatePreset: 'ALL',

  // Visibility flags
  isBalanceRevealed: localStorage.getItem('nevaeh_balance_shown') !== 'false',
  isAccountRevealed: localStorage.getItem('nevaeh_account_shown') !== 'false',
  isDarkMode: localStorage.getItem('nevaeh_dark_mode') === 'true',
};

// Module instances
let api = null;
let ui = null;
let auth = null;
let dashboard = null;
let financial = null;
let events = null;

// Initialize application
async function init() {
  // Load templates first
  await loadTemplates();

  // Initialize UI (needed for api injectors)
  ui = initUi(state);

  // Initialize API with UI functions for showToast/showView
  api = initApi(state, ui);
  // Inject UI functions into API to avoid circular dependencies
  if (api.setUiFunctions) {
    api.setUiFunctions(ui.showView, ui.showToast);
  }

  // Initialize dashboard before auth so auth can call dashboard methods
  dashboard = initDashboard(state, api, ui);

  // Initialize other modules
  auth = initAuth(state, api, ui, dashboard);
  financial = initFinancial(state, api, ui);

  // Initialize event listeners (last, as it needs all modules)
  events = initEvents({ auth, ui, dashboard, financial }, state);

  // Initialize theme
  ui.initTheme();

  // Wrap the showView function to add balance update functionality
  const originalShowView = ui.showView;
  let balanceUpdateInterval = null;

  ui.showView = async (viewName) => {
    // If we're showing the dashboard, start balance updates
    if (viewName === 'dashboard') {
      startBalanceUpdates();
    }
    // If we're hiding the dashboard (showing something else), stop balance updates
    else if (viewName === 'landing' && document.getElementById('dashboardView')?.classList.contains('hidden') === false) {
      stopBalanceUpdates();
    }

    // Call the original showView function
    await originalShowView.call(ui, viewName);

    // If we just showed the dashboard, also do an immediate balance update
    if (viewName === 'dashboard') {
      await financial.refreshAccountData();
    }
  };

  // Function to start balance updates
  function startBalanceUpdates() {
    // Clear any existing interval
    stopBalanceUpdates();

    // Set up interval to update balance every 5 seconds
    balanceUpdateInterval = setInterval(async () => {
      if (document.getElementById('dashboardView')?.classList.contains('hidden') === false) {
        // Only update if dashboard is currently visible
        await financial.refreshAccountData();
      }
    }, 5000); // 5 seconds
  }

  // Function to stop balance updates
  function stopBalanceUpdates() {
    if (balanceUpdateInterval !== null) {
      clearInterval(balanceUpdateInterval);
      balanceUpdateInterval = null;
    }
  }

  // Clean up interval when app is unloaded
  window.addEventListener('beforeunload', stopBalanceUpdates);

  // Check for existing token and load dashboard if present
  const token = localStorage.getItem('nevaeh_jwt_token');
  if (token) {
    try {
      await loadDashboard();
    } catch (err) {
      // If token is invalid, show landing view
      ui.showView('landing');
    }
  } else {
    ui.showView('landing');
  }
}

// Public API methods (preserved for backward compatibility with inline HTML handlers)
async function loadDashboard() {
  await dashboard.loadDashboard();
}

function openAuthModal(mode = 'login') {
  ui.openAuthModal(mode);
}

function closeAuthModal() {
  ui.closeAuthModal();
}

function openModal(id) {
  ui.openModal(id);
}

function closeModal(id) {
  ui.closeModal(id);
}

function goToTxnPage(page) {
  dashboard.goToTxnPage(page);
}

function clearTxnFilters() {
  dashboard.clearTxnFilters();
}

function applyDatePreset(preset) {
  dashboard.applyDatePreset(preset);
}

// Expose public API
window.app = {
  init,
  loadDashboard,
  openAuthModal,
  closeAuthModal,
  openModal,
  closeModal,
  goToTxnPage,
  clearTxnFilters,
  applyDatePreset
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);