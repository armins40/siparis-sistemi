import Link from 'next/link';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export default async function WhatsAppSiparisPage() {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  // FAQ Schema (JSON-LD) for SEO - matches page content exactly
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kurulum gerekiyor mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. Hemen kullanmaya başlayabilirsin. Sadece ürünlerini ekle, bu kadar."
        }
      },
      {
        "@type": "Question",
        "name": "Telefonla kullanabilir miyim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, telefon, tablet, bilgisayar - hepsinde çalışır. Telefondan rahatça kullanabilirsin."
        }
      },
      {
        "@type": "Question",
        "name": "Deneme bitince otomatik ödeme olur mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. 7 gün sonra istersen devam edersin, istemezsen kapatırsın. Otomatik ödeme yok."
        }
      },
      {
        "@type": "Question",
        "name": "Destek var mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet, WhatsApp üzerinden destek veriyoruz. Sorun olursa yaz, çözelim."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* FAQ Schema (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
        }}
      />
      <MarketingHeader
        bannerTitle="WhatsApp Sipariş Sistemi"
        bannerSubtitle="QR veya linkle dijital menü paylaşın. Müşteri menüden seçer, adresini WhatsApp'tan gönderir. Siparişler sizde listelenir, konumu kuryeye yollarsınız. Komisyonsuz."
        whatsappNumber={whatsappNumber}
        bannerChildren={
          <div className="space-y-3">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              Ücretsiz Dene
            </Link>
            <p className="text-sm text-slate-400">Kart bilgisi istemiyoruz • 7 gün tam sürüm</p>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Section 1: Problem */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Sipariş Almak Neden Zor Geliyor?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-4">
              Müşteri menüyü nereden görsün? Kağıt menü yetmiyor. WhatsApp’ta gelen siparişler karışıyor, 
              adres yanlış yazılıyor, hangi sipariş hazır takip edilmiyor, kuryeye adresi anlatmakla uğraşıyorsunuz.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>Düzenli bir menü yok; müşteri ne alacağını net göremiyor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>WhatsApp’ta siparişler karışıyor, adres yanlış yazılıyor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>Hangi sipariş hazır, hangisi gönderildi belli değil</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">❌</span>
                  <span>Kuryeye adresi tarif etmekle vakit kaybediyorsunuz</span>
                </li>
              </ul>
            </div>
            <p className="text-lg text-gray-700">
              Dijital menü + sipariş listesi + canlı konum paylaşımı ile hepsini tek uygulamada çözüyoruz.
            </p>
          </div>
        </section>

        {/* Section 2: Solution */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Siparis-Sistemi Ne Sağlar?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              QR veya mağaza linkiyle dijital menü paylaşırsınız. Müşteri menüden seçer, adresini ve canlı konumunu WhatsApp’tan size gönderir. Siparişler uygulamada listelenir; siz hazırlayıp canlı konumu kuryeye yollarsınız.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Dijital Menü (QR + Link)</h3>
                <p className="text-gray-700">
                  Buzdolabı magneti, broşür veya Instagram’da paylaşın. Müşteri menüye tıklar, ürünleri görür.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Sipariş + Adres WhatsApp’tan</h3>
                <p className="text-gray-700">
                  Müşteri menüden seçim yapar, adresini ve canlı konumunu girer; sipariş size WhatsApp’tan gelir.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Sipariş Listesi Sizde</h3>
                <p className="text-gray-700">
                  Tüm siparişler uygulamada listelenir. Hazır / gönderildi takibi, akşam sayımı kolay.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Canlı Konum Kuryeye</h3>
                <p className="text-gray-700">
                  Teslimat adresi ve canlı konum kuryeye iletin; ürün müşteriye ulaşsın.
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Karışıklık biter, siparişler düzenli olur, müşteri memnuniyeti artar.
            </p>
          </div>
        </section>

        {/* Section 3: Who is it for */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Kimler İçin Uygun?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              WhatsApp'tan sipariş alan her küçük esnaf için uygun. Özellikle şu işletmeler için ideal:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Marketler</h3>
                <p className="text-gray-600">
                  Günlük sipariş alan marketler için. Müşteri adresleri kayıtlı, siparişler düzenli.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🥃</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Tekel Bayileri</h3>
                <p className="text-gray-600">
                  WhatsApp'tan sipariş alan tekel bayileri için. Sipariş takibi kolay, karışıklık yok.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🍎</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Manavlar</h3>
                <p className="text-gray-600">
                  Taze ürün siparişi alan manavlar için. Siparişler düzenli, müşteri memnuniyeti artar.
                </p>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <div className="text-4xl mb-3">🏪</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">Bakkallar</h3>
                <p className="text-gray-600">
                  Mahalle bakkalları için. Dijital menü + sipariş listesi, iş daha kolay.
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700 mt-6">
              Hangi sektörde olursanız olun, dijital menü ve WhatsApp ile sipariş almak istiyorsanız bu sistem sizin için.
            </p>
          </div>
        </section>

        {/* Section 4: Why commission-free */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Neden Komisyonsuz Sipariş Sistemi?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Diğer sipariş sistemleri her siparişten komisyon alır. Siz 100 TL'lik sipariş alırsınız, 
              sistem 10-15 TL komisyon keser. Bu küçük esnaf için çok ağır.
            </p>
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200 mb-6">
              <h3 className="text-xl font-bold mb-3 text-gray-900">💰 Komisyonsuz = Daha Fazla Kar</h3>
              <p className="text-gray-700 mb-4">
                Siparis-Sistemi'nde komisyon yok. Sabit aylık ücret ödersiniz, ne kadar sipariş alırsanız alın 
                komisyon ödemezsiniz. Bu, küçük esnaf için büyük bir avantaj.
              </p>
              <div className="bg-white rounded p-4">
                <p className="text-sm text-gray-600 mb-2"><strong>Örnek:</strong></p>
                <p className="text-gray-700">
                  Günde 20 sipariş, ortalama 50 TL = 1000 TL/gün. Diğer sistemlerde %10 komisyon = 100 TL/gün kayıp. 
                  Ayda 3000 TL kayıp. Siparis-Sistemi'nde bu kayıp yok.
                </p>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Komisyonsuz sistem sayesinde daha fazla kar edersiniz. Küçük esnaf için tasarlandı, 
              küçük esnafın cebini düşündük.
            </p>
          </div>
        </section>

        {/* Section 5: Setup */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            4 Adımda Nasıl Çalışır?
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Kayıt olun, ürünlerinizi ekleyin; QR veya linkle menüyü paylaşın. Müşteri siparişi WhatsApp’tan gönderir, siz hazırlayıp konumu kuryeye yollarsınız.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xl">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Kayıt Ol, Ürünleri Ekle</h3>
                  <p className="text-gray-700">
                    Sektörünüzü seçin, ürünlerinizi ekleyin (fotoğraf, fiyat, kategori). Kart bilgisi istemiyoruz, 7 gün ücretsiz.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xl">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Menüyü Paylaşın</h3>
                  <p className="text-gray-700">
                    QR kod veya mağaza linkinizi buzdolabı magnetine, broşüre basın veya Instagram gibi sosyal medyada paylaşın.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xl">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Müşteri Sipariş Verir</h3>
                  <p className="text-gray-700">
                    Müşteri menüden seçim yapar, adresini ve canlı konumunu girer; sipariş size WhatsApp’tan gelir, uygulamada listelenir.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center font-bold text-xl">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Hazırlayın, Kuryeye Konum Gönderin</h3>
                  <p className="text-gray-700">
                    Siparişleri hazırlayın; canlı konumu kuryeye yollayın, ürün müşteriye ulaşsın.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
              <p className="text-lg text-gray-700">
                <strong>Kurulum süresi:</strong> 10-15 dakika. Bilgisayar şart değil, telefondan da kurabilirsiniz. Destek ekibimiz her zaman yardıma hazır.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Kurulum gerekiyor mu?
              </h3>
              <p className="text-gray-700">
                Hayır. Hemen kullanmaya başlayabilirsin. Sadece ürünlerini ekle, bu kadar.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Telefonla kullanabilir miyim?
              </h3>
              <p className="text-gray-700">
                Evet, telefon, tablet, bilgisayar - hepsinde çalışır. Telefondan rahatça kullanabilirsin.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Deneme bitince otomatik ödeme olur mu?
              </h3>
              <p className="text-gray-700">
                Hayır. 7 gün sonra istersen devam edersin, istemezsen kapatırsın. Otomatik ödeme yok.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Destek var mı?
              </h3>
              <p className="text-gray-700">
                Evet, WhatsApp üzerinden destek veriyoruz. Sorun olursa yaz, çözelim.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[#25D366] to-[#20BA5A] rounded-xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Hemen Başla, Siparişler Düzene Girsin
          </h2>
          <p className="text-xl mb-8 opacity-90">
            7 gün ücretsiz dene. Kart bilgisi yok, taahhüt yok. Dakikalar içinde aktif.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-[#25D366] rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Ücretsiz Dene
          </Link>
          <p className="text-sm mt-4 opacity-75">
            Zaten kullanan esnaflar: <Link href="/" className="underline">Örnek mağazaları gör</Link>
          </p>
        </section>

        {/* Internal Links */}
        <section className="text-center text-gray-600">
          <p className="mb-4">Diğer sayfalar:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-[#25D366] hover:underline">
              Ana Sayfa
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-[#25D366] hover:underline">
              İletişim
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            <p>© 2024 siparis-sistemi.com Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
