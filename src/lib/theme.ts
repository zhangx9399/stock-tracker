import { themes } from './themes';

export function applyTheme(themeName: string, customHsl?: { h: number; s: number; l: number }) {
  const root = document.documentElement;

  if (themeName === 'custom' && customHsl) {
    root.style.setProperty('--accent-h', String(customHsl.h));
    root.style.setProperty('--accent-s', `${customHsl.s}%`);
    root.style.setProperty('--accent-l', `${customHsl.l}%`);
    return;
  }

  const theme = themes[themeName] || themes.default;
  root.style.setProperty('--accent-h', String(theme.h));
  root.style.setProperty('--accent-s', `${theme.s}%`);
  root.style.setProperty('--accent-l', `${theme.l}%`);
}
