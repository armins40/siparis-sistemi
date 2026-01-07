'use client'

import React, { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  image?: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load products from API on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/products')
        
        if (!response.ok) {
          throw new Error('Failed to load products')
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          setProducts(data)
        }
      } catch (error) {
        console.error('Error loading products:', error)
        alert('Ürünler yüklenirken bir hata oluştu.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = formData.name.trim()
    const price = parseFloat(formData.price)
    const category = formData.category.trim()

    if (!name || !category || isNaN(price) || price <= 0) {
      alert('Lütfen tüm alanları doldurun ve geçerli bir fiyat girin.')
      return
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name,
      price,
      category,
      image: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`
    }

    try {
      setIsSaving(true)
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        throw new Error('Failed to save product')
      }

      // Reload products from API
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const data = await productsResponse.json()
        if (data && Array.isArray(data)) {
          setProducts(data)
        }
      }

      // Reset form
      setFormData({
        name: '',
        price: '',
        category: ''
      })
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Ürün kaydedilirken bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      setIsSaving(true)
      // For delete, we'll filter the products array
      const currentProductsResponse = await fetch('/api/products')
      if (!currentProductsResponse.ok) {
        throw new Error('Failed to load products')
      }
      
      const currentData = await currentProductsResponse.json()
      const updatedProducts = Array.isArray(currentData) 
        ? currentData.filter((p: any) => p.id !== id)
        : []
      
      // Replace all products
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProducts),
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Reload products from API
      const productsResponse = await fetch('/api/products')
      if (productsResponse.ok) {
        const data = await productsResponse.json()
        if (data && Array.isArray(data)) {
          setProducts(data)
        }
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ürün silinirken bir hata oluştu.')
    } finally {
      setIsSaving(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    margin: '0'
  }

  const formCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  }

  const formTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 20px 0'
  }

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '20px'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer'
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }

  const productsCardStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  }

  const productsTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 20px 0'
  }

  const productsListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }

  const productCardStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px'
  }

  const productInfoStyle: React.CSSProperties = {
    flex: '1'
  }

  const productNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
  }

  const productMetaStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  }

  const deleteButtonStyle: React.CSSProperties = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  }

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666'
  }

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Panel</h1>
        <p style={subtitleStyle}>Ürün Yönetimi</p>
      </div>

      {/* Product Form */}
      <div style={formCardStyle}>
        <h2 style={formTitleStyle}>Yeni Ürün Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label htmlFor="name" style={labelStyle}>
              Ürün Adı *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Örn: Hamburger"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="price" style={labelStyle}>
              Fiyat (₺) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder="Örn: 45.00"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="category" style={labelStyle}>
              Kategori *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={selectStyle}
            >
              <option value="">Kategori Seçin</option>
              <option value="İçecekler">İçecekler</option>
              <option value="Yiyecekler">Yiyecekler</option>
              <option value="Tatlılar">Tatlılar</option>
              <option value="Atıştırmalıklar">Atıştırmalıklar</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>

          <button type="submit" disabled={isSaving} style={{
            ...buttonStyle,
            opacity: isSaving ? 0.6 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer'
          }}>
            {isSaving ? 'Kaydediliyor...' : 'Ürün Ekle'}
          </button>
        </form>
      </div>

      {/* Products List */}
      <div style={productsCardStyle}>
        <h2 style={productsTitleStyle}>
          Ürünler ({products.length})
        </h2>
        
        {products.length === 0 ? (
          <div style={emptyStateStyle}>
            <p>Henüz ürün eklenmemiş.</p>
          </div>
        ) : (
          <div style={productsListStyle}>
            {products.map((product) => (
              <div key={product.id} style={productCardStyle}>
                <div style={productInfoStyle}>
                  <div style={productNameStyle}>{product.name}</div>
                  <div style={productMetaStyle}>
                    {product.category} • {product.price.toFixed(2)} ₺
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  style={deleteButtonStyle}
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

