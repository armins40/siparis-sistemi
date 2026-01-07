'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'
import { generateSlug } from '../lib/utils'
import { ParentCategory } from '../lib/products'
import * as QRCode from 'qrcode'

const DASHBOARD_DATA_KEY = 'siparis-dashboard-data'

interface DashboardData {
  logoUrl: string | null
  businessTypes: ParentCategory[]
  whatsappNumber: string | null
  backgroundColor?: string
  bannerImage?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [businessName, setBusinessName] = useState<string>('')
  const [storeSlug, setStoreSlug] = useState<string>('')
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    logoUrl: null,
    businessTypes: [],
    whatsappNumber: null
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [publicMenuLink, setPublicMenuLink] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check authentication
    const user = auth.getUser()
    if (!user || !user.isLoggedIn) {
      router.push('/login')
      return
    }

    // Load user info
    const userInfo = auth.getUserInfo()
    if (userInfo) {
      setBusinessName(userInfo.businessName)
      const slug = generateSlug(userInfo.businessName)
      setStoreSlug(slug)
      
      // Generate public menu link
      const baseUrl = window.location.origin
      const menuUrl = `${baseUrl}/m/${slug}`
      setPublicMenuLink(menuUrl)

      // Generate QR code
      QRCode.toDataURL(menuUrl, { width: 300, margin: 2 })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation error:', err))
    }

