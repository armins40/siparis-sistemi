'use client';

import {
  Shield,
  CreditCard,
  LockKeyhole,
  FileText,
  BadgePercent,
} from 'lucide-react';

const badges = [
  {
    id: 'ssl',
    icon: Shield,
    label: '256-Bit SSL Güvenli Ödeme',
  },
  {
    id: 'paytr',
    icon: CreditCard,
    label: 'PayTR Güvenli Ödeme Altyapısı',
  },
  {
    id: 'no-storage',
    icon: LockKeyhole,
    label: 'Kart bilgileriniz saklanmaz',
  },
  {
    id: 'e-fatura',
    icon: FileText,
    label: 'E-Fatura gönderilir',
  },
  {
    id: 'trial',
    icon: BadgePercent,
    label: '7 gün ücretsiz deneme',
  },
] as const;

export default function PaymentTrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {badges.map(({ id, icon: Icon, label }) => (
        <div
          key={id}
          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50/80 hover:bg-gray-100/80 hover:border-gray-300 transition-all duration-200"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      ))}
    </div>
  );
}
