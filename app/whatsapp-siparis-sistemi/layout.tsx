import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Sipariş Sistemi – Komisyonsuz Online Sipariş Altyapısı',
  description: 'QR veya linkle dijital menü paylaşın; müşteri menüden seçer, adresini WhatsApp’tan gönderir. Sipariş listesi, konum kuryeye. Komisyonsuz, 7 gün ücretsiz.',
  keywords: [
    'whatsapp sipariş sistemi',
    'whatsapp ile sipariş alma',
    'esnaf whatsapp sipariş',
    'whatsapp sipariş alma sistemi',
    'küçük esnaf sipariş sistemi',
    'komisyonsuz sipariş sistemi',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'WhatsApp Sipariş Sistemi – Komisyonsuz Online Sipariş Altyapısı',
    description: 'QR veya linkle dijital menü paylaşın; müşteri menüden seçer, adresini WhatsApp’tan gönderir. Komisyonsuz, 7 gün ücretsiz.',
    url: 'https://www.siparis-sistemi.com/whatsapp-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Sipariş Sistemi – Komisyonsuz Online Sipariş Altyapısı',
    description: 'Dijital menü + WhatsApp sipariş. Müşteri menüden seçer, adresini gönderir; siz hazırlayıp konumu kuryeye yollarsınız.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/whatsapp-siparis-sistemi',
  },
};

export default function WhatsAppSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
