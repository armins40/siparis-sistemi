'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Menu page error:', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1a1a1a',
          margin: '0 0 12px 0',
        }}
      >
        Something went wrong!
      </h2>
      <p
        style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 24px 0',
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        We couldn't load the menu. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  )
}

