'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth, User } from '../lib/auth'
import { generateSlug } from '../lib/utils'

type BusinessType = 'Tekel' | 'Manav' | 'Bakkal' | 'Market'

const BUSINESS_TYPES: BusinessType[] = ['Tekel', 'Manav', 'Bakkal', 'Market']

const DASHBOARD_DATA_KEY = 'siparis-dashboard-data'

const PLAN_NAMES: Record<string, string> = {
  free: 'Ücretsiz Deneme',
  monthly: 'Aylık',
  six_months: '6 Aylık',
  yearly: 'Yıllık'
}

interface DashboardData {
  logoUrl: string | null
  businessTypes: BusinessType[]
  whatsappNumber: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<BusinessType[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState<string>('')
  const [publicMenuUrl, setPublicMenuUrl] = useState<string>('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [backgroundColor, setBackgroundColor] = useState<string>('#f8f9fa')
  const [bannerImage, setBannerImage] = useState<string | null>(null)
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

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

      // User is authenticated, load user info
      const currentUser = auth.getUserInfo()
      setUser(currentUser)

      // Load dashboard data from localStorage
      const savedData = localStorage.getItem(DASHBOARD_DATA_KEY)
      if (savedData) {
        try {
          const data = JSON.parse(savedData) as DashboardData
          setLogoUrl(data.logoUrl)
          setSelectedTypes(data.businessTypes || [])
          setWhatsappNumber(data.whatsappNumber || '')
        } catch {
          // Ignore parse errors
        }
      }

      // Load theme settings
      const themeData = localStorage.getItem('siparisTheme')
      if (themeData) {
        try {
          const theme = JSON.parse(themeData) as { backgroundColor: string }
          if (theme.backgroundColor) {
            setBackgroundColor(theme.backgroundColor)
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Load banner image
      const bannerData = localStorage.getItem('siparisBanner')
      if (bannerData) {
        setBannerImage(bannerData)
      }

      // Load selected plan
      const plan = localStorage.getItem('selectedPlan')
      if (plan) {
        setSelectedPlan(plan)
      }

      // Generate public menu URL
      if (currentUser) {
        const slug = generateSlug(currentUser.businessName)
        const url = `${window.location.origin}/m/${slug}`
        setPublicMenuUrl(url)
        generateQRCode(url)
      }

      setIsLoading(false)
    } catch {
      // Parse error, redirect to login
      router.push('/login')
    }
  }, [router])

  const saveDashboardData = (data: Partial<DashboardData>) => {
    if (typeof window === 'undefined') return
    const existingData: DashboardData = {
      logoUrl,
      businessTypes: selectedTypes,
      whatsappNumber: whatsappNumber || null
    }
    const newData = { ...existingData, ...data }
    localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(newData))
  }

  const handleWhatsappNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '')
    setWhatsappNumber(value)
    saveDashboardData({ whatsappNumber: value || null })
  }

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setBackgroundColor(color)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('siparisTheme', JSON.stringify({ backgroundColor: color }))
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Lütfen JPG, PNG veya WebP formatında bir resim seçin')
      return
    }

    // Validate file size (max 300 KB)
    if (file.size > 300 * 1024) {
      alert('Dosya boyutu 300 KB\'dan küçük olmalıdır')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setBannerImage(dataUrl)
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('siparisBanner', dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBanner = () => {
    setBannerImage(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('siparisBanner')
    }
    // Reset file input
    const fileInput = document.getElementById('banner-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Dosya boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setLogoUrl(dataUrl)
      saveDashboardData({ logoUrl: dataUrl })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoUrl(null)
    saveDashboardData({ logoUrl: null })
    // Reset file input
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }

  const handleBusinessTypeToggle = (type: BusinessType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    setSelectedTypes(newTypes)
    saveDashboardData({ businessTypes: newTypes })
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/')
  }

  const generateQRCode = async (url: string) => {
    if (typeof window === 'undefined') return

    try {
      // Use QRCode library
      const QRCode = await import('qrcode')
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(dataUrl)
      
      // Draw on canvas for download
      if (qrCanvasRef.current) {
        const canvas = qrCanvasRef.current
        await QRCode.toCanvas(canvas, url, {
          width: 300,
          margin: 2
        })
      }
    } catch (error) {
      console.error('QR code generation failed:', error)
      // Fallback: use QR Server API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
      setQrCodeDataUrl(qrUrl)
    }
  }

  const copyLink = () => {
    if (!publicMenuUrl) return
    navigator.clipboard.writeText(publicMenuUrl).then(() => {
      alert('Link kopyalandı!')
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = publicMenuUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link kopyalandı!')
    })
  }

  const downloadQR = () => {
    if (!qrCodeDataUrl) return

    // Use data URL or canvas
    const canvas = qrCanvasRef.current
    if (canvas && canvas.width > 0) {
      // Download from canvas
      canvas.toBlob((blob) => {
        if (!blob) {
          // Fallback to data URL
          downloadFromDataUrl()
          return
        }
        const link = document.createElement('a')
        link.download = `qr-${generateSlug(user?.businessName || 'shop')}.png`
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      }, 'image/png')
    } else {
      downloadFromDataUrl()
    }
  }

  const downloadFromDataUrl = () => {
    if (!qrCodeDataUrl) return
    const link = document.createElement('a')
    link.download = `qr-${generateSlug(user?.businessName || 'shop')}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    paddingTop: '20px'
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  }

  const welcomeCardStyle: React.CSSProperties = {
    ...cardStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    marginBottom: '24px'
  }

  const welcomeTitleStyle: React.CSSProperties = {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#ffffff'
  }

  const welcomeSubtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    margin: '0',
    color: 'rgba(255, 255, 255, 0.9)'
  }

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 20px 0'
  }

  const logoContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  }

  const logoPreviewStyle: React.CSSProperties = {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  }

  const uploadButtonStyle: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#ffffff',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-block'
  }

  const removeButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }

  const fileInputStyle: React.CSSProperties = {
    display: 'none'
  }

  const businessTypesContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const typeToggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: '#ffffff'
  }

  const typeToggleActiveStyle: React.CSSProperties = {
    ...typeToggleStyle,
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  }

  const checkboxStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#3b82f6'
  }

  const typeLabelStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a1a1a',
    cursor: 'pointer',
    flex: '1'
  }

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  }

  const primaryButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  }

  const primaryButtonDisabledStyle: React.CSSProperties = {
    ...primaryButtonStyle,
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6
  }

  const logoutButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#dc2626',
    backgroundColor: '#ffffff',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
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

  if (!user) {
    return null
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Welcome Card */}
        <div style={welcomeCardStyle}>
          <h1 style={welcomeTitleStyle}>Hoş Geldiniz, {user.businessName}!</h1>
          <p style={welcomeSubtitleStyle}>
            İşletmenizi yönetmek için başlayın
          </p>
          {selectedPlan && (
            <div style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Plan: {PLAN_NAMES[selectedPlan] || selectedPlan}
            </div>
          )}
        </div>

        {/* Logo Upload Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>İşletme Logosu / Fotoğrafı</h2>
          <div style={logoContainerStyle}>
            {logoUrl ? (
              <img src={logoUrl} alt="Business logo" style={logoPreviewStyle} />
            ) : (
              <div style={logoPreviewStyle} />
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <label htmlFor="logo-upload" style={uploadButtonStyle}>
                {logoUrl ? 'Logo Değiştir' : 'Logo Yükle'}
              </label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={fileInputStyle}
              />
              {logoUrl && (
                <button onClick={handleRemoveLogo} style={removeButtonStyle}>
                  Logoyu Kaldır
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Business Types Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>İşletme Türü</h2>
          <div style={businessTypesContainerStyle}>
            {BUSINESS_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type)
              return (
                <div
                  key={type}
                  onClick={() => handleBusinessTypeToggle(type)}
                  style={isSelected ? typeToggleActiveStyle : typeToggleStyle}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleBusinessTypeToggle(type)}
                    style={checkboxStyle}
                  />
                  <label style={typeLabelStyle}>{type}</label>
                </div>
              )
            })}
          </div>
        </div>

        {/* WhatsApp Number Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>WhatsApp Sipariş Numarası <span style={{ color: '#dc2626' }}>*</span></h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            Müşterileriniz siparişlerini bu numaraya WhatsApp üzerinden gönderebilir
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={whatsappNumber}
              onChange={handleWhatsappNumberChange}
              placeholder="905551112233"
              maxLength={15}
              style={{
                padding: '12px 16px',
                fontSize: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'monospace',
                letterSpacing: '1px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
              Format: Ülke kodu + numara (sadece rakamlar). Örnek: 905551112233
            </p>
            {whatsappNumber && whatsappNumber.length > 0 && whatsappNumber.length < 10 && (
              <p style={{ fontSize: '12px', color: '#dc2626', margin: '0' }}>
                Numara çok kısa görünüyor. Lütfen ülke kodu ile birlikte girin.
              </p>
            )}
          </div>
        </div>

        {/* Theme Settings Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Mağaza Görünümü</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Arka Plan Rengi
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={handleBackgroundColorChange}
                  style={{
                    width: '60px',
                    height: '40px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => {
                    setBackgroundColor(e.target.value)
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('siparisTheme', JSON.stringify({ backgroundColor: e.target.value }))
                    }
                  }}
                  style={{
                    flex: '1',
                    minWidth: '120px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#666', margin: '8px 0 0 0' }}>
                Müşteri menü sayfasının arka plan rengini seçin
              </p>
            </div>

            {/* Live Preview */}
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Önizleme:
              </p>
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: backgroundColor,
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px'
                }}
              >
                Menü arka plan önizlemesi
              </div>
            </div>
          </div>
        </div>

        {/* Banner Upload Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Mobil Banner Yükle</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Müşteri menü sayfasının üstünde gösterilecek banner görseli
          </p>
          
          {bannerImage && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={bannerImage}
                alt="Banner preview"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb'
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label htmlFor="banner-upload" style={uploadButtonStyle}>
              {bannerImage ? 'Banner Değiştir' : 'Banner Yükle'}
            </label>
            <input
              id="banner-upload"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleBannerUpload}
              style={fileInputStyle}
            />
            {bannerImage && (
              <button onClick={handleRemoveBanner} style={removeButtonStyle}>
                Banner'ı Kaldır
              </button>
            )}
          </div>

          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0', fontWeight: '600' }}>
              Önerilen Özellikler:
            </p>
            <ul style={{ fontSize: '12px', color: '#666', margin: '0', paddingLeft: '20px' }}>
              <li>Format: JPG, PNG veya WebP</li>
              <li>Maksimum dosya boyutu: 300 KB</li>
              <li>Önerilen oran: 1080x360 piksel (3:1)</li>
              <li>Mobil cihazlarda optimize edilmiş görsel</li>
            </ul>
          </div>
        </div>

        {/* Public Menu Link & QR Code Card */}
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Halka Açık Menü Linki</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={publicMenuUrl}
                readOnly
                style={{
                  flex: '1',
                  minWidth: '200px',
                  padding: '10px 12px',
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb',
                  fontFamily: 'monospace'
                }}
              />
              <button
                onClick={copyLink}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Linki Kopyala
              </button>
            </div>

            {qrCodeDataUrl && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '20px',
                backgroundColor: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    style={{
                      width: '200px',
                      height: '200px',
                      display: 'block'
                    }}
                  />
                </div>
                <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
                <button
                  onClick={downloadQR}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  QR Kodunu İndir (PNG)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions Card */}
        <div style={cardStyle}>
          <div style={buttonContainerStyle}>
            <button
              onClick={() => router.push('/dashboard/products')}
              style={primaryButtonStyle}
            >
              Ürünleri Yönet
            </button>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
