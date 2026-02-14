'use client'

import { useEffect, useState } from 'react'

type Product = {
  id: string
  name: string
  price: number
  category?: string
  image?: string
}

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('API error')
        const data = await res.json()

        console.log('API DATA:', data)

        if (Array.isArray(data)) {
          setProducts(data)
        } else if (Array.isArray(data.products)) {
          setProducts(data.products)
        } else {
          setProducts([])
        }
      } catch (e) {
        console.error(e)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <div>Yükleniyor...</div>
  if (error) return <div>Menü yüklenemedi</div>
  if (products.length === 0) return <div>Henüz ürün yok</div>

  const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
    const key = p.category || 'Diğer'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <div style={{ padding: 20 }}>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 30 }}>
          <h2>{cat}</h2>

          {items.map(p => (
            <div
              key={p.id}
              style={{
                border: '1px solid #ddd',
                padding: 10,
                marginBottom: 10
              }}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  width={120}
                  style={{ display: 'block' }}
                />
              )}
              <strong>{p.name}</strong>
              <div>{p.price} ₺</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
