import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Siparis-Sistemi.com gizlilik politikası ve kişisel verilerin korunması.',
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-block text-orange-600 hover:text-orange-700 font-medium mb-8"
        >
          ← Ana sayfaya dön
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-600">
            Bu Gizlilik Politikası, siparis-sistemi.com platformunu kullanan ziyaretçilerin ve kullanıcıların kişisel verilerinin nasıl toplandığını, işlendiğini ve korunduğunu açıklamaktadır.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Genel Bilgilendirme</h2>
            <p>
              Bu Gizlilik Politikası, siparis-sistemi.com platformunu kullanan ziyaretçilerin ve kullanıcıların kişisel verilerinin nasıl toplandığını, işlendiğini ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Veri Sorumlusu</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">ABA Yazılım</p>
              <p>Vergi Dairesi: Kırşehir</p>
              <p>Vergi No: 1670425470</p>
              <p>Adres: Kırşehir Merkez</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Toplanan Veriler</h2>
            <p className="mb-4">Platform aşağıdaki verileri toplayabilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ad soyad</li>
              <li>Telefon numarası</li>
              <li>E-posta adresi</li>
              <li>İşletme bilgileri</li>
              <li>Sipariş ve ürün verileri</li>
              <li>IP adresi</li>
              <li>Kullanım logları</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Verilerin Kullanım Amaçları</h2>
            <p className="mb-4">Toplanan veriler; aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hizmet sunmak</li>
              <li>Kullanıcı hesaplarını yönetmek</li>
              <li>Teknik destek sağlamak</li>
              <li>Ödeme işlemlerini gerçekleştirmek</li>
              <li>Yasal yükümlülükleri yerine getirmek</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Veri Güvenliği</h2>
            <p className="mb-4">Siparis-sistemi.com; aşağıdaki güvenlik önlemlerini kullanmaktadır:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL güvenliği</li>
              <li>Sunucu güvenlik sistemleri</li>
              <li>Erişim kontrol mekanizmaları</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Üçüncü Taraf Hizmetler</h2>
            <p className="mb-4">Platform aşağıdaki hizmet sağlayıcılarla veri paylaşabilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ödeme altyapısı (PayTR)</li>
              <li>Hosting ve sunucu sağlayıcıları</li>
              <li>E-posta ve bildirim servisleri</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Veri Saklama Süresi</h2>
            <p>
              Kişisel veriler yasal yükümlülükler süresince saklanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Kullanıcı Hakları</h2>
            <p className="mb-4">Kullanıcılar; aşağıdaki haklara sahiptir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verilerine erişme</li>
              <li>Düzeltme talep etme</li>
              <li>Silinmesini isteme</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
