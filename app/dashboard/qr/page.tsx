'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { getStore } from '@/lib/store';

export default function QRPage() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // Use a callback to avoid setState in effect warning
    const initQR = async () => {
      const store = getStore();
      if (!store || !store.slug) {
        setMenuUrl('');
        return;
      }

      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/m/${store.slug}`
        : '';
      setMenuUrl(url);

      if (url) {
        try {
          const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
          setQrUrl(dataUrl);
        } catch (err) {
          console.error('QR code generation error:', err);
        }
      }
    };
    
    initQR();
  }, []);

  const handleCopy = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const input = document.createElement('input');
      input.value = menuUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-menu-${getStore()?.slug || 'menu'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const store = getStore();

  if (!store || !store.slug) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Kod & Link</h1>
          <p className="text-gray-600 mt-1">Menünüzü paylaşın</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Mağaza bilgisi eksik
          </h3>
          <p className="text-gray-600 mb-6">
            QR kod oluşturmak için önce mağaza ayarlarından slug bilgisini kaydedin.
          </p>
          <a
            href="/dashboard/settings"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Ayarlara Git
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Kod & Link</h1>
        <p className="text-gray-600 mt-1">Menünüzü paylaşın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">QR Kod</h2>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            {qrUrl ? (
              <>
                <img src={qrUrl} alt="QR Code" className="mb-4" />
                <button
                  onClick={handleDownloadQR}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  QR Kodu İndir (PNG)
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  QR kodu yazdırıp müşterilerinize gösterebilirsiniz
                </p>
              </>
            ) : (
              <div className="text-gray-400">QR kod oluşturuluyor...</div>
            )}
          </div>
        </div>

        {/* Link */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Menü Linki</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menü URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={menuUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm cursor-text"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    copySuccess
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {copySuccess ? '✓ Kopyalandı' : 'Kopyala'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Bu linki müşterilerinizle paylaşabilirsiniz
              </p>
            </div>
            <div>
              <button
                onClick={() => window.open(menuUrl, '_blank')}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Menüyü Görüntüle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