    // Load dashboard data
    const savedData = localStorage.getItem(DASHBOARD_DATA_KEY)
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as DashboardData
        setDashboardData(data)
        setLogoPreview(data.logoUrl)
        setBannerPreview(data.bannerImage || null)
      } catch {
        // Ignore parse errors
      }
    }

    // Load theme and banner from separate localStorage keys
    const themeData = localStorage.getItem('siparisTheme')
    const bannerData = localStorage.getItem('siparisBanner')
    
    if (themeData) {
      try {
        const theme = JSON.parse(themeData)
        setDashboardData(prev => ({ ...prev, backgroundColor: theme.backgroundColor }))
      } catch {}
    }
    
    if (bannerData) {
      setBannerPreview(bannerData)
      setDashboardData(prev => ({ ...prev, bannerImage: bannerData }))
    }

    setIsLoading(false)
  }, [router])

  const handleBusinessTypeToggle = (type: ParentCategory) => {
    const currentTypes = dashboardData.businessTypes || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    
    const updated = { ...dashboardData, businessTypes: newTypes }
    setDashboardData(updated)
    localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(updated))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      alert('Logo boyutu 500 KB\'dan küçük olmalıdır')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setLogoPreview(base64)
      setLogoFile(file)
      
      const updated = { ...dashboardData, logoUrl: base64 }
      setDashboardData(updated)
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(updated))
    }
    reader.readAsDataURL(file)
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.match(/^image\/(jpg|jpeg|png|webp)$/)) {
      alert('Sadece JPG, PNG veya WebP formatı desteklenir')
      return
    }

    if (file.size > 300 * 1024) {
      alert('Banner boyutu 300 KB\'dan küçük olmalıdır')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setBannerPreview(base64)
      setBannerFile(file)
      
      setDashboardData(prev => ({ ...prev, bannerImage: base64 }))
      localStorage.setItem('siparisBanner', base64)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveBanner = () => {
    setBannerPreview(null)
    setBannerFile(null)
    setDashboardData(prev => ({ ...prev, bannerImage: undefined }))
    localStorage.removeItem('siparisBanner')
  }

  const handleBackgroundColorChange = (color: string) => {
    setDashboardData(prev => ({ ...prev, backgroundColor: color }))
    localStorage.setItem('siparisTheme', JSON.stringify({ backgroundColor: color }))
  }

  const handleWhatsAppNumberChange = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '')
    const updated = { ...dashboardData, whatsappNumber: numbersOnly || null }
    setDashboardData(updated)
    localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(updated))
  }

  const copyLink = () => {
    if (!publicMenuLink) return
    navigator.clipboard.writeText(publicMenuLink).then(() => {
      alert('Link kopyalandı!')
    }).catch(() => {
      alert('Link kopyalanamadı')
    })
  }

  const downloadQR = () => {
    if (!qrCodeUrl || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = 300
      canvas.height = 300
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr-menu-${storeSlug}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    }
    img.src = qrCodeUrl
  }

  const handleLogout = () => {
    auth.logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <p style={{ fontSize: '16px', color: '#666' }}>Yükleniyor...</p>
      </div>
    )
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#9c27b0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '12px',
    marginBottom: '12px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    marginBottom: '12px'
  }

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: active ? 'white' : '#666',
    backgroundColor: active ? '#9c27b0' : '#f5f5f5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px'
  })

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                Hoş Geldiniz, {businessName}
              </h1>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                Dashboard'unuzdan işletmenizi yönetin
              </p>
            </div>
            <button onClick={handleLogout} style={{ ...buttonStyle, backgroundColor: '#dc2626' }}>
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Public Menu Link & QR Code */}
        {publicMenuLink && (
          <div style={cardStyle}>
            <h2 style={titleStyle}>Müşteri Menü Linki & QR Kod</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Public Menu Link:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={publicMenuLink}
                  readOnly
                  style={{ ...inputStyle, marginBottom: 0, backgroundColor: '#f9fafb' }}
                />
                <button onClick={copyLink} style={buttonStyle}>
                  Linki Kopyala
                </button>
              </div>
            </div>
            {qrCodeUrl && (
              <div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '300px', width: '100%', height: 'auto' }} />
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button onClick={downloadQR} style={buttonStyle}>
                  QR Kodunu İndir (PNG)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Business Types */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>İşletme Türü</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            İşletmenizin türünü seçin (birden fazla seçebilirsiniz):
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(['Tekel', 'Manav', 'Bakkal', 'Market'] as ParentCategory[]).map(type => (
              <button
                key={type}
                onClick={() => handleBusinessTypeToggle(type)}
                style={toggleStyle(dashboardData.businessTypes?.includes(type) || false)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>İşletme Logosu</h2>
          {logoPreview && (
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <img
                src={logoPreview}
                alt="Logo Preview"
                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            style={{ marginBottom: '8px' }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Maksimum dosya boyutu: 500 KB
          </p>
        </div>

        {/* WhatsApp Number */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>WhatsApp Sipariş Numarası</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Müşterilerinizin sipariş vereceği WhatsApp numarası (ülke kodu ile, sadece rakam):
          </p>
          <input
            type="text"
            placeholder="905551112233"
            value={dashboardData.whatsappNumber || ''}
            onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
            style={inputStyle}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Örnek: 905551112233 (Türkiye için 90 + telefon numarası)
          </p>
        </div>

        {/* Theme Settings */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>Mağaza Görünümü</h2>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
            Arka Plan Rengi:
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <input
              type="color"
              value={dashboardData.backgroundColor || '#f5f5f5'}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            />
            <input
              type="text"
              value={dashboardData.backgroundColor || '#f5f5f5'}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              style={{ ...inputStyle, width: '120px', marginBottom: 0 }}
            />
          </div>
          {dashboardData.backgroundColor && (
            <div
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: dashboardData.backgroundColor,
                borderRadius: '8px',
                border: '1px solid #e0e0e0'
              }}
            />
          )}
        </div>

        {/* Banner Upload */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>Mobil Banner</h2>
          {bannerPreview && (
            <div style={{ marginBottom: '16px' }}>
              <img
                src={bannerPreview}
                alt="Banner Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <button
                onClick={handleRemoveBanner}
                style={{ ...buttonStyle, backgroundColor: '#dc2626', marginTop: '12px' }}
              >
                Banner'ı Kaldır
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleBannerUpload}
            style={{ marginBottom: '8px' }}
          />
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Desteklenen formatlar: JPG, PNG, WebP | Maksimum boyut: 300 KB | Önerilen oran: 1080x360
          </p>
        </div>

        {/* Actions */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>İşlemler</h2>
          <button
            onClick={() => router.push('/dashboard/products')}
            style={buttonStyle}
          >
            Ürünleri Yönet
          </button>
        </div>
      </div>
    </div>
  )
}
