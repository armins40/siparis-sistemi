'use client';

import Link from 'next/link';
import MarketingHeader from './MarketingHeader';
import { MARKETING } from '@/lib/marketing';

const WHATSAPP_URL = (num: string) => `https://wa.me/${num.replace(/\D/g, '')}`;

interface Props {
  initialWhatsappNumber: string;
  yearlyPrice?: string;
  monthlyPrice?: string;
  priceTagline?: string;
}

export default function LandingPageContent({
  initialWhatsappNumber,
  yearlyPrice = '2490',
  monthlyPrice = '208',
  priceTagline = 'Günlük bir çay parasına sipariş sistemi',
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <MarketingHeader
        bannerTitle="WhatsApp ile Sipariş Alın"
        bannerSubtitle="Tekel, manav, market, kasap ve şarküteri için pratik sipariş sistemi. QR veya linkle menü paylaşın; müşteri seçer, ödeme yöntemini belirler, sipariş WhatsApp'tan gelir."
        whatsappNumber={initialWhatsappNumber}
        bannerChildren={
          <>
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
          </>
        }
      />

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
          <p className="mb-2 text-slate-500 text-sm font-medium">{priceTagline}</p>
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            {MARKETING.PRICE_HEADING}
          </h2>
          <p className="mb-8 text-slate-600">
            Aylık {monthlyPrice}₺ • Yıllık {yearlyPrice}₺+KDV
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
          <Link href="/kullanim-sartlari" className="hover:text-slate-900">
            Kullanım Şartları
          </Link>
          <Link href="/affiliate-sozlesmesi" className="hover:text-slate-900">
            Affiliate
          </Link>
          <Link href="/sss" className="hover:text-slate-900">
            SSS
          </Link>
          <Link href="/gizlilik-politikasi" className="hover:text-slate-900">
            Gizlilik
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
          <Link href="/cerez-politikasi" className="hover:text-slate-900">
            Çerez Politikası
          </Link>
        </div>
      </footer>
    </div>
  );
}
