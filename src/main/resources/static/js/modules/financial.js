// Financial module - handles financial operations: deposit, withdraw, transfer, bills
import { $, $$ } from './utils/dom.js';

// Initialize financial module with state, api, and ui dependencies
function initFinancial(state, api, ui) {
  // Format currency helper (shared with dashboard)
  function formatCurrency(amount) {
    const val = Number(amount) || 0;
    return '₱' + val.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Financial operations
  async function handleQuickTransfer(e) {
    e.preventDefault();
    if (!state.currentUser || !state.currentUser.accountId) return;

    const dest = $('#dashTransferDest').value.trim();
    const amount = parseFloat($('#dashTransferAmount').value);
    const category = $('#dashTransferCategory').value;
    const btn = $('#btnSendMoney');

    const errDest = $('#dashTransferDestError');
    const errAmt = $('#dashTransferAmountError');
    errDest.classList.add('hidden');
    errAmt.classList.add('hidden');

    if (!dest || !/^\d{12}$/.test(dest)) {
      errDest.textContent = 'Must be exactly 12 numeric digits';
      errDest.classList.remove('hidden');
      return;
    }

    if (!amount || isNaN(amount) || amount < 100) {
      errAmt.textContent = 'Minimum transfer amount is ₱100.00';
      errAmt.classList.remove('hidden');
      return;
    }

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.transfer(state.currentUser.accountId), {
        method: 'POST',
        body: JSON.stringify({
          destinationAccountNumber: dest,
          amount: amount,
          category: category
        }),
      });

      ui.showToast('success', 'Transfer Complete', `${formatCurrency(amount)} successfully sent to account ${dest}.`);
      $('#dashQuickTransferForm').reset();
      await refreshAccountData();
    } catch (err) {
      ui.showToast('error', 'Transfer Failed', err.message);
      errAmt.textContent = err.message;
      errAmt.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  async function handleModalDeposit(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    const amount = parseFloat($('#modalDepositAmount').value);
    const btn = $('#btnModalDepositSubmit');
    const errEl = $('#modalDepositError');
    errEl.classList.add('hidden');

    if (!amount || amount < 100) {
      errEl.textContent = 'Minimum deposit is ₱100.00';
      errEl.classList.remove('hidden');
      return;
    }

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.deposit(state.currentUser.accountId), {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });

      ui.showToast('success', 'Deposit Confirmed', `${formatCurrency(amount)} added to your available balance.`);
      ui.closeModal('depositModal');
      $('#modalDepositForm').reset();
      await refreshAccountData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  async function handleModalWithdraw(e) {
    e.preventDefault();
    if (!state.currentUser) return;

    const amount = parseFloat($('#modalWithdrawAmount').value);
    const btn = $('#btnModalWithdrawSubmit');
    const errEl = $('#modalWithdrawError');
    errEl.classList.add('hidden');

    if (!amount || amount < 100) {
      errEl.textContent = 'Minimum withdrawal is ₱100.00';
      errEl.classList.remove('hidden');
      return;
    }

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.withdraw(state.currentUser.accountId), {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });

      ui.showToast('success', 'Withdrawal Confirmed', `${formatCurrency(amount)} withdrawn.`);
      ui.closeModal('withdrawModal');
      $('#modalWithdrawForm').reset();
      await refreshAccountData();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  async function handleModalTransfer(e) {
    e.preventDefault();
    if (!state.currentUser || !state.currentUser.accountId) return;

    const dest = $('#modalTransferDest').value.trim();
    const amount = parseFloat($('#modalTransferAmount').value);
    const btn = $('#btnModalTransferSubmit');
    const errDest = $('#modalTransferDestError');
    const errAmt = $('#modalTransferAmountError');
    errDest.classList.add('hidden');
    errAmt.classList.add('hidden');

    if (!dest || !/^\d{12}$/.test(dest)) {
      errDest.textContent = 'Account number must be exactly 12 digits';
      errDest.classList.remove('hidden');
      return;
    }

    if (!amount || isNaN(amount) || amount < 100) {
      errAmt.textContent = 'Minimum transfer amount is ₱100.00';
      errAmt.classList.remove('hidden');
      return;
    }

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.transfer(state.currentUser.accountId), {
        method: 'POST',
        body: JSON.stringify({
          destinationAccountNumber: dest,
          amount: amount,
        }),
      });

      ui.showToast('success', 'Transfer Successful', `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} sent to account ${dest}.`);
      ui.closeModal('transferModal');
      $('#modalTransferForm').reset();
      await refreshAccountData();
    } catch (err) {
      ui.showToast('error', 'Transfer Failed', err.message);
      errAmt.textContent = err.message;
      errAmt.classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  async function handleModalBills(e) {
    e.preventDefault();
    const biller = $('#modalBillerType').value;
    const ref = $('#modalBillRef').value;
    const amount = parseFloat($('#modalBillAmount').value);
    const btn = $('#btnModalBillSubmit');

    if (!amount || amount < 50) {
      ui.showToast('error', 'Invalid Amount', 'Minimum bill payment is ₱50.00');
      return;
    }

    btn.classList.add('btn-loading');

    // Simulate bill settlement deduction
    setTimeout(() => {
      btn.classList.remove('btn-loading');
      ui.closeModal('billsModal');
      $('#modalBillsForm').reset();
      ui.showToast('success', 'Bill Paid Successfully', `₱${amount.toFixed(2)} paid to ${biller} (Ref: ${ref})`);
    }, 700);
  }

  // Refresh account data
  async function refreshAccountData() {
    try {
      const res = await api.apiFetch(api.ENDPOINTS.me);
      state.currentUser = res.data;
      // Dispatch custom event so dashboard can update its displays
      window.dispatchEvent(new CustomEvent('nevaeh:accountUpdated'));
    } catch (err) {
      console.warn(err);
    }
  }

  return {
    handleQuickTransfer,
    handleModalDeposit,
    handleModalWithdraw,
    handleModalTransfer,
    handleModalBills,
    refreshAccountData
  };
}

export { initFinancial };