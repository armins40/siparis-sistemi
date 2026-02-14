'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { themes, getTheme } from '@/lib/themes';
import { getThemeId, saveThemeId, getStore, saveStore } from '@/lib/store';
// Database operations moved to API route - no direct DB imports needed

export default function ThemePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [selectedThemeId, setSelectedThemeId] = useState<string>('modern-blue');

  useEffect(() => {
    // Load theme from localStorage first (fast), then try to sync with database
    const loadTheme = async () => {
      // First, load from localStorage (instant)
      const localThemeId = getThemeId();
      if (localThemeId) {
        setSelectedThemeId(localThemeId);
      }
      
      // Then try to load from database via API (if userId available)
      if (userId) {
        try {
          const response = await fetch(`/api/menu/${encodeURIComponent(userId)}`);
          const result = await response.json();
          
          if (result.success && result.store && result.store.themeId) {
            setSelectedThemeId(result.store.themeId);
            saveThemeId(result.store.themeId);
          }
        } catch (error) {
          console.warn('Could not load theme from DB, using localStorage:', error);
        }
      }
    };
    loadTheme();
  }, [userId]);

  const handleThemeSelect = async (themeId: string) => {
    setSelectedThemeId(themeId);
    saveThemeId(themeId);
    
    // Save to localStorage first (instant feedback)
    const store = getStore();
    if (store) {
      const updatedStore = { ...store, themeId };
      saveStore(updatedStore);
    }
    
    // Update in database via API route (server-side)
    try {
      const store = getStore();
      const storeData = store ? {
        ...store,
        themeId: themeId,
      } : {
        slug: userId,
        name: userId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        themeId: themeId,
      };
      
      console.log('📤 Sending theme update to API:', { themeId, storeSlug: storeData.slug });
      
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ store: storeData }),
      });

      const result = await response.json();
      console.log('📥 API Response:', result);

      if (result.success) {
        console.log('✅ Theme saved to database');
        // Update localStorage with full store data if needed
        if (store) {
          saveStore({ ...store, themeId });
        }
      } else {
        console.error('❌ Failed to save theme to database:', result.error);
        alert(`⚠️ Tema localStorage'a kaydedildi (database hatası: ${result.error || 'Bilinmeyen hata'})`);
      }
    } catch (error: any) {
      console.error('❌ Error saving theme to database:', error);
      alert(`⚠️ Tema localStorage'a kaydedildi (database hatası: ${error?.message || 'Bilinmeyen hata'})`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tema & Tasarım</h1>
        <p className="text-gray-600 mt-1">Müşteri menünüz için tema seçin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                isSelected ? 'ring-4 ring-gray-900' : 'hover:shadow-xl'
              }`}
            >
              <div
                className="h-32"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                }}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{theme.name}</h3>
                  {isSelected && (
                    <span className="px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                      Seçili
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>
                  <div
                    className="p-3 rounded-lg text-sm font-medium text-center"
                    style={{
                      backgroundColor: theme.primary,
                      color: '#ffffff',
                    }}
                  >
                    Örnek Buton
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Tema Nasıl Çalışır?</h3>
            <p className="text-blue-700 text-sm">
              Seçtiğiniz tema müşteri menü sayfanıza otomatik olarak uygulanır.
              Müşterileriniz menünüzü açtığında seçtiğiniz renkleri göreceklerdir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
