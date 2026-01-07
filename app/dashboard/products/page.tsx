'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../../lib/auth'
import { PRODUCT_CATALOG, Product, ProductSettings, ParentCategory } from '../../lib/products'
import { generateSlug } from '../../lib/utils'

const DASHBOARD_DATA_KEY = 'siparis-dashboard-data'

interface DashboardData {
  logoUrl: string | null
  businessTypes: ParentCategory[]
}

export default function ProductsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [businessName, setBusinessName] = useState<string>('')
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [businessTypes, setBusinessTypes] = useState<ParentCategory[]>([])
  const [productSettingsMap, setProductSettingsMap] = useState<Record<string, ProductSettings>>({})
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>('')

  useEffect(() => {
    // Check authentication client-side only (SSR-safe)
    if (typeof window === 'undefined') return

    // Read "siparisUser" from localStorage
    const userStr = localStorage.getItem('siparisUser')
    
    // If not exists OR isLoggedIn !== true → redirect to /login
    if (!userStr) {
      router.push('/login')
      return
    }

    try {
      const siparisUser = JSON.parse(userStr)
      if (!siparisUser || siparisUser.isLoggedIn !== true) {
        router.push('/login')
        return
      }

      // Get business name and generate store slug
      const userInfo = auth.getUserInfo()
      if (userInfo) {
        setBusinessName(userInfo.businessName)
        const slug = generateSlug(userInfo.businessName)
        setStoreSlug(slug)
        
        // Load product settings from siparisProducts_{storeSlug}
        const productDataKey = `siparisProducts_${slug}`
        const productDataStr = localStorage.getItem(productDataKey)
        if (productDataStr) {
          try {
            const settings = JSON.parse(productDataStr) as Record<string, ProductSettings>
            setProductSettingsMap(settings)
          } catch {
            // Invalid data, start with empty
            setProductSettingsMap({})
          }
        }
      }

      // Load business types from dashboard data
      const savedData = localStorage.getItem(DASHBOARD_DATA_KEY)
      if (savedData) {
        try {
          const data = JSON.parse(savedData) as DashboardData
          const types = data.businessTypes || []
          setBusinessTypes(types)
        } catch {
          // Ignore parse errors
        }
      }

      // Expand all subcategories by default
      const allSubcategories = new Set<string>()
      PRODUCT_CATALOG.forEach(product => {
        allSubcategories.add(`${product.parentCategory}-${product.subcategory}`)
      })
      const expanded: Record<string, boolean> = {}
      allSubcategories.forEach(sub => {
        expanded[sub] = true
      })
      setExpandedSubcategories(expanded)

      setIsLoading(false)
    } catch {
      router.push('/login')
    }
  }, [router])

  // Filter and group products by business type → subcategory
  const groupedProducts = useMemo(() => {
    const filtered = businessTypes.length > 0
      ? PRODUCT_CATALOG.filter(p => businessTypes.includes(p.parentCategory))
      : PRODUCT_CATALOG

    const grouped: Record<ParentCategory, Record<string, Product[]>> = {
      Tekel: {},
      Manav: {},
      Bakkal: {},
      Market: {}
    }

    filtered.forEach(product => {
      if (!grouped[product.parentCategory][product.subcategory]) {
        grouped[product.parentCategory][product.subcategory] = []
      }
      grouped[product.parentCategory][product.subcategory].push(product)
    })

    return grouped
  }, [businessTypes])

  const toggleSubcategory = (parentCategory: ParentCategory, subcategory: string) => {
    const key = `${parentCategory}-${subcategory}`
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handlePriceChange = (productId: string, value: string) => {
    const price = value === '' ? null : parseFloat(value)
    if (price !== null && (isNaN(price) || price < 0)) return

    // Update local state only (save on explicit "Kaydet" button click)
    const newSettings = { ...productSettingsMap[productId] || { active: true, outOfStock: false }, price }
    const updatedMap = {
      ...productSettingsMap,
      [productId]: newSettings
    }
    setProductSettingsMap(updatedMap)
  }

  const handleActiveToggle = (productId: string) => {
    const current = productSettingsMap[productId] || { price: null, active: true, outOfStock: false }
    const newActive = !current.active

    // Update local state only (save on explicit "Kaydet" button click)
    const newSettings = { ...current, active: newActive }
    const updatedMap = {
      ...productSettingsMap,
      [productId]: newSettings
    }
    setProductSettingsMap(updatedMap)
  }

  const handleOutOfStockToggle = (productId: string) => {
    const current = productSettingsMap[productId] || { price: null, active: true, outOfStock: false }
    const newOutOfStock = !current.outOfStock

    // Update local state only (save on explicit "Kaydet" button click)
    const newSettings = { ...current, outOfStock: newOutOfStock }
    const updatedMap = {
      ...productSettingsMap,
      [productId]: newSettings
    }
    setProductSettingsMap(updatedMap)
  }

  const handleSave = () => {
    if (!storeSlug || typeof window === 'undefined') return

    setIsSaving(true)
    setSaveMessage('')

    try {
      // Save settings to localStorage as draft (only for this page's state)
      const productDataKey = `siparisProducts_${storeSlug}`
      localStorage.setItem(productDataKey, JSON.stringify(productSettingsMap))

      setSaveMessage('Ayarlar kaydedildi. Yayınlamak için "Yayınla" butonuna basın.')
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)

      setIsSaving(false)
    } catch (error) {
      setSaveMessage('Kaydetme sırasında bir hata oluştu')
      setIsSaving(false)
    }
  }

  const publishProducts = async () => {
    if (!storeSlug || typeof window === 'undefined') {
      alert("Mağaza bilgisi bulunamadı")
      return
    }

    // Build published products from current settings state
    const publishedProducts: any[] = []

    PRODUCT_CATALOG.forEach(product => {
      const setting = productSettingsMap[product.id]
      
      if (!setting) return
      
      // Must be active
      const isActive = setting.active === true || String(setting.active) === "true"
      if (!isActive) return
      
      // Must have a valid price > 0
      if (setting.price === null || setting.price === undefined || setting.price <= 0) return
      
      // Build full product object for API (matching admin panel format)
      const publishedProduct = {
        id: String(product.id),
        name: product.name,
        price: setting.price,
        category: product.subcategory || product.category || 'Diğer',
        image: product.image || `https://via.placeholder.com/150?text=${encodeURIComponent(product.name)}`,
        unit: 'kg', // Default unit
        stock: setting.outOfStock ? 0 : 100 // Default stock
      }
      
      publishedProducts.push(publishedProduct)
    })

    if (publishedProducts.length === 0) {
      alert("Aktif ürün yok veya fiyat girilmemiş")
      return
    }

    // POST to /api/products (replace all products)
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishedProducts), // Send array to replace all
      })

      if (!response.ok) {
        throw new Error('Failed to publish products')
      }

      alert(`Ürünler başarıyla yayınlandı (${publishedProducts.length} ürün)`)
    } catch (error) {
      console.error('[Publish] Error:', error)
      alert('Ürünler yayınlanırken bir hata oluştu')
      throw error
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    setSaveMessage('')

    try {
      await publishProducts()
      setSaveMessage('Ürünler başarıyla yayınlandı!')
      setTimeout(() => {
        setSaveMessage('')
      }, 3000)
    } catch (error) {
      setSaveMessage('Yayınlama sırasında bir hata oluştu')
    } finally {
      setIsPublishing(false)
    }
  }

  const getProductSettings = (productId: string): ProductSettings => {
    return productSettingsMap[productId] || { price: null, active: true, outOfStock: false }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }

  const headerStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto 24px auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    paddingTop: '20px'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0'
  }

  const backButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto'
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
    borderBottom: '3px solid #3b82f6'
  }

  const subcategoryHeaderStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '8px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.2s ease'
  }

  const subcategoryTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    margin: '0'
  }

  const expandIconStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    transition: 'transform 0.2s ease'
  }

  const productListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    marginLeft: '8px'
  }

  const productCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '12px 16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap'
  }

  const productImageStyle: React.CSSProperties = {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
    backgroundColor: '#f9fafb',
    flexShrink: 0
  }

  const productInfoStyle: React.CSSProperties = {
    flex: '1',
    minWidth: '150px'
  }

  const productNameStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0'
  }

  const priceInputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const priceLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#666',
    whiteSpace: 'nowrap'
  }

  const priceInputStyle: React.CSSProperties = {
    padding: '8px 10px',
    fontSize: '14px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    width: '100px',
    boxSizing: 'border-box'
  }

  const toggleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }

  const toggleGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }

  const toggleLabelStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#333',
    whiteSpace: 'nowrap'
  }

  const toggleSwitchStyle = (active: boolean): React.CSSProperties => ({
    width: '40px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: active ? '#3b82f6' : '#d1d5db',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  })

  const toggleSwitchStyleOutOfStock = (outOfStock: boolean): React.CSSProperties => ({
    width: '40px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: outOfStock ? '#dc2626' : '#d1d5db',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  })

  const toggleKnobStyle = (active: boolean): React.CSSProperties => ({
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute' as const,
    top: '2px',
    left: active ? '20px' : '2px',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
  })

  const emptyStateStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }

  const emptyStateTextStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    margin: '0'
  }

  const loadingStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    fontSize: '16px',
    color: '#666'
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Yükleniyor...</div>
      </div>
    )
  }

  const hasProducts = Object.values(groupedProducts).some(
    category => Object.values(category).some(subcategory => subcategory.length > 0)
  )

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Ürünleri Yönet</h1>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={isSaving || !storeSlug}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: isSaving || !storeSlug ? '#9ca3af' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: isSaving || !storeSlug ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || !storeSlug}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: isPublishing || !storeSlug ? '#9ca3af' : '#10b981',
              border: 'none',
              borderRadius: '8px',
              cursor: isPublishing || !storeSlug ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
          </button>
          <button onClick={() => router.push('/dashboard')} style={backButtonStyle}>
            ← Dashboard'a Dön
          </button>
        </div>
      </div>

      {saveMessage && (
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto 20px auto',
          padding: '12px 16px',
          backgroundColor: saveMessage.includes('başarıyla') ? '#d1fae5' : '#fee2e2',
          color: saveMessage.includes('başarıyla') ? '#065f46' : '#991b1b',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {saveMessage}
        </div>
      )}

      <div style={contentStyle}>
        {!hasProducts ? (
          <div style={emptyStateStyle}>
            <p style={emptyStateTextStyle}>
              Henüz bir işletme türü seçmediniz. Lütfen dashboard'dan işletme türünüzü seçin.
            </p>
          </div>
        ) : (
          (Object.keys(groupedProducts) as ParentCategory[]).map((parentCategory) => {
            const subcategories = groupedProducts[parentCategory]
            const hasSubcategories = Object.keys(subcategories).length > 0

            if (!hasSubcategories) return null

            return (
              <div key={parentCategory} style={categorySectionStyle}>
                <h2 style={categoryTitleStyle}>{parentCategory}</h2>
                {Object.entries(subcategories).map(([subcategory, products]) => {
                  if (products.length === 0) return null
                  
                  const subcategoryKey = `${parentCategory}-${subcategory}`
                  const isExpanded = expandedSubcategories[subcategoryKey] !== false

                  return (
                    <div key={subcategoryKey}>
                      <div
                        onClick={() => toggleSubcategory(parentCategory, subcategory)}
                        style={subcategoryHeaderStyle}
                      >
                        <h3 style={subcategoryTitleStyle}>{subcategory}</h3>
                        <span style={{
                          ...expandIconStyle,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </span>
                      </div>
                      {isExpanded && (
                        <div style={productListStyle}>
                          {products.map((product) => {
                            const settings = getProductSettings(product.id)
                            return (
                              <div key={product.id} style={productCardStyle}>
                                <img src={product.image} alt={product.name} style={productImageStyle} />
                                
                                <div style={productInfoStyle}>
                                  <h4 style={productNameStyle}>{product.name}</h4>
                                </div>

                                <div style={priceInputContainerStyle}>
                                  <label htmlFor={`price-${product.id}`} style={priceLabelStyle}>
                                    Fiyat (₺):
                                  </label>
                                  <input
                                    id={`price-${product.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={settings.price ?? ''}
                                    onChange={(e) => handlePriceChange(product.id, e.target.value)}
                                    placeholder="0.00"
                                    style={priceInputStyle}
                                  />
                                </div>

                                <div style={toggleGroupStyle}>
                                  <div style={toggleContainerStyle}>
                                    <span style={toggleLabelStyle}>
                                      {settings.active ? 'Aktif' : 'Pasif'}
                                    </span>
                                    <div
                                      onClick={() => handleActiveToggle(product.id)}
                                      style={toggleSwitchStyle(settings.active)}
                                    >
                                      <div style={toggleKnobStyle(settings.active)} />
                                    </div>
                                  </div>
                                  <div style={toggleContainerStyle}>
                                    <span style={toggleLabelStyle}>
                                      {settings.outOfStock ? 'Stokta Yok' : 'Stokta Var'}
                                    </span>
                                    <div
                                      onClick={() => handleOutOfStockToggle(product.id)}
                                      style={toggleSwitchStyleOutOfStock(settings.outOfStock)}
                                    >
                                      <div style={toggleKnobStyle(settings.outOfStock)} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
