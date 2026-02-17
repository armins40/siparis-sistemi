import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-url";
import { getSetting } from "@/lib/db/settings";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAOfflineBanner from "@/components/PWAOfflineBanner";
import PWALaunchRedirect from "@/components/PWALaunchRedirect";
import WhatsAppFloat from "@/components/WhatsAppFloat";

// Using system fonts instead of Google Fonts to avoid build-time network dependency
const fontVariable = "font-sans";

export const metadata: Metadata = {
  title: {
    default: "WhatsApp Sipariş Sistemi | Tekel, Manav, Market için Pratik Sipariş",
    template: "%s | Siparis"
  },
  description: "QR veya linkle dijital menü paylaşın; müşteri menüden seçer, adresini WhatsApp’tan gönderir. Sipariş listesi, konum kuryeye. Tekel, manav, market, kasap. 7 gün ücretsiz deneme.",
  keywords: ["whatsapp sipariş sistemi", "sipariş sistemi", "whatsapp sipariş", "tekel sipariş", "manav sipariş", "market sipariş", "pet shop sipariş", "online sipariş", "qr menü", "dijital menü", "esnaf sipariş sistemi"],
  authors: [{ name: "Siparis Sistemi" }],
  creator: "Siparis Sistemi",
  publisher: "Siparis Sistemi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: 'Siparis Sistemi',
    title: 'WhatsApp Sipariş Sistemi | Tekel, Manav, Market için Pratik Sipariş',
    description: 'WhatsApp sipariş sistemi ile siparişler tek ekranda. Karışıklık yok, 7 gün ücretsiz deneme.',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Siparis Sistemi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Sipariş Sistemi | Tekel, Manav, Market için Pratik Sipariş',
    description: 'WhatsApp sipariş sistemi ile siparişler tek ekranda. 7 gün ücretsiz deneme.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '3tKPr4gh7zknKchpFVyRqkzLrYw-vzv1FEKWPL8hSUE',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Sipariş',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#25D366',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <html lang="tr">
      <body className={`${fontVariable} antialiased`} style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <PWAOfflineBanner />
        <PWALaunchRedirect />
        {children}
        <PWAInstallPrompt />
        <WhatsAppFloat whatsappNumber={whatsappNumber} />
      </body>
    </html>
  );
}
