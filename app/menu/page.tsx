'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { PRODUCT_CATALOG, Product, productSettings, ParentCategory } from '../lib/products'

type Language = 'tr' | 'en' | 'ar'

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface Translations {
  shopName: string
  shopDescription: string
  addToCart: string
  cart: string
  total: string
  sendOrder: string
  quantity: string
  noProducts: string
  language: string
  address: string
  addressPlaceholder: string
  sendMyLocation: string
  locationPermissionDenied: string
  locationError: string
  gettingLocation: string
  locationReceived: string
  loadingMenu: string
  menuNotAvailable: string
  menuNotAvailableDesc: string
  errorLoadingMenu: string
  errorLoadingMenuDesc: string
}

const translations: Record<Language, Translations> = {
  tr: {
    shopName: 'Mağaza Adı',
    shopDescription: 'Online sipariş için QR kodunu tarayın',
    addToCart: 'Sepete Ekle',
    cart: 'Sepet',
    total: 'Toplam',
    sendOrder: 'Siparişi Gönder',
    quantity: 'Adet',
    noProducts: 'Henüz ürün bulunmuyor',
    language: 'Dil',
    address: 'Adres (İsteğe Bağlı)',
    addressPlaceholder: 'Mahalle, Sokak, Bina No...',
    sendMyLocation: 'Konumumu Gönder',
    locationPermissionDenied: 'Konum izni verilmedi',
    locationError: 'Konum alınamadı',
    gettingLocation: 'Konum alınıyor...',
    locationReceived: '✓ Konum alındı',
    loadingMenu: 'Menü yükleniyor...',
    menuNotAvailable: 'Menü Henüz Hazır Değil',
    menuNotAvailableDesc: 'Bu işletmenin menüsü şu anda mevcut değil. Lütfen ürün eklemek için yönetim paneline giriş yapın.',
    errorLoadingMenu: 'Menü Yüklenemedi',
    errorLoadingMenuDesc: 'Menü bilgileri yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.'
  },
  en: {
    shopName: 'Shop Name',
    shopDescription: 'Scan QR code to place an order',
    addToCart: 'Add to Cart',
    cart: 'Cart',
    total: 'Total',
    sendOrder: 'Send Order',
    quantity: 'Quantity',
    noProducts: 'No products available',
    language: 'Language',
    address: 'Address (Optional)',
    addressPlaceholder: 'Street, Building No...',
    sendMyLocation: 'Send My Location',
    locationPermissionDenied: 'Location permission denied',
    locationError: 'Failed to get location',
    gettingLocation: 'Getting location...',
    locationReceived: '✓ Location received',
    loadingMenu: 'Loading menu...',
    menuNotAvailable: 'Menu Not Available',
    menuNotAvailableDesc: 'This restaurant\'s menu is currently not available. Please log in to the admin panel to add products.',
    errorLoadingMenu: 'Failed to Load Menu',
    errorLoadingMenuDesc: 'There was a problem loading the menu. Please refresh the page.'
  },
  ar: {
    shopName: 'اسم المتجر',
    shopDescription: 'امسح رمز QR لوضع طلب',
    addToCart: 'أضف إلى السلة',
    cart: 'السلة',
    total: 'المجموع',
    sendOrder: 'إرسال الطلب',
    quantity: 'الكمية',
    noProducts: 'لا توجد منتجات متاحة',
    language: 'اللغة',
    address: 'العنوان (اختياري)',
    addressPlaceholder: 'الحي، الشارع، رقم المبنى...',
    sendMyLocation: 'إرسال موقعي',
    locationPermissionDenied: 'تم رفض إذن الموقع',
    locationError: 'فشل الحصول على الموقع',
    gettingLocation: 'جاري الحصول على الموقع...',
    locationReceived: '✓ تم الحصول على الموقع',
    loadingMenu: 'جاري تحميل القائمة...',
    menuNotAvailable: 'القائمة غير متاحة',
    menuNotAvailableDesc: 'قائمة هذا المطعم غير متاحة حالياً. يرجى تسجيل الدخول إلى لوحة الإدارة لإضافة المنتجات.',
    errorLoadingMenu: 'فشل تحميل القائمة',
    errorLoadingMenuDesc: 'حدثت مشكلة أثناء تحميل القائمة. يرجى تحديث الصفحة.'
  }
}

