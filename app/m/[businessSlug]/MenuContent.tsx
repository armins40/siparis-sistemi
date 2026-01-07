'use client'

import React, { useRef, useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  products: Product[]
}

interface Product {
  id: number
  name: string
  price: number
  image: string | null
  stock: number
}

interface MenuContentProps {
  businessName: string
  logoUrl: string | null
  categories: Category[]
}

export default function MenuContent({ businessName, logoUrl, categories }: MenuContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories.length > 0 ? String(categories[0].id) : null
  )
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollToCategory = (categoryId: number) => {
    setActiveCategory(String(categoryId))
    const element = categoryRefs.current[String(categoryId)]
    if (element) {
      const headerOffset = 120
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  // Handle scroll to update active category
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (const category of categories) {
        const element = categoryRefs.current[String(category.id)]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveCategory(String(category.id))
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [categories])

  // Debug logging
  useEffect(() => {
    console.debug('[MenuContent] Categories received:', {
      categoriesCount: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productsCount: Array.isArray(cat.products) ? cat.products.length : 0,
        products: cat.products?.slice(0, 3).map(p => ({ id: p.id, name: p.name })) || []
      }))
    })
  }, [categories])

  if (categories.length === 0) {
    console.debug('[MenuContent] No categories - showing empty state')
    return (
      <div style={emptyStateStyle}>
        <h2 style={emptyTitleStyle}>Menu Not Available</h2>
        <p style={emptyTextStyle}>
          This restaurant's menu is currently not available. Please check back later.
        </p>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          {logoUrl && (
            <img src={logoUrl} alt={businessName} style={logoStyle} />
          )}
          <div style={headerTextStyle}>
            <h1 style={businessNameStyle}>{businessName}</h1>
          </div>
        </div>
      </header>

      {/* Horizontal Scrollable Category Bar */}
      <nav style={categoryNavStyle}>
        <div style={categoryNavContentStyle}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => scrollToCategory(category.id)}
            style={{
              ...categoryButtonStyle,
              ...(activeCategory === String(category.id) ? categoryButtonActiveStyle : {}),
            }}
          >
            {category.name}
          </button>
        ))}
        </div>
      </nav>

      {/* Menu Content */}
      <main style={mainStyle}>
        {categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => (categoryRefs.current[String(category.id)] = el)}
            style={categorySectionStyle}
          >
            <h2 style={categoryTitleStyle}>{category.name}</h2>
            <div style={productGridStyle}>
              {category.products.map((product) => (
                <div key={product.id} style={productCardStyle}>
                  <div style={productImageContainerStyle}>
                    <img
                      src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'}
                      alt={product.name}
                      style={productImageStyle}
                    />
                    {product.stock === 0 && (
                      <div style={outOfStockBadgeStyle}>Out of Stock</div>
                    )}
                  </div>
                  <div style={productInfoStyle}>
                    <h3 style={productNameStyle}>{product.name}</h3>
                    <p style={productPriceStyle}>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      }).format(product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

// Styles
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
}

const headerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '16px 20px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
}

const headerContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
}

const logoStyle: React.CSSProperties = {
  width: '60px',
  height: '60px',
  borderRadius: '8px',
  objectFit: 'cover',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  flexShrink: 0,
}

const headerTextStyle: React.CSSProperties = {
  flex: '1',
}

const businessNameStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0',
}

const categoryNavStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 0',
  position: 'sticky',
  top: '93px',
  zIndex: 90,
}

const categoryNavContentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
}

const categoryButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#666',
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
  flexShrink: 0,
}

const categoryButtonActiveStyle: React.CSSProperties = {
  color: '#3b82f6',
  backgroundColor: '#e0e7ff',
  borderColor: '#3b82f6',
}

const mainStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px 20px',
}

const categorySectionStyle: React.CSSProperties = {
  marginBottom: '48px',
}

const categoryTitleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 24px 0',
  paddingBottom: '12px',
  borderBottom: '2px solid #3b82f6',
}

const productGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: '16px',
}

const productCardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
}

const productImageContainerStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  paddingTop: '100%',
  backgroundColor: '#f9fafb',
  overflow: 'hidden',
}

const productImageStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const outOfStockBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: '600',
  color: '#ffffff',
  backgroundColor: '#dc2626',
  borderRadius: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const productInfoStyle: React.CSSProperties = {
  padding: '12px',
}

const productNameStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

const productPriceStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#3b82f6',
  margin: '0',
}

const emptyStateStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  textAlign: 'center',
}

const emptyTitleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 12px 0',
}

const emptyTextStyle: React.CSSProperties = {
  fontSize: '16px',
  color: '#666',
  margin: '0',
  maxWidth: '400px',
}

