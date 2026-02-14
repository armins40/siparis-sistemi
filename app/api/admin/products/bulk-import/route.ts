import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/client';
import { requireAdminAuth } from '@/lib/admin-auth';
import type { Product, Sector } from '@/lib/types';

// Parse price from Turkish format
function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  let cleaned = priceStr.replace(/TL/g, '').replace(/\s/g, '').trim();
  if (!cleaned) return 0;
  
  const hasDot = cleaned.includes('.');
  const hasComma = cleaned.includes(',');
  
  if (hasDot && hasComma) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (hasDot) {
    const dotCount = (cleaned.match(/\./g) || []).length;
    if (dotCount === 1 && cleaned.split('.')[1].length <= 3) {
      cleaned = cleaned.replace(/\./g, '');
    }
  } else if (hasComma) {
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount === 1 && cleaned.split(',')[1].length <= 3) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const price = parseFloat(cleaned);
  return isNaN(price) ? 0 : price;
}

// Detect category from product name
function detectCategory(productName: string): string {
  const name = productName.toLowerCase();
  
  if (name.includes('efes') || name.includes('tuborg') || name.includes('bira')) {
    return 'Biralar';
  }
  if (name.includes('johnnie walker') || name.includes('chivas') || name.includes('jameson') || 
      name.includes('ballantine') || name.includes('glenlivet') || name.includes('aberlour') ||
      name.includes('viski') || name.includes('whisky') || name.includes('wisers') ||
      name.includes('pike creek') || name.includes('scapa') || name.includes('singleton') ||
      name.includes('cardhu') || name.includes('mortlach') || name.includes('clynelish') ||
      name.includes('caol ila') || name.includes('glenkinchie') || name.includes('talisker') ||
      name.includes('lagavulin') || name.includes('royal salute') || name.includes('aberfeldy') ||
      name.includes('royal brackla') || name.includes('craigellachie') || name.includes('teeling') ||
      name.includes('dewar')) {
    return 'Viskiler';
  }
  if (name.includes('gordon') || name.includes('gilbey') || name.includes('tanqueray') ||
      name.includes('beefeater') || name.includes('malfy') || name.includes('monkey') ||
      name.includes('cork dry gin') || name.includes('bombay') || name.includes('oxley') ||
      name.includes('cin') || name.includes('gin')) {
    return 'Cinler';
  }
  if (name.includes('don julio') || name.includes('casamigos') || name.includes('olmeca') ||
      name.includes('codigo') || name.includes('patron') || name.includes('tequila') ||
      name.includes('tekila')) {
    return 'Tekilalar';
  }
  if (name.includes('absolut') || name.includes('wyborowa') || name.includes('grey goose') ||
      name.includes('smirnoff') || name.includes('istanblue') || name.includes('bazooka') ||
      name.includes('ketel one') || name.includes('ciroc') || name.includes('votka')) {
    return 'Votkalar';
  }
  if (name.includes('havana club') || name.includes('bumbu') || name.includes('santa teresa') ||
      name.includes('bacardi') || name.includes('rom')) {
    return 'Romlar';
  }
  if (name.includes('kahlua') || name.includes('malibu') || name.includes('st germain') ||
      name.includes('likör') || name.includes('liqueur')) {
    return 'Likörler';
  }
  if (name.includes('mumm') || name.includes('luc belaire') || name.includes('cafe de paris') ||
      name.includes('garonne prosecco') || name.includes('martini prosecco') ||
      name.includes('martini asti') || name.includes('martini brut') ||
      name.includes('şampanya') || name.includes('köpüklü şarap')) {
    return 'Şaraplar';
  }
  if (name.includes('martell') || name.includes('konyak') || name.includes('brendi') ||
      name.includes('cognac') || name.includes('brandy')) {
    return 'Konyak & Brendi';
  }
  if (name.includes('sarı zeybek') || name.includes('efe') || name.includes('rakı')) {
    return 'Rakılar';
  }
  if (name.includes('del maguey') || name.includes('ojo de tigre') || name.includes('mezcal')) {
    return 'Mezcal';
  }
  if (name.includes('martini fiero') || name.includes('martini extra dry') ||
      name.includes('martini rosso') || name.includes('vermut')) {
    return 'Vermut';
  }
  if (name.includes('düziko') || name.includes('özem')) {
    return 'Düziko';
  }
  if (name.includes('parliament') || name.includes('marlboro') || name.includes('kent') ||
      name.includes('winston') || name.includes('camel') || name.includes('davidoff') ||
      name.includes('muratti') || name.includes('l&m') || name.includes('chesterfield') ||
      name.includes('lark') || name.includes('rothmans') || name.includes('viceroy') ||
      name.includes('pall mall') || name.includes('tekel 2000') || name.includes('tekel 2001') ||
      name.includes('west') || name.includes('monte carlo') || name === 'ld' || name.includes(' ld ') || name.startsWith('ld ') ||
      name.includes('medley') || name.includes('mmc') || name.includes('hazar') ||
      name.includes('toros') || name.includes('captain black') || name.includes('sigara')) {
    return 'Sigara';
  }
  return 'Genel';
}

