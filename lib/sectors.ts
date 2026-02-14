// Sektör yönetimi ve sabitler

import type { Sector } from './types';

export const SECTORS: { value: Sector; label: string; icon: string }[] = [
  { value: 'kasap', label: 'Kasap', icon: '🥩' },
  { value: 'sarkuteri', label: 'Şarküteri', icon: '🧀' },
  { value: 'tekel', label: 'Tekel', icon: '🥃' },
  { value: 'manav', label: 'Manav', icon: '🍎' },
  { value: 'market', label: 'Market', icon: '🛒' },
  { value: 'tatlici-pastane', label: 'Tatlıcı & Pastane', icon: '🍰' },
  { value: 'petshop', label: 'Petshop', icon: '🐶' },
  { value: 'kafe-restoran', label: 'Kafe & Küçük Restoranlar', icon: '☕' },
];

export function getSectorLabel(sector?: Sector | 'all'): string {
  if (!sector) return 'Belirtilmemiş';
  if (sector === 'all') return 'Tüm Sektörler';
  const found = SECTORS.find(s => s.value === sector);
  return found ? found.label : sector;
}

export function getSectorIcon(sector?: Sector | 'all'): string {
  if (!sector) return '🏪';
  if (sector === 'all') return '🌐';
  const found = SECTORS.find(s => s.value === sector);
  return found ? found.icon : '🏪';
}
