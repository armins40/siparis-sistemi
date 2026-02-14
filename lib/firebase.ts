'use client';

import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;
  const config = getConfig();
  if (!config.apiKey || !config.projectId) return null;
  if (getApps().length > 0) {
    return getApps()[0] as FirebaseApp;
  }
  app = initializeApp(config);
  return app;
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  if (messaging) return messaging;
  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const perm = await requestNotificationPermission();
  if (perm !== 'granted') return null;
  const ms = getFirebaseMessaging();
  if (!ms || !VAPID_KEY) return null;
  try {
    const token = await getToken(ms, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (e) {
    console.warn('FCM getToken failed:', e);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: unknown) => void): (() => void) | null {
  const ms = getFirebaseMessaging();
  if (!ms) return null;
  return onMessage(ms, callback);
}

export function isFirebaseConfigured(): boolean {
  const config = getConfig();
  return !!(
    config.apiKey &&
    config.projectId &&
    config.messagingSenderId &&
    VAPID_KEY
  );
}
