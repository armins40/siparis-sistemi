import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3000/api/v1';
const BACKEND_TOKEN = process.env.BACKEND_ADMIN_TOKEN;

async function handleGet(request: NextRequest) {
  if (!BACKEND_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'BACKEND_ADMIN_TOKEN yapılandırılmamış',
      configured: false,
    }, { status: 200 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${BACKEND_TOKEN}` },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        error: err.message || `Backend ${res.status}`,
        configured: true,
      }, { status: res.status >= 500 ? 502 : res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data, configured: true });
  } catch (e: unknown) {
    console.error('Super admin dashboard fetch error:', e);
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : 'Backend bağlantı hatası',
      configured: true,
    }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}
