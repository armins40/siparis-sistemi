'use client';

import Link from 'next/link';

const WHATSAPP_URL = (num: string) => `https://wa.me/${num.replace(/\D/g, '')}`;

interface Props {
  initialWhatsappNumber: string;
  yearlyPrice?: string;
  monthlyPrice?: string;
  dailyPrice?: string;
}

export default function LandingPageContent({
  initialWhatsappNumber,
  yearlyPrice = '2490',
  monthlyPrice = '208',
  dailyPrice = '6.8',
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-slate-800 hover:text-slate-900">
            Sipariş Sistemi
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/whatsapp-siparis-sistemi"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Nasıl Çalışır?
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Giriş
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[#25D366] px-5 py-2.5 font-semibold text-white shadow-md hover:bg-[#1da851] transition-colors"
            >
              Ücretsiz Dene
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            WhatsApp ile Sipariş Alın
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 sm:text-xl">
            Tekel, manav, market, kasap ve şarküteri için pratik sipariş sistemi. QR veya linkle menü paylaşın; müşteri seçer, ödeme yöntemini belirler, sipariş WhatsApp&apos;tan gelir.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 font-semibold text-white shadow-lg hover:bg-[#1da851] transition-all hover:scale-105"
            >
              <span>7 Gün Ücretsiz Başla</span>
            </Link>
            <a
              href={WHATSAPP_URL(initialWhatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              WhatsApp&apos;tan Sor
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Kart bilgisi istemiyoruz • Dakikalar içinde aktif
          </p>
        </div>
      </section>

      {/* Özellikler */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
          Neden Sipariş Sistemi?
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="mb-4 text-3xl">📱</div>
            <h3 className="mb-2 font-semibold text-slate-900">Tek Ekranda Siparişler</h3>
            <p className="text-sm text-slate-600">
              Tüm siparişler tek panelde. Karışıklık yok, her şey düzenli.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="mb-4 text-3xl">🕐</div>
            <h3 className="mb-2 font-semibold text-slate-900">Açılış Saatleri</h3>
            <p className="text-sm text-slate-600">
              Gün gün açılış/kapanış saatlerinizi girin. Müşteri menüde görsün.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="mb-4 text-3xl">💳</div>
            <h3 className="mb-2 font-semibold text-slate-900">Nakit / Kredi Kartı</h3>
            <p className="text-sm text-slate-600">
              Müşteri ödeme yöntemini seçer, WhatsApp mesajında belirtilir.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100">
            <div className="mb-4 text-3xl">⭐</div>
            <h3 className="mb-2 font-semibold text-slate-900">Google Puanlama</h3>
            <p className="text-sm text-slate-600">
              Menüde &quot;Bizi Değerlendirin&quot; butonu. Google linkinizi ekleyin.
            </p>
          </div>
        </div>
      </section>

      {/* Fiyat */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Komisyonsuz, Şeffaf Fiyat
          </h2>
          <p className="mb-8 text-slate-600">
            Aylık {monthlyPrice}₺ • Günlük {dailyPrice}₺ • Yıllık {yearlyPrice}₺
          </p>
          <Link
            href="/signup"
            className="inline-flex rounded-xl bg-slate-900 px-8 py-4 font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            7 Gün Ücretsiz Dene
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-[#25D366] to-[#1da851] p-10 text-center text-white shadow-xl">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            Hemen Başlayın
          </h2>
          <p className="mb-8 text-white/90">
            Ürünlerinizi ekleyin, QR veya link paylaşın. Müşteriler sipariş vermeye başlasın.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-xl bg-white px-8 py-4 font-semibold text-[#25D366] hover:bg-slate-50 transition-colors"
          >
            Ücretsiz Kayıt Ol
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
          <Link href="/hizmet-sozlesmesi" className="hover:text-slate-900">
            Hizmet Sözleşmesi
          </Link>
          <Link href="/kvkk" className="hover:text-slate-900">
            KVKK
          </Link>
          <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-slate-900">
            Mesafeli Satış
          </Link>
          <Link href="/iade-iptal" className="hover:text-slate-900">
            İade & İptal
          </Link>
        </div>
      </footer>
    </div>
  );
}
