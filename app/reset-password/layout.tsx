import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'Şifre Sıfırlama',
  robots: { index: false, follow: false },
};

export default async function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Şifre Sıfırlama"
        bannerSubtitle="Yeni şifrenizi belirleyin"
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
