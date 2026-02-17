import Link from 'next/link';
import type { Metadata } from 'next';
import { getSetting } from '@/lib/db/settings';

export const metadata: Metadata = {
  title: 'Hizmet Sözleşmesi',
  description: 'Siparis-Sistemi.com bulut tabanlı sipariş yönetim hizmeti kullanım koşulları ve hizmet sözleşmesi.',
};

export default async function HizmetSozlesmesiPage() {
  const yearlyPrice = await getSetting('yearly_price') || '2490';
  const monthlyPrice = await getSetting('monthly_plan_price') || '599';

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
            Hizmet Sözleşmesi
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com platformu üzerinden sunulan hizmetlere ilişkin kullanım koşulları ve tarafların hak ve yükümlülükleri aşağıda belirtilmiştir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Taraflar</h2>
            <p className="mb-4">
              İşbu Hizmet Sözleşmesi;
            </p>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">ABA Yazılım</p>
              <p>Şirket Türü: Şahıs Şirketi</p>
              <p>Vergi Dairesi: Kırşehir</p>
              <p>Vergi No: 1670425470</p>
              <p>Adres: Kırşehir Merkez</p>
              <p className="mt-2 text-sm text-gray-600">(Bundan sonra &quot;Hizmet Sağlayıcı&quot; olarak anılacaktır)</p>
            </div>
            <p>
              ile <strong>www.siparis-sistemi.com</strong> platformuna kayıt olan kullanıcı (bundan sonra &quot;Kullanıcı&quot; olarak anılacaktır) arasında elektronik ortamda kurulmuştur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Hizmet Tanımı</h2>
            <p>
              Siparis-sistemi.com; işletmelerin ürünlerini listeleyebileceği, sipariş alabileceği ve WhatsApp entegrasyonu ile sipariş yönetimi yapabileceği bulut tabanlı yazılım hizmetidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Üyelik ve Kullanım</h2>
            <p className="mb-2">Kullanıcı:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kayıt sırasında doğru bilgi vermekle yükümlüdür</li>
              <li>Hesap güvenliğinden sorumludur</li>
              <li>Hizmeti hukuka aykırı amaçlarla kullanamaz</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Ücretlendirme</h2>
            <p className="mb-4">Platform abonelik modeli ile çalışır.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Aylık abonelik ücreti: {monthlyPrice} TL + KDV</li>
              <li>Yıllık abonelik ücreti: {yearlyPrice} TL + KDV</li>
              <li>Hizmet 7 gün ücretsiz deneme ile sunulmaktadır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Deneme Süresi</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcı 7 gün boyunca sistemi ücretsiz deneyebilir.</li>
              <li>Deneme süresi sonunda abonelik başlatılır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. İade Politikası</h2>
            <p>
              Deneme süresi içerisinde iptal edilmediği takdirde: Ödeme sonrası ücret iadesi yapılmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Abonelik İptali</h2>
            <p className="mb-4">Kullanıcı aboneliğini istediği zaman iptal edebilir.</p>
            <p className="mb-2">İptal sonrası:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sistem kullanımı sona erer</li>
              <li>Kullanıcı verileri makul süre saklanabilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Hizmetin Askıya Alınması</h2>
            <p className="mb-4">Hizmet sağlayıcı; aşağıdaki hallerde hizmeti askıya alma hakkına sahiptir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hukuka aykırı kullanım</li>
              <li>Ödeme yapılmaması</li>
              <li>Sistem güvenliğini tehdit eden durumlar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Affiliate Sistemi</h2>
            <p className="mb-4">Platform, kullanıcı yönlendirme ve satış ortaklığı sistemi sunabilir.</p>
            <p className="mb-2">Affiliate kullanıcılar:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kendi yönlendirdikleri müşteriler üzerinden komisyon kazanabilir</li>
              <li>Komisyon şartları platform panelinde belirtilir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Sorumluluk Reddi</h2>
            <p className="mb-2">Siparis-sistemi.com:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcıların ürün içeriklerinden sorumlu değildir</li>
              <li>Kullanıcı ile müşterileri arasındaki ticari ilişkilerden sorumlu değildir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Yetkili Mahkeme</h2>
            <p>
              İşbu sözleşmeden doğabilecek uyuşmazlıklarda Kırşehir Mahkemeleri yetkilidir.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
