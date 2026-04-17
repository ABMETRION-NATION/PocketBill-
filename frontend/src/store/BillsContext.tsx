import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { advanceDate } from '../utils/date';
import { cancelReminder, scheduleBillReminder } from '../utils/notifications';

export type Recurrence = 'none' | 'weekly' | 'monthly' | 'custom';

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO
  recurrence: Recurrence;
  customDays?: number;
  notes?: string;
  paid: boolean;
  paidAt?: string | null;
  createdAt: string;
  reminderId?: string | null;
};

type BillsState = {
  bills: Bill[];
  ready: boolean;
};

type BillsCtx = BillsState & {
  addBill: (input: Omit<Bill, 'id' | 'createdAt' | 'paid' | 'paidAt' | 'reminderId'>) => Promise<Bill>;
  updateBill: (id: string, patch: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  getBill: (id: string) => Bill | undefined;
};

const STORAGE_KEY = '@pocketbill/bills/v1';
const SEED_FLAG_KEY = '@pocketbill/seeded/v1';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

const buildSeed = (): Bill[] => {
  const now = new Date();
  const mk = (dayOffset: number, h = 9) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(h, 0, 0, 0);
    return d.toISOString();
  };
  const createdAt = new Date().toISOString();
  return [
    {
      id: uid(),
      name: 'Electricity Bill',
      amount: 78.5,
      dueDate: mk(-2),
      recurrence: 'monthly',
      notes: 'Sample bill — feel free to delete.',
      paid: false,
      createdAt,
      reminderId: null,
    },
    {
      id: uid(),
      name: 'Internet Subscription',
      amount: 49.99,
      dueDate: mk(3),
      recurrence: 'monthly',
      notes: 'Sample bill — feel free to delete.',
      paid: false,
      createdAt,
      reminderId: null,
    },
    {
      id: uid(),
      name: 'Gym Membership',
      amount: 24.0,
      dueDate: mk(10),
      recurrence: 'monthly',
      notes: 'Sample bill — feel free to delete.',
      paid: false,
      createdAt,
      reminderId: null,
    },
    {
      id: uid(),
      name: 'Streaming (Netflix)',
      amount: 15.49,
      dueDate: mk(-15),
      recurrence: 'monthly',
      notes: 'Sample bill — feel free to delete.',
      paid: true,
      paidAt: mk(-15),
      createdAt,
      reminderId: null,
    },
  ];
};

const Ctx = createContext<BillsCtx | null>(null);

export const BillsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const seeded = await AsyncStorage.getItem(SEED_FLAG_KEY);
        if (raw) {
          setBills(JSON.parse(raw));
        } else if (!seeded) {
          const seed = buildSeed();
          setBills(seed);
          await AsyncStorage.setItem(SEED_FLAG_KEY, '1');
        }
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bills)).catch(() => {});
  }, [bills, ready]);

  const addBill: BillsCtx['addBill'] = useCallback(async (input) => {
    const id = uid();
    const newBill: Bill = {
      id,
      createdAt: new Date().toISOString(),
      paid: false,
      paidAt: null,
      reminderId: null,
      ...input,
    };
    const reminderId = await scheduleBillReminder(id, newBill.name, newBill.dueDate);
    newBill.reminderId = reminderId ?? null;
    setBills((list) => [newBill, ...list]);
    return newBill;
  }, []);

  const updateBill: BillsCtx['updateBill'] = useCallback(async (id, patch) => {
    let prev: Bill | undefined;
    setBills((list) => {
      prev = list.find((b) => b.id === id);
      return list.map((b) => (b.id === id ? { ...b, ...patch } : b));
    });
    if (prev && patch.dueDate && patch.dueDate !== prev.dueDate) {
      await cancelReminder(prev.reminderId ?? null);
      const reminderId = await scheduleBillReminder(id, patch.name ?? prev.name, patch.dueDate);
      setBills((list) => list.map((b) => (b.id === id ? { ...b, reminderId: reminderId ?? null } : b)));
    }
  }, []);

  const deleteBill: BillsCtx['deleteBill'] = useCallback(async (id) => {
    setBills((list) => {
      const target = list.find((b) => b.id === id);
      if (target?.reminderId) {
        cancelReminder(target.reminderId);
      }
      return list.filter((b) => b.id !== id);
    });
  }, []);

  const togglePaid: BillsCtx['togglePaid'] = useCallback(async (id) => {
    let toSchedule: { id: string; name: string; dueDate: string } | null = null;
    setBills((list) =>
      list.map((b) => {
        if (b.id !== id) return b;
        if (!b.paid) {
          if (b.recurrence !== 'none') {
            const nextDue = advanceDate(b.dueDate, b.recurrence, b.customDays);
            if (b.reminderId) cancelReminder(b.reminderId);
            toSchedule = { id: b.id, name: b.name, dueDate: nextDue };
            return { ...b, dueDate: nextDue, paid: false, paidAt: new Date().toISOString(), reminderId: null };
          }
          return { ...b, paid: true, paidAt: new Date().toISOString() };
        }
        return { ...b, paid: false, paidAt: null };
      })
    );
    if (toSchedule) {
      const rid = await scheduleBillReminder(toSchedule.id, toSchedule.name, toSchedule.dueDate);
      setBills((list) => list.map((b) => (b.id === toSchedule!.id ? { ...b, reminderId: rid ?? null } : b)));
    }
  }, []);

  const getBill = useCallback((id: string) => bills.find((b) => b.id === id), [bills]);

  const value = useMemo<BillsCtx>(
    () => ({ bills, ready, addBill, updateBill, deleteBill, togglePaid, getBill }),
    [bills, ready, addBill, updateBill, deleteBill, togglePaid, getBill]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useBills = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useBills must be inside BillsProvider');
  return ctx;
};
