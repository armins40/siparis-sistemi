import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getSetting, setSetting, getAllSettings } from '@/lib/db/settings';

async function handleGet(request: NextRequest) {
  try {
    const settings = await getAllSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePut(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Key and value are required' },
        { status: 400 }
      );
    }

    try {
      const success = await setSetting(key, String(value));
      
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Failed to update setting. Please check database connection and ensure settings table exists.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (dbError: any) {
      // Catch database-specific errors
      console.error('Database error in setSetting:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: dbError?.message || 'Database error. Please ensure the settings table exists and database connection is configured.' 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating setting:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAdminAuth(request, handleGet);
}

export async function PUT(request: NextRequest) {
  return requireAdminAuth(request, handlePut);
}
