'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'

const PLAN_NAMES: Record<string, string> = {
  free: 'Ücretsiz Deneme',
  monthly: 'Aylık',
  six_months: '6 Aylık',
  yearly: 'Yıllık'
}

export default function RegisterPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const plan = localStorage.getItem('selectedPlan')
      if (plan) {
        setSelectedPlan(plan)
      }
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!businessName || !email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    const success = auth.register(businessName, email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta deneyin.')
      setIsLoading(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    textAlign: 'center'
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 32px 0',
    textAlign: 'center'
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  }

  const inputGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  }

  const inputStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    width: '100%',
    boxSizing: 'border-box'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    transition: 'background-color 0.2s ease'
  }

  const errorStyle: React.CSSProperties = {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '8px',
    fontSize: '14px',
    textAlign: 'center'
  }

  const linkStyle: React.CSSProperties = {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#666'
  }

  const linkTextStyle: React.CSSProperties = {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer'
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Kayıt Ol</h1>
        <p style={subtitleStyle}>Yeni hesap oluşturun</p>

        {selectedPlan && (
          <div style={{
            padding: '12px',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Seçilen Plan: {PLAN_NAMES[selectedPlan] || selectedPlan}
          </div>
        )}

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label htmlFor="businessName" style={labelStyle}>
              İşletme Adı
            </label>
            <input
              id="businessName"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ahmet'in Bakkalı"
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              style={inputStyle}
              disabled={isLoading}
              required
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="confirmPassword" style={labelStyle}>
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              disabled={isLoading}
              required
              minLength={6}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div style={linkStyle}>
          Zaten hesabınız var mı?{' '}
          <a
            href="/login"
            style={linkTextStyle}
            onClick={(e) => {
              e.preventDefault()
              router.push('/login')
            }}
          >
            Giriş yapın
          </a>
        </div>
      </div>
    </div>
  )
}

