export function getStoredTheme() {
  try { return localStorage.getItem('pv_theme') || 'system' } catch (e) { return 'system' }
}

export function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  try { localStorage.setItem('pv_theme', theme) } catch (e) {}
}