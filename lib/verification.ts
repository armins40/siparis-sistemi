// Email/Telefon doğrulama sistemi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { VerificationCode } from './types';

const VERIFICATION_CODES_KEY = 'siparis_verification_codes';

function getVerificationCodesArray(): VerificationCode[] {
  return safeParseJSON<VerificationCode[]>(safeGetItem(VERIFICATION_CODES_KEY), []);
}

function saveVerificationCodesArray(codes: VerificationCode[]): boolean {
  return safeSetItem(VERIFICATION_CODES_KEY, safeStringifyJSON(codes) || '[]');
}

// Doğrulama kodu oluştur
export function createVerificationCode(emailOrPhone: string, type: 'email' | 'phone'): VerificationCode {
  const codes = getVerificationCodesArray();
  
  // Eski kodları temizle (expired olanlar)
  const now = Date.now();
  const validCodes = codes.filter(code => {
    const expiresAt = new Date(code.expiresAt).getTime();
    return expiresAt > now && !code.verified;
  });
  
  // 6 haneli rastgele kod oluştur
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 12 dakika geçerlilik
  const expiresAt = new Date(now + 12 * 60 * 1000);
  
  const verificationCode: VerificationCode = {
    id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    [type]: emailOrPhone,
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
  
  const foundCode = codes.find(c => {
    const matchesType = c.type === type && c[type] === emailOrPhone;
    const matchesCode = c.code === code;
    const notExpired = new Date(c.expiresAt).getTime() > now;
    const notVerified = !c.verified;
    
    return matchesType && matchesCode && notExpired && notVerified;
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
  
  const validCodes = codes
    .filter(c => {
      const matchesType = c.type === type && c[type] === emailOrPhone;
      const notExpired = new Date(c.expiresAt).getTime() > now;
      return matchesType && notExpired;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return validCodes.length > 0 ? validCodes[0] : null;
}

// Email/Telefon doğrulanmış mı kontrol et
export function isEmailOrPhoneVerified(emailOrPhone: string, type: 'email' | 'phone'): boolean {
  const codes = getVerificationCodesArray();
  return codes.some(
    c => c.type === type && c[type] === emailOrPhone && c.verified
  );
}
