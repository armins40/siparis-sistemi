import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İade ve İptal Politikası',
  description: 'Siparis-Sistemi.com iade, iptal ve deneme süresi koşulları.',
};

export default function IadeIptalPage() {
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
            İade ve İptal Politikası
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com platformunda sunulan abonelik hizmetine ilişkin iade, iptal ve deneme süresi koşulları aşağıda açıklanmaktadır.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Deneme Süresi</h2>
            <p>
              Platform 7 gün ücretsiz deneme sunar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. İade Koşulları</h2>
            <p className="mb-4">Deneme süresi sona erdikten sonra:</p>
            <p>
              Satın alınan abonelikler için ücret iadesi yapılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Abonelik İptali</h2>
            <p className="mb-4">Kullanıcı:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>İstediği zaman aboneliğini iptal edebilir</li>
              <li>İptal sonrası sistem erişimi sona erer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Teknik Sorunlar</h2>
            <p>
              Hizmet kaynaklı büyük teknik sorunlarda: Hizmet sağlayıcı telafi hakkını saklı tutar.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
