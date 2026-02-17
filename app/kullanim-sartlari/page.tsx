import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Şartları',
  description: 'Siparis-Sistemi.com platform kullanım şartları ve koşulları.',
};

export default function KullanimSartlariPage() {
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
            Kullanım Şartları
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com platformunu kullanmadan önce aşağıdaki şartları okumanız ve kabul etmeniz gerekmektedir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Hizmet Tanımı</h2>
            <p>
              Siparis-sistemi.com, işletmeler için bulut tabanlı sipariş ve ürün yönetim yazılımıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Kullanıcı Yükümlülükleri</h2>
            <p className="mb-4">Kullanıcı:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Doğru bilgi vermek zorundadır</li>
              <li>Hesap güvenliğini sağlamakla sorumludur</li>
              <li>Hukuka aykırı içerik paylaşamaz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Yasaklı Kullanımlar</h2>
            <p className="mb-4">Platform üzerinden aşağıdakiler yasaktır:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sahte ürün satışı</li>
              <li>Dolandırıcılık</li>
              <li>Telif ihlali</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Hizmet Değişikliği</h2>
            <p>
              Hizmet sağlayıcı, platform özelliklerini değiştirme hakkına sahiptir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Sorumluluk Sınırı</h2>
            <p>
              Siparis-sistemi.com; kullanıcı ile müşteri arasındaki ticari işlemlerden sorumlu değildir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Hesap Askıya Alma</h2>
            <p className="mb-4">Aşağıdaki durumlarda hesap askıya alınabilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ödeme yapılmaması</li>
              <li>Kural ihlali</li>
              <li>Güvenlik riski</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
