import { NextRequest, NextResponse } from 'next/server'

// Database types (replace with your actual database schema)
interface CategoryRow {
  id: number
  name: string
  is_active: boolean
  order: number
  business_slug: string
}

interface ProductRow {
  id: number
  name: string
  price: number
  image: string | null
  stock: number
  is_active: boolean
  category_id: number
  business_slug: string
}

// API Response types
interface ProductResponse {
  id: number
  name: string
  price: number
  image: string | null
  stock: number
}

interface CategoryResponse {
  id: number
  name: string
  products: ProductResponse[]
}

interface MenuResponse {
  categories: CategoryResponse[]
}

// Database functions - replace with actual database queries
// IMPORTANT: Filter by is_active in the SQL query for better performance
async function fetchCategories(businessSlug: string): Promise<CategoryRow[]> {
  // TODO: Replace with actual database query
  // Example SQL:
  // SELECT id, name, is_active, `order`, business_slug
  // FROM categories
  // WHERE business_slug = ? AND is_active = true
  // ORDER BY `order` ASC
  // 
  // Example with Prisma:
  // return await prisma.category.findMany({
  //   where: { business_slug: businessSlug, is_active: true },
  //   orderBy: { order: 'asc' }
  // })
  return []
}

async function fetchProducts(businessSlug: string): Promise<ProductRow[]> {
  // TODO: Replace with actual database query
  // Example SQL:
  // SELECT id, name, price, image, stock, is_active, category_id, business_slug
  // FROM products
  // WHERE business_slug = ? AND is_active = true
  // ORDER BY name ASC
  //
  // Example with Prisma:
  // return await prisma.product.findMany({
  //   where: { business_slug: businessSlug, is_active: true },
  //   orderBy: { name: 'asc' }
  // })
  return []
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessSlug: string }> }
) {
  try {
    const { businessSlug } = await params

    if (!businessSlug) {
      return NextResponse.json(
        { error: 'Business slug is required' },
        { status: 400 }
      )
    }

    // Fetch active categories (should be pre-filtered and sorted by DB query)
    const allCategories = await fetchCategories(businessSlug)
    // Double-check filter (remove if DB query guarantees is_active = true)
    const activeCategories = allCategories
      .filter(cat => cat.is_active === true)
      .sort((a, b) => a.order - b.order)

    // Fetch active products (should be pre-filtered and sorted by DB query)
    const allProducts = await fetchProducts(businessSlug)
    // Double-check filter (remove if DB query guarantees is_active = true)
    const activeProducts = allProducts
      .filter(prod => prod.is_active === true)
      .sort((a, b) => a.name.localeCompare(b.name))

    // Group products by category and filter out categories with no products
    const categoriesWithProducts: CategoryResponse[] = activeCategories
      .map(category => {
        const categoryProducts = activeProducts
          .filter(product => product.category_id === category.id)
          .map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            stock: product.stock,
          }))

        return {
          id: category.id,
          name: category.name,
          products: categoryProducts,
        }
      })
      .filter(category => category.products.length > 0)

    const response: MenuResponse = {
      categories: categoriesWithProducts,
    }

    console.debug('[API] Menu response prepared:', {
      businessSlug,
      categoriesCount: categoriesWithProducts.length,
      totalProducts: categoriesWithProducts.reduce((sum, cat) => sum + cat.products.length, 0),
      categories: categoriesWithProducts.map(cat => ({
        id: cat.id,
        name: cat.name,
        productsCount: cat.products.length
      }))
    })

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching menu data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

