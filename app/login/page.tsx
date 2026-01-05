'use client'

import React, { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun')
      setIsLoading(false)
      return
    }

    const success = auth.login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('E-posta veya şifre hatalı. Lütfen tekrar deneyin.')
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
        <h1 style={titleStyle}>Giriş Yap</h1>
        <p style={subtitleStyle}>Hesabınıza giriş yapın</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
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
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={linkStyle}>
          Hesabınız yok mu?{' '}
          <a
            href="/register"
            style={linkTextStyle}
            onClick={(e) => {
              e.preventDefault()
              router.push('/register')
            }}
          >
            Kayıt olun
          </a>
        </div>
      </div>
    </div>
  )
}

