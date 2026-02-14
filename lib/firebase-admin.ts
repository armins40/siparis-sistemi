import type { Messaging } from 'firebase-admin/messaging';

let defaultMessaging: Messaging | null = null;

function getAdminMessaging(): Messaging | null {
  if (typeof window !== 'undefined') return null;
  if (defaultMessaging) return defaultMessaging;
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw || typeof raw !== 'string') return null;
    const serviceAccount = JSON.parse(raw) as Record<string, string>;
    const { getApps, initializeApp, cert } = require('firebase-admin/app');
    const { getMessaging } = require('firebase-admin/messaging');
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount) });
    }
    defaultMessaging = getMessaging();
    return defaultMessaging;
  } catch (e) {
    console.warn('Firebase Admin init failed:', e);
    return null;
  }
}

export async function sendPushToUser(
  tokens: string[],
  title: string,
  body: string,
  url: string
): Promise<{ successCount: number; failureCount: number }> {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };
  const messaging = getAdminMessaging();
  if (!messaging) return { successCount: 0, failureCount: tokens.length };
  try {
    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: { url },
      webpush: {
        fcmOptions: { link: url },
      },
    });
    return { successCount: result.successCount, failureCount: result.failureCount };
  } catch (e) {
    console.error('sendPushToUser:', e);
    return { successCount: 0, failureCount: tokens.length };
  }
}
