import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tekel Sipariş Sistemi – WhatsApp ile Kolay Sipariş Al',
  description: 'Tekel bayileri için WhatsApp ve telefonla siparişleri tek ekranda toplayan komisyonsuz sipariş sistemi. 7 gün ücretsiz dene.',
  keywords: [
    'tekel sipariş sistemi',
    'tekel bayileri sipariş',
    'whatsapp tekel sipariş',
    'tekel sipariş alma sistemi',
    'komisyonsuz tekel sistemi',
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
    title: 'Tekel Sipariş Sistemi – WhatsApp ile Kolay Sipariş Al',
    description: 'Tekel bayileri için WhatsApp ve telefonla siparişleri tek ekranda toplayan komisyonsuz sipariş sistemi. 7 gün ücretsiz dene.',
    url: 'https://www.siparis-sistemi.com/tekel-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tekel Sipariş Sistemi – WhatsApp ile Kolay Sipariş Al',
    description: 'Tekel bayileri için WhatsApp ve telefonla siparişleri tek ekranda toplayan komisyonsuz sipariş sistemi.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/tekel-siparis-sistemi',
  },
};

export default function TekelSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
