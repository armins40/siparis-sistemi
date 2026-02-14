import { getSetting } from '@/lib/db/settings';
import LandingPageContent from '@/components/LandingPageContent';

export default async function LandingPage() {
  // Server-side: Fetch settings from database
  const whatsappNumber = await getSetting('whatsapp_number') || '905535057059';
  const yearlyPriceStr = await getSetting('yearly_price') || '2490';
  const yearlyPrice = parseFloat(yearlyPriceStr) || 2490;
  const monthlyPrice = Math.round(yearlyPrice / 12).toString();
  const dailyPrice = (yearlyPrice / 365).toFixed(1);

  // Structured Data (JSON-LD) for SEO - Server-side rendered
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Siparis Sistemi",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": yearlyPriceStr,
      "priceCurrency": "TRY",
      "availability": "https://schema.org/InStock"
    },
    "description": "Kasap, şarküteri, tekel, manav ve pet shoplar için pratik sipariş sistemi. WhatsApp ve telefondan gelen siparişler tek ekranda.",
    "url": "https://www.siparis-sistemi.com",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  };

  return (
    <>
      {/* Structured Data for SEO - Server-side rendered, visible to crawlers */}
      {/* Next.js official recommendation: Use replace(/</g, '\\u003c') to prevent XSS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      
      {/* Client-side interactive content */}
      <LandingPageContent
        initialWhatsappNumber={whatsappNumber}
        yearlyPrice={yearlyPriceStr}
        monthlyPrice={monthlyPrice}
        dailyPrice={dailyPrice}
      />
    </>
  );
}
