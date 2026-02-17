'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MARKETING } from '@/lib/marketing';

const faqs = [
  {
    soru: 'Sipariş Sistemi nedir?',
    cevap: 'Siparis-Sistemi.com, tekel, manav, market, kasap ve şarküteri gibi işletmeler için bulut tabanlı sipariş ve ürün yönetim yazılımıdır. Müşterileriniz QR kod veya link ile menünüze ulaşır, ürün seçer, ödeme yöntemini belirler ve sipariş WhatsApp üzerinden size iletir.',
  },
  {
    soru: 'Ücretsiz deneme var mı?',
    cevap: 'Evet. 7 gün ücretsiz deneme ile tüm özellikleri test edebilirsiniz. Kayıt sırasında kredi kartı bilgisi istemiyoruz.',
  },
  {
    soru: 'Fiyatlandırma nasıl?',
    cevap: MARKETING.SSS_FIYAT_CEVAP,
  },
  {
    soru: 'Nasıl başlayabilirim?',
    cevap: 'Kayıt ol butonuna tıklayarak hesap oluşturun. Ürünlerinizi ekleyin, QR kod veya menü linkinizi alın. Müşterilerinizle bu linki paylaşın, siparişler WhatsApp\'tan gelmeye başlasın.',
  },
  {
    soru: 'Hangi işletmeler için uygundur?',
    cevap: 'Tekel, manav, market, kasap, şarküteri, lokanta, kafe ve sipariş alan tüm perakende işletmeler için uygundur.',
  },
  {
    soru: 'Siparişler nasıl gelir?',
    cevap: 'Müşteri menüden seçim yaptıktan sonra sipariş otomatik olarak belirlediğiniz WhatsApp numarasına mesaj olarak iletilir. Tüm siparişler ayrıca panelde tek ekranda görüntülenir.',
  },
  {
    soru: 'Ürün ve kategori nasıl eklenir?',
    cevap: 'Giriş yaptıktan sonra panelden Ürünler ve Kategoriler bölümüne gidin. Kategorileri oluşturun, ardından her kategoriye ürün ekleyin. Fiyat, açıklama ve görsel ekleyebilirsiniz.',
  },
  {
    soru: 'Menü nasıl paylaşılır?',
    cevap: 'Her işletmenin benzersiz bir menü linki ve QR kodu vardır. Bu linki sosyal medyada, vitrininizde veya WhatsApp durumunuzda paylaşabilirsiniz. QR kodu yazdırıp masaya veya camınıza koyabilirsiniz.',
  },
  {
    soru: 'Açılış saatleri nasıl ayarlanır?',
    cevap: 'Panelden gün gün açılış ve kapanış saatlerinizi girebilirsiniz. Müşteri menüde bu saatleri görür ve kapalı olduğunuzda sipariş veremez.',
  },
  {
    soru: 'Ödeme yöntemleri nelerdir?',
    cevap: 'Müşteri sipariş verirken nakit veya kredi kartı seçebilir. Bu bilgi WhatsApp mesajında size iletilir. Ödeme işlemi sizin mevcut sisteminizle (nakit tahsilat, POS vb.) yapılır.',
  },
  {
    soru: 'İptal ve iade nasıl yapılır?',
    cevap: 'İade ve iptal koşulları İade & İptal sayfamızda detaylı olarak açıklanmaktadır. Abonelik iptali panelden yapılabilir.',
  },
  {
    soru: 'Destek alabilir miyim?',
    cevap: 'Ana sayfadaki "WhatsApp\'tan Sor" butonu ile veya kayıt sonrası paneldeki iletişim bilgileriyle bize ulaşabilirsiniz.',
  },
];

export default function SSSPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-block text-orange-600 hover:text-orange-700 font-medium mb-8"
        >
          ← Ana sayfaya dön
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Sıkça Sorulan Sorular
          </h1>
          <p className="text-gray-600">
            Siparis-Sistemi.com hakkında merak ettiklerinizin cevapları.
          </p>
        </header>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">{faq.soru}</span>
                <span
                  className={`shrink-0 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              {openIndex === index && (
                <div className="px-5 pb-4 pt-0">
                  <p className="text-gray-600 leading-relaxed">{faq.cevap}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-gray-500 text-sm">
          Sorunuz cevaplanmadı mı?{' '}
          <Link href="/" className="text-orange-600 hover:text-orange-700 font-medium">
            Ana sayfadan
          </Link>{' '}
          WhatsApp ile bize ulaşabilirsiniz.
        </p>
      </article>
    </div>
  );
}
