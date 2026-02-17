import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'İletişim | Siparis Sistemi',
  description: 'Siparis Sistemi ile iletişime geçin. Sorularınız için bize ulaşın. E-posta: destek@siparis-sistemi.com',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'İletişim | Siparis Sistemi',
    description: 'Siparis Sistemi ile iletişime geçin. Sorularınız için bize ulaşın.',
    url: 'https://www.siparis-sistemi.com/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'İletişim | Siparis Sistemi',
    description: 'Siparis Sistemi ile iletişime geçin.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/contact',
  },
};

export default async function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="İletişim"
        bannerSubtitle="Sorularınız için bize ulaşın"
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
