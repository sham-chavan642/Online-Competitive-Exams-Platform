import React, { useEffect, useState } from 'react';
import ThemeContext from './ThemeContextValue';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => (
    window.localStorage.getItem('app-theme') === 'dark' ? 'dark' : 'light'
  ));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
