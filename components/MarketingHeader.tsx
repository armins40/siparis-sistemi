'use client';

import Link from 'next/link';
import { useState } from 'react';

const WHATSAPP_URL = (num: string) => `https://wa.me/${num.replace(/\D/g, '')}`;

interface MarketingHeaderProps {
  /** Banner başlığı (örn: "WhatsApp Sipariş Sistemi") */
  bannerTitle: string;
  /** Banner alt metni (opsiyonel) */
  bannerSubtitle?: string;
  /** WhatsApp numarası - menüde kullanılır */
  whatsappNumber?: string;
  /** Banner içeriği - CTA butonları vb. (opsiyonel) */
  bannerChildren?: React.ReactNode;
}

export default function MarketingHeader({
  bannerTitle,
  bannerSubtitle,
  whatsappNumber = '905535057059',
  bannerChildren,
}: MarketingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Header: Logo sol, menü ikonu sağ */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm h-14 sm:h-16">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="relative flex h-full items-center shrink-0">
            <img
              src="/logo.svg"
              alt="Sipariş Sistemi"
              className="h-14 w-auto max-w-[360px] sm:h-16 sm:max-w-[420px] md:h-16 md:max-w-[500px] object-contain object-left"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const fb = (e.target as HTMLImageElement).nextElementSibling;
                if (fb) (fb as HTMLElement).style.display = 'block';
              }}
            />
            <span className="hidden text-xl font-bold text-slate-800 ml-0" style={{ display: 'none' }}>
              Sipariş Sistemi
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#FB6602' }}
            >
              Giriş
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Menü"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Açılır menü */}
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-hidden="true" />
            <nav className="absolute right-4 top-full mt-2 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Menü</p>
              </div>
              <div className="p-2">
                <Link
                  href="/whatsapp-siparis-sistemi"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-[#25D366]/10 hover:text-[#1da851]"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="font-medium">Nasıl Çalışır?</span>
                </Link>
                <Link
                  href="/affiliate"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-amber-50 hover:text-amber-700"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span className="font-medium">Satış Ortaklığı</span>
                </Link>
                <Link
                  href="/hakkimizda"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <span className="font-medium">Hakkımızda</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="font-medium">İletişim</span>
                </Link>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                <a
                  href={WHATSAPP_URL(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1da851] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp&apos;tan Sor
                </a>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* Banner: Koyu gradient - önceki büyük boyut */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32 md:py-40 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {bannerTitle}
          </h1>
          {bannerSubtitle && (
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300 sm:text-xl">
              {bannerSubtitle}
            </p>
          )}
          {bannerChildren}
        </div>
      </section>
    </>
  );
}
