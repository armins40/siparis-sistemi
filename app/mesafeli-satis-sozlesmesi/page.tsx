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
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Taraflar</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1. Satıcı / Hizmet Sağlayıcı Bilgileri</h3>
            <ul className="list-none space-y-1 mb-6 pl-0">
              <li><strong>Ünvan:</strong> [Şirket Ünvanı]</li>
              <li><strong>Adres:</strong> [Adres Bilgisi]</li>
              <li><strong>Vergi Dairesi / Vergi Numarası:</strong> [Vergi Dairesi adı ve Vergi No]</li>
              <li><strong>MERSİS No:</strong> [Varsa MERSİS No]</li>
              <li><strong>E-posta:</strong> [İletişim e-posta adresi]</li>
              <li><strong>Telefon:</strong> [İletişim telefonu]</li>
            </ul>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2. Alıcı / Kullanıcı Bilgileri</h3>
            <ul className="list-none space-y-1 pl-0">
              <li><strong>Ad Soyad / Ünvan:</strong> [Alıcı adı soyadı veya tüzel kişi ünvanı]</li>
              <li><strong>Adres:</strong> [Alıcı adresi]</li>
              <li><strong>E-posta:</strong> [Alıcı e-posta adresi]</li>
              <li><strong>Telefon:</strong> [Alıcı telefonu]</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              <strong>Not:</strong> Alıcı, tüketici (B2C) veya tüketici olmayan (B2B) gerçek/tüzel kişi olabilir. Tüketici niteliğindeki kullanıcılar için 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği; tüketici olmayan kullanıcılar için genel hükümler uygulanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Sözleşmenin Konusu</h2>
            <p className="mb-4">
              İşbu Mesafeli Satış Sözleşmesi, Alıcı’nın Satıcı’ya ait Siparis-Sistemi.com internet sitesi üzerinden elektronik ortamda siparişini verdiği <strong>abonelik esaslı dijital SaaS hizmetinin</strong> (bulut tabanlı sipariş yönetim yazılımı kullanım lisansı ve ilgili teknik hizmetler) mesafeli satış usulüyle sunulmasına ilişkin tarafların hak ve yükümlülüklerini düzenler.
            </p>
            <p className="mb-4">
              <strong>Hizmet Kapsamı:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Bulut tabanlı sipariş yönetim yazılımı kullanım lisansı</li>
              <li>Dijital menü ve QR kod oluşturma hizmeti</li>
              <li>WhatsApp sipariş entegrasyonu (üçüncü taraf hizmeti)</li>
              <li>Sipariş ve müşteri verilerinin bulut altyapısında saklanması</li>
              <li>Teknik destek ve platform erişimi</li>
            </ul>
            <p>
              <strong>Önemli:</strong> Satı konusu <strong>fiziksel bir ürün değil</strong>, dijital/hizmet niteliğindedir. Platform, kullanıcı işletmelerin müşterilerine fiziksel ürün satışı yapmaz; yalnızca sipariş yönetimi yazılımı ve teknik altyapı hizmeti sunar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Ücretsiz Deneme Süresi</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform, yeni kayıt olan kullanıcılara <strong>7 (yedi) gün ücretsiz deneme</strong> hakkı tanır.</li>
              <li>Deneme süresi boyunca tam sürüm özellikleri kullanılabilir; kredi kartı veya ödeme bilgisi talep edilmez.</li>
              <li>Deneme süresi, kayıt tarihinden itibaren 7 gün olarak hesaplanır. Bu süre içinde kullanıcı herhangi bir ücret ödemez.</li>
              <li>Deneme süresi sonunda abonelik satın alınmazsa hesap erişimi sınırlandırılabilir veya sonlandırılabilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Abonelik Sistemi ve Ödeme Koşulları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hizmet, <strong>aylık</strong> veya <strong>yıllık</strong> abonelik paketleri halinde sunulur. Fiyatlar platform ve ödeme ekranında <strong>KDV dahil</strong> gösterilir.</li>
              <li>Ödeme, PayTR veya platformda sunulan diğer online ödeme kuruluşları (kredi kartı, banka kartı vb.) üzerinden tek seferde tahsil edilir. Ödeme işlemleri, ödeme kuruluşunun kendi şartları ve gizlilik politikalarına tabidir.</li>
              <li>Abonelik dönemi, ödemenin başarıyla alındığı ve platform tarafından onaylandığı tarihten itibaren başlar.</li>
              <li>Fatura veya e-arşiv fatura, ödeme sonrası yasal süre içinde (genellikle 5 iş günü) düzenlenir ve kullanıcıya e-posta ile iletilir.</li>
              <li>Ödeme kuruluşu kaynaklı sorunlar, gecikmeler veya işlem redleri Platform’un sorumluluğunda değildir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Cayma Hakkı – Dijital Hizmet İstisnası</h2>
            <p className="mb-4">
              <strong>6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği md. 15/ğ uyarınca:</strong> Tüketicinin, onayından önce kendisine bilgi verilen veya <strong>onayı ile ifa edilmeye başlanan elektronik ortamda anında tüketiciye sunulan gayrimaddi mallara (dijital içerik ve hizmetlere)</strong> ilişkin sözleşmelerde, <strong>cayma hakkı kullanılamaz</strong>.
            </p>
            <p className="mb-4">
              Siparis-Sistemi.com hizmeti, abonelik satın alındığı anda veya deneme sonrası ödeme yapıldığı anda <strong>elektronik ortamda anında erişime açılan bir dijital SaaS hizmeti</strong> olduğundan, bu kapsamdadır. Hizmet, ödeme onayı ile anında ifa edilmeye başlandığı için:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Ödeme sonrası cayma hakkı bulunmamaktadır.</strong></li>
              <li>Bu nedenle ödenen aylık veya yıllık abonelik bedeli için <strong>iade yapılmamaktadır</strong>.</li>
              <li>Deneme süresi (7 gün ücretsiz) içinde ücret ödenmediği için bu dönem için cayma talebi söz konusu değildir.</li>
            </ul>
            <p>
              Tüketici, satın alma/ödeme ekranında bu durumun kendisine <strong>açıkça bildirildiğini</strong> ve <strong>onay vererek</strong> işlemi gerçekleştirdiğini kabul eder. Tüketici olmayan (B2B) kullanıcılar için de aynı hükümler geçerlidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Hizmetin İfası ve Teknik Koşullar</h2>
            <p className="mb-4">
              Satıcı, ödemenin başarıyla alınmasından itibaren hizmeti (yazılım erişimi, bulut hizmeti ve belirtilen entegrasyonlar dahil) <strong>anında</strong> veya en kısa sürede elektronik ortamda sunar. Kullanıcı, oluşturduğu hesap bilgileriyle platforma giriş yaparak hizmeti kullanır.
            </p>
            <p className="mb-4">
              <strong>Teknik Kesinti ve Bakım:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Platform, planlı bakım, teknik güncelleme veya güvenlik gerekçesi ile hizmeti geçici olarak durdurabilir. Planlı kesintiler mümkün olduğunca önceden duyurulur.</li>
              <li>Acil güvenlik müdahaleleri veya zorunlu kuvvet (force majeure) hallerinde önceden duyuru yapılamayabilir.</li>
              <li>Teknik arıza hallerinde Satıcı, makul sürede müdahale ve çözüm sunmak için çalışır; ancak kesintilerin tamamen önlenmesi garanti edilmez.</li>
              <li>Üçüncü taraf kaynaklı kesintiler (internet, elektrik, WhatsApp/Meta servisleri, ödeme kuruluşları) Platform’un doğrudan kontrolü dışındadır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Abonelik İptali ve Sonuçları</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcı, aboneliğini dilediği zaman iptal edebilir. İptal, platform içi hesap ayarlarından veya destek kanalı üzerinden yapılabilir.</li>
              <li><strong>İptal edilse bile, ödenen abonelik dönemi sonuna kadar hizmetten yararlanma hakkı devam eder.</strong> Örneğin yıllık plan satın alındıysa ve 3. ayda iptal edildiyse, 12. ayın sonuna kadar hizmet kullanılabilir; bu süre için kısmi iade yapılmaz.</li>
              <li>İptal sonrası dönem bitiminde hesap erişimi sınırlandırılır veya kapatılır. Veri dışa aktarma süresi platformda veya e-posta ile duyurulabilir.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Sorumluluk Sınırları</h2>
            <p className="mb-4">
              Platform, aşağıdaki konulardan sorumlu tutulamaz:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Kullanıcı işletmesinin ticari faaliyetleri:</strong> Kullanıcının müşteri ilişkileri, ürün kalitesi, teslimat süreçleri, işletme kar/zararı vb. Platform’un sorumluluğunda değildir.</li>
              <li><strong>WhatsApp / Meta servisleri:</strong> WhatsApp entegrasyonu üçüncü taraf (Meta) hizmetidir. WhatsApp/Meta servis kesintileri, mesaj gecikmeleri, API değişiklikleri veya hizmet sonlandırmaları Platform’un kontrolü dışındadır ve sorumluluğunda değildir.</li>
              <li><strong>Ödeme kuruluşları (PayTR vb.):</strong> Ödeme işlemleri ödeme kuruluşu tarafından gerçekleştirilir. Ödeme kuruluşu kaynaklı sorunlar, gecikmeler, işlem redleri veya güvenlik ihlalleri Platform’un sorumluluğunda değildir.</li>
              <li><strong>Üçüncü taraf servisler:</strong> Bulut altyapı sağlayıcıları, internet servis sağlayıcıları, cihaz ve yazılım sorunları Platform’un kontrolü dışındadır.</li>
              <li><strong>Kullanıcı hataları:</strong> Yanlış veri girişi, şifre paylaşımı, güvenlik ihlali, yasal ihlal vb. kullanıcı kaynaklı durumlar.</li>
              <li><strong>Dolaylı zararlar:</strong> Kar kaybı, iş kesintisi, müşteri kaybı, itibar zararı vb. dolaylı zararlar.</li>
            </ul>
            <p className="mb-4">
              <strong>Platform Sorumluluğunun Üst Sınırı:</strong>
            </p>
            <p>
              Platform’un toplam sorumluluğu, ilgili abonelik döneminde kullanıcının ödediği toplam tutarı (KDV dahil) aşamaz. Bu sınır, yasal zorunluluklar saklı kalmak kaydıyla geçerlidir. Platform, hizmeti &quot;olduğu gibi&quot; (as is) sunar; örtülü garanti veya belirli bir sonuç garantisi vermez.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Şikâyet ve Uyuşmazlık Çözümü</h2>
            <p className="mb-4">
              <strong>Tüketici Kullanıcılar (B2C):</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Tüketici şikâyetleri için Satıcı’nın yukarıda belirtilen iletişim kanalları kullanılır.</li>
              <li>Uyuşmazlıklarda <strong>Tüketici Hakem Heyetleri</strong> (il/ilçe nüfusa göre belirlenen değere kadar) ve <strong>Tüketici Mahkemeleri</strong> yetkilidir.</li>
              <li>Uyuşmazlık öncesi zorunlu arabuluculuk uygulanmaz; ancak taraflar anlaşarak arabuluculuğa başvurabilir.</li>
            </ul>
            <p className="mb-4">
              <strong>Tüketici Olmayan Kullanıcılar (B2B):</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tüketici olmayan (ticari amaçlı) kullanıcılar için genel hükümler uygulanır.</li>
              <li>Uyuşmazlıklarda [İstanbul] Mahkemeleri ve İcra Daireleri yetkilidir. (veya sözleşmede belirlenen yetkili mahkeme)</li>
            </ul>
            <p className="mt-4">
              <strong>Uygulanacak Hukuk:</strong> İşbu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Yürürlük ve Kabul</h2>
            <p>
              İşbu Mesafeli Satış Sözleşmesi, Alıcı’nın sipariş/ödeme onayı ile elektronik ortamda kabul edilmiş sayılır. Sözleşme metni, satın alma ekranında veya e-posta ile tüketiciye iletilir; ayrıca Siparis-Sistemi.com web sitesinde sürekli yayımlanır. Önemli değişiklikler kullanıcıya e-posta veya platform içi bildirimle duyurulur; devam eden kullanım değişikliklerin kabulü sayılır.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-6 border-t border-gray-200">
            Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümlerine uygun olarak düzenlenmiştir. [Satıcı/Alıcı bilgileri] alanları, somut sözleşme düzenlenirken doldurulacaktır. Yürürlük öncesi hukuk danışmanlığı alınması önerilir.
          </p>
        </div>
      </article>
    </div>
  );
}
