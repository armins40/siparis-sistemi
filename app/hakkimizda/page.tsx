import Link from 'next/link';

export default function HakkimizdaPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-block text-orange-600 hover:text-orange-700 font-medium mb-8"
      >
        ← Ana sayfaya dön
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Hakkımızda
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Sipariş Sistemi
        </p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8 text-gray-700">
        <p className="text-lg leading-relaxed">
          Sipariş Sistemi, restoran, kafe ve benzeri işletmelerin dijital sipariş ve menü yönetimini kolaylaştırmak amacıyla geliştirilmiş bulut tabanlı bir yazılım platformudur.
        </p>

        <p className="leading-relaxed">
          Günümüzde işletmeler için hızlı, pratik ve erişilebilir dijital çözümler büyük önem taşımaktadır. Sipariş Sistemi, işletmelerin menülerini dijital ortama taşımasını, sipariş süreçlerini yönetmesini ve müşteri deneyimini geliştirmesini sağlayan modern bir altyapı sunar.
        </p>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">🎯 Misyonumuz</h2>
          <p className="leading-relaxed">
            İşletmelerin dijital dönüşüm sürecini kolaylaştırmak, sipariş ve menü yönetimini daha verimli hale getirmek ve kullanıcı dostu çözümler sunmaktır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">🚀 Vizyonumuz</h2>
          <p className="leading-relaxed">
            Türkiye başta olmak üzere restoran ve hizmet sektöründe faaliyet gösteren işletmeler için güvenilir, ölçeklenebilir ve yenilikçi sipariş yönetim platformlarından biri olmak.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">💡 Neler Sunuyoruz?</h2>
          <p className="mb-4 leading-relaxed">
            Sipariş Sistemi üzerinden işletmeler:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Dijital menü oluşturabilir</li>
            <li>Ürün ve kategori yönetimi yapabilir</li>
            <li>Siparişleri anlık takip edebilir</li>
            <li>İşletme paneli üzerinden tüm süreçleri yönetebilir</li>
            <li>Müşteri sipariş deneyimini iyileştirebilir</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">🔐 Güven ve Şeffaflık</h2>
          <p className="leading-relaxed">
            Platformumuz, kullanıcı verilerinin güvenliği ve hizmet kalitesi konusunda yüksek standartları benimsemektedir. Tüm süreçler şeffaf şekilde yürütülmekte ve kullanıcı memnuniyeti öncelikli tutulmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">📊 Hizmet Modelimiz</h2>
          <p className="leading-relaxed">
            Sipariş Sistemi abonelik modeli ile çalışmaktadır. Kullanıcılar kayıt olduktan sonra sistemi ücretsiz deneyebilir ve ihtiyaçlarına uygun abonelik planını seçerek kullanmaya devam edebilir.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-4">🤝 Müşteri Odaklı Yaklaşım</h2>
          <p className="leading-relaxed">
            Her işletmenin ihtiyacının farklı olduğunun bilinciyle, kullanıcı deneyimini ön planda tutan esnek ve pratik çözümler geliştirmekteyiz.
          </p>
        </section>

        <section className="bg-slate-50 rounded-xl p-6 mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Firma Bilgileri</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Şirket Adı:</strong> aba yazılım</li>
            <li><strong>Şirket Türü:</strong> Şahıs Şirketi</li>
            <li><strong>Vergi Dairesi:</strong> Kırşehir</li>
            <li><strong>Faaliyet Alanı:</strong> Yazılım ve dijital sipariş sistemleri</li>
          </ul>
        </section>

        <section className="bg-slate-50 rounded-xl p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📬 İletişim</h2>
          <p className="mb-4 leading-relaxed">
            Her türlü soru ve destek talebi için bizimle iletişime geçebilirsiniz.
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Destek E-posta:</strong>{' '}
              <a href="mailto:destek@siparis-sistemi.com" className="text-orange-600 hover:underline">
                destek@siparis-sistemi.com
              </a>
            </li>
            <li>
              <strong>Web Site:</strong>{' '}
              <a href="https://www.siparis-sistemi.com" className="text-orange-600 hover:underline">
                www.siparis-sistemi.com
              </a>
            </li>
          </ul>
          <Link
            href="/contact"
            className="inline-block mt-4 px-6 py-2 rounded-lg font-medium text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            İletişim Formu
          </Link>
        </section>
      </div>
    </article>
  );
}
