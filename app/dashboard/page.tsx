'use client'

export default function DashboardPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333',
          margin: '0 0 16px 0'
        }}>
          Dashboard works
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0'
        }}>
          Dashboard route is working correctly.
        </p>
      </div>
    </div>
  )
}
