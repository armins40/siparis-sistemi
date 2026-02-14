import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'Siparis-Sistemi.com Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default function KvkkPage() {
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
            Kişisel Verilerin Korunması Aydınlatma Metni
          </h1>
          <p className="text-gray-600">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, Siparis-Sistemi.com platformunda işlenen kişisel verilerinize ilişkin aydınlatma ve bilgilendirme metnidir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
            <p className="mb-4">
              Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca &quot;veri sorumlusu&quot; sıfatıyla Siparis-Sistemi.com hizmetini sunan [Şirket Ünvanı] tarafından aşağıda açıklanan kapsamda işlenmektedir.
            </p>
            <p>
              <strong>İletişim:</strong> [İletişim e-posta adresi] | [İletişim telefonu] | [Adres Bilgisi]
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Veri İşleme Rolü – SaaS Platformu Özel Durumu</h2>
            <p className="mb-4">
              Siparis-Sistemi.com bir <strong>SaaS (Hizmet Olarak Yazılım) platformudur</strong>. Bu nedenle veri işleme rolleri aşağıdaki şekilde ayrışır:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">2.1. Platform Kullanıcısı Verileri (Sizin Verileriniz)</h3>
              <p className="mb-2">
                <strong>Veri Sorumlusu:</strong> [Şirket Ünvanı] (Platform)
              </p>
              <p>
                Platform’a kayıt olan işletme sahibi (kullanıcı) verileriniz (ad, e-posta, telefon, ödeme bilgileri vb.) Platform tarafından <strong>veri sorumlusu</strong> sıfatıyla işlenir.
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">2.2. Kullanıcı İşletmesinin Müşteri Verileri</h3>
              <p className="mb-2">
                <strong>Veri Sorumlusu:</strong> Platform kullanıcısı (işletme sahibi)
              </p>
              <p className="mb-2">
                <strong>Veri İşleyen:</strong> [Şirket Ünvanı] (Platform)
              </p>
              <p>
                Platform kullanıcılarının (işletmelerin) müşteri verileri (müşteri adı, adresi, sipariş bilgileri vb.), kullanıcı işletmesi tarafından platforma yüklenir. Bu durumda <strong>kullanıcı işletmesi veri sorumlusu</strong>, Platform ise <strong>veri işleyen</strong> konumundadır. Platform, bu verileri yalnızca teknik altyapı ve hizmet sunumu amacıyla işler; verilerin içeriği, kullanımı veya paylaşımından kullanıcı işletmesi sorumludur.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Toplanan Kişisel Veriler</h2>
            <p className="mb-4">
              <strong>3.1. Platform Kullanıcısı Verileri (İşletme Sahibi Verileri)</strong>
            </p>
            <p className="mb-4">Platforma kayıt olan işletme sahibi (kullanıcı) verileriniz:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Kimlik bilgileri:</strong> Ad, soyadı, ünvan (kayıt ve fatura düzenleme için).</li>
              <li><strong>İletişim bilgileri:</strong> E-posta adresi, cep telefonu numarası (kayıt, giriş, doğrulama, bildirim ve destek için).</li>
              <li><strong>Finansal bilgiler:</strong> Ödeme ile ilgili işlem kayıtları, fatura bilgileri. <strong>Önemli:</strong> Kredi kartı numarası, CVV, son kullanma tarihi gibi hassas finansal veriler <strong>ödeme kuruluşu (PayTR vb.) tarafında</strong> işlenir ve saklanır. Platform, yalnızca işlem onayı ve fatura düzenleme için gerekli bilgileri (maske kart bilgisi, işlem tutarı, tarih vb.) alır.</li>
              <li><strong>İşlem ve kullanım verileri:</strong> Giriş/çıkış zamanları, abonelik türü ve süresi, platform kullanım istatistikleri (hizmetin sunulması ve iyileştirilmesi için).</li>
              <li><strong>Teknik veriler:</strong> IP adresi, cihaz bilgisi, tarayıcı türü, işletim sistemi (güvenlik, fraud önleme ve teknik destek için).</li>
              <li><strong>Çerez ve benzeri teknolojiler:</strong> Oturum ve tercih verileri (oturum yönetimi ve kullanıcı deneyimi için); ayrıntılar Çerez Politikası’nda belirtilebilir.</li>
            </ul>
            <p className="mb-4">
              <strong>3.2. Kullanıcı İşletmesinin Müşteri Verileri</strong>
            </p>
            <p className="mb-4">
              Platform kullanıcılarının (işletmelerin) müşteri verileri (müşteri adı, adresi, telefon, sipariş bilgileri, canlı konum vb.) kullanıcı işletmesi tarafından platforma yüklenir. Bu veriler:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kullanıcı işletmesi tarafından toplanır ve platforma aktarılır.</li>
              <li>Platform, bu verileri yalnızca teknik altyapı ve hizmet sunumu amacıyla işler (veri işleyen konumunda).</li>
              <li>Verilerin içeriği, kullanımı, paylaşımı veya silinmesinden kullanıcı işletmesi (veri sorumlusu) sorumludur.</li>
              <li>WhatsApp entegrasyonu kullanıldığında, müşteri mesaj ve iletişim verileri Meta/WhatsApp ile paylaşılabilir (üçüncü taraf hizmeti).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Veri İşleme Amaçları</h2>
            <p className="mb-4">
              <strong>4.1. Platform Kullanıcısı Verilerinin İşlenme Amaçları</strong>
            </p>
            <p className="mb-4">Toplanan kişisel veriler aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Hesap oluşturma, kimlik doğrulama ve güvenli erişim sağlama;</li>
              <li>Abonelik yönetimi, faturalandırma ve ödeme süreçlerinin yürütülmesi (PayTR veya diğer ödeme kuruluşları üzerinden);</li>
              <li>SaaS hizmetinin sunulması (bulut tabanlı sipariş yönetim yazılımı, dijital menü, QR kod oluşturma);</li>
              <li>WhatsApp entegrasyonu ve sipariş yönetimi özelliklerinin çalıştırılması;</li>
              <li>E-posta ve SMS ile bilgilendirme, duyuru ve teknik bildirimler gönderilmesi;</li>
              <li>Müşteri hizmetleri ve destek taleplerinin yanıtlanması;</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (veri saklama, denetim, yetkili makam talepleri, fatura düzenleme);</li>
              <li>Güvenlik, dolandırıcılık önleme ve sistem performansının izlenmesi;</li>
              <li>Hizmet ve kullanıcı deneyiminin iyileştirilmesi (anonim/istatistiksel analizler dahil);</li>
              <li>Pazarlama ve tanıtım faaliyetleri (açık rıza veya meşru menfaat kapsamında).</li>
            </ul>
            <p className="mb-4">
              <strong>4.2. Kullanıcı İşletmesinin Müşteri Verilerinin İşlenme Amacı</strong>
            </p>
            <p>
              Platform, kullanıcı işletmelerinin müşteri verilerini yalnızca <strong>teknik altyapı ve hizmet sunumu</strong> amacıyla işler. Verilerin içeriği, kullanımı veya paylaşımından kullanıcı işletmesi (veri sorumlusu) sorumludur. Platform, bu verileri pazarlama veya başka amaçlarla kullanmaz.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Veri İşleme Hukuki Sebepleri</h2>
            <p>
              Kişisel verileriniz; KVKK md. 5 ve 6 uyarınca açık rızanız, sözleşmenin ifası, hukuki yükümlülük, meşru menfaat ve (hassas veriler söz konusuysa) Kanun’da öngörülen diğer şartlara dayanılarak işlenmektedir. Abonelik ve ödeme işlemleri sözleşmenin ifası ve yasal zorunluluk kapsamında; pazarlama ve analiz amaçlı işlemler ise açık rıza veya meşru menfaat kapsamında değerlendirilir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Veri Saklama Süreleri</h2>
            <p className="mb-4">
              <strong>6.1. Platform Kullanıcısı Verilerinin Saklama Süreleri</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Hesap ve abonelik verileri:</strong> Abonelik süresi ve sona erme sonrası, yasal zamanaşım ve saklama süreleri (ör. 10 yıl ticari defter belgeleri) dikkate alınarak saklanır. Hesap silme talebi halinde, yasal saklama zorunluluğu olmayan veriler silinir.</li>
              <li><strong>Fatura ve muhasebe verileri:</strong> 6102 sayılı Türk Ticaret Kanunu ve Vergi Mevzuatı uyarınca <strong>10 yıl</strong> saklanır.</li>
              <li><strong>Ödeme işlem kayıtları:</strong> Ödeme kuruluşu (PayTR vb.) tarafından kendi politikalarına göre saklanır. Platform, yalnızca işlem onayı ve fatura düzenleme için gerekli kayıtları tutar.</li>
              <li><strong>İletişim ve destek kayıtları:</strong> Talebin çözümü ve olası uyuşmazlıklar için makul süre (ör. 2 yıl) saklanabilir.</li>
              <li><strong>Güvenlik ve log verileri:</strong> Güvenlik amacıyla sınırlı süre (ör. 1 yıl) saklanabilir.</li>
              <li>Süre sonunda veriler silinir, anonymize edilir veya arşivlenir; yasal saklama zorunluluğu varsa yalnızca bu amaçla tutulur.</li>
            </ul>
            <p className="mb-4">
              <strong>6.2. Kullanıcı İşletmesinin Müşteri Verilerinin Saklama Süreleri</strong>
            </p>
            <p>
              Kullanıcı işletmesinin müşteri verileri, kullanıcı işletmesi tarafından belirlenen süre boyunca platformda saklanır. Hesap silme veya abonelik sonlandırma halinde, kullanıcı işletmesine veri dışa aktarma süresi tanınır; süre sonunda veriler silinir. Yasal saklama zorunluluğu varsa (ör. fatura kayıtları), bu veriler yalnızca yasal amaçla saklanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Verilerin Aktarılması ve Üçüncü Taraf Paylaşımı</h2>
            <p className="mb-4">
              Kişisel verileriniz, hizmetin sunulması ve yasal zorunluluklar çerçevesinde aşağıdaki gruplara aktarılabilir:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Ödeme kuruluşları (PayTR vb.):</strong> Ödeme işlemlerinin gerçekleştirilmesi için gerekli veriler (kart numarası, son kullanma tarihi, CVV vb. hassas veriler) ödeme kuruluşu tarafında işlenir ve saklanır. Platform, yalnızca işlem onayı ve fatura düzenleme için gerekli bilgileri (maske kart bilgisi, işlem tutarı vb.) alır. Ödeme kuruluşunun kendi gizlilik politikası ve veri işleme şartları geçerlidir.</li>
              <li><strong>Bulut ve altyapı hizmeti sağlayıcıları:</strong> Sunucu ve barındırma hizmeti veren taraflar. Bu aktarımlar, KVKK md. 9 uyarınca veri işleme sözleşmeleri ile düzenlenir ve KVKK’ya uyum sağlanır.</li>
              <li><strong>WhatsApp / Meta:</strong> WhatsApp sipariş entegrasyonu kullanıldığında, ilgili iletişim ve mesaj verileri Meta/WhatsApp ile paylaşılabilir. Bu entegrasyon, üçüncü taraf (Meta) hizmetidir ve Meta’nın kendi gizlilik politikası, kullanım şartları ve veri işleme uygulamaları geçerlidir. Platform, WhatsApp/Meta servislerinin kesintisi, değişikliği veya sonlandırılmasından sorumlu tutulamaz. Kullanıcı, bu entegrasyonu kullanarak Meta’nın veri işleme uygulamalarını kabul etmiş sayılır.</li>
              <li><strong>Yasal merciler:</strong> Yasa ile yetkili kılınan kurum ve kuruluşlara (vergi dairesi, mahkeme, kolluk kuvvetleri vb.), yasal zorunluluk halinde aktarım yapılabilir.</li>
            </ul>
            <p className="mb-4">
              <strong>Yurt Dışına Aktarım:</strong>
            </p>
            <p>
              Yurt dışına aktarım yapılması halinde (ör. Meta/WhatsApp sunucuları), KVKK md. 9’da belirtilen koşullar (yeterli koruma ülkesi veya yazılı taahhüt vb.) sağlanır. Aktarım, hizmetin sunumu için teknik zorunluluk veya kullanıcının açık rızası kapsamında gerçekleşir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. İlgili Kişi Hakları (KVKK md. 11)</h2>
            <p className="mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenmek;</li>
              <li>İşlenmişse buna ilişkin bilgi talep etmek;</li>
              <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenmek;</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilmek;</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini istemek;</li>
              <li>KVKK md. 7’deki şartlar çerçevesinde silinmesini veya yok edilmesini istemek;</li>
              <li>Düzeltme ve silme işlemlerinin üçüncü kişilere bildirilmesini istemek;</li>
              <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etmek;</li>
              <li>Kanuna aykırı işlem nedeniyle zarara uğramanız halinde zararın giderilmesini talep etmek.</li>
            </ul>
            <p className="mt-4">
              Haklarınızı kullanmak için veri sorumlusuna yazılı veya kayıtlı elektronik ortamdan ([İletişim e-posta adresi] veya web sitesindeki başvuru formu) başvurabilirsiniz. Başvurularınız, KVKK md. 13 uyarınca talebin niteliğine göre <strong>en geç 30 gün</strong> içinde sonuçlandırılır; reddedilirse gerekçesi yazılı olarak bildirilir. Şikâyet için <strong>Kişisel Verileri Koruma Kurulu’na</strong> başvuru hakkınız saklıdır.
            </p>
            <p className="mt-4">
              <strong>Not:</strong> Kullanıcı işletmesinin müşteri verileri için hak talepleri, öncelikle ilgili kullanıcı işletmesine (veri sorumlusu) yöneltilmelidir. Platform (veri işleyen), kullanıcı işletmesinin talimatı doğrultusunda işlem yapar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizin güvenliği için teknik ve idari tedbirler (erişim kısıtları, şifreleme, güvenli iletişim kanalları, çalışan eğitimi vb.) alınmaktadır. Verilerin yetkisiz erişim, kayıp veya ifşası halinde Kanun’da öngörülen bildirim ve kayıt süreçleri uygulanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Güncellemeler</h2>
            <p>
              Bu Aydınlatma Metni, mevzuat veya hizmet değişiklikleri nedeniyle güncellenebilir. Güncel metin Siparis-Sistemi.com web sitesinde yayımlanır. Önemli değişiklikler, mümkün olduğunca e-posta veya platform içi bildirimle duyurulur.
            </p>
          </section>

          <p className="text-sm text-gray-500 pt-6 border-t border-gray-200">
            Bu metin, 6698 sayılı KVKK kapsamında bilgilendirme amacıyla hazırlanmıştır. Yürürlük öncesi hukuk danışmanlığı almanız önerilir.
          </p>
        </div>
      </article>
    </div>
  );
}
