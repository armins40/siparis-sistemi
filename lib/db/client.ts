// Database Client - Vercel Postgres veya Neon PostgreSQL
// Neon PostgreSQL kullanıyorsanız, @vercel/postgres Neon connection string'i ile de çalışır
import { sql } from '@vercel/postgres';

export { sql };

// Not: Neon PostgreSQL kullanıyorsanız, connection string'i environment variable'a ekleyin:
// POSTGRES_URL=postgresql://user:password@host/database?sslmode=require
// @vercel/postgres bu connection string'i otomatik kullanır

// Database connection check
export async function checkConnection() {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
