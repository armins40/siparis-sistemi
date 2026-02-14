import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kasap Sipariş Sistemi – Telefon ve WhatsApp Siparişleri Düzenli',
  description: 'Kasaplar için WhatsApp ve telefon siparişlerini karışmadan yöneten sipariş sistemi. Komisyon yok, 7 gün ücretsiz.',
  keywords: [
    'kasap sipariş sistemi',
    'kasap sipariş',
    'whatsapp kasap sipariş',
    'kasap sipariş alma',
    'komisyonsuz kasap sistemi',
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
    title: 'Kasap Sipariş Sistemi – Telefon ve WhatsApp Siparişleri Düzenli',
    description: 'Kasaplar için WhatsApp ve telefon siparişlerini karışmadan yöneten sipariş sistemi. Komisyon yok, 7 gün ücretsiz.',
    url: 'https://www.siparis-sistemi.com/kasap-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kasap Sipariş Sistemi – Telefon ve WhatsApp Siparişleri Düzenli',
    description: 'Kasaplar için WhatsApp ve telefon siparişlerini karışmadan yöneten sipariş sistemi.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/kasap-siparis-sistemi',
  },
};

export default function KasapSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
