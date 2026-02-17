/**
 * Merkezi pazarlama metinleri ve varsayılan değerler.
 * Bu dosyadan güncellenince tüm sayfalarda yansır.
 * Fiyatlar veritabanından (settings) alınır; buradaki değerler yedek/varsayılan içindir.
 */

export const MARKETING = {
  /** Fiyat bölümü sloganı (ana sayfa) */
  PRICE_TAGLINE: 'Günlük bir çay parasına sipariş sistemi',

  /** Fiyat başlığı */
  PRICE_HEADING: 'Komisyonsuz, Şeffaf Fiyat',

  /** SSS - Fiyatlandırma cevabı (fiyatlar ana sayfadan gelir, burada sadece açıklama) */
  SSS_FIYAT_CEVAP:
    'Komisyonsuz, şeffaf fiyatlandırma uygulanır. Aylık ve yıllık plan seçenekleri mevcuttur. Yıllık plan KDV dahil değildir (+KDV). Güncel fiyatlar ana sayfada ve kayıt sayfasında belirtilir.',

  /** Varsayılan yıllık fiyat (TL) - DB'de yearly_price yoksa kullanılır */
  DEFAULT_YEARLY_PRICE: '2490',

  /** Varsayılan aylık fiyat (TL) - DB'de monthly_plan_price yoksa kullanılır */
  DEFAULT_MONTHLY_PRICE: '599',
} as const;
