/**
 * Portfolio JavaScript - Enhanced functionality
 * Features: Theme toggle, smooth scroll, form validation, mobile menu, analytics
 */

class PortfolioApp {
  constructor() {
    this.init();
  }

  init() {
    this.updateYear();
    this.initThemeToggle();
    this.initSmoothScroll();
    this.initFormValidation();
    this.initMobileMenu();
    this.initProjectCards();
    this.initSkipLink();
  }

  // Update footer year
  updateYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
  }

  // Theme toggle with localStorage & system preference
  initThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    root.setAttribute('data-theme', currentTheme);
    this.updateToggleIcon(currentTheme);

    toggle.addEventListener('click', () => {
      const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark
