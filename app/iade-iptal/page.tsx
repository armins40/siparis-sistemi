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
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Genel Bilgi ve Hizmet Türü</h2>
            <p className="mb-4">
              Siparis-Sistemi.com, bulut tabanlı bir <strong>SaaS (Hizmet Olarak Yazılım)</strong> sipariş yönetim hizmeti sunmaktadır. Hizmet, aylık veya yıllık abonelik modeli ile sunulur. Fiziksel ürün satışı yapılmadığı için, bu politika yalnızca <strong>dijital hizmet aboneliği</strong> ile ilgili iade ve iptal kurallarını kapsar.
            </p>
            <p>
              Bu politika, Türkiye Cumhuriyeti mevzuatı (6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği) çerçevesinde hazırlanmıştır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 7 Gün Ücretsiz Deneme</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platforma yeni kayıt olan kullanıcılara <strong>7 (yedi) gün ücretsiz deneme</strong> hakkı tanınmaktadır.</li>
              <li>Deneme süresi boyunca tam sürüm özellikleri (sipariş yönetimi, dijital menü, WhatsApp entegrasyonu vb.) kullanılabilir; kredi kartı veya ödeme bilgisi talep edilmeden deneme başlatılır.</li>
              <li>Deneme süresi, kayıt tarihinden itibaren 7 gün olarak hesaplanır. Bu süre içinde kullanıcı herhangi bir ücret ödemez.</li>
              <li><strong>Deneme süresi sonrası ücret iadesi yapılmaz.</strong> Çünkü deneme döneminde herhangi bir ödeme alınmamaktadır; iade ancak ödeme yapılmış abonelik dönemleri için söz konusu olabilir. Abonelik satın alındıktan sonra ise aşağıdaki dijital hizmet cayma istisnası nedeniyle cayma/iade hakkı uygulanmaz.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Abonelik Satın Alma Sonrası – Cayma Hakkı ve İade</h2>
            <p className="mb-4">
              <strong>6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği md. 15/ğ uyarınca:</strong> Tüketicinin, onayından önce kendisine bilgi verilen veya <strong>onayı ile ifa edilmeye başlanan elektronik ortamda anında tüketiciye sunulan gayrimaddi mallara (dijital içerik ve hizmetlere)</strong> ilişkin sözleşmelerde, <strong>cayma hakkı kullanılamaz</strong>.
            </p>
            <p className="mb-4">
              Siparis-Sistemi.com hizmeti, ödeme sonrası <strong>anında elektronik ortamda erişime açılan bir dijital SaaS hizmeti</strong> olduğu için bu kapsamdadır. Bu nedenle:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Abonelik satın alındıktan (ödeme yapıldıktan) sonra <strong>cayma hakkı bulunmamaktadır</strong>.</li>
              <li>Bu nedenle ödenen aylık veya yıllık abonelik bedeli için <strong>iade yapılmamaktadır</strong>.</li>
              <li>Kullanıcı, satın alma/ödeme ekranında bu durumun kendisine <strong>açıkça bildirildiğini</strong> ve <strong>onay vererek</strong> işlemi gerçekleştirdiğini kabul eder.</li>
            </ul>
            <p>
              <strong>Tüketici Olmayan (B2B) Kullanıcılar:</strong> Ticari amaçlı kullanıcılar için de aynı hükümler geçerlidir; cayma/iade hakkı bulunmamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Abonelik İptali ve Kullanım Hakkı</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcı, aboneliğini dilediği zaman <strong>iptal edebilir</strong>. İptal, platform içi hesap/abonelik ayarlarından veya destek kanalı üzerinden yapılabilir.</li>
              <li><strong>İptal edilse bile, ödenen abonelik dönemi sonuna kadar kullanım hakkı devam eder.</strong> Örneğin yıllık plan satın alındıysa ve 3. ayda iptal edildiyse, 12. ayın sonuna kadar hizmet kullanılabilir; bu süre için kısmi iade yapılmaz.</li>
              <li>İptal sonrası dönem bitiminde hesap erişimi sınırlandırılır veya kapatılır. Veri dışa aktarma süresi platformda veya e-posta ile duyurulabilir.</li>
              <li>İptal işlemi geri alınamaz; yeni dönem için yeniden abonelik satın alınması gerekir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Teknik Arıza ve Hizmet Aksaklıkları</h2>
            <p className="mb-4">
              Hizmetin sunumunda teknik arıza, kesinti veya performans sorunu yaşanması halinde:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Platform, <strong>teknik arıza durumlarında çözüm sunmayı</strong> taahhüt eder. Sorun, destek kanalları ([İletişim e-posta adresi] veya platform içi destek) üzerinden bildirildiğinde makul sürede müdahale ve giderim için çalışılır.</li>
              <li><strong>Planlı bakım:</strong> Platform, planlı bakım ve güncellemeler için hizmeti geçici olarak durdurabilir. Planlı kesintiler mümkün olduğunca önceden duyurulur.</li>
              <li><strong>Platform kaynaklı kesintiler:</strong> Platform kaynaklı, makul süreyi aşan ve hizmeti kullanılamaz hale getiren kesintilerde, Platform tek taraflı olarak <strong>hizmet süresi uzatması</strong> veya <strong>kısmi kredi</strong> gibi çözümler sunmayı değerlendirebilir. Bu, yasal zorunluluk değil; Platform’un iyi niyetli uygulamasıdır.</li>
              <li><strong>Üçüncü taraf kaynaklı kesintiler:</strong> Aşağıdaki durumlar Platform’un doğrudan kontrolü dışındadır ve sorumluluğunda değildir:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>WhatsApp / Meta servis kesintileri, API değişiklikleri veya hizmet sonlandırmaları</li>
                  <li>Ödeme kuruluşları (PayTR vb.) kaynaklı sorunlar, gecikmeler veya işlem redleri</li>
                  <li>İnternet servis sağlayıcıları, elektrik kesintileri, doğal afetler</li>
                  <li>Bulut altyapı sağlayıcıları kaynaklı teknik sorunlar</li>
                  <li>Kullanıcı cihazı, yazılım veya internet bağlantısı sorunları</li>
                </ul>
              </li>
            </ul>
            <p>
              <strong>Zorunlu Kuvvet (Force Majeure):</strong> Doğal afet, savaş, salgın, hükümet kararı vb. zorunlu kuvvet hallerinde Platform’un sorumluluğu kalkar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. İptal ve İade Talebi Nasıl Yapılır?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Abonelik iptali:</strong> Platform içi hesap/abonelik ayarlarından veya [İletişim e-posta adresi] üzerinden talepte bulunulabilir.</li>
              <li><strong>İade talepleri:</strong> Yasal çerçevede cayma hakkı olmadığı için ödeme sonrası &quot;iade&quot; talepleri kabul edilmez. Ancak teknik arıza veya hizmet sunulamaması gibi olağanüstü durumlarda Platform ile iletişime geçilebilir; Platform, durumu değerlendirerek iyi niyetli çözüm sunabilir.</li>
              <li><strong>Şikâyet ve uyuşmazlık:</strong> Tüketici kullanıcılar için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yolu saklıdır. Tüketici olmayan kullanıcılar için genel hükümler uygulanır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Özet Tablo</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Durum</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Cayma / İade</th>
                    <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Kullanım Hakkı</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">7 gün ücretsiz deneme</td>
                    <td className="border border-gray-200 px-4 py-2">Ödeme yok; iade söz konusu değildir.</td>
                    <td className="border border-gray-200 px-4 py-2">7 gün boyunca tam sürüm özellikleri kullanılabilir.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Abonelik satın alma sonrası</td>
                    <td className="border border-gray-200 px-4 py-2">Mesafeli Sözleşmeler Yönetmeliği md. 15/ğ uyarınca dijital hizmet cayma istisnası; cayma/iade hakkı yoktur.</td>
                    <td className="border border-gray-200 px-4 py-2">Abonelik dönemi boyunca hizmet kullanılabilir.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Abonelik iptali</td>
                    <td className="border border-gray-200 px-4 py-2">Kısmi iade yapılmaz.</td>
                    <td className="border border-gray-200 px-4 py-2">Ödenen dönem sonuna kadar kullanım hakkı devam eder.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Platform kaynaklı teknik arıza</td>
                    <td className="border border-gray-200 px-4 py-2">Platform çözüm sunar; gerekirse süre uzatması veya kısmi kredi değerlendirilir (iyi niyetli uygulama).</td>
                    <td className="border border-gray-200 px-4 py-2">Sorun giderilene kadar veya uzatma süresi boyunca.</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">Üçüncü taraf kaynaklı kesinti (WhatsApp, ödeme kuruluşu vb.)</td>
                    <td className="border border-gray-200 px-4 py-2">Platform sorumluluğunda değildir; iade yapılmaz.</td>
                    <td className="border border-gray-200 px-4 py-2">Kesinti süresince hizmet kullanılamayabilir.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-sm text-gray-500 pt-6 border-t border-gray-200">
            Bu politika, Siparis-Sistemi.com web sitesinde yayımlanır. Güncellemeler aynı sayfada yer alır ve önemli değişiklikler kullanıcıya duyurulur. Yürürlük öncesi hukuk danışmanlığı alınması önerilir.
          </p>
        </div>
      </article>
    </div>
  );
}
