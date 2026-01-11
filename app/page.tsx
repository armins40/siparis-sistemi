'use client';

import Link from 'next/link';

export default function LandingPage() {
  const scrollToPricing = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('fiyatlandirma');
    if (element) {
      // Sticky header için offset hesapla (64px = h-16)
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#555555' }}>
                Siparis
          </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 font-medium transition-colors"
                style={{ color: '#555555' }}
              >
                Giriş Yap
              </Link>
              <a
                href="#fiyatlandirma"
                onClick={scrollToPricing}
                className="px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
              >
                Fiyatlandırma
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="text-6xl mb-6">🏪</div>
        <h2 className="text-5xl sm:text-6xl font-bold mb-6" style={{ color: '#555555' }}>
          Dijital Sipariş & QR Menü Sistemi
        </h2>
        <p className="text-2xl mb-8" style={{ color: '#999999' }}>
          Küçük işletmeler için büyük kolaylık
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 text-lg" style={{ color: '#555555' }}>
          <div className="flex items-center justify-center">
            <span className="mr-2">✅</span>
            <span>Komisyon yok.</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="mr-2">✅</span>
            <span>Karmaşa yok.</span>
          </div>
          <div className="flex items-center justify-center">
            <span className="mr-2">✅</span>
            <span>Müşterin menüne saniyeler içinde ulaşsın.</span>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
        >
          🚀 Ücretsiz 7 Gün Dene
        </Link>
      </section>

      {/* Kimler İçin Uygun? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#555555' }}>
          🚀 Kimler İçin Uygun?
        </h3>
        <p className="text-center mb-10" style={{ color: '#999999' }}>
          Bu sistem özellikle şu işletmeler için tasarlandı:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {[
            { icon: '🥖', name: 'Bakkal' },
            { icon: '🥃', name: 'Tekel' },
            { icon: '🍎', name: 'Manav' },
            { icon: '🛒', name: 'Market' },
            { icon: '🍰', name: 'Tatlıcı & Pastane' },
            { icon: '🐶', name: 'Petshop' },
            { icon: '☕', name: 'Kafe & küçük restoranlar' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 rounded-xl transition-shadow hover:shadow-lg"
              style={{ backgroundColor: '#FAFAFA' }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <p className="text-sm font-medium text-center" style={{ color: '#555555' }}>
                {item.name}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm" style={{ color: '#999999' }}>
          Bilgisayar bilgisi gerekmez. <br />
          Kur, ürünlerini ekle, QR kodunu masaya koy – bu kadar.
        </p>
      </section>

      {/* Kullanım Kolaylığı */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#555555' }}>
          💡 Kullanım Kolaylığı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-10">
          {[
            { text: 'Telefon, tablet, bilgisayar uyumlu' },
            { text: 'Müşteri uygulama indirmez' },
            { text: 'QR okut → Menü açılır' },
            { text: 'Sipariş anında sana ulaşır' },
            { text: 'Ürün, fiyat, stok dilediğin zaman değişir' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <p className="font-medium" style={{ color: '#555555' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 font-medium" style={{ color: '#555555' }}>
          Dakikalar içinde dijital menüye geç.
        </p>
      </section>

      {/* Amaç */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#555555' }}>
          🎯 Amaç
        </h3>
        <p className="text-center mb-8" style={{ color: '#999999' }}>
          İşletmenin:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            'Sipariş almayı hızlandırması',
            'Karışıklığı azaltması',
            'Müşteriye modern bir deneyim sunması',
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl text-center"
              style={{ backgroundColor: '#FAFAFA' }}
            >
              <p className="font-medium" style={{ color: '#555555' }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sonuç & Faydalar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#555555' }}>
          ✅ Sonuç & Faydalar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-10">
          {[
            { icon: '⏱', text: 'Daha hızlı sipariş' },
            { icon: '📉', text: 'Daha az hata' },
            { icon: '📱', text: 'Daha modern görünüm' },
            { icon: '💰', text: 'Daha fazla satış' },
            { icon: '😌', text: 'Daha az stres' },
          ].map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl text-center"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <p className="font-medium" style={{ color: '#555555' }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyatlandırma Planları */}
      <section id="fiyatlandirma" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#555555' }}>
          💳 Fiyatlandırma Planları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Ücretsiz Deneme */}
          <div className="p-6 rounded-xl border-2 relative flex flex-col" style={{ backgroundColor: '#FAFAFA', borderColor: '#AF948F' }}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="text-xl font-bold mb-2" style={{ color: '#555555' }}>
                ÜCRETSİZ DENEME
              </h4>
              <p className="text-2xl font-bold mb-1" style={{ color: '#555555' }}>
                7 Gün Ücretsiz
              </p>
            </div>
            <ul className="space-y-2 mb-4 text-sm flex-1" style={{ color: '#555555' }}>
              <li>✓ QR Menü</li>
              <li>✓ Tema seçimi</li>
              <li>✓ Sınırlı ürün ekleme</li>
              <li>✓ Mobil uyumlu</li>
            </ul>
            <div className="text-xs text-center mb-4" style={{ color: '#999999' }}>
              🟢 Kredi kartı gerekmez
            </div>
            <Link
              href="/dashboard"
              className="block w-full text-center py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 mt-auto"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Hemen Başla
            </Link>
          </div>

          {/* 1 Aylık Plan */}
          <div className="p-6 rounded-xl border-2 relative flex flex-col" style={{ backgroundColor: '#FAFAFA', borderColor: '#AF948F' }}>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold mb-2" style={{ color: '#555555' }}>
                📅 1 AYLIK PLAN
              </h4>
              <p className="text-3xl font-bold mb-1" style={{ color: '#555555' }}>
                299₺
              </p>
              <p className="text-sm" style={{ color: '#999999' }}>
                / ay
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm flex-1" style={{ color: '#555555' }}>
              <li>✓ Sınırsız ürün</li>
              <li>✓ Sipariş alma</li>
              <li>✓ Tema özelleştirme</li>
              <li>✓ WhatsApp sipariş</li>
              <li>✓ Temel destek</li>
            </ul>
            <Link
              href="/signup?plan=monthly"
              className="block w-full text-center py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 mt-auto"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Hemen Başla
            </Link>
          </div>

          {/* 6 Aylık Plan */}
          <div className="p-6 rounded-xl border-2 relative flex flex-col" style={{ backgroundColor: '#FAFAFA', borderColor: '#AF948F' }}>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold mb-2" style={{ color: '#555555' }}>
                📆 6 AYLIK PLAN
              </h4>
              <p className="text-sm mb-2" style={{ color: '#999999' }}>
                Daha Uygun, Daha Mantıklı
              </p>
              <p className="text-3xl font-bold mb-1" style={{ color: '#555555' }}>
                1590₺
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm flex-1" style={{ color: '#555555' }}>
              <li>✓ Aylık plana göre indirim</li>
              <li>✓ Uzun vadeli kullanım</li>
              <li>✓ Tüm özellikler</li>
              <li>✓ WhatsApp sipariş</li>
              <li>✓ Temel destek</li>
            </ul>
            <Link
              href="/signup?plan=6month"
              className="block w-full text-center py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 mt-auto"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Hemen Başla
            </Link>
          </div>

          {/* Yıllık Plan - Önerilen */}
          <div className="p-6 rounded-xl border-2 relative flex flex-col transform scale-105" style={{ backgroundColor: '#FAFAFA', borderColor: '#FB6602' }}>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#F6A705', color: '#FFFFFF' }}>
              En Avantajlı Plan 🔥
            </div>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold mb-2" style={{ color: '#555555' }}>
                ⭐ YILLIK PLAN – ÖNERİLEN
              </h4>
              <p className="text-sm mb-2" style={{ color: '#999999' }}>
                Avantajlı Paket 🔥
              </p>
              <p className="text-3xl font-bold mb-1" style={{ color: '#555555' }}>
                2490₺
              </p>
              <p className="text-xs mb-2" style={{ color: '#999999' }}>
                1 aylık fiyata göre ciddi tasarruf
              </p>
            </div>
            <ul className="space-y-2 mb-6 text-sm flex-1" style={{ color: '#555555' }}>
              <li>✓ Tüm özellikler açık</li>
              <li>✓ Öncelikli destek</li>
              <li>✓ Daha az maliyet, daha çok kazanç</li>
            </ul>
            <Link
              href="/signup?plan=yearly"
              className="block w-full text-center py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 mt-auto"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              Yıllık Planı Seç
            </Link>
          </div>
        </div>
      </section>

      {/* Neden Bu Sistem? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-4" style={{ color: '#555555' }}>
          🧡 Neden Bu Sistem?
        </h3>
        <p className="text-center max-w-3xl mx-auto text-lg mb-8" style={{ color: '#999999' }}>
          Çünkü bu sistem:
        </p>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="font-medium" style={{ color: '#555555' }}>
              Büyük zincirler için değil
            </p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="font-medium" style={{ color: '#555555' }}>
              Senin gibi esnaf için yapıldı
            </p>
          </div>
          <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <p className="font-medium" style={{ color: '#555555' }}>
              Karmaşık paneller yok. Gereksiz özellik yok. Sadece işini kolaylaştıran şeyler var.
            </p>
          </div>
        </div>
      </section>

      {/* Kapanış CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center" style={{ backgroundColor: '#AF948F' }}>
        <h3 className="text-3xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
          Dijitalleşmek zor değil.
        </h3>
        <p className="text-xl mb-8" style={{ color: '#FFFFFF', opacity: 0.9 }}>
          Doğru sistemle çok kolay.
        </p>
        <p className="text-lg mb-8" style={{ color: '#FFFFFF', opacity: 0.8 }}>
          Şimdi başla, farkı hemen gör.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 rounded-lg font-semibold text-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
        >
          🟠 Ücretsiz 7 Gün Dene
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center space-y-2" style={{ color: '#999999' }}>
            <p>© 2024 Siparis. Tüm hakları saklıdır.</p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link
                href="/contact"
                className="hover:underline transition-colors"
                style={{ color: '#555555' }}
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
