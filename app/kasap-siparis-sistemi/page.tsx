import Link from 'next/link';
import Image from 'next/image';

export default function KasapSiparisPage() {
  // FAQ Schema (JSON-LD) for SEO - matches page content exactly
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Kasaplar için uygun mu?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Günlük sipariş alan kasaplar için uygundur."
        }
      },
      {
        "@type": "Question",
        "name": "Parça ve kilo siparişleri girilebilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Sipariş notlarıyla detaylı şekilde girilebilir."
        }
      },
      {
        "@type": "Question",
        "name": "Telefonla gelen siparişler eklenebilir mi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. Telefon siparişleri manuel olarak eklenir."
        }
      },
      {
        "@type": "Question",
        "name": "Destek var mı?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Evet. WhatsApp üzerinden destek sağlanır."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* FAQ Schema (JSON-LD) for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c'),
        }}
      />
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Siparis Sistemi"
                width={531}
                height={354}
                className="hidden md:block"
                style={{ width: '200px', height: 'auto' }}
                priority
              />
              <Image
                src="/logo.svg"
                alt="Siparis Sistemi"
                width={531}
                height={354}
                className="md:hidden"
                style={{ width: '150px', height: 'auto' }}
                priority
              />
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Giriş Yap
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-semibold transition-all text-sm"
              >
                Ücretsiz Dene
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight">
          Kasap Sipariş Sistemi
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-600">
          WhatsApp ve telefonla gelen siparişler düzenli. Komisyonsuz, dakikalar içinde aktif.
        </p>
        
        <div className="space-y-3 mb-12">
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Ücretsiz Dene
          </Link>
          <p className="text-sm text-gray-500">Kart bilgisi istemiyoruz • 7 gün tam sürüm</p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Benefits Section */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Kasaplar için özel olarak tasarlanmış sipariş sistemi. WhatsApp ve telefonla gelen 
              siparişleri karışmadan yönetin, parça ve kilo siparişlerini detaylı şekilde kaydedin.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Detaylı Sipariş Kaydı</h3>
                <p className="text-gray-700">
                  Parça ve kilo siparişleri sipariş notlarıyla detaylı şekilde girilebilir.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Telefon Siparişleri</h3>
                <p className="text-gray-700">
                  Telefonla gelen siparişler manuel olarak kolayca eklenir.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ Sipariş Takibi</h3>
                <p className="text-gray-700">
                  Hangi sipariş hazırlandı, hangisi gönderildi, hepsi görünür.
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-xl font-bold mb-3 text-gray-900">✅ WhatsApp Desteği</h3>
                <p className="text-gray-700">
                  WhatsApp üzerinden destek sağlanır. Sorun olursa çözülür.
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
                Kasaplar için uygun mu?
              </h3>
              <p className="text-gray-700">
                Evet. Günlük sipariş alan kasaplar için uygundur.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Parça ve kilo siparişleri girilebilir mi?
              </h3>
              <p className="text-gray-700">
                Evet. Sipariş notlarıyla detaylı şekilde girilebilir.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Telefonla gelen siparişler eklenebilir mi?
              </h3>
              <p className="text-gray-700">
                Evet. Telefon siparişleri manuel olarak eklenir.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                Destek var mı?
              </h3>
              <p className="text-gray-700">
                Evet. WhatsApp üzerinden destek sağlanır.
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
