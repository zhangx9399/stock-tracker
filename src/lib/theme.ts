import { themes } from './themes';

export function applyTheme(themeName: string) {
  const theme = themes[themeName] || themes.default;
  const root = document.documentElement;
  root.style.setProperty('--accent-h', String(theme.h));
  root.style.setProperty('--accent-s', `${theme.s}%`);
  root.style.setProperty('--accent-l', `${theme.l}%`);
}
