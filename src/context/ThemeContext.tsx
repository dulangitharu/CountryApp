import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'purple' | 'blue' | 'green' | 'black';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  lastSearch: string | null;
  setLastSearch: (search: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedDarkMode = sessionStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = sessionStorage.getItem('theme');
    return (savedTheme as Theme) || 'purple';
  });

  const [lastSearch, setLastSearch] = useState<string | null>(() => {
    return sessionStorage.getItem('lastSearch') || null;
  });

  useEffect(() => {
    sessionStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const updateLastSearch = (search: string) => {
    setLastSearch(search);
    sessionStorage.setItem('lastSearch', search);
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleDarkMode, theme, setTheme, lastSearch, setLastSearch: updateLastSearch }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};