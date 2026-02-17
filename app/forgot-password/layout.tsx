import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export const metadata: Metadata = {
  title: 'Şifremi Unuttum',
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Şifremi Unuttum"
        bannerSubtitle="E-posta adresinize şifre sıfırlama linki gönderelim"
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
