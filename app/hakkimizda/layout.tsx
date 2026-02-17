import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'Hakkımızda | Sipariş Sistemi',
  description: 'Sipariş Sistemi hakkında bilgi edinin. Restoran, kafe ve işletmeler için bulut tabanlı dijital sipariş ve menü yönetim platformu.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Hakkımızda | Sipariş Sistemi',
    description: 'Restoran, kafe ve işletmeler için bulut tabanlı dijital sipariş ve menü yönetim platformu.',
    url: 'https://www.siparis-sistemi.com/hakkimizda',
    type: 'website',
  },
};

export default async function HakkimizdaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Hakkımızda"
        bannerSubtitle="Sipariş Sistemi – Dijital sipariş ve menü yönetim platformu"
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
