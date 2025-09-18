// Auto update year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Theme toggle
const root = document.documentElement;
const btn = document.getElementById('themeBtn');
const saved = localStorage.getItem('theme');

if (saved) {
  root.setAttribute('data-theme', saved);
}

btn.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});
