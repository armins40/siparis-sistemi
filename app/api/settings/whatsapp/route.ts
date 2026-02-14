import { NextRequest, NextResponse } from 'next/server';
import { getSetting } from '@/lib/db/settings';

export async function GET(request: NextRequest) {
  try {
    // Public endpoint - no auth required
    const whatsappNumber = await getSetting('whatsapp_number');
    
    // Default fallback
    const defaultNumber = '905535057059';
    
    return NextResponse.json({
      success: true,
      whatsappNumber: whatsappNumber || defaultNumber,
    });
  } catch (error: any) {
    console.error('Error fetching WhatsApp number:', error);
    // Return default on error
    return NextResponse.json({
      success: true,
      whatsappNumber: '905535057059',
    });
  }
}
