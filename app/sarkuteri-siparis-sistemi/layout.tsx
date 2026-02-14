import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Şarküteri Sipariş Sistemi – WhatsApp Siparişlerini Düzenle',
  description: 'Şarküteriler için WhatsApp ve telefon siparişlerini tek ekranda yöneten pratik sipariş sistemi. 7 gün ücretsiz dene.',
  keywords: [
    'şarküteri sipariş sistemi',
    'şarküteri sipariş',
    'whatsapp şarküteri sipariş',
    'şarküteri sipariş alma',
    'komisyonsuz şarküteri sistemi',
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
    title: 'Şarküteri Sipariş Sistemi – WhatsApp Siparişlerini Düzenle',
    description: 'Şarküteriler için WhatsApp ve telefon siparişlerini tek ekranda yöneten pratik sipariş sistemi. 7 gün ücretsiz dene.',
    url: 'https://www.siparis-sistemi.com/sarkuteri-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Şarküteri Sipariş Sistemi – WhatsApp Siparişlerini Düzenle',
    description: 'Şarküteriler için WhatsApp ve telefon siparişlerini tek ekranda yöneten pratik sipariş sistemi.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/sarkuteri-siparis-sistemi',
  },
};

export default function SarkuteriSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
