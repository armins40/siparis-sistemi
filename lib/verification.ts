// Email/Telefon doğrulama sistemi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { VerificationCode } from './types';

const VERIFICATION_CODES_KEY = 'siparis_verification_codes';

// In-memory storage (server-side için)
// Not: Server restart'ta kaybolur, ama API route'ları için gerekli
let inMemoryCodes: VerificationCode[] = [];

// Hybrid storage: Client-side'da localStorage, server-side'da in-memory
export function getVerificationCodesArray(): VerificationCode[] {
  // Server-side'da in-memory kullan
  if (typeof window === 'undefined') {
    return inMemoryCodes;
  }
  
  // Client-side'da localStorage kullan
  return safeParseJSON<VerificationCode[]>(safeGetItem(VERIFICATION_CODES_KEY), []);
}

function saveVerificationCodesArray(codes: VerificationCode[]): boolean {
  // Server-side'da in-memory kullan
  if (typeof window === 'undefined') {
    inMemoryCodes = codes;
    return true;
  }
  
  // Client-side'da localStorage kullan
  return safeSetItem(VERIFICATION_CODES_KEY, safeStringifyJSON(codes) || '[]');
}

// Email/Phone normalize et (küçük harfe çevir, trim yap)
function normalizeEmailOrPhone(value: string, type: 'email' | 'phone'): string {
  const trimmed = value.trim();
  return type === 'email' ? trimmed.toLowerCase() : trimmed;
}

// Doğrulama kodu oluştur
export function createVerificationCode(emailOrPhone: string, type: 'email' | 'phone'): VerificationCode {
  const codes = getVerificationCodesArray();
  
  // Email/Phone'u normalize et
  const normalized = normalizeEmailOrPhone(emailOrPhone, type);
  
  // Eski kodları temizle (expired olanlar)
  const now = Date.now();
  const validCodes = codes.filter(code => {
    const expiresAt = new Date(code.expiresAt).getTime();
    return expiresAt > now && !code.verified;
  });
  
  // 6 haneli rastgele kod oluştur
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 12 dakika geçerlilik (12 * 60 * 1000 = 720000 ms)
  const expiresAt = new Date(now + 12 * 60 * 1000);
  
  const verificationCode: VerificationCode = {
    id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    [type]: normalized,
    code,
    type,
    expiresAt: expiresAt.toISOString(),
    verified: false,
    createdAt: new Date().toISOString(),
  };
  
  validCodes.push(verificationCode);
  saveVerificationCodesArray(validCodes);
  
  return verificationCode;
}

// Doğrulama kodu kontrol et
export function verifyCode(emailOrPhone: string, code: string, type: 'email' | 'phone'): boolean {
  const codes = getVerificationCodesArray();
  const now = Date.now();
  
  // Email/Phone'u normalize et
  const normalized = normalizeEmailOrPhone(emailOrPhone, type);
  
  // Kodu normalize et (sadece rakamlar)
  const normalizedCode = code.trim();
  
  const foundCode = codes.find(c => {
    const codeValue = c[type];
    if (!codeValue) return false;
    
    const matchesType = c.type === type;
    const matchesEmailOrPhone = type === 'email' 
      ? codeValue.toLowerCase() === normalized
      : codeValue === normalized;
    const matchesCode = c.code === normalizedCode;
    const notExpired = new Date(c.expiresAt).getTime() > now;
    const notVerified = !c.verified;
    
    return matchesType && matchesEmailOrPhone && matchesCode && notExpired && notVerified;
  });
  
  if (foundCode) {
    // Kodu doğrulandı olarak işaretle
    foundCode.verified = true;
    saveVerificationCodesArray(codes);
    return true;
  }
  
  return false;
}

// En son gönderilen kodu al
export function getLatestCode(emailOrPhone: string, type: 'email' | 'phone'): VerificationCode | null {
  const codes = getVerificationCodesArray();
  const now = Date.now();
  
  // Email/Phone'u normalize et
  const normalized = normalizeEmailOrPhone(emailOrPhone, type);
  
  const validCodes = codes
    .filter(c => {
      const codeValue = c[type];
      if (!codeValue) return false;
      
      const matchesType = c.type === type;
      const matchesEmailOrPhone = type === 'email' 
        ? codeValue.toLowerCase() === normalized
        : codeValue === normalized;
      const notExpired = new Date(c.expiresAt).getTime() > now;
      return matchesType && matchesEmailOrPhone && notExpired;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return validCodes.length > 0 ? validCodes[0] : null;
}

// Email/Telefon doğrulanmış mı kontrol et
export function isEmailOrPhoneVerified(emailOrPhone: string, type: 'email' | 'phone'): boolean {
  const codes = getVerificationCodesArray();
  const normalized = normalizeEmailOrPhone(emailOrPhone, type);
  
  return codes.some(c => {
    const codeValue = c[type];
    if (!codeValue) return false;
    
    const matchesType = c.type === type;
    const matchesEmailOrPhone = type === 'email' 
      ? codeValue.toLowerCase() === normalized
      : codeValue === normalized;
    
    return matchesType && matchesEmailOrPhone && c.verified;
  });
}
