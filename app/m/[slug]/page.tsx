'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: string | number
  name: string
  price: number
  category: string
  image?: string
}

export default function CustomerMenuPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } catch (err: any) {
        console.error('[Menu] Error loading products:', err)
        setError(err.message || 'Ürünler yüklenirken bir hata oluştu')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Group products by category
  const groupedProducts: Record<string, Product[]> = {}
  products.forEach((product) => {
    const category = product.category || 'Diğer'
    if (!groupedProducts[category]) {
      groupedProducts[category] = []
    }
    groupedProducts[category].push(product)
  })

  const businessName = slug
    ? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Mağaza'

  // Loading State
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e0e0e0',
            borderTopColor: '#9c27b0',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
            WebkitAnimation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: '16px', color: '#666', margin: 0 }}>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#d32f2f', marginBottom: '12px' }}>
            Hata Oluştu
          </h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Empty State
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '12px' }}>
            Henüz ürün bulunmuyor
          </h2>
          <p style={{ color: '#666' }}>
            Bu mağazada henüz ürün eklenmemiş.
          </p>
        </div>
      </div>
    )
  }

  // Main Content
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
        padding: '20px 16px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', marginBottom: '4px' }}>
          {businessName}
        </h1>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Online Menü
        </p>
      </div>

      {/* Products by Category */}
      <div style={{ padding: '16px' }}>
        {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
          <div key={categoryName} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#333',
              marginBottom: '16px',
              paddingBottom: '8px',
              borderBottom: '2px solid #9c27b0'
            }}>
              {categoryName}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '16px'
            }}>
              {categoryProducts.map((product) => {
                const productName = product.name || 'Ürün'
                const productPrice = typeof product.price === 'number' ? product.price : 0
                const productImage = product.image || 'https://via.placeholder.com/150?text=Urun'

                return (
                  <div
                    key={String(product.id || Math.random())}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '160px',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={productImage}
                        alt={productName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Urun'
                        }}
                      />
                    </div>

                    <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '40px'
                      }}>
                        {productName}
                      </h3>

                      <p style={{
                        margin: 'auto 0 0 0',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#9c27b0'
                      }}>
                        {productPrice > 0 ? `${productPrice.toFixed(2)} ₺` : 'Fiyat Yok'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
