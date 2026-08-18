// Dashboard module - handles dashboard data loading and rendering
import { $, $$ } from './utils/dom.js';

// Initialize dashboard module with state, api, and ui dependencies
function initDashboard(state, api, ui) {
  // Transaction constants
  const TXN_PAGE_SIZE = 5;

  // State initialization (if not already set)
  if (!state.transactionsCache) state.transactionsCache = [];
  if (!state.currentTxnFilter) state.currentTxnFilter = 'ALL';
  if (!state.currentTxnPage) state.currentTxnPage = 1;
  if (!state.txnStartDate) state.txnStartDate = '';
  if (!state.txnEndDate) state.txnEndDate = '';
  if (!state.txnDatePreset) state.txnDatePreset = 'ALL';
  if (!state.isBalanceRevealed) state.isBalanceRevealed = localStorage.getItem('nevaeh_balance_shown') !== 'false';
  if (!state.isAccountRevealed) state.isAccountRevealed = localStorage.getItem('nevaeh_account_shown') !== 'false';

  // Format currency in Philippine Peso (₱)
  function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return '₱' + val.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function parseTxnDate(dateVal) {
    if (!dateVal) return null;
    if (Array.isArray(dateVal)) {
      const [y, m = 1, d = 1, h = 0, min = 0, s = 0] = dateVal;
      return new Date(y, m - 1, d, h, min, s);
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Just now';
    const d = parseTxnDate(dateStr);
    if (!d) return 'Just now';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  }

  // Balance and account display
  function updateBalanceDisplay() {
    const el = $('#dashBalanceDisplay');
    const toggleBtn = $('#btnToggleBalance');
    if (!el) return;

    if (state.isBalanceRevealed && state.currentUser) {
      el.textContent = formatCurrency(state.currentUser.balance);
      el.classList.remove('masked-text');
      if (toggleBtn) {
        toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
      }
    } else {
      el.textContent = '₱ • • • • • •';
      el.classList.add('masked-text');
      if (toggleBtn) {
        toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18z"/></svg>`;
      }
    }
  }

  function updateAccountNumberDisplay() {
    const el = $('#dashAccountNumberDisplay');
    const toggleBtn = $('#btnToggleAccount');
    if (!el) return;

    if (state.currentUser && state.currentUser.accountNumber) {
      const acc = state.currentUser.accountNumber;
      if (state.isAccountRevealed) {
        // Full account number: XXXX XXXX XXXX
        el.textContent = acc.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
        el.classList.remove('masked-text');
        if (toggleBtn) {
          toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>`;
        }
      } else {
        // Masked: 0106 •••• ••••
        const prefix = acc.length >= 4 ? acc.substring(0, 4) : '••••';
        el.textContent = `${prefix} •••• ••••`;
        el.classList.add('masked-text');
        if (toggleBtn) {
          toggleBtn.innerHTML = `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18z"/></svg>`;
        }
      }
    } else {
      el.textContent = '•••• •••• ••••';
    }
  }

  // Dashboard data loader
  async function loadDashboard() {
    ui.showView('dashboard');

    try {
      const res = await api.apiFetch(api.ENDPOINTS.me);
      state.currentUser = res.data;

      // Update greetings & user display
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'morning' : (hour < 18 ? 'afternoon' : 'evening');
      $('#dashGreetingTime').textContent = timeGreeting;
      $('#dashGreetingName').textContent = state.currentUser.firstName || state.currentUser.username;

      const initials = ((state.currentUser.firstName?.[0] || '') + (state.currentUser.lastName?.[0] || 'U')).toUpperCase();
      $('#userAvatarBadge').textContent = initials;

      const navName = $('#navUserNameDisplay');
      if (navName) navName.textContent = state.currentUser.firstName || state.currentUser.username;

      const dropName = $('#dropdownUserName');
      if (dropName) {
        const fullName = `${state.currentUser.firstName || ''} ${state.currentUser.lastName || ''}`.trim();
        dropName.textContent = fullName || state.currentUser.username || 'Account Holder';
      }

      const dropEmail = $('#dropdownUserEmail');
      if (dropEmail) dropEmail.textContent = state.currentUser.email || state.currentUser.username || '';

      // Update balance & account number
      updateBalanceDisplay();
      updateAccountNumberDisplay();

      // Load live transactions
      await loadTransactions();

    } catch (err) {
      ui.showToast('error', 'Dashboard Error', 'Could not load account details.');
    }
  }

  // Transaction loading and rendering
  async function loadTransactions() {
    if (!state.currentUser || !state.currentUser.accountId) return;

    try {
      const res = await api.apiFetch(api.ENDPOINTS.transactions(state.currentUser.accountId));
      const txns = Array.isArray(res) ? res : (res.data || []);

      // Sort newest first
      txns.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      state.transactionsCache = txns;

      renderTransactions();
      updateAnalyticsMetrics();
    } catch (err) {
      console.warn('Could not fetch transactions:', err);
    }
  }

  function renderTransactions() {
    const container = $('#dashTransactionList');
    const paginationControls = $('#txnPaginationControls');
    const paginationInfo = $('#txnPaginationInfo');
    const countBadge = $('#txnTotalCountBadge');
    const clearBtn = $('#btnClearTxnFilters');

    if (!container) return;

    // Update total count badge
    if (countBadge) {
      countBadge.textContent = state.transactionsCache.length;
    }

    // Determine if any filters are active
    const isFiltered = state.currentTxnFilter !== 'ALL' || !!state.txnStartDate || !!state.txnEndDate || state.txnDatePreset !== 'ALL';
    if (clearBtn) {
      if (isFiltered) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }

    // 1. Filter by Type
    let filtered = state.transactionsCache;
    if (state.currentTxnFilter !== 'ALL') {
      filtered = filtered.filter(t => {
        const type = (t.transactionType || '').toUpperCase();
        if (state.currentTxnFilter === 'DEPOSIT') {
          return type.includes('DEPOSIT') || type.includes('IN');
        } else if (state.currentTxnFilter === 'TRANSFER') {
          return type.includes('TRANSFER') && !type.includes('DEPOSIT') && !type.includes('IN');
        } else if (state.currentTxnFilter === 'WITHDRAW') {
          return !type.includes('DEPOSIT') && !type.includes('IN') && !type.includes('TRANSFER');
        }
        return true;
      });
    }

    // 2. Filter by Date Range
    if (state.txnStartDate || state.txnEndDate) {
      let start = null;
      let end = null;

      if (state.txnStartDate) {
        start = new Date(state.txnStartDate + 'T00:00:00');
      }
      if (state.txnEndDate) {
        end = new Date(state.txnEndDate + 'T23:59:59.999');
      }

      filtered = filtered.filter(t => {
        const d = parseTxnDate(t.createdAt);
        if (!d) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      });
    }

    // Handle Empty State
    if (!filtered.length) {
      container.innerHTML = `
        <div class="p-8 text-center bg-slate-50 dark:bg-purple-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-purple-800">
          <div class="text-3xl mb-2">💳</div>
          <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">No Transactions Found</h4>
          <p class="text-xs text-slate-400 mt-1">${isFiltered ? 'No transactions match your selected filter criteria.' : 'Make your first deposit or transfer to see your audit trail here.'}</p>
          ${isFiltered ? '<button onclick="app.clearTxnFilters()" class="mt-3.5 px-4 py-1.5 rounded-full text-xs font-bold bg-finvest-purple text-white hover:bg-finvest-purpleDark transition shadow-sm">Reset All Filters</button>' : ''}
        </div>
      `;
      if (paginationInfo) paginationInfo.textContent = 'Page 0 of 0';
      if (paginationControls) paginationControls.innerHTML = '';
      return;
    }

    // 3. Pagination calculation (5 items max per page)
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / TXN_PAGE_SIZE) || 1;

    if (state.currentTxnPage > totalPages) state.currentTxnPage = totalPages;
    if (state.currentTxnPage < 1) state.currentTxnPage = 1;

    const startIndex = (state.currentTxnPage - 1) * TXN_PAGE_SIZE;
    const endIndex = Math.min(startIndex + TXN_PAGE_SIZE, totalItems);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    // 4. Render Paginated Items (max 5)
    container.innerHTML = paginatedItems.map(t => {
      const type = (t.transactionType || 'TRANSFER').toUpperCase();
      const isDeposit = type.includes('DEPOSIT') || type.includes('IN');
      const isTransfer = type.includes('TRANSFER');

      let badgeColor = isDeposit
        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
        : (isTransfer
          ? 'bg-purple-50 text-finvest-purple dark:bg-purple-950/60 dark:text-primary-300'
          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400');

      let icon = isDeposit ? '+' : (isTransfer ? '↗' : '↙');
      let sign = isDeposit ? '+' : '-';
      let title = type.replace(/_/g, ' ');
      const refId = t.transactionReference || (t.id ? `REF-${t.id}` : 'REF-TXN');

      return `
        <div class="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-slate-50/80 dark:bg-purple-950/25 border border-slate-200/60 dark:border-purple-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 transition">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shadow-sm ${badgeColor}">
              ${icon}
            </div>
            <div>
              <div class="font-bold text-xs text-slate-800 dark:text-white uppercase tracking-wider">${title}</div>
              <div class="text-[11px] text-slate-400 font-mono mt-0.5">${refId} · ${formatDate(t.createdAt)}</div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm font-extrabold ${isDeposit ? 'text-emerald-600 dark:text-emerald-400' : (isTransfer ? 'text-finvest-purple dark:text-primary-300' : 'text-rose-600 dark:text-rose-400')}">
              ${sign}${formatCurrency(t.amount)}
            </div>
            ${t.description ? `<div class="text-[10px] text-slate-400 mt-0.5">${t.description}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // 5. Render Pagination Info (Page X of Y)
    if (paginationInfo) {
      paginationInfo.innerHTML = `Page <span class="font-bold text-slate-700 dark:text-slate-200">${state.currentTxnPage}</span> of <span class="font-bold text-slate-700 dark:text-slate-200">${totalPages}</span>`;
    }

    // 6. Render Pagination Controls (Only if > 5 items / > 1 page)
    if (paginationControls) {
      if (totalPages <= 1) {
        paginationControls.innerHTML = '';
      } else {
        let controlsHtml = '';

        // Previous button
        const prevDisabled = state.currentTxnPage === 1;
        controlsHtml += `
          <button type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${prevDisabled
            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400'
            : 'bg-white dark:bg-finvest-darkCard border border-slate-200 dark:border-purple-800/60 text-slate-700 dark:text-slate-200 hover:border-finvest-purple hover:text-finvest-purple active:scale-95 shadow-sm'
          }"
          ${prevDisabled ? 'disabled' : `onclick="app.goToTxnPage(${state.currentTxnPage - 1})"`}>
            ‹ Prev
          </button>
        `;

        // Numbered page buttons
        const pageNumbers = getPaginationRange(state.currentTxnPage, totalPages);
        pageNumbers.forEach(p => {
          if (p === '...') {
            controlsHtml += `<span class="px-2 py-1 text-xs text-slate-400 font-bold">…</span>`;
          } else {
            const isCurrent = p === state.currentTxnPage;
            controlsHtml += `
              <button type="button"
                class="min-w-[32px] h-8 rounded-xl text-xs font-bold transition ${isCurrent
                ? 'bg-finvest-purple text-white shadow-sm font-extrabold'
                : 'bg-white dark:bg-finvest-darkCard border border-slate-200 dark:border-purple-800/60 text-slate-700 dark:text-slate-300 hover:border-finvest-purple hover:text-finvest-purple active:scale-95 shadow-sm'
              }"
                onclick="app.goToTxnPage(${p})">
                ${p}
              </button>
            `;
          }
        });

        // Next button
        const nextDisabled = state.currentTxnPage === totalPages;
        controlsHtml += `
          <button type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${nextDisabled
            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-purple-950/40 text-slate-400'
            : 'bg-white dark:bg-finvest-darkCard border border-slate-200 dark:border-purple-800/60 text-slate-700 dark:text-slate-200 hover:border-finvest-purple hover:text-finvest-purple active:scale-95 shadow-sm'
          }"
          ${nextDisabled ? 'disabled' : `onclick="app.goToTxnPage(${state.currentTxnPage + 1})"`}>
            Next ›
          </button>
        `;

        paginationControls.innerHTML = controlsHtml;
      }
    }
  }

  function getPaginationRange(current, total) {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range = [];

    // Always show first page
    range.push(1);

    // Add ellipsis and pages before current if needed
    if (current > 3) {
      // If current page is far enough from start, add ellipsis
      if (current > 4) {
        range.push('...');
      }
      // Add up to 2 pages before current
      for (let i = Math.max(2, current - 2); i < current; i++) {
        range.push(i);
      }
    } else {
      // Close to start, show all pages from 2 to current-1
      for (let i = 2; i < current; i++) {
        range.push(i);
      }
    }

    // Add current page (if not already added)
    if (range[range.length - 1] !== current) {
      range.push(current);
    }

    // Add ellipsis and pages after current if needed
    if (current < total - 2) {
      // Add up to 2 pages after current
      for (let i = current + 1; i <= Math.min(total - 1, current + 2); i++) {
        range.push(i);
      }
      // If current page is far enough from end, add ellipsis
      if (current < total - 3) {
        range.push('...');
      }
    } else {
      // Close to end, show all pages from current+1 to total-1
      for (let i = current + 1; i < total; i++) {
        range.push(i);
      }
    }

    // Always show last page (if not already added)
    if (total > 1 && range[range.length - 1] !== total) {
      range.push(total);
    }

    return range;
  }

  function goToTxnPage(page) {
    state.currentTxnPage = page;
    renderTransactions();
    const el = $('#dashTransactionList');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function applyDatePreset(preset) {
    state.txnDatePreset = preset;
    state.currentTxnPage = 1;

    const today = new Date();
    const formatDateYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'TODAY') {
      const todayStr = formatDateYMD(today);
      state.txnStartDate = todayStr;
      state.txnEndDate = todayStr;
    } else if (preset === '7DAYS') {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 6);
      state.txnStartDate = formatDateYMD(past7);
      state.txnEndDate = formatDateYMD(today);
    } else if (preset === '30DAYS') {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      state.txnStartDate = formatDateYMD(firstDayOfMonth);
      state.txnEndDate = formatDateYMD(today);
    } else { // ALL
      state.txnStartDate = '';
      state.txnEndDate = '';
    }

    const startInput = $('#txnStartDate');
    const endInput = $('#txnEndDate');
    if (startInput) startInput.value = state.txnStartDate;
    if (endInput) endInput.value = state.txnEndDate;

    // Update label on date filter dropdown button
    const dateLabel = $('#txnDateFilterLabel');
    if (dateLabel) {
      if (preset === 'TODAY') dateLabel.textContent = 'Today';
      else if (preset === '7DAYS') dateLabel.textContent = 'Last 7 Days';
      else if (preset === '30DAYS') dateLabel.textContent = 'This Month';
      else dateLabel.textContent = 'All Time';
    }

    // Update preset buttons styling
    $$('.txn-date-preset').forEach(btn => {
      if (btn.getAttribute('data-range') === preset) {
        btn.className = 'txn-date-preset active px-2.5 py-1.5 rounded-lg text-xs font-bold bg-finvest-purple text-white shadow-sm transition active:scale-95';
      } else {
        btn.className = 'txn-date-preset px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-slate-300 hover:text-finvest-purple transition active:scale-95';
      }
    });

    renderTransactions();
  }

  function clearTxnFilters() {
    state.currentTxnFilter = 'ALL';
    state.txnStartDate = '';
    state.txnEndDate = '';
    state.txnDatePreset = 'ALL';
    state.currentTxnPage = 1;

    const startInput = $('#txnStartDate');
    const endInput = $('#txnEndDate');
    if (startInput) startInput.value = '';
    if (endInput) endInput.value = '';

    const dateLabel = $('#txnDateFilterLabel');
    if (dateLabel) dateLabel.textContent = 'All Time';

    // Reset date preset buttons styling
    $$('.txn-date-preset').forEach(btn => {
      if (btn.getAttribute('data-range') === 'ALL') {
        btn.className = 'txn-date-preset active px-2.5 py-1.5 rounded-lg text-xs font-bold bg-finvest-purple text-white shadow-sm transition active:scale-95';
      } else {
        btn.className = 'txn-date-preset px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-slate-300 hover:text-finvest-purple transition active:scale-95';
      }
    });

    // Reset type filter tabs
    $$('.txn-tab').forEach(tab => {
      if (tab.getAttribute('data-filter') === 'ALL') {
        tab.className = 'txn-tab px-3.5 py-1 rounded-full text-xs font-bold bg-finvest-purple text-white shadow-sm transition';
      } else {
        tab.className = 'txn-tab px-3.5 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-finvest-purple transition';
      }
    });

    renderTransactions();
  }

  function updateAnalyticsMetrics() {
    let inflow = 0;
    let outflow = 0;

    state.transactionsCache.forEach(t => {
      const amt = Number(t.amount) || 0;
      const type = (t.transactionType || '').toUpperCase();
      if (type.includes('DEPOSIT') || type.includes('IN')) {
        inflow += amt;
      } else {
        outflow += amt;
      }
    });

    const netSavings = Math.max(0, inflow - outflow);

    if ($('#statInflow')) $('#statInflow').textContent = `+${formatCurrency(inflow || 52400)}`;
    if ($('#statOutflow')) $('#statOutflow').textContent = `-${formatCurrency(outflow || 18650)}`;
    if ($('#statNetSavings')) $('#statNetSavings').textContent = `+${formatCurrency(netSavings || 33750)}`;
  }

  // Listen for account data updates from financial module
  window.addEventListener('nevaeh:accountUpdated', () => {
    updateBalanceDisplay();
    loadTransactions();
  });

  // ============================================================
  //  LIST ACCOUNTS FEATURE
  // ============================================================
  let accountsCache = [];

  async function loadAccounts() {
    const skeleton = $('#accountsLoadingSkeleton');
    const content = $('#accountsListContent');
    const countBadge = $('#accountsCountBadge');
    const searchInput = $('#accountsSearchInput');

    // Show loading state
    if (skeleton) skeleton.classList.remove('hidden');
    if (content) content.classList.add('hidden');
    if (searchInput) searchInput.value = '';

    try {
      const res = await api.apiFetch(api.ENDPOINTS.accounts);
      const accounts = res.data || [];
      accountsCache = accounts;

      // Hide skeleton, show content
      if (skeleton) skeleton.classList.add('hidden');
      if (content) content.classList.remove('hidden');

      // Update badge
      if (countBadge) {
        countBadge.textContent = `${accounts.length} account${accounts.length !== 1 ? 's' : ''}`;
      }

      renderAccountsList(accounts);
    } catch (err) {
      if (skeleton) skeleton.classList.add('hidden');
      if (content) {
        content.classList.remove('hidden');
        content.innerHTML = `
          <div class="p-8 text-center bg-slate-50 dark:bg-purple-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-purple-800">
            <div class="text-3xl mb-2">⚠️</div>
            <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">Failed to Load Accounts</h4>
            <p class="text-xs text-slate-400 mt-1">${err.message || 'An error occurred while fetching accounts.'}</p>
          </div>
        `;
      }
      ui.showToast('error', 'Load Error', 'Could not fetch accounts list.');
    }
  }

  function renderAccountsList(accounts) {
    const container = $('#accountsListContent');
    if (!container) return;

    if (!accounts.length) {
      container.innerHTML = `
        <div class="p-8 text-center bg-slate-50 dark:bg-purple-950/30 rounded-2xl border border-dashed border-slate-200 dark:border-purple-800">
          <div class="text-3xl mb-2">🏦</div>
          <h4 class="font-bold text-sm text-slate-700 dark:text-slate-200">No Accounts Found</h4>
          <p class="text-xs text-slate-400 mt-1">There are no registered accounts in the system yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = accounts.map((acc, index) => {
      const ownerName = acc.ownerName || 'Unknown User';
      const initials = ownerName
        .split(' ')
        .map(w => w[0] || '')
        .join('')
        .toUpperCase()
        .substring(0, 2);

      const accNum = acc.accountNumber || '000000000000';
      const formattedAccNum = accNum.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      const balance = Number(acc.balance) || 0;
      const formattedBalance = '₱' + balance.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // Determine if this is the current user's account
      const isCurrentUser = state.currentUser && acc.accountNumber === state.currentUser.accountNumber;

      // Color palette for avatar backgrounds
      const colors = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-indigo-500 to-blue-600',
      ];
      const avatarColor = colors[index % colors.length];

      const createdDate = acc.createdAt
        ? new Date(acc.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';

      return `
        <div class="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-purple-950/25 border border-slate-200/60 dark:border-purple-800/40 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 hover:border-finvest-purple/30 dark:hover:border-purple-700/60 transition-all duration-200 group ${isCurrentUser ? 'ring-2 ring-finvest-purple/30 dark:ring-purple-600/30' : ''}">
          <div class="flex items-center gap-3.5">
            <!-- Avatar -->
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform duration-200">
              ${initials}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-slate-800 dark:text-white truncate">${ownerName}</span>
                ${isCurrentUser ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-finvest-purple/10 dark:bg-purple-900/50 text-finvest-purple dark:text-purple-300 border border-finvest-purple/20">YOU</span>' : ''}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[11px] text-slate-400 font-mono">${formattedAccNum}</span>
                <span class="text-[10px] text-slate-300 dark:text-purple-800">•</span>
                <span class="text-[11px] text-slate-400">${acc.ownerEmail || ''}</span>
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">Joined ${createdDate}</div>
            </div>
          </div>

          <div class="text-right flex-shrink-0 ml-4">
            <div class="text-sm font-extrabold ${balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}">${formattedBalance}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">Balance</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function filterAccounts(searchTerm) {
    if (!searchTerm) {
      renderAccountsList(accountsCache);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = accountsCache.filter(acc => {
      const name = (acc.ownerName || '').toLowerCase();
      const email = (acc.ownerEmail || '').toLowerCase();
      const username = (acc.ownerUsername || '').toLowerCase();
      const accNum = (acc.accountNumber || '').toLowerCase();
      return name.includes(term) || email.includes(term) || username.includes(term) || accNum.includes(term);
    });

    renderAccountsList(filtered);

    // Update badge with filtered count
    const countBadge = $('#accountsCountBadge');
    if (countBadge) {
      if (filtered.length !== accountsCache.length) {
        countBadge.textContent = `${filtered.length} of ${accountsCache.length}`;
      } else {
        countBadge.textContent = `${accountsCache.length} account${accountsCache.length !== 1 ? 's' : ''}`;
      }
    }
  }

  return {
    loadDashboard,
    updateBalanceDisplay,
    updateAccountNumberDisplay,
    loadTransactions,
    renderTransactions,
    goToTxnPage,
    clearTxnFilters,
    applyDatePreset,
    updateAnalyticsMetrics,
    loadAccounts,
    filterAccounts
  };
}

export { initDashboard };