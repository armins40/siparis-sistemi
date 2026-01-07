'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'

interface Product {
  id: string | number
  name: string
  price: number
  unit: string
  stock: number
  image?: string
  category: string
}

interface CartItem {
  productId: string | number
  name: string
  quantity: number
  price: number
  unit: string
}

export default function CustomerMenuPage() {
  const params = useParams()
  const storeSlug = params?.slug as string

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<string>('Tümü')
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const savedCart = localStorage.getItem(`cart_${storeSlug}`)
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (err) {
      console.error('Error loading cart:', err)
    }
  }, [storeSlug])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(cart))
    } catch (err) {
      console.error('Error saving cart:', err)
    }
  }, [cart, storeSlug])

  // Fetch products
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

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(['Tümü'])
    products.forEach(p => {
      if (p.category) cats.add(p.category)
    })
    return Array.from(cats)
  }, [products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'Tümü' || product.category === activeCategory
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchQuery])

  // Group by category
  const groupedProducts = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    filteredProducts.forEach(product => {
      const category = product.category || 'Diğer'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(product)
    })
    return grouped
  }, [filteredProducts])

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => String(item.productId) === String(product.id))
      if (existing) {
        return prev.map(item =>
          String(item.productId) === String(product.id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        unit: product.unit || 'adet'
      }]
    })
  }

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => String(i.productId) === String(productId))
      if (!item) return prev

      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) {
        return prev.filter(i => String(i.productId) !== String(productId))
      }

      return prev.map(i =>
        String(i.productId) === String(productId) ? { ...i, quantity: newQuantity } : i
      )
    })
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const storeName = storeSlug
    ? storeSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Mağaza'

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-3">Hata Oluştu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  // Empty State
  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-5">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Henüz ürün bulunmuyor</h2>
          <p className="text-gray-600">Bu mağazada henüz ürün eklenmemiş.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🛒</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold truncate">{storeName}</h1>
                <p className="text-xs text-white/80">Online Menü</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Input */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-11 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 placeholder-gray-400"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="px-4 py-3 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="px-4 py-4">
        {Object.keys(groupedProducts).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aradığınız kriterlere uygun ürün bulunamadı.</p>
          </div>
        ) : (
          Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
            <div key={categoryName} className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 px-1">{categoryName}</h2>
              <div className="grid grid-cols-2 gap-3">
                {categoryProducts.map((product) => {
                  const cartItem = cart.find(item => String(item.productId) === String(product.id))
                  const quantity = cartItem?.quantity || 0
                  const isOutOfStock = product.stock === 0

                  return (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                      quantity={quantity}
                      isOutOfStock={isOutOfStock}
                      onAddToCart={() => addToCart(product)}
                      onUpdateQuantity={(delta) => updateQuantity(product.id, delta)}
                    />
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <button
          onClick={() => {
            alert(`Sepet Toplamı: ${cartTotal.toFixed(2)} ₺\n\nÜrünler: ${cart.map(item => `${item.name} x${item.quantity}`).join(', ')}`)
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full shadow-xl flex items-center justify-center z-50 hover:shadow-2xl transition-all hover:scale-105"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {cartItemCount > 99 ? '99+' : cartItemCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

// ProductCard Component
function ProductCard({
  product,
  quantity,
  isOutOfStock,
  onAddToCart,
  onUpdateQuantity,
}: {
  product: Product
  quantity: number
  isOutOfStock: boolean
  onAddToCart: () => void
  onUpdateQuantity: (delta: number) => void
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="w-full h-40 bg-gray-100 relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/150?text=Urun'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
            🛍️
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            Stokta Yok
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        <div className="mt-auto">
          <p className="text-base font-bold text-indigo-600 mb-1">
            {product.price > 0 ? `${product.price.toFixed(2)} ₺` : 'Fiyat Yok'}
            {product.unit && <span className="text-xs text-gray-500 font-normal"> / {product.unit}</span>}
          </p>
          
          {product.stock > 0 && (
            <p className="text-xs text-gray-500 mb-2">
              Stok: {product.stock.toFixed(1)} {product.unit}
            </p>
          )}

          {/* Add to Cart / Quantity Controls */}
          {quantity > 0 ? (
            <div className="flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => onUpdateQuantity(-1)}
                className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-semibold flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                −
              </button>
              <span className="flex-1 text-center font-semibold text-gray-800">{quantity}</span>
              <button
                onClick={() => onUpdateQuantity(1)}
                disabled={isOutOfStock}
                className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-semibold flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={onAddToCart}
              disabled={isOutOfStock}
              className="w-full mt-2 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
