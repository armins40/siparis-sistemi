// Store settings management
import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { Store } from './types';

const STORE_KEY = 'siparisStore';
const THEME_KEY = 'siparisTheme';

export function getStore(): Store | null {
  const stored = safeGetItem(STORE_KEY);
  return safeParseJSON<Store | null>(stored, null);
}

export function clearStore(): void {
  safeSetItem(STORE_KEY, '');
}

export function saveStore(store: Store): boolean {
  const json = safeStringifyJSON(store);
  if (!json) return false;
  return safeSetItem(STORE_KEY, json);
}

export function getThemeId(): string {
  const stored = safeGetItem(THEME_KEY);
  return stored || 'modern-blue';
}

export function saveThemeId(themeId: string): boolean {
  return safeSetItem(THEME_KEY, themeId);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Turkish character conversion
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    // Replace spaces and special chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}
