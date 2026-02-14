import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';

async function handleGet(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      return NextResponse.json(
        { success: false, error: 'POSTGRES_URL not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'monthly') as 'daily' | 'weekly' | 'monthly';

    // Tüm kullanıcıları getir
    const usersResult = await sql`
      SELECT 
        id, plan, is_active, created_at, expires_at
      FROM users
      ORDER BY created_at DESC
    `;

    // Tüm abonelikleri getir
    const subscriptionsResult = await sql`
      SELECT 
        user_id, plan, amount, status, start_date, end_date, created_at
      FROM subscriptions
      ORDER BY created_at DESC
    `;

    const users = usersResult.rows;
    const subscriptions = subscriptionsResult.rows;

    const now = new Date();

    // Aktif abonelikler (end_date > now)
    const activeSubscriptions = subscriptions.filter(s => {
      const endDate = new Date(s.end_date);
      return s.status === 'active' && endDate > now;
    });

    // Trial kullanıcıları
    const trialUsers = users.filter(u => u.plan === 'trial');
    const activeTrialUsers = trialUsers.filter(u => {
      if (!u.expires_at) return false;
      const expiresAt = new Date(u.expires_at);
      return expiresAt > now;
    });
    const expiredTrialUsers = trialUsers.filter(u => {
      if (!u.expires_at) return true;
      const expiresAt = new Date(u.expires_at);
      return expiresAt <= now;
    });

    // Paid plan kullanıcıları (subscriptions tablosundan)
    const paidPlanUsers = new Set(activeSubscriptions.map(s => s.user_id));
    const usersWithPaidPlans = users.filter(u => paidPlanUsers.has(u.id));

    // Toplam gelir (subscriptions'dan)
    const totalRevenue = subscriptions.reduce((sum, s) => {
      return sum + parseFloat(String(s.amount || 0));
    }, 0);

    // Plan bazlı gelir
    const revenueByPlan = {
      monthly: subscriptions
        .filter(s => s.plan === 'monthly')
        .reduce((sum, s) => sum + parseFloat(String(s.amount || 0)), 0),
      '6month': subscriptions
        .filter(s => s.plan === '6month')
        .reduce((sum, s) => sum + parseFloat(String(s.amount || 0)), 0),
      yearly: subscriptions
        .filter(s => s.plan === 'yearly')
        .reduce((sum, s) => sum + parseFloat(String(s.amount || 0)), 0),
    };

    // Kullanıcı sayıları
    const userStats = {
      total: users.length,
      active: users.filter(u => u.is_active).length,
      trial: trialUsers.length,
      activeTrial: activeTrialUsers.length,
      expiredTrial: expiredTrialUsers.length,
      paid: usersWithPaidPlans.length,
      monthly: users.filter(u => u.plan === 'monthly').length,
      '6month': users.filter(u => u.plan === '6month').length,
      yearly: users.filter(u => u.plan === 'yearly').length,
      free: users.filter(u => u.plan === 'free').length,
    };

    // Trial'dan paid plan'a geçiş oranı
    const conversionRate = trialUsers.length > 0
      ? (usersWithPaidPlans.length / trialUsers.length) * 100
      : 0;

    // Tarihe göre kullanıcı kayıtları (period bazlı)
    const userRegistrationsMap = new Map<string, { users: number; paid: number; revenue: number }>();

    users.forEach(user => {
      const date = new Date(user.created_at);
      let key: string;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = userRegistrationsMap.get(key) || { users: 0, paid: 0, revenue: 0 };
      existing.users += 1;
      if (paidPlanUsers.has(user.id)) {
        existing.paid += 1;
      }
      userRegistrationsMap.set(key, existing);
    });

    // Abonelik gelirlerini tarihe göre grupla
    subscriptions.forEach(sub => {
      const date = new Date(sub.created_at);
      let key: string;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      const existing = userRegistrationsMap.get(key) || { users: 0, paid: 0, revenue: 0 };
      existing.revenue += parseFloat(String(sub.amount || 0));
      userRegistrationsMap.set(key, existing);
    });

    const timelineData = Array.from(userRegistrationsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      analytics: {
        totalRevenue,
        revenueByPlan,
        totalSubscriptions: subscriptions.length,
        activeSubscriptions: activeSubscriptions.length,
        userStats,
        conversionRate,
        period,
        timelineData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching SaaS analytics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
