// Admin utilities and storage

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { User, Coupon, Order, SalesAnalytics } from './types';

const ADMIN_STORAGE_KEY = 'siparis_admin_auth';
const USERS_STORAGE_KEY = 'siparis_users';
const COUPONS_STORAGE_KEY = 'siparis_coupons';
const ORDERS_STORAGE_KEY = 'siparis_orders';

// Admin Authentication
export function setAdminAuth(isAuthenticated: boolean): boolean {
  return safeSetItem(ADMIN_STORAGE_KEY, JSON.stringify({ authenticated: isAuthenticated, timestamp: Date.now() }));
}

export function isAdminAuthenticated(): boolean {
  const auth = safeParseJSON<{ authenticated: boolean; timestamp: number }>(safeGetItem(ADMIN_STORAGE_KEY), { authenticated: false, timestamp: 0 });
  
  // 24 saatlik session kontrolü
  const sessionTimeout = 24 * 60 * 60 * 1000; // 24 saat
  if (auth.authenticated && Date.now() - auth.timestamp > sessionTimeout) {
    setAdminAuth(false);
    return false;
  }
  
  return auth.authenticated;
}

export function adminLogin(username: string, password: string): boolean {
  if (username === 'arasbeydoğan' && password === 'ab58kprs3C') {
    setAdminAuth(true);
    return true;
  }
  return false;
}

export function adminLogout(): void {
  setAdminAuth(false);
}

// Users Management
function getUsersArray(): User[] {
  return safeParseJSON<User[]>(safeGetItem(USERS_STORAGE_KEY), []);
}

function saveUsersArray(users: User[]): boolean {
  return safeSetItem(USERS_STORAGE_KEY, safeStringifyJSON(users) || '[]');
}

export function getAllUsers(): User[] {
  return getUsersArray();
}

export function getUserById(id: string): User | null {
  const users = getUsersArray();
  return users.find(u => u.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const users = getUsersArray();
  const normalizedEmail = email.trim().toLowerCase();
  return users.find(u => u.email?.trim().toLowerCase() === normalizedEmail) || null;
}

export function getUserByPhone(phone: string): User | null {
  const users = getUsersArray();
  const normalizedPhone = phone.trim();
  return users.find(u => u.phone?.trim() === normalizedPhone) || null;
}

export function getUserByStoreSlug(storeSlug: string): User | null {
  const users = getUsersArray();
  const normalizedSlug = storeSlug.trim().toLowerCase();
  return users.find(u => u.storeSlug?.trim().toLowerCase() === normalizedSlug) || null;
}

export function createUser(user: Omit<User, 'id' | 'createdAt'>): User {
  const users = getUsersArray();
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsersArray(users);
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): boolean {
  const users = getUsersArray();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return false;
  users[index] = { ...users[index], ...updates };
  saveUsersArray(users);
  return true;
}

export function deleteUser(id: string): boolean {
  const users = getUsersArray();
  const filtered = users.filter(u => u.id !== id);
  if (filtered.length === users.length) return false;
  saveUsersArray(filtered);
  return true;
}

// Coupons Management
function getCouponsArray(): Coupon[] {
  return safeParseJSON<Coupon[]>(safeGetItem(COUPONS_STORAGE_KEY), []);
}

function saveCouponsArray(coupons: Coupon[]): boolean {
  return safeSetItem(COUPONS_STORAGE_KEY, safeStringifyJSON(coupons) || '[]');
}

export function getAllCoupons(): Coupon[] {
  return getCouponsArray();
}

export function getCouponByCode(code: string): Coupon | null {
  const coupons = getCouponsArray();
  return coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
}

export function createCoupon(coupon: Omit<Coupon, 'id' | 'usageCount' | 'createdAt'>): Coupon {
  const coupons = getCouponsArray();
  const newCoupon: Coupon = {
    ...coupon,
    id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    usageCount: 0,
    createdAt: new Date().toISOString(),
  };
  coupons.push(newCoupon);
  saveCouponsArray(coupons);
  return newCoupon;
}

export function updateCoupon(id: string, updates: Partial<Coupon>): boolean {
  const coupons = getCouponsArray();
  const index = coupons.findIndex(c => c.id === id);
  if (index === -1) return false;
  coupons[index] = { ...coupons[index], ...updates };
  saveCouponsArray(coupons);
  return true;
}

export function deleteCoupon(id: string): boolean {
  const coupons = getCouponsArray();
  const filtered = coupons.filter(c => c.id !== id);
  if (filtered.length === coupons.length) return false;
  saveCouponsArray(filtered);
  return true;
}

// Orders Management
function getOrdersArray(): Order[] {
  return safeParseJSON<Order[]>(safeGetItem(ORDERS_STORAGE_KEY), []);
}

function saveOrdersArray(orders: Order[]): boolean {
  return safeSetItem(ORDERS_STORAGE_KEY, safeStringifyJSON(orders) || '[]');
}

export function getAllOrders(): Order[] {
  return getOrdersArray();
}

export function getOrdersByUserId(userId: string): Order[] {
  const orders = getOrdersArray();
  return orders.filter(o => o.userId === userId);
}

export function getOrdersByStoreSlug(storeSlug: string): Order[] {
  const orders = getOrdersArray();
  return orders.filter(o => o.storeSlug === storeSlug);
}

export function createOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
  const orders = getOrdersArray();
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  orders.push(newOrder);
  saveOrdersArray(orders);
  
  // Kupon kullanıldıysa usage count artır
  if (order.couponCode) {
    const coupon = getCouponByCode(order.couponCode);
    if (coupon) {
      updateCoupon(coupon.id, { usageCount: coupon.usageCount + 1 });
    }
  }
  
  return newOrder;
}

export function updateOrder(id: string, updates: Partial<Order>): boolean {
  const orders = getOrdersArray();
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return false;
  orders[index] = { ...orders[index], ...updates };
  if (updates.status === 'completed' && !orders[index].completedAt) {
    orders[index].completedAt = new Date().toISOString();
  }
  saveOrdersArray(orders);
  return true;
}

// Analytics
export function getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly'): SalesAnalytics {
  const orders = getOrdersArray();
  const completedOrders = orders.filter(o => o.status === 'completed');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.finalTotal, 0);
  const totalOrders = completedOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Tarihe göre grupla
  const dataMap = new Map<string, { revenue: number; orders: number }>();
  
  completedOrders.forEach(order => {
    const date = new Date(order.createdAt);
    let key: string;
    
    if (period === 'daily') {
      key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (period === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Haftanın başlangıcı
      key = weekStart.toISOString().split('T')[0];
    } else { // monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }
    
    const existing = dataMap.get(key) || { revenue: 0, orders: 0 };
    dataMap.set(key, {
      revenue: existing.revenue + order.finalTotal,
      orders: existing.orders + 1,
    });
  });
  
  const data = Array.from(dataMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    period,
    data,
  };
}
