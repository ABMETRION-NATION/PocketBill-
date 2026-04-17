export const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const daysBetween = (a: Date, b: Date) => {
  const MS = 1000 * 60 * 60 * 24;
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS);
};

export const isOverdue = (dueISO: string, paid: boolean) => {
  if (paid) return false;
  return daysBetween(new Date(), new Date(dueISO)) < 0;
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelative = (iso: string) => {
  const diff = daysBetween(new Date(), new Date(iso));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  if (diff < 7) return `In ${diff} days`;
  return formatDate(iso);
};

export const advanceDate = (iso: string, recurrence: 'weekly' | 'monthly' | 'custom', customDays?: number) => {
  const d = new Date(iso);
  if (recurrence === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurrence === 'monthly') d.setMonth(d.getMonth() + 1);
  else if (recurrence === 'custom' && customDays && customDays > 0) d.setDate(d.getDate() + customDays);
  return d.toISOString();
};

export const isSameMonth = (isoA: string, isoB: string) => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
};
