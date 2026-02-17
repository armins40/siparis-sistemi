import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate (Satış Ortaklığı) Sözleşmesi',
  description: 'Siparis-Sistemi.com affiliate programı ve satış ortaklığı şartları.',
};

export default function AffiliateSozlesmesiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-block text-orange-600 hover:text-orange-700 font-medium mb-8"
        >
          ← Ana sayfaya dön
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Affiliate (Satış Ortaklığı) Sözleşmesi
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com affiliate programına katılmadan önce aşağıdaki sözleşme şartlarını okumanız ve kabul etmeniz gerekmektedir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Tanım</h2>
            <p>
              Affiliate sistemi, kullanıcıların siparis-sistemi.com platformuna yeni müşteri yönlendirerek komisyon kazanmasını sağlar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Katılım</h2>
            <p>
              Affiliate olmak için kullanıcı panelinden başvuru yapılabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Komisyon Kazancı</h2>
            <p className="mb-4">Affiliate kullanıcı:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Yönlendirdiği müşteriler üzerinden komisyon kazanır</li>
              <li>Komisyon oranları panelde belirtilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Ödeme Şartları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Minimum ödeme tutarı: 1000 TL</li>
              <li>Ödeme periyodu: 5 gün</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Yasaklı Davranışlar</h2>
            <p className="mb-4">Affiliate kullanıcı:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sahte üyelik oluşturamaz</li>
              <li>Spam reklam yapamaz</li>
              <li>Yanıltıcı bilgi veremez</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Komisyon İptali</h2>
            <p className="mb-4">Aşağıdaki durumlarda komisyon iptal edilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sahte satış</li>
              <li>İade edilen abonelik</li>
              <li>Kural ihlali</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Sözleşme Feshi</h2>
            <p>
              Hizmet sağlayıcı, affiliate hesabını sonlandırabilir.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
