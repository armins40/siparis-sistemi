import { NextResponse } from 'next/server'

// In-memory products storage (server-side only)
let products: Array<{
  id: string | number
  name: string
  price: number
  category: string
  image?: string
}> = []

// Initialize with sample products if empty
if (products.length === 0) {
  products = [
    {
      id: '1',
      name: 'Örnek Ürün 1',
      price: 25.00,
      category: 'İçecekler',
      image: 'https://via.placeholder.com/150?text=Urun+1'
    },
    {
      id: '2',
      name: 'Örnek Ürün 2',
      price: 35.50,
      category: 'Yiyecekler',
      image: 'https://via.placeholder.com/150?text=Urun+2'
    }
  ]
}

export async function GET() {
  try {
    return NextResponse.json(products)
  } catch (error) {
    // Fallback: return empty array if JSON serialization fails
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // If body is an array, replace all products
    if (Array.isArray(body)) {
      products = body
      return NextResponse.json({ success: true, message: 'Products replaced', count: products.length })
    }
    
    // Otherwise, add the product
    if (body && typeof body === 'object') {
      const newProduct = {
        id: body.id || Date.now().toString(),
        name: body.name || 'Unnamed Product',
        price: typeof body.price === 'number' ? body.price : 0,
        category: body.category || 'Diğer',
        image: body.image || `https://via.placeholder.com/150?text=${encodeURIComponent(body.name || 'Product')}`
      }
      products.push(newProduct)
      return NextResponse.json({ success: true, product: newProduct })
    }
    
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch (error) {
    console.error('[API] Error in POST /api/products:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}
