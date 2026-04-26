const shared = {
  radius: {
    sm: 14,
    md: 18,
    lg: 24,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
  },
};

const dark = {
  background: '#0B1220',
  surface: '#111827',
  elevated: '#172033',
  card: '#111827',
  text: '#EAF2FF',
  muted: '#8AA0C5',
  accent: '#3B82F6',
  accentSoft: '#1D4ED8',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  border: 'rgba(255,255,255,0.08)',
  chip: 'rgba(59,130,246,0.14)',
  overlay: 'rgba(15,23,42,0.88)',
};

const light = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  elevated: '#EEF3FF',
  card: '#FFFFFF',
  text: '#102033',
  muted: '#5C6F8E',
  accent: '#2563EB',
  accentSoft: '#60A5FA',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  border: 'rgba(16,32,51,0.10)',
  chip: 'rgba(37,99,235,0.12)',
  overlay: 'rgba(246,248,252,0.92)',
};

export const themes = {
  dark: {
    mode: 'dark',
    colors: dark,
    ...shared,
  },
  light: {
    mode: 'light',
    colors: light,
    ...shared,
  },
};

export const theme = themes.dark;

export const resolveTheme = isDarkMode => (isDarkMode ? themes.dark : themes.light);
