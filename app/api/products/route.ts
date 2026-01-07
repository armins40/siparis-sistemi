import { NextResponse } from 'next/server'

let products = global.products || []
global.products = products

export async function GET() {
  return NextResponse.json(products)
}

export async function POST(req: Request) {
  const body = await req.json()
  
  // If body is an array, replace all products (for delete operations)
  if (Array.isArray(body)) {
    products = body
    global.products = products
    return NextResponse.json({ success: true })
  }
  
  // Otherwise, add the product
  products.push(body)
  return NextResponse.json({ success: true })
}
