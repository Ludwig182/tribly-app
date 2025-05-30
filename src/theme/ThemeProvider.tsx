import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import adultTheme from './theme.adult';
import childTheme from './theme.child';
import teenTheme from './theme.teen';
import { Theme } from './theme.types';

const ThemeContext = createContext<Theme>(adultTheme);

export const useTheme = (): Theme => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { familyMember } = useAuth();
  const role = familyMember?.role as string | undefined;

  const theme = useMemo<Theme>(() => {
    if (role === 'child') return childTheme;
    if (role === 'teen') return teenTheme;
    return adultTheme;
  }, [role]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;
