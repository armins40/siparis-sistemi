export default function Loading() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-spinner {
            animation: spin 1s linear infinite;
          }
        `
      }} />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <div
            className="loading-spinner"
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              margin: '0 auto 16px',
            }}
          />
          <p
            style={{
              fontSize: '16px',
              color: '#666',
              margin: '0',
            }}
          >
            Loading menu...
          </p>
        </div>
      </div>
    </>
  )
}

