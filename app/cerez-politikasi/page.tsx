import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'Siparis-Sistemi.com çerez kullanımı ve yönetimi politikası.',
};

export default function CerezPolitikasiPage() {
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
            Çerez Politikası
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com platformunda kullanılan çerezler ve yönetim seçenekleri hakkında bilgilendirme.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Çerez Nedir?</h2>
            <p>
              Çerezler, web sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük veri dosyalarıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Kullanılan Çerez Türleri</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Zorunlu Çerezler</h3>
                <p>Sitenin çalışması için gereklidir.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Performans Çerezleri</h3>
                <p>Site kullanım analizleri için kullanılır.</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Fonksiyonel Çerezler</h3>
                <p>Kullanıcı tercihlerini saklar.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Çerez Yönetimi</h2>
            <p>
              Kullanıcılar tarayıcı ayarlarından çerezleri devre dışı bırakabilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Üçüncü Taraf Çerezleri</h2>
            <p>
              Analiz ve performans araçları kullanılabilir.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
