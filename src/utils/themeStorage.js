const THEME_KEY = "democrazy_theme";

/** @returns {"dark"|"light"} */
export function getStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark") return raw;
  } catch {
    /* ignore */
  }
  return "dark";
}

/** @param {"dark"|"light"} theme */
export function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.theme = theme;
}

/** Init from storage; default dark. */
export function initThemeDocument() {
  const t = getStoredTheme();
  document.documentElement.dataset.theme = t;
  return t;
}