const DASHBOARD_DATA_KEY = 'siparis-dashboard-data'
const WHATSAPP_NUMBER = '905551234567' // Default - should be configurable in dashboard

interface DashboardData {
  logoUrl: string | null
  businessTypes: ParentCategory[]
}

export default function MenuPage() {
  const [language, setLanguage] = useState<Language>('tr')
  const [businessName, setBusinessName] = useState<string>('')
  const [businessTypes, setBusinessTypes] = useState<ParentCategory[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [availableProducts, setAvailableProducts] = useState<Array<Product & { price: number }>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState<boolean>(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      setIsLoading(true)
      setLoadError(false)

      // Load shop data
      const userStr = localStorage.getItem('siparisUser')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setBusinessName(user.businessName || 'Mağaza')
        } catch {
          setBusinessName('Mağaza')
        }
      }

      // Load business types
      const savedData = localStorage.getItem(DASHBOARD_DATA_KEY)
      if (savedData) {
        try {
          const data = JSON.parse(savedData) as DashboardData
          setBusinessTypes(data.businessTypes || [])
        } catch {
          // Ignore parse errors
        }
      }
    } catch (error) {
      console.error('[Menu Page] Error loading data:', error)
      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      // Load available products (active with prices)
      const settings = productSettings.getAll()
      const filtered = PRODUCT_CATALOG.filter(product => {
        // Filter by business types
        if (businessTypes.length > 0 && !businessTypes.includes(product.parentCategory)) {
          return false
        }

        // Check if product is active, has price, and is in stock
        const productSetting = settings[product.id] || { price: null, active: true, outOfStock: false }
        return productSetting.active && 
               productSetting.price !== null && 
               productSetting.price > 0 && 
               !productSetting.outOfStock
      })

      const productsWithPrices = filtered.map(product => ({
        ...product,
        price: settings[product.id]?.price || 0
      }))

      setAvailableProducts(productsWithPrices)
      setLoadError(false)
    } catch (error) {
      console.error('[Menu Page] Error loading products:', error)
      setLoadError(true)
      setAvailableProducts([])
    }
  }, [businessTypes])

  // Group products by parentCategory → subcategory
  const groupedProducts = useMemo(() => {
    const grouped: Record<ParentCategory, Record<string, Array<Product & { price: number }>>> = {
      Tekel: {},
      Manav: {},
      Bakkal: {},
      Market: {}
    }

    availableProducts.forEach(product => {
      if (!grouped[product.parentCategory][product.subcategory]) {
        grouped[product.parentCategory][product.subcategory] = []
      }
      grouped[product.parentCategory][product.subcategory].push(product)
    })

    return grouped
  }, [availableProducts])

  const addToCart = (product: Product & { price: number }) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, name: product.name, quantity: 1, price: product.price }]
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

    const t = translations[language]
    let message = `*${businessName}*\n\n`
    message += `${t.sendOrder}:\n\n`

    cart.forEach(item => {
      message += `${item.name} x${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ₺\n`
    })

    message += `\n*${t.total}: ${getTotal().toFixed(2)} ₺*`

    // Add address if provided
    if (address.trim()) {
      message += `\n\n📍 ${t.address}:\n${address.trim()}`
    }

    // Add location link if available
    if (location) {
      const mapsLink = getGoogleMapsLink(location.lat, location.lng)
      message += `\n\n🗺️ ${t.sendMyLocation}: ${mapsLink}`
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const t = translations[language]
  const isRTL = language === 'ar'

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    fontFamily: isRTL 
      ? '"Segoe UI", "Arabic UI Display", Arial, sans-serif'
      : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    direction: isRTL ? 'rtl' : 'ltr',
    paddingBottom: cart.length > 0 ? '200px' : '20px'
  }

  const headerStyle: React.CSSProperties = {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }

  const languageSwitcherStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginBottom: '16px'
  }

  const langButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    color: isActive ? '#3b82f6' : '#666',
    backgroundColor: isActive ? '#e0e7ff' : '#ffffff',
    border: `1px solid ${isActive ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '6px',
    cursor: 'pointer'
  })

  const shopNameStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 8px 0'
  }

  const shopDescStyle: React.CSSProperties = {
    fontSize: '14px',
    margin: '0',
    opacity: 0.9
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
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb'
  }

  const subcategoryTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    margin: '0 0 12px 0'
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
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    fontSize: '18px',
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
    padding: '8px 16px',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  }

  const totalStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  }

  const sendOrderButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
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

  const emptyStateTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 12px 0'
  }

  const emptyStateDescStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    margin: '0',
    lineHeight: '1.6'
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
  } as React.CSSProperties & { animation: string }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
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
        <h1 style={shopNameStyle}>{businessName || t.shopName}</h1>
        <p style={shopDescStyle}>{t.shopDescription}</p>
      </div>

      <div style={contentStyle}>
        {/* Loading State */}
        {isLoading && (
          <div style={loadingStateStyle}>
            <div style={loadingSpinnerStyle} />
            <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
              {t.loadingMenu}
            </p>
          </div>
        )}

        {/* Error State */}
        {loadError && !isLoading && (
          <div style={emptyStateStyle}>
            <h2 style={emptyStateTitleStyle}>{t.errorLoadingMenu}</h2>
            <p style={emptyStateDescStyle}>
              {t.errorLoadingMenuDesc}
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
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              {t.language === 'tr' ? 'Sayfayı Yenile' : t.language === 'ar' ? 'تحديث الصفحة' : 'Refresh Page'}
            </button>
          </div>
        )}

        {/* Empty Menu State */}
        {!isLoading && !loadError && availableProducts.length === 0 && (
          <div style={emptyStateStyle}>
            <h2 style={emptyStateTitleStyle}>{t.menuNotAvailable}</h2>
            <p style={emptyStateDescStyle}>
              {t.menuNotAvailableDesc}
            </p>
          </div>
        )}

        {/* Products Display */}
        {!isLoading && !loadError && availableProducts.length > 0 && (
          (Object.keys(groupedProducts) as ParentCategory[]).map((parentCategory) => {
            const subcategories = groupedProducts[parentCategory]
            const hasSubcategories = Object.keys(subcategories).length > 0

            if (!hasSubcategories) return null

            return (
              <div key={parentCategory} style={categorySectionStyle}>
                <h2 style={categoryTitleStyle}>{parentCategory}</h2>
                {Object.entries(subcategories).map(([subcategory, products]) => {
                  if (products.length === 0) return null

                  return (
                    <div key={subcategory} style={{ marginBottom: '24px' }}>
                      <h3 style={subcategoryTitleStyle}>{subcategory}</h3>
                      <div style={productListStyle}>
                        {products.map((product) => {
                          const cartItem = cart.find(item => item.productId === product.id)
                          const quantity = cartItem?.quantity || 0

                          return (
                            <div key={product.id} style={productCardStyle}>
                              <img src={product.image} alt={product.name} style={productImageStyle} />
                              
                              <div style={productInfoStyle}>
                                <h4 style={productNameStyle}>{product.name}</h4>
                                <p style={productPriceStyle}>{product.price.toFixed(2)} ₺</p>
                              </div>

                              {quantity > 0 ? (
                                <div style={quantityContainerStyle}>
                                  <button
                                    onClick={() => updateQuantity(product.id, -1)}
                                    style={quantityButtonStyle}
                                  >
                                    -
                                  </button>
                                  <span style={quantityDisplayStyle}>{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(product.id, 1)}
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
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {cart.length > 0 && (
        <div style={cartStyle}>
          <div style={cartContentStyle}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                {t.total}
              </div>
              <div style={totalStyle}>{getTotal().toFixed(2)} ₺</div>
            </div>
            <button onClick={sendOrder} style={sendOrderButtonStyle}>
              {t.sendOrder}
            </button>
          </div>
          
          <div style={{
            maxWidth: '800px',
            margin: '16px auto 0 auto',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  {t.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressPlaceholder}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
              }}>
                <button
                  onClick={getLocation}
                  disabled={locationLoading}
                  style={{
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    backgroundColor: locationLoading ? '#9ca3af' : '#3b82f6',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: locationLoading ? 'not-allowed' : 'pointer',
                    flex: '1'
                  }}
                >
                  {locationLoading ? t.gettingLocation : t.sendMyLocation}
                </button>
                
                {location && (
                  <span style={{
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: '600'
                  }}>
                    {t.locationReceived}
                  </span>
                )}
                
                {locationError && (
                  <span style={{
                    fontSize: '12px',
                    color: '#dc2626',
                    fontWeight: '600'
                  }}>
                    {locationError}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

