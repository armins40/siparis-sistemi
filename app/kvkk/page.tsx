import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'Siparis-Sistemi.com Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default function KvkkPage() {
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
            KVKK Aydınlatma Metni
          </h1>
          <p className="text-gray-600">
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında, Siparis-Sistemi.com platformunda işlenen kişisel verilerinize ilişkin aydınlatma ve bilgilendirme metnidir.
          </p>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">ABA Yazılım</p>
              <p>Vergi No: 1670425470</p>
              <p>Adres: Kırşehir Merkez</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Toplanan Veriler</h2>
            <p className="mb-4">Platform aşağıdaki verileri toplayabilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ad soyad</li>
              <li>Telefon numarası</li>
              <li>E-posta adresi</li>
              <li>İşletme bilgileri</li>
              <li>Sipariş verileri</li>
              <li>IP adresi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Veri Toplama Amacı</h2>
            <p className="mb-4">Veriler; aşağıdaki amaçlarıyla işlenir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hizmet sunumu</li>
              <li>Abonelik yönetimi</li>
              <li>Teknik destek</li>
              <li>Yasal yükümlülükler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Veri Paylaşımı</h2>
            <p className="mb-4">Kişisel veriler; mevzuat kapsamında aşağıdakilerle paylaşılabilir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ödeme altyapıları</li>
              <li>Yasal kurumlar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Veri Saklama</h2>
            <p>
              Veriler, yasal süreler boyunca saklanır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Kullanıcı Hakları</h2>
            <p className="mb-4">Kullanıcı; aşağıdaki haklara sahiptir:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Verilerinin işlenmesini öğrenme</li>
              <li>Düzeltme talep etme</li>
              <li>Silinmesini talep etme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Başvuru</h2>
            <p>
              KVKK talepleri e-posta yoluyla iletilebilir.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
