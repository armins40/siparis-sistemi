// Input validation utilities

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validate Turkish phone number
 * Format: 05XX XXX XX XX or +90 5XX XXX XX XX
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check Turkish phone format
  // 05XX... (10 digits) or +905XX... (13 digits) or 905XX... (12 digits)
  const phoneRegex = /^(\+90|90|0)?5\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Şifre gerekli' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Şifre en az 6 karakter olmalıdır' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Şifre çok uzun (maksimum 128 karakter)' };
  }
  
  return { valid: true };
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, maxLength);
  
  return sanitized;
}

/**
 * Validate store slug
 */
export function isValidStoreSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Mağaza adı gerekli' };
  }
  
  const trimmed = slug.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Mağaza adı en az 3 karakter olmalıdır' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Mağaza adı çok uzun (maksimum 50 karakter)' };
  }
  
  // Only allow alphanumeric, dash, and underscore
  const slugRegex = /^[a-z0-9_-]+$/;
  if (!slugRegex.test(trimmed.toLowerCase())) {
    return { valid: false, error: 'Mağaza adı sadece harf, rakam, tire ve alt çizgi içerebilir' };
  }
  
  return { valid: true };
}

/**
 * Validate price
 */
export function isValidPrice(price: number | string): { valid: boolean; error?: string; value?: number } {
  if (price === null || price === undefined) {
    return { valid: false, error: 'Fiyat gerekli' };
  }
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return { valid: false, error: 'Geçersiz fiyat formatı' };
  }
  
  if (numPrice < 0) {
    return { valid: false, error: 'Fiyat negatif olamaz' };
  }
  
  if (numPrice > 1000000) {
    return { valid: false, error: 'Fiyat çok yüksek (maksimum 1.000.000 TL)' };
  }
  
  return { valid: true, value: numPrice };
}

/**
 * Validate product name
 */
export function isValidProductName(name: string): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Ürün adı gerekli' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 1) {
    return { valid: false, error: 'Ürün adı gerekli' };
  }
  
  if (trimmed.length > 200) {
    return { valid: false, error: 'Ürün adı çok uzun (maksimum 200 karakter)' };
  }
  
  return { valid: true };
}

/**
 * Validate category name
 */
export function isValidCategoryName(category: string): { valid: boolean; error?: string } {
  if (!category || typeof category !== 'string') {
    return { valid: false, error: 'Kategori adı gerekli' };
  }
  
  const trimmed = category.trim();
  
  if (trimmed.length < 1) {
    return { valid: false, error: 'Kategori adı gerekli' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Kategori adı çok uzun (maksimum 100 karakter)' };
  }
  
  return { valid: true };
}
