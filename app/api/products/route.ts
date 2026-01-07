import { NextResponse } from 'next/server'

// Type-safe global products storage
declare global {
  // eslint-disable-next-line no-var
  var products: any[]
}

let products: any[] = (global as any).products || []
;(global as any).products = products

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // If body is an array, replace all products (for delete operations)
    if (Array.isArray(body)) {
      products = body
      ;(global as any).products = products
      return NextResponse.json({ success: true, message: 'Products replaced' })
    }
    
    // Otherwise, add the product
    if (body && typeof body === 'object') {
      products.push(body)
      ;(global as any).products = products
      return NextResponse.json({ success: true, product: body })
    }
    
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch (error) {
    console.error('[API] Error in POST /api/products:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
}
