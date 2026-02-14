import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İletişim | Siparis Sistemi',
  description: 'Siparis Sistemi ile iletişime geçin. Sorularınız için bize ulaşın. E-posta: admin@siparis-sistemi.com',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'İletişim | Siparis Sistemi',
    description: 'Siparis Sistemi ile iletişime geçin. Sorularınız için bize ulaşın.',
    url: 'https://www.siparis-sistemi.com/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'İletişim | Siparis Sistemi',
    description: 'Siparis Sistemi ile iletişime geçin.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
