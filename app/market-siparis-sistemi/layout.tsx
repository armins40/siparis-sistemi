import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Market Sipariş Sistemi – WhatsApp ve Telefon Siparişleri Tek Yerde',
  description: 'Marketler için WhatsApp ve telefonla gelen siparişleri tek ekranda toplayan pratik sipariş sistemi. 7 gün ücretsiz.',
  keywords: [
    'market sipariş sistemi',
    'market sipariş',
    'whatsapp market sipariş',
    'market sipariş alma',
    'komisyonsuz market sistemi',
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
    title: 'Market Sipariş Sistemi – WhatsApp ve Telefon Siparişleri Tek Yerde',
    description: 'Marketler için WhatsApp ve telefonla gelen siparişleri tek ekranda toplayan pratik sipariş sistemi. 7 gün ücretsiz.',
    url: 'https://www.siparis-sistemi.com/market-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Sipariş Sistemi – WhatsApp ve Telefon Siparişleri Tek Yerde',
    description: 'Marketler için WhatsApp ve telefonla gelen siparişleri tek ekranda toplayan pratik sipariş sistemi.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/market-siparis-sistemi',
  },
};

export default function MarketSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
