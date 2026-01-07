'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [activeMenuItems, setActiveMenuItems] = useState<number>(0);
  const totalOrders = 0;

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();
          if (Array.isArray(products)) {
            setTotalProducts(products.length);
            setActiveMenuItems(products.filter((p: any) => p.stock > 0 || !p.stock).length);
          }
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f5f5f5',
      padding: '24px'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: '32px'
      }}>
        Yönetim Paneli
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Toplam Ürün Sayısı */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Toplam Ürün Sayısı
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            {totalProducts}
          </div>
        </div>

        {/* Aktif Menü Sayısı */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Aktif Menü Sayısı
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            {activeMenuItems}
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px'
          }}>
            Toplam Sipariş
          </div>
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a'
          }}>
            {totalOrders}
          </div>
        </div>
      </div>
    </div>
  );
}
