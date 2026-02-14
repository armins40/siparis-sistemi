import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hizmet Sözleşmesi',
  description: 'Siparis-Sistemi.com bulut tabanlı sipariş yönetim hizmeti kullanım koşulları ve hizmet sözleşmesi.',
};

export default function HizmetSozlesmesiPage() {
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Taraflar ve Hizmet Tanımı</h2>
            <p className="mb-4">
              İşbu Hizmet Sözleşmesi (&quot;Sözleşme&quot;), Siparis-Sistemi.com platformunu işleten hizmet sağlayıcı (&quot;Platform&quot;) ile platforma kayıt olan ve abonelik satın alan gerçek veya tüzel kişi kullanıcı (&quot;Kullanıcı&quot;) arasında elektronik ortamda akdedilmiş sayılır.
            </p>
            <p className="mb-4">
              <strong>Hizmet:</strong> Platform, bulut tabanlı bir SaaS (Hizmet Olarak Yazılım) sipariş yönetim sistemi sunmaktadır. Hizmet kapsamında; yazılım kullanım lisansı, bulut altyapısı üzerinden erişim, WhatsApp sipariş entegrasyonu ve dijital sipariş yönetimi araçları sağlanmaktadır. Fiziksel ürün satışı yapılmamaktadır.
            </p>
            <p>
              Hizmet, özellikle market, manav, tekel bayi, kasap, petshop ve benzeri küçük işletmelerin sipariş süreçlerini dijitalleştirmesi amacıyla sunulmaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Abonelik ve Deneme Süresi</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcı, platforma kayıt olarak <strong>7 (yedi) gün ücretsiz deneme</strong> hakkından yararlanır. Deneme süresi boyunca tam sürüm özellikleri kullanılabilir.</li>
              <li>Deneme süresi sonunda abonelik satın alınmazsa hesap erişimi sınırlandırılabilir veya sonlandırılabilir.</li>
              <li>Abonelikler <strong>aylık</strong> veya <strong>yıllık</strong> dönemler halinde sunulur. Fiyatlar platformda ve ödeme ekranında KDV dahil olarak gösterilir.</li>
              <li>Abonelik süresi, ödemenin alındığı tarihten itibaren işlemeye başlar.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Kullanıcı Yükümlülükleri</h2>
            <p className="mb-4">Kullanıcı aşağıdaki hususlara uymayı kabul eder:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kayıt ve abonelik bilgilerinin doğru, güncel ve eksiksiz olması;</li>
              <li>Hesap güvenliğini sağlamak ve şifre ile erişim bilgilerini üçüncü kişilerle paylaşmamak;</li>
              <li>Platformu yalnızca meşru iş amaçları ve kendi işletme sipariş yönetimi için kullanmak;</li>
              <li>Yasaklı içerik veya faaliyetlere aracılık etmemek, platformu kötüye kullanmamak;</li>
              <li>Üçüncü kişilerin fikri mülkiyet haklarına ve mevzuata saygı göstermek;</li>
              <li>Ödeme yükümlülüklerini zamanında yerine getirmek.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Platform Hakları ve Yükümlülükleri</h2>
            <p className="mb-4">Platform, hizmetin kesintisiz ve güvenli sunulması için makul çabayı gösterir. Platformun hakları:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hizmet içeriğini, özelliklerini ve fiyatlarını önceden duyurmak kaydıyla güncellemek;</li>
              <li>Kullanım koşullarını ihlal eden hesapları uyarı veya fesih ile sınırlamak veya sonlandırmak;</li>
              <li>Güvenlik, yasal zorunluluk veya teknik gereklilik hallerinde erişimi geçici olarak kısıtlamak;</li>
              <li>Planlı bakım çalışmalarını makul sürelerle ve mümkünse önceden duyurarak yapmak.</li>
            </ul>
            <p className="mt-4">
              Platform, kullanıcının işletme faaliyetlerinden, müşteri ilişkilerinden veya üçüncü taraf hizmetlerinden (ör. WhatsApp) doğan sonuçlardan sorumlu tutulamaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Ödeme Koşulları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ödemeler, platformda belirtilen aylık veya yıllık tutarlar üzerinden, KDV dahil olarak online ödeme sistemleri ile tahsil edilir.</li>
              <li>Abonelik yenilemesi, dönem sonunda otomatik olarak yapılmaz; kullanıcı yeni dönem için ödeme yaparak devam eder. Platform ileride otomatik yenileme sunarsa, bu durum ayrıca duyurulur ve onay alınır.</li>
              <li>Fatura veya e-arşiv fatura, ödeme sonrası yasal süre içinde düzenlenir ve kullanıcıya iletilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Hizmet Kesintileri ve Teknik Bakım</h2>
            <p className="mb-4">
              Platform, aşağıdaki durumlarda hizmeti geçici olarak kesebilir veya sınırlayabilir:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Planlı bakım ve güncellemeler (mümkün olduğunca önceden duyurulur);</li>
              <li>Acil güvenlik veya stabilite müdahaleleri;</li>
              <li>Üçüncü taraf altyapı veya iletişim kesintileri;</li>
              <li>Yasal bir zorunluluk veya yetkili makam kararı.</li>
            </ul>
            <p className="mt-4">
              Makul süreyi aşan ve platform kaynaklı kesintilerde, Platform gerekirse kullanıcıya orantılı hizmet uzatması veya kısmi iade gibi çözümler sunmayı değerlendirir. Bu madde, tazminat yükümlülüğü doğurmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Fesih ve Sonuçları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Kullanıcı feshi:</strong> Kullanıcı, aboneliği dilediği zaman sonlandırabilir. İptal edilse bile, ödenen dönem sonuna kadar hizmetten yararlanma hakkı devam eder.</li>
              <li><strong>Platform feshi:</strong> Ödeme yapılmaması, sözleşme ihlali, yasal ihlal veya platform politikalarına aykırı kullanım halinde Platform, hesabı askıya alabilir veya sözleşmeyi feshedebilir.</li>
              <li>Fesih sonrasında kullanıcı verilerinin saklama ve silinmesi, KVKK Aydınlatma Metni ve ilgili mevzuata göre yürütülür.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Sorumluluk Reddi</h2>
            <p className="mb-4">
              Platform, yazılımı &quot;olduğu gibi&quot; (as is) sunar. Aşağıdaki konularda sorumluluk kabul edilmez (yasal zorunluluklar saklı kalmak kaydıyla):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Dolaylı zarar, kar kaybı, veri kaybı veya iş kesintisi kaynaklı iddialar;</li>
              <li>Üçüncü taraf hizmetlerindeki (WhatsApp, ödeme kuruluşları vb.) aksaklıklar;</li>
              <li>Kullanıcının hatalı kullanımı veya veri girişinden doğan sonuçlar;</li>
              <li>Zorunlu kuvvet (force majeure) halleri.</li>
            </ul>
            <p className="mt-4">
              Platformun toplam sorumluluğu, ilgili abonelik döneminde kullanıcının ödediği toplam tutarı aşamaz; aksi yasalarla zorunlu kılındığı haller saklıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Uyuşmazlık Çözümü</h2>
            <p>
              İşbu Sözleşmeden doğan uyuşmazlıklarda Türkiye Cumhuriyeti kanunları uygulanır. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici niteliğindeki kullanıcılar için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkisi saklıdır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Yürürlük</h2>
            <p>
              Bu Hizmet Sözleşmesi, platforma kayıt veya abonelik satın alma ile elektronik ortamda kabul edilmiş sayılır. Güncel metin her zaman web sitesinde (Siparis-Sistemi.com) yayımlanır. Önemli değişiklikler kullanıcıya e-posta veya platform içi bildirimle duyurulur; devam eden kullanım değişikliklerin kabulü sayılır.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-6 border-t border-gray-200">
            Son güncelleme: Bu metin yayınlanmaya hazır şablon niteliğindedir. Yürürlük öncesi hukuk danışmanlığı almanız önerilir.
          </p>
        </div>
      </article>
    </div>
  );
}
