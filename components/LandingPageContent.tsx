'use client';

import Link from 'next/link';

const WHATSAPP_URL = (num: string) => `https://wa.me/${num.replace(/\D/g, '')}`;

export default function LandingPageContent({ initialWhatsappNumber }: { initialWhatsappNumber: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-emerald-700">Sipariş Sistemi</span>
          <nav className="flex gap-4">
            <Link href="/login" className="text-emerald-700 hover:underline">Giriş</Link>
            <Link href="/signup" className="rounded-lg bg-[#25D366] px-4 py-2 font-medium text-white hover:bg-[#1da851]">Ücretsiz Dene</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          WhatsApp ile Sipariş Alın
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Tekel, manav, market ve kasap için pratik sipariş sistemi. QR veya linkle menü paylaşın; müşteri seçer, sipariş WhatsApp’tan gelir. 7 gün ücretsiz deneme.
        </p>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href={WHATSAPP_URL(initialWhatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-medium text-white shadow-lg hover:bg-[#1da851]"
          >
            <span>WhatsApp’tan Yazın</span>
          </a>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 px-6 py-3 font-medium text-emerald-700 hover:bg-emerald-50"
          >
            7 Gün Ücretsiz Başla
          </Link>
        </div>

        <section className="rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">Neden Sipariş Sistemi?</h2>
          <ul className="grid gap-4 text-left sm:grid-cols-2 md:grid-cols-3">
            <li className="flex gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <strong>Tek ekranda siparişler</strong>
                <p className="text-sm text-gray-600">Tüm siparişler tek panelde</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <strong>QR & link menü</strong>
                <p className="text-sm text-gray-600">Müşteri menüden seçer, WhatsApp’tan gönderir</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-2xl">🆓</span>
              <div>
                <strong>7 gün ücretsiz</strong>
                <p className="text-sm text-gray-600">Denemeden sonra karar verin</p>
              </div>
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-t border-emerald-100 py-6 text-center text-sm text-gray-500">
        <Link href="/hizmet-sozlesmesi" className="hover:underline">Hizmet Sözleşmesi</Link>
        {' · '}
        <Link href="/kvkk" className="hover:underline">KVKK</Link>
      </footer>
    </div>
  );
}
