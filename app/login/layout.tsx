import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'Giriş Yap',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Giriş Yap"
        bannerSubtitle="Dashboard'a erişmek için giriş yapın"
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
