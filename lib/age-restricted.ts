/**
 * 18+ ürünler: alkollü içecekler, sigara/tütün.
 * Bu kategorilerdeki ürünlerin fotoğrafı gösterilmez; aynı ebatta +18 placeholder kullanılır.
 */
const CATEGORIES_18_PLUS = [
  'sigara',
  'biralar',
  'rakılar',
  'raki',
  'viskiler',
  'viski',
  'votkalar',
  'votka',
  'cinler',
  'cin',
  'tekilalar',
  'tekila',
  'tequila',
  'şampanya',
  'sampanya',
  'köpüklü',
  'kopuklu',
  'konyak',
  'likör',
  'likor',
  'rom',
  'romlar',
  'mezcal',
  'vermut',
  'aperitif',
  'bira',
  'rakı',
] as const;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function is18PlusProduct(p: { category?: string | null }): boolean {
  const cat = p.category ?? '';
  if (!cat) return false;
  const n = normalize(cat);
  return CATEGORIES_18_PLUS.some((c) => n.includes(c) || n === c);
}
