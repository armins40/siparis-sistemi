import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi',
  description: 'Siparis-Sistemi.com mesafeli satış sözleşmesi ve tüketici bilgilendirmesi.',
};

export default function MesafeliSatisSozlesmesiPage() {
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
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-gray-600">
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Konu</h2>
            <p>
              Bu sözleşme, siparis-sistemi.com üzerinden satın alınan dijital hizmet aboneliğini kapsar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Hizmet Bilgisi</h2>
            <p>
              Satın alınan hizmet: Bulut tabanlı sipariş yönetim yazılımıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Ödeme</h2>
            <p>
              Ödemeler PayTR altyapısı üzerinden alınmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Hizmet Teslimi</h2>
            <p>
              Hizmet, ödeme tamamlandıktan sonra kullanıcı hesabına otomatik olarak tanımlanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cayma Hakkı</h2>
            <p className="mb-4">Dijital hizmetlerde:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hizmet kullanımı başladığında cayma hakkı sona erer.</li>
              <li>Ancak kullanıcıya 7 gün ücretsiz deneme süresi sunulmaktadır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. İptal</h2>
            <p>
              Kullanıcı aboneliğini panel üzerinden iptal edebilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Uyuşmazlık</h2>
            <p>
              Uyuşmazlıklarda Kırşehir Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
