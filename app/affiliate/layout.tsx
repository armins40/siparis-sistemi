import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export default async function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="Satış Ortaklığı Programı"
        bannerSubtitle="İşletmeler için sipariş sistemini tanıtın, her satıştan komisyon kazanın."
        whatsappNumber={whatsappNumber}
      />
      {children}
    </div>
  );
}
