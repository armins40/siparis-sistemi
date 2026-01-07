'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PRODUCT_CATALOG, Product, ProductSettings, ParentCategory } from '../../lib/products'

type Language = 'tr' | 'en' | 'ar'

interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}


interface DashboardData {
  logoUrl: string | null
  businessTypes: ParentCategory[]
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
    locationReceived: '✓ Konum alındı',
    loadingMenu: 'Menü yükleniyor...',
    menuNotAvailable: 'Menü Henüz Hazır Değil',
    menuNotAvailableDesc: 'Bu işletmenin menüsü şu anda mevcut değil. Lütfen daha sonra tekrar deneyin.',
    apiError: 'Menü Yüklenemedi',
    apiErrorDesc: 'Menü bilgileri yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.',
    retry: 'Tekrar Dene',
    retrying: 'Yeniden deneniyor...'
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
    locationReceived: '✓ Location received',
    loadingMenu: 'Loading menu...',
    menuNotAvailable: 'Menu Not Available',
    menuNotAvailableDesc: 'This restaurant\'s menu is currently not available. Please check back later.',
    apiError: 'Failed to Load Menu',
    apiErrorDesc: 'There was a problem loading the menu. Please try again.',
    retry: 'Retry',
    retrying: 'Retrying...'
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
    locationReceived: '✓ تم الحصول على الموقع',
    loadingMenu: 'جاري تحميل القائمة...',
    menuNotAvailable: 'القائمة غير متاحة',
    menuNotAvailableDesc: 'قائمة هذا المطعم غير متاحة حالياً. يرجى المحاولة لاحقاً.',
    apiError: 'فشل تحميل القائمة',
    apiErrorDesc: 'حدثت مشكلة أثناء تحميل القائمة. يرجى المحاولة مرة أخرى.',
    retry: 'إعادة المحاولة',
    retrying: 'جاري إعادة المحاولة...'
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
  const [availableProducts, setAvailableProducts] = useState<Array<Product & { price: number }>>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [apiError, setApiError] = useState<boolean>(false)
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  const [address, setAddress] = useState<string>('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState<boolean>(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Load business name (for display only - optional fallback)
    const userStr = localStorage.getItem('siparisUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setBusinessName(user.businessName || 'Mağaza')
      } catch {
        setBusinessName('Mağaza')
      }
    } else {
      // Fallback: use slug as display name if no user data
      setBusinessName(businessSlug || 'Mağaza')
    }

    // Load dashboard data for logo and WhatsApp number (read-only on customer side)
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

