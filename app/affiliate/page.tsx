'use client';

import Link from 'next/link';

export default function AffiliateLandingPage() {
  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sipariş Sistemi Satış Ortaklığı Programı
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          İşletmeler için sipariş sistemini tanıtın, her satıştan komisyon kazanın.
          YouTuber, içerik üreticisi veya topluluk yöneticisiyseniz programa katılın.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-2">📊</div>
            <h2 className="font-semibold text-gray-900 mb-1">Yıllık paket %20</h2>
            <p className="text-gray-600 text-sm">Yıllık abonelik satışında KDV sonrası tutar üzerinden %20 komisyon.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-2">📅</div>
            <h2 className="font-semibold text-gray-900 mb-1">Aylık paket %10</h2>
            <p className="text-gray-600 text-sm">Aylık abonelik satışında KDV sonrası tutar üzerinden %10 komisyon.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-2xl mb-2">🔄</div>
            <h2 className="font-semibold text-gray-900 mb-1">Yenilemelerden de kazanç</h2>
            <p className="text-gray-600 text-sm">Davet ettiğiniz müşteriler yeniledikçe komisyon almaya devam edersiniz.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-6">
            Kendi davet linkinizi alın, paylaşın. Müşteri kayıt olup ödeme yaptığında komisyonunuz hesaplanır.
          </p>
          <Link
            href="/affiliate/kayit"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800"
          >
            Ücretsiz katıl
          </Link>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Zaten hesabınız var mı?{' '}
          <Link href="/affiliate/giris" className="text-gray-900 font-medium underline">
            Giriş yapın
          </Link>
        </p>
    </main>
  );
}
