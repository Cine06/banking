// Authentication module - handles login, register, logout, and token management
import { $, $$ } from './utils/dom.js';

// Initialize auth module with state, api, ui, and dashboard dependencies
function initAuth(state, api, ui, dashboard) {
  // Token helpers
  function getToken() {
    return localStorage.getItem('nevaeh_jwt_token');
  }

  function setToken(token) {
    localStorage.setItem('nevaeh_jwt_token', token);
  }

  function clearToken() {
    localStorage.removeItem('nevaeh_jwt_token');
  }

  // Auth actions
  async function handleLogin(e) {
    e.preventDefault();
    const usernameOrEmail = $('#loginUsername').value.trim();
    const password = $('#loginPassword').value;
    const btn = $('#btnLoginSubmit');

    const errUser = $('#loginUsernameError');
    const errPass = $('#loginPasswordError');
    errUser.classList.add('hidden');
    errPass.classList.add('hidden');

    if (!usernameOrEmail) {
      errUser.textContent = 'Username or email is required';
      errUser.classList.remove('hidden');
      return;
    }
    if (!password) {
      errPass.textContent = 'Password is required';
      errPass.classList.remove('hidden');
      return;
    }

    btn.classList.add('btn-loading');

    try {
      const res = await api.apiFetch(api.ENDPOINTS.login, {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (res.data && res.data.token) {
        setToken(res.data.token);
        // Update state
        state.currentUser = null; // Will be loaded via loadDashboard
        ui.closeAuthModal();
        ui.showToast('success', 'Welcome Back', 'Authentication verified successfully.');
        await dashboard.loadDashboard();
      }
    } catch (err) {
      errPass.textContent = err.message || 'Login failed. Please check your credentials.';
      errPass.classList.remove('hidden');
      ui.showToast('error', 'Login Failed', err.message);
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const firstName = $('#regFirstName').value.trim();
    const lastName = $('#regLastName').value.trim();
    const middleName = $('#regMiddleName').value.trim();
    const username = $('#regUsername').value.trim();
    const email = $('#regEmail').value.trim();
    const password = $('#regPassword').value;
    const btn = $('#btnRegisterSubmit');

    // Reset error labels
    $$('#authRegisterForm [id$="Error"]').forEach(el => el.classList.add('hidden'));

    let valid = true;

    if (!firstName || firstName.length < 2 || firstName.length > 12) {
      $('#regFirstNameError').textContent = '2-12 characters required';
      $('#regFirstNameError').classList.remove('hidden');
      valid = false;
    }
    if (!lastName || lastName.length < 2 || lastName.length > 12) {
      $('#regLastNameError').textContent = '2-12 characters required';
      $('#regLastNameError').classList.remove('hidden');
      valid = false;
    }
    if (!username || username.length < 2 || username.length > 12) {
      $('#regUsernameError').textContent = '2-12 characters required';
      $('#regUsernameError').classList.remove('hidden');
      valid = false;
    } else if (!/\d/.test(username) || !/[^a-zA-Z0-9]/.test(username)) {
      $('#regUsernameError').textContent = 'Must include numbers & special character';
      $('#regUsernameError').classList.remove('hidden');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $('#regEmailError').textContent = 'Valid email address required';
      $('#regEmailError').classList.remove('hidden');
      valid = false;
    }
    if (!password || password.length < 2 || password.length > 12) {
      $('#regPasswordError').textContent = 'Password must be 2-12 characters';
      $('#regPasswordError').classList.remove('hidden');
      valid = false;
    } else if (!/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      $('#regPasswordError').textContent = 'Must include numbers & special character';
      $('#regPasswordError').classList.remove('hidden');
      valid = false;
    }

    if (!valid) return;

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.register, {
        method: 'POST',
        body: JSON.stringify({ firstName, middleName, lastName, username, email, password }),
      });

      ui.showToast('success', 'Account Registered', 'You can now sign in with your credentials.');
      ui.switchAuthTab('login');
      $('#loginUsername').value = username;
      $('#loginPassword').value = '';
    } catch (err) {
      ui.showToast('error', 'Registration Failed', err.message);
      $('#regPasswordError').textContent = err.message;
      $('#regPasswordError').classList.remove('hidden');
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  function handleLogout() {
    clearToken();
    // Update state
    state.currentUser = null;
    state.transactionsCache = [];
    state.currentTxnPage = 1;
    state.currentTxnFilter = 'ALL';
    state.txnStartDate = '';
    state.txnEndDate = '';
    state.txnDatePreset = 'ALL';
    state.isBalanceRevealed = localStorage.getItem('nevaeh_balance_shown') !== 'false';
    state.isAccountRevealed = localStorage.getItem('nevaeh_account_shown') !== 'false';
    state.isDarkMode = localStorage.getItem('nevaeh_dark_mode') === 'true';

    ui.showView('landing');
    ui.showToast('info', 'Signed Out', 'You have been safely logged out.');
  }

  // Change password handler
  async function handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = $('#cpCurrentPassword').value;
    const newPassword = $('#cpNewPassword').value;
    const confirmPassword = $('#cpConfirmPassword').value;
    const btn = $('#btnChangePasswordSubmit');

    const errCurrent = $('#cpCurrentPasswordError');
    const errNew = $('#cpNewPasswordError');
    const errConfirm = $('#cpConfirmPasswordError');

    // Reset error states
    errCurrent.classList.add('hidden');
    errNew.classList.add('hidden');
    errConfirm.classList.add('hidden');

    // Validation
    let valid = true;

    if (!currentPassword) {
      errCurrent.textContent = 'Current password is required';
      errCurrent.classList.remove('hidden');
      valid = false;
    }

    if (!newPassword) {
      errNew.textContent = 'New password is required';
      errNew.classList.remove('hidden');
      valid = false;
    } else if (newPassword.length < 2 || newPassword.length > 12) {
      errNew.textContent = 'Password must be 2-12 characters';
      errNew.classList.remove('hidden');
      valid = false;
    } else if (!/\d/.test(newPassword) || !/[^a-zA-Z0-9]/.test(newPassword)) {
      errNew.textContent = 'Must include at least 1 number & 1 special character';
      errNew.classList.remove('hidden');
      valid = false;
    }

    if (!confirmPassword) {
      errConfirm.textContent = 'Please confirm your new password';
      errConfirm.classList.remove('hidden');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      errConfirm.textContent = 'Passwords do not match';
      errConfirm.classList.remove('hidden');
      valid = false;
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errNew.textContent = 'New password must be different from current password';
      errNew.classList.remove('hidden');
      valid = false;
    }

    if (!valid) return;

    btn.classList.add('btn-loading');

    try {
      await api.apiFetch(api.ENDPOINTS.changePassword, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      ui.showToast('success', 'Password Updated', 'Your password has been changed successfully.');

      // Close modal and reset form
      const card = $('#changePasswordCard');
      if (card) card.classList.add('scale-95');
      ui.closeModal('changePasswordModal');
      $('#changePasswordForm').reset();

      // Reset strength indicator
      updatePasswordStrength('');
    } catch (err) {
      const msg = err.message || 'Failed to change password.';
      // Show error on the current password field if it's an auth error
      if (msg.toLowerCase().includes('current password') || msg.toLowerCase().includes('incorrect')) {
        errCurrent.textContent = msg;
        errCurrent.classList.remove('hidden');
      } else {
        errNew.textContent = msg;
        errNew.classList.remove('hidden');
      }
      ui.showToast('error', 'Password Change Failed', msg);
    } finally {
      btn.classList.remove('btn-loading');
    }
  }

  // Password strength indicator
  function updatePasswordStrength(password) {
    const bars = [
      $('#cpStrengthBar1'),
      $('#cpStrengthBar2'),
      $('#cpStrengthBar3'),
      $('#cpStrengthBar4'),
    ];
    const label = $('#cpStrengthLabel');

    if (!bars[0] || !label) return;

    if (!password) {
      bars.forEach(bar => {
        bar.style.width = '0';
        bar.className = 'h-full w-0 rounded-full transition-all duration-300';
      });
      label.textContent = '';
      return;
    }

    let strength = 0;
    if (password.length >= 2) strength++;
    if (password.length >= 6) strength++;
    if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength++;
    if (password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;

    const colors = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-500'];
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const textColors = ['text-rose-400', 'text-amber-400', 'text-emerald-400', 'text-emerald-300'];

    bars.forEach((bar, i) => {
      if (i < strength) {
        bar.style.width = '100%';
        bar.className = `h-full rounded-full transition-all duration-300 ${colors[strength - 1]}`;
      } else {
        bar.style.width = '0';
        bar.className = 'h-full w-0 rounded-full transition-all duration-300';
      }
    });

    label.textContent = labels[strength - 1] || '';
    label.className = `text-[10px] font-bold uppercase tracking-wider ${textColors[strength - 1] || 'text-purple-200/60'}`;
  }

  return {
    getToken,
    setToken,
    clearToken,
    handleLogin,
    handleRegister,
    handleLogout,
    handleChangePassword,
    updatePasswordStrength
  };
}

export { initAuth };