import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { createUserInDB, updateUserInDB, deleteUserFromDB, getUserByIdFromDB } from '@/lib/db/users';
import { requireAdminAuth } from '@/lib/admin-auth';
import type { User } from '@/lib/types';

function mapRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: (row.email as string) || undefined,
    phone: (row.phone as string) || undefined,
    name: (row.name as string) || undefined,
    plan: ((row.plan as string) || 'trial') as User['plan'],
    isActive: row.isActive !== undefined ? Boolean(row.isActive) : true,
    createdAt: row.createdAt ? new Date(row.createdAt as string).toISOString() : new Date().toISOString(),
    expiresAt: row.expiresAt ? new Date(row.expiresAt as string).toISOString() : undefined,
    storeSlug: (row.storeSlug as string) || undefined,
    sector: (row.sector as string) || undefined,
    emailVerified: row.emailVerified !== undefined ? Boolean(row.emailVerified) : false,
    phoneVerified: row.phoneVerified !== undefined ? Boolean(row.phoneVerified) : false,
    paymentMethodId: (row.paymentMethodId as string) || undefined,
  } as User;
}

async function handleGet(request: NextRequest) {
  try {
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL is not set');
      return NextResponse.json(
        { success: false, error: 'Database connection not configured', details: 'POSTGRES_URL environment variable is missing' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      const user = await getUserByIdFromDB(userId);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Kullanıcı bulunamadı' }, { status: 404 });
      }
      const { password: _p, ...safe } = user as User & { password?: string };
      return NextResponse.json({ success: true, user: safe });
    }

    const result = await sql`
      SELECT 
        id, email, phone, name, password,
        plan, is_active as "isActive",
        created_at as "createdAt",
        expires_at as "expiresAt",
        store_slug as "storeSlug",
        sector,
        email_verified as "emailVerified",
        phone_verified as "phoneVerified",
        payment_method_id as "paymentMethodId"
      FROM users
      ORDER BY created_at DESC
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, users: [] });
    }

    const users: User[] = result.rows.map((row: Record<string, unknown>) => {
      try {
        return mapRowToUser(row);
      } catch (err) {
        console.error('❌ Error mapping user row:', err, row);
        return null;
      }
    }).filter((u): u is User => u !== null);

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('❌ Error fetching users from DB:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { user } = body;

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'User data with ID is required' },
        { status: 400 }
      );
    }

    // Ensure required fields have defaults
    const userData: User = {
      ...user,
      plan: user.plan || 'trial',
      isActive: user.isActive !== undefined ? user.isActive : true,
      createdAt: user.createdAt || new Date().toISOString(),
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false,
    };

    const success = await createUserInDB(userData);

    if (success) {
      return NextResponse.json({ success: true, user: userData });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating user in DB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAdminAuth(request, handlePost);
}

const PLAN_DURATIONS_DAYS: Record<string, number> = {
  monthly: 30,
  '6month': 180,
  yearly: 365,
};

async function handlePut(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: 'User ID and updates are required' },
        { status: 400 }
      );
    }

    const u = { ...updates };
    if (u.plan && (u.plan === 'monthly' || u.plan === '6month' || u.plan === 'yearly')) {
      const days = PLAN_DURATIONS_DAYS[u.plan] ?? 30;
      const end = new Date();
      end.setDate(end.getDate() + days);
      u.expiresAt = end.toISOString();
    }

    const success = await updateUserInDB(userId, u);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to update user' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating user in DB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return requireAdminAuth(request, handlePut);
}

async function handleDelete(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteUserFromDB(userId);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Kullanıcı başarıyla silindi' 
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete user' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting user from DB:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  return requireAdminAuth(request, handleDelete);
}
