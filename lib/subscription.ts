// Abonelik ve ödeme yönetimi

import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { Subscription, PaymentIntent, User } from './types';

const SUBSCRIPTIONS_KEY = 'siparis_subscriptions';
const PAYMENT_INTENTS_KEY = 'siparis_payment_intents';

function getSubscriptionsArray(): Subscription[] {
  return safeParseJSON<Subscription[]>(safeGetItem(SUBSCRIPTIONS_KEY), []);
}

function saveSubscriptionsArray(subscriptions: Subscription[]): boolean {
  return safeSetItem(SUBSCRIPTIONS_KEY, safeStringifyJSON(subscriptions) || '[]');
}

function getPaymentIntentsArray(): PaymentIntent[] {
  return safeParseJSON<PaymentIntent[]>(safeGetItem(PAYMENT_INTENTS_KEY), []);
}

function savePaymentIntentsArray(intents: PaymentIntent[]): boolean {
  return safeSetItem(PAYMENT_INTENTS_KEY, safeStringifyJSON(intents) || '[]');
}

// Plan fiyatları
export const PLAN_PRICES = {
  monthly: 299,
  '6month': 1590,
  yearly: 2490,
} as const;

// Plan süreleri (gün cinsinden)
export const PLAN_DURATIONS = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
} as const;

// Abonelik oluştur
export function createSubscription(
  userId: string,
  plan: 'monthly' | '6month' | 'yearly',
  paymentId?: string,
  paymentMethod?: string
): Subscription {
  const subscriptions = getSubscriptionsArray();
  
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + PLAN_DURATIONS[plan]);
  
  const newSubscription: Subscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    plan,
    amount: PLAN_PRICES[plan],
    status: 'active',
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    paymentMethod,
    paymentId,
    createdAt: new Date().toISOString(),
  };
  
  subscriptions.push(newSubscription);
  saveSubscriptionsArray(subscriptions);
  
  return newSubscription;
}

// Kullanıcının aktif aboneliğini getir
export function getActiveSubscription(userId: string): Subscription | null {
  const subscriptions = getSubscriptionsArray();
  const now = new Date();
  
  const active = subscriptions.find(sub => {
    if (sub.userId !== userId || sub.status !== 'active') return false;
    const endDate = new Date(sub.endDate);
    return endDate > now;
  });
  
  return active || null;
}

// Kullanıcının tüm aboneliklerini getir
export function getUserSubscriptions(userId: string): Subscription[] {
  const subscriptions = getSubscriptionsArray();
  return subscriptions
    .filter(sub => sub.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Abonelik iptal et
export function cancelSubscription(subscriptionId: string): boolean {
  const subscriptions = getSubscriptionsArray();
  const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
  
  if (index === -1) return false;
  
  subscriptions[index].status = 'cancelled';
  subscriptions[index].cancelledAt = new Date().toISOString();
  saveSubscriptionsArray(subscriptions);
  
  return true;
}

// Ödeme intent oluştur
export function createPaymentIntent(
  userId: string,
  plan: 'monthly' | '6month' | 'yearly'
): PaymentIntent {
  const intents = getPaymentIntentsArray();
  
  const newIntent: PaymentIntent = {
    id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    plan,
    amount: PLAN_PRICES[plan],
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  intents.push(newIntent);
  savePaymentIntentsArray(intents);
  
  return newIntent;
}

// Ödeme intent tamamla
export function completePaymentIntent(
  intentId: string,
  paymentMethod?: string
): PaymentIntent | null {
  const intents = getPaymentIntentsArray();
  const intent = intents.find(i => i.id === intentId);
  
  if (!intent) return null;
  
  intent.status = 'completed';
  intent.paymentMethod = paymentMethod;
  intent.completedAt = new Date().toISOString();
  
  savePaymentIntentsArray(intents);
  
  // Abonelik oluştur
  createSubscription(intent.userId, intent.plan, intentId, paymentMethod);
  
  return intent;
}

// Ödeme intent başarısız olarak işaretle
export function failPaymentIntent(intentId: string): boolean {
  const intents = getPaymentIntentsArray();
  const intent = intents.find(i => i.id === intentId);
  
  if (!intent) return false;
  
  intent.status = 'failed';
  savePaymentIntentsArray(intents);
  
  return true;
}
