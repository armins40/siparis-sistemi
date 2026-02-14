import { MetadataRoute } from 'next';
import { sql } from '@/lib/db/client';
import { SITE_URL } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/whatsapp-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tekel-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/manav-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/market-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kasap-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sarkuteri-siparis-sistemi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Dynamic pages - Active stores
  try {
    const result = await sql`
      SELECT s.slug, s.updated_at, u.is_active
      FROM stores s
      INNER JOIN users u ON s.slug = u.store_slug
      WHERE u.is_active = true
      ORDER BY s.updated_at DESC
    `;

    const storePages: MetadataRoute.Sitemap = result.rows.map((row: any) => ({
      url: `${baseUrl}/m/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }));

    return [...staticPages, ...storePages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return only static pages on error
    return staticPages;
  }
}
