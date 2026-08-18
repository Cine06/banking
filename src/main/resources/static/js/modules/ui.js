// UI module - handles UI interactions: toast, modals, theme, view switching
import { $, $$ } from './utils/dom.js';

// Initialize UI module with state
function initUi(state) {
  // Toast notifications
  function showToast(type, title, message, duration = 4500) {
    const container = $('#toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-card toast-${type}`;

    toast.innerHTML = `
      <div class="flex-1">
        <div class="font-bold text-xs uppercase tracking-wider">${title}</div>
        <div class="text-xs opacity-90 mt-0.5">${message}</div>
      </div>
      <button class="text-white/60 hover:text-white text-sm ml-2" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hiding');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // View & Modal Navigation
  function showView(viewName) {
    const landing = $('#landingView');
    const dash = $('#dashboardView');

    if (viewName === 'dashboard') {
      landing.classList.add('hidden', 'opacity-0');
      dash.classList.remove('hidden');
      setTimeout(() => dash.classList.remove('opacity-0'), 20);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      dash.classList.add('hidden', 'opacity-0');
      landing.classList.remove('hidden');
      setTimeout(() => landing.classList.remove('opacity-0'), 20);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function openAuthModal(mode = 'login') {
    const modal = $('#authModal');
    if (!modal) return;

    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('.glass-auth-card')?.classList.remove('scale-95');
    }, 10);

    switchAuthTab(mode);
  }

  function closeAuthModal() {
    const modal = $('#authModal');
    if (!modal) return;

    modal.classList.add('opacity-0');
    modal.querySelector('.glass-auth-card')?.classList.add('scale-95');
    setTimeout(() => modal.classList.add('hidden'), 250);
  }

  function switchAuthTab(tab) {
    const isLogin = tab === 'login';
    const tabLogin = $('#tabLogin');
    const tabRegister = $('#tabRegister');
    const formLogin = $('#authLoginForm');
    const formRegister = $('#authRegisterForm');
    const title = $('#authModalTitle');
    const subtitle = $('#authModalSubtitle');

    if (isLogin) {
      tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-gradient-to-r from-[#6355EC] to-[#4334C4] text-white shadow-md';
      tabRegister.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 text-white/80 hover:text-white';
      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
      title.textContent = 'Sign In';
      subtitle.textContent = 'Access your secure Nevaeh Banking workspace';
    } else {
      tabRegister.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 bg-gradient-to-r from-[#6355EC] to-[#4334C4] text-white shadow-md';
      tabLogin.className = 'flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 text-white/80 hover:text-white';
      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
      title.textContent = 'Create Account';
      subtitle.textContent = 'Join Nevaeh & enjoy seamless digital banking';
    }
  }

  function openModal(id) {
    const modal = $(`#${id}`);
    if (modal) {
      modal.classList.remove('hidden');
      setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
  }

  function closeModal(id) {
    const modal = $(`#${id}`);
    if (modal) {
      modal.classList.add('opacity-0');
      setTimeout(() => modal.classList.add('hidden'), 200);
    }
  }

  // Theme Toggle (DARK/LIGHT)
  function initTheme() {
    const isDarkMode = localStorage.getItem('nevaeh_dark_mode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function toggleTheme() {
    const isDarkMode = localStorage.getItem('nevaeh_dark_mode') === 'true';
    localStorage.setItem('nevaeh_dark_mode', (!isDarkMode).toString());
    initTheme();
  }

  return {
    showToast,
    showView,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    openModal,
    closeModal,
    initTheme,
    toggleTheme
  };
}

export { initUi };