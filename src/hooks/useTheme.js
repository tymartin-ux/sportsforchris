import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#ffffff', dark: '#0b0b0c' };
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set();

function savedTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  } catch {
    return null;
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  listeners.forEach((listener) => listener());
}

// Follow the device setting until the user picks a theme themselves
systemDark.addEventListener('change', (e) => {
  if (!savedTheme()) applyTheme(e.matches ? 'dark' : 'light');
});

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing: the choice just won't be remembered
  }
  applyTheme(theme);
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme);
}
