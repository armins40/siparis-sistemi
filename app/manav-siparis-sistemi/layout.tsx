import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manav Sipariş Sistemi – WhatsApp\'tan Gelen Siparişler Düzenli',
  description: 'Manavlar için WhatsApp ve telefonla siparişleri karışmadan yöneten online sipariş sistemi. Komisyonsuz, 7 gün ücretsiz.',
  keywords: [
    'manav sipariş sistemi',
    'manav sipariş',
    'whatsapp manav sipariş',
    'manav sipariş alma',
    'komisyonsuz manav sistemi',
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'Manav Sipariş Sistemi – WhatsApp\'tan Gelen Siparişler Düzenli',
    description: 'Manavlar için WhatsApp ve telefonla siparişleri karışmadan yöneten online sipariş sistemi. Komisyonsuz, 7 gün ücretsiz.',
    url: 'https://www.siparis-sistemi.com/manav-siparis-sistemi',
    type: 'website',
    siteName: 'Siparis Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manav Sipariş Sistemi – WhatsApp\'tan Gelen Siparişler Düzenli',
    description: 'Manavlar için WhatsApp ve telefonla siparişleri karışmadan yöneten online sipariş sistemi.',
  },
  alternates: {
    canonical: 'https://www.siparis-sistemi.com/manav-siparis-sistemi',
  },
};

export default function ManavSiparisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
