import { NextResponse } from 'next/server'

let products = global.products || []
global.products = products

export async function GET() {
  return NextResponse.json(products) // ❗ SADECE ARRAY
}

export async function POST(req: Request) {
  const body = await req.json()
  products.push(body)
  return NextResponse.json({ success: true })
}
