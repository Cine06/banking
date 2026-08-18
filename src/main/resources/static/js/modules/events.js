// Events module - initializes all event listeners for UI interactions
import { $, $$ } from './utils/dom.js';

// Initialize events module with all other modules and state
function initEvents(modules, state) {
  const { auth, ui, dashboard, financial } = modules;

  // Theme toggles
  $('#themeToggleLanding')?.addEventListener('click', ui.toggleTheme);
  $('#themeToggleDash')?.addEventListener('click', ui.toggleTheme);

  // Landing to Auth
  $('#btnOpenSignIn')?.addEventListener('click', () => ui.openAuthModal('login'));
  $('#btnHeroSignIn')?.addEventListener('click', () => ui.openAuthModal('login'));
  $('#btnHeroGetStarted')?.addEventListener('click', () => ui.openAuthModal('register'));
  $('#btnBannerSignUp')?.addEventListener('click', () => ui.openAuthModal('register'));
  $('#btnBannerSignIn')?.addEventListener('click', () => ui.openAuthModal('login'));
  $('#btnCloseAuth')?.addEventListener('click', ui.closeAuthModal);

  // Auth Switchers
  $('#tabLogin')?.addEventListener('click', () => ui.switchAuthTab('login'));
  $('#tabRegister')?.addEventListener('click', () => ui.switchAuthTab('register'));
  $('#linkToRegister')?.addEventListener('click', () => ui.switchAuthTab('register'));
  $('#linkToLogin')?.addEventListener('click', () => ui.switchAuthTab('login'));

  // Forms
  $('#authLoginForm')?.addEventListener('submit', auth.handleLogin);
  $('#authRegisterForm')?.addEventListener('submit', auth.handleRegister);
  $('#changePasswordForm')?.addEventListener('submit', auth.handleChangePassword);
  $('#dashQuickTransferForm')?.addEventListener('submit', financial.handleQuickTransfer);
  $('#modalDepositForm')?.addEventListener('submit', financial.handleModalDeposit);
  $('#modalTransferForm')?.addEventListener('submit', financial.handleModalTransfer);
  $('#modalWithdrawForm')?.addEventListener('submit', financial.handleModalWithdraw);
  $('#modalBillsForm')?.addEventListener('submit', financial.handleModalBills);

  // Dashboard Triggers
  $('#btnTriggerDeposit')?.addEventListener('click', () => ui.openModal('depositModal'));
  $('#btnTriggerTransfer')?.addEventListener('click', () => ui.openModal('transferModal'));
  $('#btnTriggerWithdraw')?.addEventListener('click', () => ui.openModal('withdrawModal'));
  $('#btnTriggerBills')?.addEventListener('click', () => ui.openModal('billsModal'));
  $('#btnTriggerListAccounts')?.addEventListener('click', () => {
    ui.openModal('accountsModal');
    // Animate the card in
    setTimeout(() => {
      const card = $('#accountsModalCard');
      if (card) card.classList.remove('scale-95');
    }, 20);
    dashboard.loadAccounts();
  });
  $('#btnLogout')?.addEventListener('click', auth.handleLogout);
  $('#btnDashBrand')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (state.currentUser && state.currentUser.accountId) financial.refreshAccountData();
  });

  // Accounts modal close button
  $('#btnCloseAccountsModal')?.addEventListener('click', () => {
    const card = $('#accountsModalCard');
    if (card) card.classList.add('scale-95');
    ui.closeModal('accountsModal');
  });

  // Accounts search
  $('#accountsSearchInput')?.addEventListener('input', (e) => {
    dashboard.filterAccounts(e.target.value.trim());
  });

  // User Profile Dropdown Toggle
  $('#btnUserMenuToggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = $('#userProfileDropdown');
    if (dropdown) dropdown.classList.toggle('hidden');
  });

  // Date Filter Dropdown Toggle
  $('#btnTxnDateDropdown')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = $('#txnDateDropdownMenu');
    if (menu) menu.classList.toggle('hidden');
  });

  // Click outside to close dropdowns
  document.addEventListener('click', (e) => {
    const profileDropdown = $('#userProfileDropdown');
    const btnUserMenu = $('#btnUserMenuToggle');
    if (profileDropdown && !profileDropdown.classList.contains('hidden')) {
      if (!profileDropdown.contains(e.target) && !btnUserMenu?.contains(e.target)) {
        profileDropdown.classList.add('hidden');
      }
    }

    const dateDropdown = $('#txnDateDropdownMenu');
    const btnDateDropdown = $('#btnTxnDateDropdown');
    if (dateDropdown && !dateDropdown.classList.contains('hidden')) {
      if (!dateDropdown.contains(e.target) && !btnDateDropdown?.contains(e.target)) {
        dateDropdown.classList.add('hidden');
      }
    }
  });

  // Change Password modal open (also close dropdown)
  $('#btnOpenChangePassword')?.addEventListener('click', () => {
    $('#userProfileDropdown')?.classList.add('hidden');
    ui.openModal('changePasswordModal');
    setTimeout(() => {
      const card = $('#changePasswordCard');
      if (card) card.classList.remove('scale-95');
    }, 20);
  });

  // Change Password modal close
  $('#btnCloseChangePassword')?.addEventListener('click', () => {
    const card = $('#changePasswordCard');
    if (card) card.classList.add('scale-95');
    ui.closeModal('changePasswordModal');
    $('#changePasswordForm')?.reset();
    auth.updatePasswordStrength('');
  });

  // Password strength indicator (live feedback as user types)
  $('#cpNewPassword')?.addEventListener('input', (e) => {
    auth.updatePasswordStrength(e.target.value);
  });

  // Balance visibility toggle
  $('#btnToggleBalance')?.addEventListener('click', () => {
    state.isBalanceRevealed = !state.isBalanceRevealed;
    localStorage.setItem('nevaeh_balance_shown', state.isBalanceRevealed ? 'true' : 'false');
    dashboard.updateBalanceDisplay();
  });

  // Account Number visibility toggle
  $('#btnToggleAccount')?.addEventListener('click', () => {
    state.isAccountRevealed = !state.isAccountRevealed;
    localStorage.setItem('nevaeh_account_shown', state.isAccountRevealed ? 'true' : 'false');
    dashboard.updateAccountNumberDisplay();
  });

  // Copy Account Number with feedback
  $('#btnCopyAccount')?.addEventListener('click', () => {
    if (state.currentUser && state.currentUser.accountNumber) {
      navigator.clipboard.writeText(state.currentUser.accountNumber).then(() => {
        ui.showToast('info', 'Account Copied', `Account #${state.currentUser.accountNumber} copied to clipboard.`);
      }).catch(err => {
        console.error('Failed to copy account number:', err);
        ui.showToast('error', 'Copy Failed', 'Unable to copy account number to clipboard.');
      });
    } else {
      ui.showToast('error', 'Copy Failed', 'No account number available to copy.');
    }
  });

  // Quick pills for quick transfer
  $$('.quick-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const amt = pill.getAttribute('data-amount');
      if (amt && $('#dashTransferAmount')) {
        $('#dashTransferAmount').value = amt;
        $('#dashTransferAmount').focus();
      }
    });
  });

  // Password visibility toggle buttons
  $$('.btn-toggle-pwd').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = $(`#${targetId}`);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  });

  // Transaction filter tabs
  $$('.txn-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.txn-tab').forEach(t => {
        t.className = 'txn-tab px-3.5 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-finvest-purple transition';
      });
      tab.className = 'txn-tab px-3.5 py-1 rounded-full text-xs font-bold bg-finvest-purple text-white shadow-sm transition';
      state.currentTxnFilter = tab.getAttribute('data-filter') || 'ALL';
      state.currentTxnPage = 1;
      dashboard.renderTransactions();
    });
  });

  // Date range inputs
  $('#txnStartDate')?.addEventListener('change', (e) => {
    state.txnStartDate = e.target.value;
    state.txnDatePreset = 'CUSTOM';
    state.currentTxnPage = 1;
    const dateLabel = $('#txnDateFilterLabel');
    if (dateLabel) dateLabel.textContent = 'Custom Range';
    $$('.txn-date-preset').forEach(b => {
      b.className = 'txn-date-preset px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-slate-300 hover:text-finvest-purple transition';
    });
    dashboard.renderTransactions();
  });

  $('#txnEndDate')?.addEventListener('change', (e) => {
    state.txnEndDate = e.target.value;
    state.txnDatePreset = 'CUSTOM';
    state.currentTxnPage = 1;
    const dateLabel = $('#txnDateFilterLabel');
    if (dateLabel) dateLabel.textContent = 'Custom Range';
    $$('.txn-date-preset').forEach(b => {
      b.className = 'txn-date-preset px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-purple-950/70 text-slate-700 dark:text-slate-300 hover:text-finvest-purple transition';
    });
    dashboard.renderTransactions();
  });

  // Quick Date presets
  $$('.txn-date-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const range = btn.getAttribute('data-range') || 'ALL';
      dashboard.applyDatePreset(range);
      // Automatically close dropdown after choosing preset
      $('#txnDateDropdownMenu')?.classList.add('hidden');
    });
  });

  // Clear filters button
  $('#btnClearTxnFilters')?.addEventListener('click', () => {
    dashboard.clearTxnFilters();
    $('#txnDateDropdownMenu')?.classList.add('hidden');
  });

  // Analytics Timeframe Filters
  $$('.analytics-filter').forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      $$('.analytics-filter').forEach(b => {
        b.className = 'analytics-filter px-3 py-1.5 rounded-lg hover:text-brand-purple';
      });
      filterBtn.className = 'analytics-filter px-3 py-1.5 rounded-lg active bg-white dark:bg-brand-purple text-brand-purple dark:text-white shadow-sm';
      ui.showToast('info', 'Analytics Filter', `Displaying spending breakdown for: ${filterBtn.textContent}`);
    });
  });

  // ESC key closes modals & dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      ui.closeAuthModal();
      $$('.action-modal').forEach(m => m.classList.add('hidden'));
      $('#userProfileDropdown')?.classList.add('hidden');
      $('#txnDateDropdownMenu')?.classList.add('hidden');
    }
  });
}

export { initEvents };