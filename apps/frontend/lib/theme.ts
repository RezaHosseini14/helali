export const THEME_STORAGE_KEY = 'helali-theme';

/** Legacy key from older builds — still read once for migration. */
export const LEGACY_DARK_MODE_KEY = 'darkMode';

export type ThemeMode = 'light' | 'dark';

export const DEFAULT_THEME: ThemeMode = 'light';

/**
 * Blocking script — runs before first paint to prevent light/dark flash.
 * Must stay in sync with THEME_STORAGE_KEY / LEGACY_DARK_MODE_KEY.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var legacy=${JSON.stringify(LEGACY_DARK_MODE_KEY)};var t=localStorage.getItem(k);if(t!=='light'&&t!=='dark'){var old=localStorage.getItem(legacy);t=old==='true'?'dark':'light';}var r=document.documentElement;r.classList.remove('light','dark');r.classList.add(t==='dark'?'dark':'light');r.style.colorScheme=t==='dark'?'dark':'light';r.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.classList.add('light');}})();`;
