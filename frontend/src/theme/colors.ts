export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentActive: string;
  onAccent: string;
  overdue: string;
  overdueBg: string;
  paid: string;
  paidBg: string;
  upcoming: string;
  upcomingBg: string;
};

export const lightPalette: Palette = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F4F5',
  textPrimary: '#09090B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  border: '#E4E4E7',
  accent: '#4338CA',
  accentActive: '#3730A3',
  onAccent: '#FFFFFF',
  overdue: '#E11D48',
  overdueBg: '#FFE4E6',
  paid: '#059669',
  paidBg: '#D1FAE5',
  upcoming: '#D97706',
  upcomingBg: '#FEF3C7',
};

export const darkPalette: Palette = {
  background: '#09090B',
  surface: '#18181B',
  surfaceAlt: '#27272A',
  textPrimary: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  border: '#27272A',
  accent: '#6366F1',
  accentActive: '#4F46E5',
  onAccent: '#FFFFFF',
  overdue: '#F43F5E',
  overdueBg: '#4C0519',
  paid: '#34D399',
  paidBg: '#064E3B',
  upcoming: '#FBBF24',
  upcomingBg: '#78350F',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
