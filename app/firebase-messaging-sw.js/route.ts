import { NextResponse } from 'next/server';

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  };
  const body = `/* eslint-disable no-restricted-globals */
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.2/firebase-messaging-compat.js');

var firebaseConfig = ${JSON.stringify(config)};
try {
  firebase.initializeApp(firebaseConfig);
  var messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (payload) {
    var title = payload.notification && payload.notification.title ? payload.notification.title : 'Yeni Sipariş Geldi!';
    var body = payload.notification && payload.notification.body ? payload.notification.body : 'Yeni siparişiniz var.';
    var url = (payload.data && payload.data.url) ? payload.data.url : '/dashboard';
    var options = {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'order-' + Date.now(),
      data: { url: url },
      requireInteraction: false,
    };
    return self.registration.showNotification(title, options);
  });
  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    var url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/dashboard';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          if (clientList[i].url && 'focus' in clientList[i]) {
            clientList[i].navigate(url);
            return clientList[i].focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
} catch (e) {
  console.error('firebase-messaging-sw init error', e);
}
`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
