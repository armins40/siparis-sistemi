// Database Schema Setup API Route
// Bu route'u bir kez çalıştırarak database schema'sını oluşturabilirsiniz
// GÜVENLİK: Production'da bu route'u devre dışı bırakın!

import { sql } from '@/lib/db/client';
import { NextResponse } from 'next/server';

// GET method for browser access
export async function GET(request: Request) {
  return await setupDatabase();
}

// POST method for API calls
export async function POST(request: Request) {
  return await setupDatabase();
}

async function setupDatabase() {
  // GÜVENLİK: Production'da bu route'u devre dışı bırakın (isteğe bağlı)
  // Şimdilik herkesin kullanabilmesi için açık bırakıyoruz
  // İsterseniz aşağıdaki kodu aktif edebilirsiniz:
  /*
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.SETUP_SECRET_KEY;
    
    if (!secretKey || authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized. Set SETUP_SECRET_KEY environment variable.' },
        { status: 401 }
      );
    }
  }
  */

  try {
    console.log('🔧 Setting up database schema...');

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        phone TEXT UNIQUE,
        name TEXT,
        password TEXT,
        plan TEXT NOT NULL DEFAULT 'trial',
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        store_slug TEXT UNIQUE,
        sector TEXT,
        email_verified BOOLEAN DEFAULT false,
        phone_verified BOOLEAN DEFAULT false,
        payment_method_id TEXT
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_users_store_slug ON users(store_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`;

    // Stores table
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        slug TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        logo TEXT,
        banner TEXT,
        address TEXT,
        phone TEXT,
        whatsapp TEXT,
        theme_id TEXT DEFAULT 'modern-blue',
        sector TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug)`;

    // Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT,
        image TEXT,
        is_published BOOLEAN DEFAULT false,
        stock DECIMAL(10, 2),
        unit TEXT DEFAULT 'adet',
        created_at TIMESTAMP DEFAULT NOW(),
        sector TEXT,
        created_by TEXT DEFAULT 'user',
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        store_slug TEXT REFERENCES stores(slug) ON DELETE CASCADE
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_store_slug ON products(store_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sector ON products(sector)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published)`;

    // Categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        "order" INTEGER DEFAULT 0,
        sector TEXT,
        store_slug TEXT REFERENCES stores(slug) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_categories_store_slug ON categories(store_slug)`;

    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        store_slug TEXT NOT NULL REFERENCES stores(slug) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        final_total DECIMAL(10, 2) NOT NULL,
        address TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_store_slug ON orders(store_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)`;

    // Coupons table
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value DECIMAL(10, 2) NOT NULL,
        min_purchase DECIMAL(10, 2),
        max_discount DECIMAL(10, 2),
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)`;

    // Subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'active',
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        payment_method TEXT,
        payment_id TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        cancelled_at TIMESTAMP
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;

    console.log('✅ Database schema created successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database schema created successfully!',
      tables: [
        'users',
        'stores',
        'products',
        'categories',
        'orders',
        'coupons',
        'subscriptions'
      ]
    });
  } catch (error: any) {
    console.error('❌ Error setting up database schema:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
