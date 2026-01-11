// 7 Popular Canva-style color themes
import type { Theme } from './types';

export const themes: Theme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Mavi',
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#60a5fa',
    background: '#f8fafc',
    text: '#1e293b',
    card: '#ffffff',
  },
  {
    id: 'warm-orange',
    name: 'Sıcak Turuncu',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: '#fff7ed',
    text: '#431407',
    card: '#ffffff',
  },
  {
    id: 'elegant-purple',
    name: 'Şık Mor',
    primary: '#9333ea',
    secondary: '#7e22ce',
    accent: '#c084fc',
    background: '#faf5ff',
    text: '#3b0764',
    card: '#ffffff',
  },
  {
    id: 'fresh-green',
    name: 'Taze Yeşil',
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
    background: '#f0fdf4',
    text: '#14532d',
    card: '#ffffff',
  },
  {
    id: 'sunset-pink',
    name: 'Günbatımı Pembe',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    background: '#fdf2f8',
    text: '#831843',
    card: '#ffffff',
  },
  {
    id: 'classic-black',
    name: 'Klasik Siyah',
    primary: '#171717',
    secondary: '#000000',
    accent: '#525252',
    background: '#fafafa',
    text: '#171717',
    card: '#ffffff',
  },
  {
    id: 'ocean-teal',
    name: 'Okyanus Turkuaz',
    primary: '#14b8a6',
    secondary: '#0d9488',
    accent: '#5eead4',
    background: '#f0fdfa',
    text: '#134e4a',
    card: '#ffffff',
  },
];

export function getTheme(themeId?: string): Theme {
  if (!themeId) return themes[0];
  const theme = themes.find((t) => t.id === themeId);
  return theme || themes[0];
}
