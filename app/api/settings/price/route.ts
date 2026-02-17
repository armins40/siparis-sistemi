import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/db/settings';
import { MARKETING } from '@/lib/marketing';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required
    const [yearlyPrice, monthlyPlanPrice, kdvRate, priceTagline] = await Promise.all([
      getSetting('yearly_price'),
      getSetting('monthly_plan_price'),
      getSetting('kdv_rate'),
      getSetting('price_tagline'),
    ]);

    const defaultYearly = MARKETING.DEFAULT_YEARLY_PRICE;
    const defaultMonthlyPlan = MARKETING.DEFAULT_MONTHLY_PRICE;
    const defaultKdv = '20';
    const price = yearlyPrice || defaultYearly;
    const monthlyPlan = monthlyPlanPrice || defaultMonthlyPlan;
    const kdv = kdvRate || defaultKdv;

    // Derived: yıllık fiyatın aylık eşdeğeri (ana sayfa / SEO için)
    const priceNum = parseFloat(price) || 2490;
    const monthlyPrice = Math.round(priceNum / 12);
    const dailyPrice = Math.round((priceNum / 365) * 10) / 10;

    return NextResponse.json({
      success: true,
      yearlyPrice: price,
      monthlyPrice: monthlyPrice.toString(),
      dailyPrice: dailyPrice.toString(),
      monthlyPlanPrice: monthlyPlan,
      kdvRate: kdv,
      priceTagline: priceTagline || MARKETING.PRICE_TAGLINE,
    });
  } catch (error: any) {
    console.error('Error fetching price:', error);
    return NextResponse.json({
      success: true,
      yearlyPrice: MARKETING.DEFAULT_YEARLY_PRICE,
      monthlyPrice: '207',
      dailyPrice: '6.8',
      monthlyPlanPrice: MARKETING.DEFAULT_MONTHLY_PRICE,
      kdvRate: '20',
      priceTagline: MARKETING.PRICE_TAGLINE,
    });
  }
}
