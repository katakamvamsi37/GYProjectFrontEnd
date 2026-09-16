import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('gy_theme');
      return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  });
  const [systemDark, setSystemDark] = useState(
    () => matchMedia('(prefers-color-scheme: dark)').matches,
  );
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const change = (event) => setSystemDark(event.matches);
    media.addEventListener('change', change);
    const sync = (event) => {
      if (event.key === 'gy_theme')
        setTheme(['light', 'dark'].includes(event.newValue) ? event.newValue : 'system');
    };
    window.addEventListener('storage', sync);
    return () => {
      media.removeEventListener('change', change);
      window.removeEventListener('storage', sync);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolvedTheme === 'dark' ? '#0F172A' : '#F8FAFC');
    try {
      localStorage.setItem('gy_theme', theme);
    } catch {
      /* Appearance still works without storage. */
    }
  }, [theme, resolvedTheme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