// Parse products from text
function parseBulkProducts(text: string): Array<{ name: string; category: string; price: number; unit?: string }> {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const products: Array<{ name: string; category: string; price: number; unit?: string }> = [];
  const seen = new Set<string>();
  
  for (const line of lines) {
    if (!line || line.startsWith('*') || line.match(/^[A-ZÇĞİÖŞÜ\s&]+$/)) {
      continue;
    }
    
    let cleaned = line.replace(/^\*\s*/, '').trim();
    let category = '';
    let name = '';
    let price = 0;
    let unit = 'adet';
    
    // Format 1: "Kategori: Ürün Adı - Fiyat"
    if (cleaned.includes(':') && cleaned.includes('-')) {
      const colonIndex = cleaned.indexOf(':');
      category = cleaned.substring(0, colonIndex).trim();
      const rest = cleaned.substring(colonIndex + 1).trim();
      const dashParts = rest.split('-').map(p => p.trim());
      name = dashParts[0] || '';
      const priceStr = dashParts[1] || '';
      price = parsePrice(priceStr);
    }
    // Format 2: "Ürün Adı: Fiyat TL" or "Ürün Adı fiyatı: Fiyat TL"
    else if (cleaned.includes(':') || cleaned.match(/fiyatı?\s*:/i)) {
      const priceMatch = cleaned.match(/(?:fiyatı|fiyat)?:\s*([\d.,\s]+)\s*TL/i);
      if (priceMatch) {
        price = parsePrice(priceMatch[1]);
        name = cleaned.substring(0, priceMatch.index).replace(/fiyatı?\s*$/i, '').trim();
        category = detectCategory(name);
      } else {
        const parts = cleaned.split(':').map(p => p.trim());
        if (parts.length >= 2) {
          name = parts[0];
          price = parsePrice(parts[1]);
          category = detectCategory(name);
        }
      }
    }
    // Format 3: "Ürün Adı - Fiyat"
    else if (cleaned.includes('-')) {
      const parts = cleaned.split('-').map(p => p.trim());
      if (parts.length >= 2) {
        name = parts[0];
        price = parsePrice(parts[1]);
        category = detectCategory(name);
      }
    }
    
    if (!name || price <= 0) {
      continue;
    }
    
    if (!category) {
      category = 'Genel';
    }
    
    const key = `${name.toLowerCase()}-${price}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    
    products.push({ name: name.trim(), category, price, unit });
  }
  
  return products;
}

// POST: Bulk import products
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { productsText, sector } = body;

    if (!productsText || !sector || sector === 'all' || sector === '') {
      return NextResponse.json(
        { success: false, error: 'Products text and sector are required' },
        { status: 400 }
      );
    }

    // Parse products
    const productsToAdd = parseBulkProducts(productsText);
    
    if (productsToAdd.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid products found' },
        { status: 400 }
      );
    }

    // Check existing products
    const existingResult = await sql`
      SELECT name, price FROM products 
      WHERE created_by = 'admin'
    `;
    const existingKeys = new Set(
      existingResult.rows.map((r: any) => `${r.name.toLowerCase()}-${r.price}`)
    );

    let successCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    // Insert products
    for (const productData of productsToAdd) {
      const key = `${productData.name.toLowerCase()}-${productData.price}`;
      
      if (existingKeys.has(key)) {
        duplicateCount++;
        continue;
      }

      try {
        const productId = `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        await sql`
          INSERT INTO products (
            id, name, price, category, unit,
            is_published, sector, created_by, created_at
          ) VALUES (
            ${productId},
            ${productData.name},
            ${productData.price},
            ${productData.category},
            ${productData.unit || 'adet'},
            false,
            ${sector === 'all' ? 'all' : sector},
            'admin',
            NOW()
          )
        `;
        
        successCount++;
        existingKeys.add(key);
      } catch (error: any) {
        errors.push(`${productData.name}: ${error?.message || 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      added: successCount,
      duplicates: duplicateCount,
      errors: errors.length > 0 ? errors.slice(0, 10) : [],
    });
  } catch (error: any) {
    console.error('Error bulk importing products:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAdminAuth(request, handlePost);
}
