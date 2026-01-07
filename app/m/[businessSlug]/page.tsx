'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

type Language = 'tr' | 'en' | 'ar'

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface DashboardData {
  logoUrl: string | null
  businessTypes: string[]
  whatsappNumber: string | null
}

interface Translations {
  shopName: string
  shopDescription: string
  addToCart: string
  total: string
  sendOrder: string
  noProducts: string
  language: string
  address: string
  addressPlaceholder: string
  sendMyLocation: string
  locationPermissionDenied: string
  locationError: string
  gettingLocation: string
  locationReceived: string
}

const translations: Record<Language, Translations> = {
  tr: {
    shopName: 'Mağaza Adı',
    shopDescription: 'Online sipariş için QR kodunu tarayın',
    addToCart: 'Sepete Ekle',
    total: 'Toplam',
    sendOrder: 'Siparişi Gönder',
    noProducts: 'Henüz ürün bulunmuyor',
    language: 'Dil',
    address: 'Adres (İsteğe Bağlı)',
    addressPlaceholder: 'Mahalle, Sokak, Bina No...',
    sendMyLocation: 'Konumumu Gönder',
    locationPermissionDenied: 'Konum izni verilmedi',
    locationError: 'Konum alınamadı',
    gettingLocation: 'Konum alınıyor...',
    locationReceived: '✓ Konum alındı'
  },
  en: {
    shopName: 'Shop Name',
    shopDescription: 'Scan QR code to place an order',
    addToCart: 'Add to Cart',
    total: 'Total',
    sendOrder: 'Send Order',
    noProducts: 'No products available',
    language: 'Language',
    address: 'Address (Optional)',
    addressPlaceholder: 'Street, Building No...',
    sendMyLocation: 'Send My Location',
    locationPermissionDenied: 'Location permission denied',
    locationError: 'Failed to get location',
    gettingLocation: 'Getting location...',
    locationReceived: '✓ Location received'
  },
  ar: {
    shopName: 'اسم المتجر',
    shopDescription: 'امسح رمز QR لوضع طلب',
    addToCart: 'أضف إلى السلة',
    total: 'المجموع',
    sendOrder: 'إرسال الطلب',
    noProducts: 'لا توجد منتجات متاحة',
    language: 'اللغة',
    address: 'العنوان (اختياري)',
    addressPlaceholder: 'الحي، الشارع، رقم المبنى...',
    sendMyLocation: 'إرسال موقعي',
    locationPermissionDenied: 'تم رفض إذن الموقع',
    locationError: 'فشل الحصول على الموقع',
    gettingLocation: 'جاري الحصول على الموقع...',
    locationReceived: '✓ تم الحصول على الموقع'
  }
}

