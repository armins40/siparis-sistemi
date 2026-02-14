import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';

async function handleGet(request: NextRequest) {
  try {
    // Get all users
    const usersResult = await sql`
      SELECT id, plan, is_active, expires_at
      FROM users
    `;

    // Get all subscriptions
    const subscriptionsResult = await sql`
      SELECT user_id, plan, amount, status, start_date, end_date
      FROM subscriptions
      WHERE status = 'active'
    `;

    // Get all orders with revenue
    const ordersResult = await sql`
      SELECT total, final_total, status, created_at
      FROM orders
    `;

    // Get all products
    const productsResult = await sql`
      SELECT id, created_by, is_published
      FROM products
    `;

    // Get all categories
    const categoriesResult = await sql`
      SELECT id
      FROM categories
    `;

    const users = usersResult.rows;
    const subscriptions = subscriptionsResult.rows;
    const orders = ordersResult.rows;
    const products = productsResult.rows;
    const categories = categoriesResult.rows;

    // Calculate statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    
    // Active subscriptions (paid plans)
    const paidPlans = subscriptions.filter(s => {
      const endDate = new Date(s.end_date);
      return endDate > new Date();
    });
    const activeSubscriptions = paidPlans.length;

    // Total revenue from subscriptions
    const totalSubscriptionRevenue = subscriptions.reduce((sum, sub) => {
      return sum + parseFloat(String(sub.amount || 0));
    }, 0);

    // Total revenue from orders
    const totalOrderRevenue = orders
      .filter(o => o.status === 'completed' || o.status === 'confirmed')
      .reduce((sum, order) => {
        return sum + parseFloat(String(order.final_total || 0));
      }, 0);

    // Revenue by plan type
    const monthlyRevenue = subscriptions
      .filter(s => s.plan === 'monthly')
      .reduce((sum, sub) => sum + parseFloat(String(sub.amount || 0)), 0);
    
    const sixMonthRevenue = subscriptions
      .filter(s => s.plan === '6month')
      .reduce((sum, sub) => sum + parseFloat(String(sub.amount || 0)), 0);
    
    const yearlyRevenue = subscriptions
      .filter(s => s.plan === 'yearly')
      .reduce((sum, sub) => sum + parseFloat(String(sub.amount || 0)), 0);

    // Users by plan
    const usersByPlan = {
      trial: users.filter(u => u.plan === 'trial').length,
      monthly: users.filter(u => u.plan === 'monthly').length,
      '6month': users.filter(u => u.plan === '6month').length,
      yearly: users.filter(u => u.plan === 'yearly').length,
      free: users.filter(u => u.plan === 'free').length,
    };

    // Calculate product stats
    const totalProducts = products.length;
    const adminProducts = products.filter(p => p.created_by === 'admin').length;
    const userProducts = products.filter(p => p.created_by === 'user').length;
    const publishedProducts = products.filter(p => p.is_published).length;

    // Calculate category stats
    const totalCategories = categories.length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        activeSubscriptions,
        totalSubscriptionRevenue,
        totalOrderRevenue,
        totalRevenue: totalSubscriptionRevenue + totalOrderRevenue,
        monthlyRevenue,
        sixMonthRevenue,
        yearlyRevenue,
        usersByPlan,
        totalOrders: orders.length,
        totalProducts,
        adminProducts,
        userProducts,
        publishedProducts,
        totalCategories,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
