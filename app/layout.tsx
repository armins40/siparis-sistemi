import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sipariş Sistemi',
  description: 'Küçük esnaf için online sipariş sistemi',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
