// Kullanıcı authentication ve session yönetimi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import { getUserByEmail, getUserByPhone, getUserById } from './admin';
import { getActiveSubscription } from './subscription';
import type { User } from './types';

const CURRENT_USER_KEY = 'siparis_current_user';

// Mevcut kullanıcıyı getir
export function getCurrentUser(): User | null {
  const userId = safeGetItem(CURRENT_USER_KEY);
  if (!userId) return null;
  
  return getUserById(userId);
}

// Kullanıcıyı oturuma kaydet
export function setCurrentUser(userId: string): boolean {
  return safeSetItem(CURRENT_USER_KEY, userId);
}

// Oturumu kapat
export function logout(): void {
  safeSetItem(CURRENT_USER_KEY, '');
}

// Email/telefon ile giriş (şifresiz - eski metod, geriye dönük uyumluluk için)
export function loginWithEmailOrPhone(emailOrPhone: string, type: 'email' | 'phone'): User | null {
  let user: User | null = null;
  
  if (type === 'email') {
    user = getUserByEmail(emailOrPhone);
  } else {
    user = getUserByPhone(emailOrPhone);
  }
  
  if (user && user.isActive && !user.password) {
    // Şifresi olmayan kullanıcılar için (eski kayıtlar)
    setCurrentUser(user.id);
    return user;
  }
  
  return null;
}

// Email/telefon + şifre ile giriş
export function userLogin(emailOrPhone: string, password: string, type: 'email' | 'phone'): User | null {
  let user: User | null = null;
  
  if (type === 'email') {
    user = getUserByEmail(emailOrPhone);
  } else {
    user = getUserByPhone(emailOrPhone);
  }
  
  if (!user) {
    return null;
  }
  
  // Şifre kontrolü
  if (user.password && user.password !== password) {
    return null; // Şifre yanlış
  }
  
  // Şifresi olmayan kullanıcılar için (eski kayıtlar)
  if (!user.password) {
    return null; // Şifre gerekli
  }
  
  if (user.isActive) {
    setCurrentUser(user.id);
    return user;
  }
  
  return null;
}

// Kullanıcının abonelik durumunu kontrol et
export function checkUserSubscription(userId: string): {
  hasActiveSubscription: boolean;
  subscription: ReturnType<typeof getActiveSubscription> | null;
  daysRemaining: number;
} {
  const subscription = getActiveSubscription(userId);
  
  if (!subscription) {
    return {
      hasActiveSubscription: false,
      subscription: null,
      daysRemaining: 0,
    };
  }
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    hasActiveSubscription: daysRemaining > 0,
    subscription,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

// Kullanıcının aktif aboneliği var mı?
export function hasActiveSubscription(userId: string): boolean {
  const subscription = getActiveSubscription(userId);
  if (!subscription) return false;
  
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  return endDate > now;
}
