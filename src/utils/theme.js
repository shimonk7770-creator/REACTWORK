// שולט במצב לילה — נשמר בתוך reactwork-settings.theme ('light' | 'dark').
// בלי בחירה מפורשת, ברירת המחדל היא prefers-color-scheme של המערכת.
export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

export function loadTheme() {
  const settings = JSON.parse(localStorage.getItem('reactwork-settings') || '{}');
  if (settings.theme) return settings.theme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
