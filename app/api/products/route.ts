import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const productsFilePath = path.join(process.cwd(), 'data', 'products.json')

async function readProducts(): Promise<any[]> {
  try {
    const fileContents = await fs.readFile(productsFilePath, 'utf8')
    const parsed = JSON.parse(fileContents)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return []
  }
}

async function writeProducts(products: any[]): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(productsFilePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Write products array to file
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8')
  } catch (error) {
    console.error('Error writing products:', error)
    throw error
  }
}

export async function GET() {
  try {
    const products = await readProducts()
    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('Error reading products:', error)
    return NextResponse.json(
      { error: 'Failed to read products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, product, productId } = body

    const products = await readProducts()

    if (action === 'add' && product) {
      // Add new product
      const newProduct = {
        ...product,
        id: product.id || Date.now().toString(),
      }
      products.push(newProduct)
      await writeProducts(products)
      return NextResponse.json(
        { success: true, product: newProduct },
        { status: 201 }
      )
    } else if (action === 'update' && product) {
      // Update existing product
      const index = products.findIndex((p: any) => p.id === product.id)
      if (index === -1) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      products[index] = product
      await writeProducts(products)
      return NextResponse.json(
        { success: true, product },
        { status: 200 }
      )
    } else if (action === 'delete' && productId) {
      // Delete product
      const filteredProducts = products.filter((p: any) => p.id !== productId)
      await writeProducts(filteredProducts)
      return NextResponse.json(
        { success: true },
        { status: 200 }
      )
    } else if (action === 'replace' && Array.isArray(body.products)) {
      // Replace all products (for bulk operations)
      await writeProducts(body.products)
      return NextResponse.json(
        { success: true },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing products:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

