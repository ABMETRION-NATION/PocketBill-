import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, Palette } from './colors';
import { useSettings } from '../store/SettingsContext';

type ThemeValue = {
  palette: Palette;
  mode: 'light' | 'dark';
  isDark: boolean;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme();
  const { themeMode } = useSettings();

  const mode: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') return system === 'dark' ? 'dark' : 'light';
    return themeMode;
  }, [themeMode, system]);

  const value = useMemo<ThemeValue>(
    () => ({
      palette: mode === 'dark' ? darkPalette : lightPalette,
      mode,
      isDark: mode === 'dark',
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
};
