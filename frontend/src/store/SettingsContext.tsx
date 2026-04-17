import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Currency = 'USD' | 'INR' | 'EUR';
export type ThemeMode = 'system' | 'light' | 'dark';

export const CURRENCY_META: Record<Currency, { symbol: string; label: string }> = {
  USD: { symbol: '$', label: 'US Dollar ($)' },
  INR: { symbol: '₹', label: 'Indian Rupee (₹)' },
  EUR: { symbol: '€', label: 'Euro (€)' },
};

type SettingsState = {
  currency: Currency;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
};

type SettingsCtx = SettingsState & {
  setCurrency: (c: Currency) => void;
  setThemeMode: (m: ThemeMode) => void;
  setNotificationsEnabled: (v: boolean) => void;
  symbol: string;
  formatAmount: (n: number) => string;
  ready: boolean;
};

const STORAGE_KEY = '@pocketbill/settings/v1';

const defaultState: SettingsState = {
  currency: 'USD',
  themeMode: 'system',
  notificationsEnabled: true,
};

const Ctx = createContext<SettingsCtx | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SettingsState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<SettingsCtx>(() => {
    const symbol = CURRENCY_META[state.currency].symbol;
    return {
      ...state,
      ready,
      symbol,
      setCurrency: (c) => setState((s) => ({ ...s, currency: c })),
      setThemeMode: (m) => setState((s) => ({ ...s, themeMode: m })),
      setNotificationsEnabled: (v) => setState((s) => ({ ...s, notificationsEnabled: v })),
      formatAmount: (n: number) => {
        const abs = Math.abs(n);
        const str = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `${n < 0 ? '-' : ''}${symbol}${str}`;
      },
    };
  }, [state, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be inside SettingsProvider');
  return ctx;
};
