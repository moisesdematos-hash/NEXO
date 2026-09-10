import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  isSimpleMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleSimpleMode: () => void;
  setSimpleMode: (simple: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexo-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [isSimpleMode, setIsSimpleModeState] = useState<boolean>(() => {
    return localStorage.getItem('nexo-simple-mode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nexo-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isSimpleMode) {
      root.classList.add('simple-mode');
    } else {
      root.classList.remove('simple-mode');
    }
    localStorage.setItem('nexo-simple-mode', String(isSimpleMode));
  }, [isSimpleMode]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSimpleMode = () => {
    setIsSimpleModeState((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isSimpleMode,
        toggleTheme,
        setTheme: setThemeState,
        toggleSimpleMode,
        setSimpleMode: setIsSimpleModeState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
