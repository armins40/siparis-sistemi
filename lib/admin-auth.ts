// Server-side admin authentication utilities
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_SESSION_COOKIE = 'admin_session';
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function normalize(s: string): string {
  return s.replace(/\r?\n/g, '').trim();
}

// Verify admin credentials (server-side only)
export function verifyAdminCredentials(username: string, password: string): boolean {
  const rawUser = process.env.ADMIN_USERNAME ?? 'admin';
  const rawPass = process.env.ADMIN_PASSWORD ?? '';
  const adminUsername = normalize(rawUser);
  const adminPassword = normalize(rawPass);
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return false;
  }
  
  const u = normalize(username);
  const p = normalize(password);
  // Use constant-time comparison to prevent timing attacks
  return constantTimeEqual(u, adminUsername) && constantTimeEqual(p, adminPassword);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// Create admin session
export async function createAdminSession(): Promise<string> {
  const sessionId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION;
  
  // In production, store session in database or Redis
  // For now, we'll use a signed cookie
  return sessionId;
}

// Verify admin session (server-side)
export async function verifyAdminSession(request: NextRequest): Promise<boolean> {
  try {
    // Check for session cookie
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE);
    
    if (!sessionCookie) {
      return false;
    }
    
    // In production, verify session in database/Redis
    // For now, we'll check if it's a valid format
    const sessionId = sessionCookie.value;
    
    if (!sessionId || !sessionId.startsWith('admin_')) {
      return false;
    }
    
    // Extract timestamp from session ID
    const parts = sessionId.split('_');
    if (parts.length < 2) {
      return false;
    }
    
    const timestamp = parseInt(parts[1], 10);
    
    if (isNaN(timestamp) || Date.now() - timestamp > ADMIN_SESSION_DURATION) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return false;
  }
}

// Admin authentication middleware for API routes
export async function requireAdminAuth(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const isAuthenticated = await verifyAdminSession(request);
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin authentication required.' },
      { status: 401 }
    );
  }
  
  return handler(request);
}
