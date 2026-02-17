import Link from 'next/link';
import { getSetting } from '@/lib/db/settings';
import MarketingHeader from '@/components/MarketingHeader';

export default async function MarketSiparisPage() {
  const whatsappNumber = (await getSetting('whatsapp_number')) || '905535057059';
  // FAQ Schema (JSON-LD) for SEO - matches page content exactly
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Marketler için uygun mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Küçük ve orta ölçekli marketler için uygundur."
        }
      },
      {
        "@type": "Question",
        "name": "Sipariş karışıklığını önler mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Tüm siparişler tek panelde listelenir."
        }
      },
      {
        "@type": "Question",
        "name": "Kurulum gerekiyor mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. Hemen kullanmaya başlayabilirsin."
        }
      },
      {
        "@type": "Question",
        "name": "Otomatik ödeme var mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Hayır. Deneme bitince sen karar verirsin."
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
        bannerTitle="Market Sipariş Sistemi"
        bannerSubtitle="Mahalle marketleri için dijital menü ve sipariş sistemi. Komisyonsuz, dakikalar içinde aktif."
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
        
        {/* Benefits Section */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Marketler için özel olarak tasarlanmış sipariş sistemi. WhatsApp ve telefonla gelen 
              siparişleri tek ekranda toplayın, karışıklığı önleyin, işinizi kolaylaştırın.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Tek Panelde Tüm Siparişler</h3>
                <p className="text-gray-700">
                  Tüm siparişler tek panelde listelenir. Karışıklık önlenir, düzen sağlanır.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Hızlı Kurulum</h3>
                <p className="text-gray-700">
                  Kurulum gerektirmez. Hemen kullanmaya başlayabilirsin.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Sipariş Takibi</h3>
                <p className="text-gray-700">
                  Hangi sipariş hazırlandı, hangisi gönderildi, hepsi görünür.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Esnek Ödeme</h3>
                <p className="text-gray-700">
                  Deneme bitince sen karar verirsin. Otomatik ödeme yok.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Marketler için uygun mu?
              </h3>
              <p className="text-gray-700">
                Evet. Küçük ve orta ölçekli marketler için uygundur.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Sipariş karışıklığını önler mi?
              </h3>
              <p className="text-gray-700">
                Evet. Tüm siparişler tek panelde listelenir.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Kurulum gerekiyor mu?
              </h3>
              <p className="text-gray-700">
                Hayır. Hemen kullanmaya başlayabilirsin.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Otomatik ödeme var mı?
              </h3>
              <p className="text-gray-700">
                Hayır. Deneme bitince sen karar verirsin.
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
        </section>

        {/* Internal Links */}
        <section className="text-center text-gray-600">
          <p className="mb-4">Diğer sayfalar:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="text-[#25D366] hover:underline">
              Ana Sayfa
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/whatsapp-siparis-sistemi" className="text-[#25D366] hover:underline">
              WhatsApp Sipariş Sistemi
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