    // Load menu data from localStorage (siparisPublishedProducts)
    // TODO: Replace with API call when database is ready
    function loadMenuFromLocalStorage() {
      try {
        setIsLoading(true)
        setApiError(false)
        
        console.debug('[Menu Page] Loading products from localStorage')
        
        // Try to load from localStorage
        const publishedProductsStr = localStorage.getItem('siparisPublishedProducts')
        
        if (!publishedProductsStr) {
          console.debug('[Menu Page] No published products found in localStorage')
          setAvailableProducts([])
          setIsLoading(false)
          return
        }

        const publishedProducts = JSON.parse(publishedProductsStr)
        
        if (!Array.isArray(publishedProducts)) {
          console.debug('[Menu Page] Published products is not an array:', typeof publishedProducts)
          setAvailableProducts([])
          setIsLoading(false)
          return
        }

        console.debug('[Menu Page] Loaded products from localStorage:', {
          count: publishedProducts.length,
          sample: publishedProducts.slice(0, 3).map((p: any) => ({ id: p.id, name: p.name, price: p.price }))
        })

        // Transform to the expected format
        const formattedProducts: Array<Product & { price: number }> = publishedProducts.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Ürün',
          subcategory: p.subcategory || 'Genel',
          parentCategory: (p.parentCategory || 'Market') as ParentCategory,
          image: p.image || 'https://via.placeholder.com/150',
          price: typeof p.price === 'number' ? p.price : 0,
        }))

        setAvailableProducts(formattedProducts)
        setApiError(false)
      } catch (error) {
        console.error('[Menu Page] Error loading products from localStorage:', error)
        setApiError(true)
        setAvailableProducts([])
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
      }
    }

    // Also set up a listener for localStorage changes (when admin publishes)
    function setupStorageListener() {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'siparisPublishedProducts') {
          console.debug('[Menu Page] Detected localStorage change, reloading products')
          loadMenuFromLocalStorage()
        }
      }

      window.addEventListener('storage', handleStorageChange)
      
      // Also listen for custom events (same-window updates)
      const handleCustomStorageChange = () => {
        console.debug('[Menu Page] Detected custom storage event, reloading products')
        loadMenuFromLocalStorage()
      }
      
      window.addEventListener('siparisProductsPublished', handleCustomStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('siparisProductsPublished', handleCustomStorageChange)
      }
    }

    loadMenuFromLocalStorage()
    const cleanup = setupStorageListener()
    
    return cleanup
  }, [businessSlug])

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
    if (!whatsappNumber || whatsappNumber.trim() === '') return

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
    justifyContent: 'center',
    transition: 'background-color 0.2s ease'
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

  const emptyStateTitleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 12px 0'
  }

  const emptyStateDescStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    margin: '0 0 24px 0',
    lineHeight: '1.6'
  }

  const retryButtonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
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

  // Check if we have products
  const hasProducts = availableProducts.length > 0
  console.debug('[Menu Page] Render check:', {
    hasProducts,
    availableProductsLength: availableProducts.length,
    sampleProducts: availableProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name }))
  })

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
        {isLoading && !apiError && (
          <div style={loadingStateStyle}>
            <div style={loadingSpinnerStyle} />
            <p style={{ fontSize: '16px', color: '#666', margin: '0' }}>
              {t.loadingMenu}
            </p>
          </div>
        )}

        {/* API Error State */}
        {apiError && !isLoading && (
          <div style={emptyStateStyle}>
            <h2 style={emptyStateTitleStyle}>{t.apiError}</h2>
            <p style={emptyStateDescStyle}>
              {t.apiErrorDesc}
            </p>
            <button
              onClick={() => {
                // Reload from localStorage
                const publishedProductsStr = localStorage.getItem('siparisPublishedProducts')
                if (publishedProductsStr) {
                  try {
                    const products = JSON.parse(publishedProductsStr)
                    if (Array.isArray(products)) {
                      const formattedProducts: Array<Product & { price: number }> = products.map((p: any) => ({
                        id: String(p.id),
                        name: p.name || 'Ürün',
                        subcategory: p.subcategory || 'Genel',
                        parentCategory: (p.parentCategory || 'Market') as ParentCategory,
                        image: p.image || 'https://via.placeholder.com/150',
                        price: typeof p.price === 'number' ? p.price : 0,
                      }))
                      setAvailableProducts(formattedProducts)
                      setApiError(false)
                    }
                  } catch (error) {
                    console.error('Error reloading products:', error)
                  }
                }
              }}
              disabled={isRetrying}
              style={{
                ...retryButtonStyle,
                backgroundColor: isRetrying ? '#9ca3af' : '#3b82f6',
                cursor: isRetrying ? 'not-allowed' : 'pointer'
              }}
            >
              {isRetrying ? t.retrying : t.retry}
            </button>
          </div>
        )}

        {/* No Categories / Empty Menu State */}
        {!isLoading && !apiError && !hasProducts && (
          <div style={emptyStateStyle}>
            <h2 style={emptyStateTitleStyle}>{t.menuNotAvailable}</h2>
            <p style={emptyStateDescStyle}>
              {t.menuNotAvailableDesc}
            </p>
          </div>
        )}

        {/* Products Display */}
        {!isLoading && !apiError && hasProducts && (

          <div>
            <h2 style={categoryTitleStyle}>All Products (Raw - No Filters)</h2>
            <div style={productListStyle}>
              {availableProducts.map((product: any, index: number) => {
                const cartItem = cart.find(item => item.productId === product.id || item.productId === product?.id)
                const quantity = cartItem?.quantity || 0
                
                // TEMPORARY: Use only p.name and p.price
                const productName = product?.name || product?.productName || `Product ${index + 1}`
                const productPrice = product?.price || 0
                const productId = product?.id || `product-${index}`

                return (
                  <div key={productId || index} style={productCardStyle}>
                    {product?.image && (
                      <img src={product.image} alt={productName} style={productImageStyle} />
                    )}
                    
                    <div style={productInfoStyle}>
                      <h4 style={productNameStyle}>{productName}</h4>
                      <p style={productPriceStyle}>{typeof productPrice === 'number' ? productPrice.toFixed(2) : productPrice} ₺</p>
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
                        onClick={() => addToCart({ ...product, id: productId, name: productName, price: productPrice })}
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
        )}
      </div>

      {/* Add CSS animation for spinner */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
      }} />

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
    </div>
  )
}

