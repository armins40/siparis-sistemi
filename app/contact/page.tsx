'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#555555' }}>
                Siparis
              </h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 font-medium transition-colors"
                style={{ color: '#555555' }}
              >
                Giriş Yap
              </Link>
              <Link
                href="/#fiyatlandirma"
                className="px-6 py-2 rounded-lg font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
              >
                Fiyatlandırma
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Contact Form Section */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: '#555555' }}>
            📧 İletişim
          </h2>
          <p className="text-center mb-8" style={{ color: '#999999' }}>
            Sorularınız için bize ulaşın. Size en kısa sürede dönüş yapacağız.
          </p>

          {submitStatus === 'success' && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-green-800 text-center">
                ✅ Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-800 text-center">
                ❌ Bir hata oluştu. Lütfen tekrar deneyin veya doğrudan{' '}
                <a
                  href="mailto:admin@siparis-sistemi.com"
                  className="underline font-semibold"
                >
                  admin@siparis-sistemi.com
                </a>
                {' '}adresine mail gönderin.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Ad Soyad *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                E-posta *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Konu *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                style={{ borderColor: '#AF948F' }}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#555555' }}>
                Mesajınız *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                style={{ borderColor: '#AF948F' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#FB6602', color: '#FFFFFF' }}
            >
              {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: '#AF948F' }}>
            <p className="text-sm mb-2" style={{ color: '#999999' }}>
              Doğrudan e-posta göndermek için:
            </p>
            <a
              href="mailto:admin@siparis-sistemi.com"
              className="text-sm font-medium hover:underline"
              style={{ color: '#FB6602' }}
            >
              admin@siparis-sistemi.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center" style={{ color: '#999999' }}>
            <p>© 2024 Siparis. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
