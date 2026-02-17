import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'Kayıt Ol',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Kayıt Ol"
        bannerSubtitle="7 gün ücretsiz deneyin. Kart bilgisi istemiyoruz."
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
