// Kullanıcı authentication ve session yönetimi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import { getUserByEmail, getUserByPhone, getUserById } from './admin';
import { getUserByIdFromDB } from './db/users';
import { getActiveSubscription } from './subscription';
import type { User } from './types';

const CURRENT_USER_KEY = 'siparis_current_user';

// Mevcut kullanıcıyı getir (async - önce database, sonra localStorage)
export async function getCurrentUserAsync(): Promise<User | null> {
  const userId = safeGetItem(CURRENT_USER_KEY);
  if (!userId) return null;
  
  // Önce database'den dene
  try {
    const userFromDB = await getUserByIdFromDB(userId);
    if (userFromDB) {
      return userFromDB;
    }
  } catch (error) {
    console.warn('Database user fetch failed, falling back to localStorage:', error);
  }
  
  // Database'de bulunamadıysa localStorage'dan oku
  return getUserById(userId);
}

// Mevcut kullanıcıyı getir (sync - sadece localStorage, geriye dönük uyumluluk için)
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

// Email/telefon + şifre ile giriş (async - önce database, sonra localStorage)
export async function userLoginAsync(emailOrPhone: string, password: string, type: 'email' | 'phone'): Promise<User | null> {
  // Normalize et
  const normalizedEmailOrPhone = type === 'email' 
    ? emailOrPhone.trim().toLowerCase() 
    : emailOrPhone.trim();
  
  let user: User | null = null;
  
  // Önce database'den dene
  try {
    if (type === 'email') {
      const { getUserByEmailFromDB } = await import('./db/users');
      user = await getUserByEmailFromDB(normalizedEmailOrPhone);
    } else {
      const { getUserByPhoneFromDB } = await import('./db/users');
      user = await getUserByPhoneFromDB(normalizedEmailOrPhone);
    }
  } catch (error) {
    console.warn('Database user fetch failed, falling back to localStorage:', error);
  }
  
  // Database'de bulunamadıysa localStorage'dan oku
  if (!user) {
    if (type === 'email') {
      user = getUserByEmail(normalizedEmailOrPhone);
    } else {
      user = getUserByPhone(normalizedEmailOrPhone);
    }
  }
  
  if (!user) {
    console.log('❌ User not found:', { type, normalizedEmailOrPhone });
    return null;
  }
  
  console.log('✅ User found:', { 
    id: user.id, 
    email: user.email, 
    phone: user.phone, 
    hasPassword: !!user.password,
    isActive: user.isActive 
  });
  
  // Şifre kontrolü
  if (user.password && user.password !== password) {
    console.log('❌ Password mismatch');
    return null; // Şifre yanlış
  }
  
  // Şifresi olmayan kullanıcılar için (eski kayıtlar)
  if (!user.password) {
    console.log('❌ User has no password');
    return null; // Şifre gerekli
  }
  
  if (user.isActive) {
    setCurrentUser(user.id);
    console.log('✅ Login successful');
    return user;
  }
  
  console.log('❌ User not active');
  return null;
}

// Email/telefon + şifre ile giriş (sync - sadece localStorage, geriye dönük uyumluluk için)
export function userLogin(emailOrPhone: string, password: string, type: 'email' | 'phone'): User | null {
  // Normalize et
  const normalizedEmailOrPhone = type === 'email' 
    ? emailOrPhone.trim().toLowerCase() 
    : emailOrPhone.trim();
  
  let user: User | null = null;
  
  if (type === 'email') {
    user = getUserByEmail(normalizedEmailOrPhone);
  } else {
    user = getUserByPhone(normalizedEmailOrPhone);
  }
  
  if (!user) {
    console.log('❌ User not found:', { type, normalizedEmailOrPhone });
    return null;
  }
  
  console.log('✅ User found:', { 
    id: user.id, 
    email: user.email, 
    phone: user.phone, 
    hasPassword: !!user.password,
    isActive: user.isActive 
  });
  
  // Şifre kontrolü
  if (user.password && user.password !== password) {
    console.log('❌ Password mismatch');
    return null; // Şifre yanlış
  }
  
  // Şifresi olmayan kullanıcılar için (eski kayıtlar)
  if (!user.password) {
    console.log('❌ User has no password');
    return null; // Şifre gerekli
  }
  
  if (user.isActive) {
    setCurrentUser(user.id);
    console.log('✅ Login successful');
    return user;
  }
  
  console.log('❌ User not active');
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
