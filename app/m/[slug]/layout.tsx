import type { Metadata } from 'next';
import { sql } from '@/lib/db/client';

interface MenuLayoutProps {
  params: Promise<{ slug?: string }>;
  children: React.ReactNode;
}

function slugToReadable(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: MenuLayoutProps): Promise<Metadata> {
  const { slug = '' } = await params;
  
  if (!slug) {
    return {
      title: 'Mağaza Bulunamadı | Online Sipariş Sistemi',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  try {
    // Fetch store data from database
    const result = await sql`
      SELECT s.name, s.slug, u.is_active
      FROM stores s
      INNER JOIN users u ON s.slug = u.store_slug
      WHERE s.slug = ${slug} AND u.is_active = true
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return {
        title: 'Mağaza Bulunamadı | Online Sipariş Sistemi',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const store = result.rows[0];
    const storeName = store.name || slugToReadable(slug);
    
    return {
      title: `${storeName} | Online Sipariş Sistemi`,
      description: `${storeName} için WhatsApp ve online sipariş altyapısı. Komisyonsuz, hızlı kurulum, anında aktif.`,
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      openGraph: {
        title: `${storeName} | Online Sipariş Sistemi`,
        description: `${storeName} için WhatsApp ve online sipariş altyapısı. Komisyonsuz, hızlı kurulum, anında aktif.`,
        url: `https://www.siparis-sistemi.com/m/${slug}`,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${storeName} | Online Sipariş Sistemi`,
        description: `${storeName} için WhatsApp ve online sipariş altyapısı.`,
      },
      alternates: {
        canonical: `https://www.siparis-sistemi.com/m/${slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata for menu page:', error);
    const storeName = slugToReadable(slug);
    return {
      title: `${storeName} | Online Sipariş Sistemi`,
      description: `${storeName} için WhatsApp ve online sipariş altyapısı. Komisyonsuz, hızlı kurulum, anında aktif.`,
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

export default async function MenuLayout({ children }: MenuLayoutProps) {
  return children;
}
