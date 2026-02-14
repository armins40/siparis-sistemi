// Kullanıcı authentication ve session yönetimi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import { getUserByEmail, getUserByPhone, getUserById, updateUser, createUser, getAllUsers, deleteUser } from './admin';
import { getActiveSubscription } from './subscription';
import { clearStore } from './store';
import type { User } from './types';

const CURRENT_USER_KEY = 'siparis_current_user';

// Mevcut kullanıcıyı getir (async - önce API'den DB, yoksa localStorage)
// Admin plan güncellemeleri (hediye 1 aylık vb.) DB'de; dashboard bunu API'den almalı.
export async function getCurrentUserAsync(): Promise<User | null> {
  const userId = safeGetItem(CURRENT_USER_KEY);
  if (!userId) return null;

  if (typeof window === 'undefined') return getUserById(userId);

  try {
    const res = await fetch(`/api/auth/me?userId=${encodeURIComponent(userId)}`);
    const data = await res.json();
    if (data.success && data.user) {
      const apiUser = data.user as User;
      const existing = getUserById(userId);
      if (existing) {
        updateUser(userId, apiUser);
      } else {
        const users = getAllUsers();
        users.push(apiUser);
        safeSetItem('siparis_users', safeStringifyJSON(users) || '[]');
      }
      return apiUser;
    }
    // 404 = kullanıcı yok (admin silmiş) — localStorage + oturum temizle
    if (res.status === 404) {
      deleteUser(userId);
      safeSetItem(CURRENT_USER_KEY, '');
      return null;
    }
  } catch (e) {
    console.warn('getCurrentUserAsync: API failed, using localStorage', e);
  }

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
  console.log('🔐 Setting current user:', userId);
  const result = safeSetItem(CURRENT_USER_KEY, userId);
  console.log('✅ Current user set:', result);
  return result;
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

export type LoginResult = { user: User | null; error?: 'not_active' | 'not_found' | 'invalid_password' };

// Email/telefon + şifre ile giriş (async - önce API route, sonra localStorage)
export async function userLoginAsync(emailOrPhone: string, password: string, type: 'email' | 'phone'): Promise<LoginResult> {
  const normalizedEmailOrPhone = type === 'email' 
    ? emailOrPhone.trim().toLowerCase() 
    : emailOrPhone.trim();
  
  console.log('🔐 Login attempt:', { type, normalizedEmailOrPhone, passwordLength: password.length });
  
  let user: User | null = null;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: normalizedEmailOrPhone, password, type }),
    });

    const result = await response.json();

    if (result.success && result.user) {
      const apiUser = result.user as User;
      user = apiUser;
      if (apiUser.isActive) {
        try {
          const existingUser = getUserById(apiUser.id);
          if (existingUser) updateUser(apiUser.id, apiUser);
          else {
            const users = getAllUsers();
            users.push(apiUser);
            safeSetItem('siparis_users', safeStringifyJSON(users) || '[]');
          }
        } catch (e) {
          console.error('localStorage update:', e);
        }
        clearStore();
        setCurrentUser(apiUser.id);
        return { user: apiUser };
      }
      return { user: null, error: 'not_active' };
    }

    if (response.status === 403 || (result.error && String(result.error).toLowerCase().includes('not active'))) {
      return { user: null, error: 'not_active' };
    }
    if (response.status === 404) {
      return { user: null, error: 'not_found' };
    }
    if (response.status === 401) {
      return { user: null, error: 'invalid_password' };
    }
    console.log('❌ Login failed from API:', result.error);
  } catch (e) {
    console.warn('API login failed, falling back to localStorage:', e);
  }
  
  const local = type === 'email' ? getUserByEmail(normalizedEmailOrPhone) : getUserByPhone(normalizedEmailOrPhone);
  if (!local) return { user: null, error: 'not_found' };
  if (!local.password || local.password !== password) return { user: null, error: 'invalid_password' };
  if (!local.isActive) return { user: null, error: 'not_active' };
  clearStore();
  setCurrentUser(local.id);
  return { user: local };
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