export default function CustomerMenuPage() {
  const params = useParams()
  const businessSlug = params?.businessSlug as string

  const [language, setLanguage] = useState<Language>('tr')
  const [businessName, setBusinessName] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Array<any>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [address, setAddress] = useState<string>('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState<boolean>(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load business name
    const userStr = localStorage.getItem('siparisUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setBusinessName(user.businessName || 'Mağaza')
      } catch {
        setBusinessName('Mağaza')
      }
    } else {
      setBusinessName(businessSlug || 'Mağaza')
    }

    // Load dashboard data
    const dashboardDataStr = localStorage.getItem('siparis-dashboard-data')
    if (dashboardDataStr) {
      try {
        const dashboardData = JSON.parse(dashboardDataStr) as DashboardData
        setLogoUrl(dashboardData.logoUrl || null)
        setWhatsappNumber(dashboardData.whatsappNumber || null)
      } catch {
        // Ignore parse errors
      }
    }

    // Load products from API
    async function loadProducts() {
      try {
        setIsLoading(true)
        setLoadError(false)
        
        const response = await fetch('/api/products', {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }

        const data = await response.json()
        
        // MUST check if it's an array
        if (Array.isArray(data)) {
          setProducts(data)
          console.log('Products count:', data.length)
        } else {
          console.warn('API response is not an array:', typeof data.products)
          setProducts([])
          console.log('Products count: 0 (not an array)')
        }
      } catch (error) {
        console.error('[Menu Page] Error loading products:', error)
        setLoadError(true)
        setProducts([])
        console.log('Products count: 0 (load error)')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [businessSlug])

  // Safe category grouping
  const groupedByCategory: Record<string, any[]> = {}
  products.forEach((product: any) => {
    const category = product.subcategory || product.category || 'Diğer'
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = []
    }
    groupedByCategory[category].push(product)
  })

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        quantity: 1, 
        price: typeof product.price === 'number' ? product.price : 0 
      }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.productId === productId)
      if (!item) return prev

      const newQuantity = item.quantity + delta
      if (newQuantity <= 0) {
        return prev.filter(i => i.productId !== productId)
      }

      return prev.map(i =>
        i.productId === productId ? { ...i, quantity: newQuantity } : i
      )
    })
  }

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(translations[language].locationError)
      return
    }

    setLocationLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationLoading(false)
      },
      (error) => {
        setLocationLoading(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(translations[language].locationPermissionDenied)
        } else {
          setLocationError(translations[language].locationError)
        }
      }
    )
  }

  const getGoogleMapsLink = (lat: number, lng: number): string => {
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  const sendOrder = () => {
    if (cart.length === 0) return
    if (!whatsappNumber || whatsappNumber.trim() === '') return

    const t = translations[language]
    let message = `*${businessName}*\n\n`
    message += `${t.sendOrder}:\n\n`

    cart.forEach(item => {
      message += `${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₺\n`
    })

    message += `\n*${t.total}: ${getTotal().toFixed(2)} ₺*`

    if (address.trim()) {
      message += `\n\n📍 ${t.address}:\n${address.trim()}`
    }

    if (location) {
      const mapsLink = getGoogleMapsLink(location.lat, location.lng)
      message += `\n\n🗺️ ${t.sendMyLocation}: ${mapsLink}`
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const t = translations[language]
  const isRTL = language === 'ar'

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: isRTL 
      ? '"Segoe UI", "Arabic UI Display", Arial, sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    direction: isRTL ? 'rtl' : 'ltr',
    paddingBottom: cart.length > 0 ? '220px' : '20px'
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  }

  const headerContentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }

  const languageSwitcherStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px'
  }

  const langButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#3b82f6' : '#666',
    backgroundColor: isActive ? '#e0e7ff' : '#f9fafb',
    border: `1px solid ${isActive ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '6px',
    cursor: 'pointer'
  })

  const shopInfoStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  }

  const logoStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    flexShrink: 0
  }

  const shopTextStyle: React.CSSProperties = {
    flex: '1'
  }

  const shopNameStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
  }

  const shopDescStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  }

  const categorySectionStyle: React.CSSProperties = {
    marginBottom: '32px'
  }

  const categoryTitleStyle: React.CSSProperties = {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #3b82f6'
  }

  const productListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px'
  }

  const productCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  }

  const productImageStyle: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    objectFit: 'cover',
    backgroundColor: '#f9fafb',
    flexShrink: 0
  }

  const productInfoStyle: React.CSSProperties = {
    flex: '1',
    minWidth: '0'
  }

  const productNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
  }

  const productPriceStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#3b82f6',
    margin: '0'
  }

  const quantityContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }

  const quantityButtonStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const quantityDisplayStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: '30px',
    textAlign: 'center'
  }

  const addButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }

  const cartStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTop: '2px solid #e5e7eb',
    padding: '16px 20px',
    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 1000
  }

  const cartContentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }

  const cartTopStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px'
  }

  const totalStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  }

  const sendOrderButtonStyle: React.CSSProperties = {
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    flex: '1',
    minWidth: '200px'
  }

  const addressSectionStyle: React.CSSProperties = {
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const addressLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  }

  const addressInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxSizing: 'border-box'
  }

  const locationButtonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  }

  const locationButtonStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: locationLoading ? '#9ca3af' : '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: locationLoading ? 'not-allowed' : 'pointer',
    flex: '1',
    minWidth: '150px'
  }

  const statusMessageStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: '600'
  }

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
    margin: '40px auto'
  }

  const loadingStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
    margin: '40px auto'
  }

  const loadingSpinnerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite'
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={languageSwitcherStyle}>
            <button onClick={() => setLanguage('tr')} style={langButtonStyle(language === 'tr')}>
              TR
            </button>
            <button onClick={() => setLanguage('en')} style={langButtonStyle(language === 'en')}>
              EN
            </button>
            <button onClick={() => setLanguage('ar')} style={langButtonStyle(language === 'ar')}>
              AR
            </button>
          </div>

          <div style={shopInfoStyle}>
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} style={logoStyle} />
            ) : (
              <div style={logoStyle} />
            )}
            <div style={shopTextStyle}>
              <h1 style={shopNameStyle}>{businessName || t.shopName}</h1>
              <p style={shopDescStyle}>{t.shopDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        {/* Loading State */}
        {isLoading && (
          <div style={loadingStateStyle}>
            <div style={loadingSpinnerStyle} />
            <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
              Yükleniyor...
            </p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div style={emptyStateStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '0 0 12px 0' }}>
              Hata Oluştu
            </h2>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Ürünler yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        )}

        {/* Empty Menu State */}
        {!isLoading && !loadError && products.length === 0 && (
          <div style={emptyStateStyle}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 12px 0' }}>
              Henüz ürün bulunmuyor
            </h2>
            <p style={{ fontSize: '16px', color: '#666', margin: '0', lineHeight: '1.6' }}>
              Bu işletmenin menüsü şu anda mevcut değil.
            </p>
          </div>
        )}

        {/* Products Display */}
        {!isLoading && !loadError && products.length > 0 && (
          <div>
            {Object.entries(groupedByCategory).map(([categoryName, categoryProducts]) => (
              <div key={categoryName} style={categorySectionStyle}>
                <h2 style={categoryTitleStyle}>{categoryName}</h2>
                <div style={productListStyle}>
                  {categoryProducts.map((product: any) => {
                    const cartItem = cart.find(item => item.productId === product.id)
                    const quantity = cartItem?.quantity || 0
                    const productId = String(product.id || '')
                    const productName = product.name || 'Ürün'
                    const productPrice = typeof product.price === 'number' ? product.price : 0

                    return (
                      <div key={productId} style={productCardStyle}>
                        {product.image && (
                          <img src={product.image} alt={productName} style={productImageStyle} />
                        )}
                        
                        <div style={productInfoStyle}>
                          <h4 style={productNameStyle}>{productName}</h4>
                          <p style={productPriceStyle}>{productPrice.toFixed(2)} ₺</p>
                        </div>

                        {quantity > 0 ? (
                          <div style={quantityContainerStyle}>
                            <button
                              onClick={() => updateQuantity(productId, -1)}
                              style={quantityButtonStyle}
                            >
                              -
                            </button>
                            <span style={quantityDisplayStyle}>{quantity}</span>
                            <button
                              onClick={() => updateQuantity(productId, 1)}
                              style={quantityButtonStyle}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            style={addButtonStyle}
                          >
                            {t.addToCart}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div style={cartStyle}>
          <div style={cartContentStyle}>
            <div style={cartTopStyle}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {t.total}
                </div>
                <div style={totalStyle}>{getTotal().toFixed(2)} ₺</div>
              </div>
              {whatsappNumber && whatsappNumber.trim() !== '' ? (
                <button 
                  onClick={sendOrder} 
                  style={sendOrderButtonStyle}
                >
                  {t.sendOrder}
                </button>
              ) : (
                <button 
                  disabled
                  style={{
                    ...sendOrderButtonStyle,
                    backgroundColor: '#9ca3af',
                    cursor: 'not-allowed',
                    opacity: 0.6
                  }}
                >
                  WhatsApp Numarası Gerekli
                </button>
              )}
            </div>

            <div style={addressSectionStyle}>
              <div>
                <label style={addressLabelStyle}>
                  {t.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  style={addressInputStyle}
                />
              </div>

              <div style={locationButtonContainerStyle}>
                <button
                  onClick={getLocation}
                  disabled={locationLoading}
                  style={locationButtonStyle}
                >
                  {locationLoading ? t.gettingLocation : t.sendMyLocation}
                </button>

                {location && (
                  <span style={{ ...statusMessageStyle, color: '#10b981' }}>
                    {t.locationReceived}
                  </span>
                )}

                {locationError && (
                  <span style={{ ...statusMessageStyle, color: '#dc2626' }}>
                    {locationError}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  )
}

