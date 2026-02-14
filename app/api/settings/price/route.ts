import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/db/settings';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required
    const [yearlyPrice, monthlyPlanPrice, kdvRate] = await Promise.all([
      getSetting('yearly_price'),
      getSetting('monthly_plan_price'),
      getSetting('kdv_rate'),
    ]);

    const defaultYearly = '2490';
    const defaultMonthlyPlan = '599';
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
    });
  } catch (error: any) {
    console.error('Error fetching price:', error);
    return NextResponse.json({
      success: true,
      yearlyPrice: '2490',
      monthlyPrice: '207',
      dailyPrice: '6.8',
      monthlyPlanPrice: '599',
      kdvRate: '20',
    });
  }
}
