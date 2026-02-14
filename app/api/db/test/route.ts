import { NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';

// Test endpoint to check database connection and POSTGRES_URL
export async function GET() {
  try {
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    
    if (!hasPostgresUrl) {
      return NextResponse.json({
        success: false,
        error: 'POSTGRES_URL environment variable is not set',
        message: 'Please add POSTGRES_URL to Vercel Environment Variables'
      }, { status: 500 });
    }

    // Test database connection
    try {
      const result = await sql`SELECT 1 as test`;
      return NextResponse.json({
        success: true,
        postgres_url_set: true,
        database_connected: true,
        test_query: 'OK',
        message: 'Database connection successful!'
      });
    } catch (dbError: any) {
      return NextResponse.json({
        success: false,
        postgres_url_set: true,
        database_connected: false,
        error: dbError?.message || 'Database connection failed',
        message: 'POSTGRES_URL is set but database connection failed. Check connection string.'
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Unknown error',
      message: 'Failed to test database connection'
    }, { status: 500 });
  }
}
