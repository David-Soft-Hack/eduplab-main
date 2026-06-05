import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { md3LightTokens, md3DarkTokens, allTokenKeys, type Md3TokenKey } from './tokens';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function injectTokens(mode: 'light' | 'dark') {
  const tokens = mode === 'light' ? md3LightTokens : md3DarkTokens;
  const root = document.documentElement;
  for (const key of allTokenKeys) {
    root.style.setProperty(`--md-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, tokens[key]);
  }
  root.classList.toggle('dark', mode === 'dark');
}

const STORAGE_KEY = 'md3-theme-mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  });

  useEffect(() => {
    injectTokens(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleTheme = () => setMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useMd3Theme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useMd3Theme must be used within ThemeProvider');
  return ctx;
}
