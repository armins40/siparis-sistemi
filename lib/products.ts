// Product management with localStorage
import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { Product, Sector } from './types';
import { getStore } from './store';

const PRODUCTS_KEY = 'siparisProducts';
const PUBLISHED_KEY = 'siparisPublishedProducts';

function getProductsArray(): Product[] {
  const stored = safeGetItem(PRODUCTS_KEY);
  const parsed = safeParseJSON<Product[]>(stored, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveProductsArray(products: Product[]): boolean {
  const json = safeStringifyJSON(products);
  if (!json) return false;
  return safeSetItem(PRODUCTS_KEY, json);
}

function getPublishedIds(): string[] {
  const stored = safeGetItem(PUBLISHED_KEY);
  const parsed = safeParseJSON<string[]>(stored, []);
  return Array.isArray(parsed) ? parsed : [];
}

function savePublishedIds(ids: string[]): boolean {
  const json = safeStringifyJSON(ids);
  if (!json) return false;
  return safeSetItem(PUBLISHED_KEY, json);
}

export function getAllProducts(): Product[] {
  return getProductsArray();
}

export function getPublishedProducts(): Product[] {
  const products = getProductsArray();
  const publishedIds = getPublishedIds();
  return products.filter((p) => publishedIds.includes(p.id));
}

export function getProductById(id: string): Product | null {
  const products = getProductsArray();
  return products.find((p) => p.id === id) || null;
}

export function createProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getProductsArray();
  const newProduct: Product = {
    ...product,
    id: `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    // Ensure stock and unit are included
    stock: product.stock,
    unit: product.unit,
  };
  products.push(newProduct);
  saveProductsArray(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
  const products = getProductsArray();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  saveProductsArray(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = getProductsArray();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  
  products.splice(index, 1);
  saveProductsArray(products);
  
  // Also remove from published if exists
  const publishedIds = getPublishedIds();
  const publishedIndex = publishedIds.indexOf(id);
  if (publishedIndex !== -1) {
    publishedIds.splice(publishedIndex, 1);
    savePublishedIds(publishedIds);
  }
  
  return true;
}

export function toggleProductPublish(id: string): boolean {
  const product = getProductById(id);
  if (!product) return false;
  
  const publishedIds = getPublishedIds();
  const index = publishedIds.indexOf(id);
  
  if (index === -1) {
    // Publish
    publishedIds.push(id);
  } else {
    // Unpublish
    publishedIds.splice(index, 1);
  }
  
  savePublishedIds(publishedIds);
  updateProduct(id, { isPublished: !product.isPublished });
  return true;
}

export function getProductsByCategory(category: string, useAll: boolean = false): Product[] {
  const products = useAll ? getAllProducts() : getPublishedProducts();
  return products.filter((p) => p.category === category);
}

export function getCategories(useAll: boolean = false): string[] {
  const products = useAll ? getAllProducts() : getPublishedProducts();
  const categories = new Set<string>();
  products.forEach((p) => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories).sort();
}

// Sektör bazlı ürün filtreleme
export function getProductsBySector(sector: Sector): Product[] {
  const products = getProductsArray();
  return products.filter((p) => p.sector === sector);
}

// Kullanıcının sektörüne göre tüm ürünleri getir (admin eklediği + kullanıcının kendi ürünleri)
export function getProductsForUser(userSector?: Sector, userId?: string): Product[] {
  const products = getProductsArray();
  if (!userSector) return products;
  
  return products.filter((p) => {
    // Kullanıcının kendi ürünleri
    if (userId && p.userId === userId) return true;
    // Admin'in eklediği kullanıcının sektörüne ait ürünler (isPublished false olabilir)
    if (p.createdBy === 'admin' && p.sector === userSector) return true;
    return false;
  });
}

// Kullanıcının kendi eklediği ürünler
export function getUserProducts(userId: string): Product[] {
  const products = getProductsArray();
  return products.filter((p) => p.userId === userId);
}

// Admin'in eklediği sektör ürünleri
export function getAdminProductsBySector(sector: Sector): Product[] {
  const products = getProductsArray();
  return products.filter((p) => p.createdBy === 'admin' && p.sector === sector);
}

// Dashboard için: Kullanıcının görebileceği ürünler (kendi sektörüne ait admin ürünleri + kendi ürünleri)
export function getDashboardProducts(userSector?: Sector, userId?: string): Product[] {
  if (!userSector) return [];
  return getProductsForUser(userSector, userId);
}

// Menü sayfası için: Yayınlanmış ürünler (sadece kullanıcının sektörüne ait)
export function getPublishedProductsForSector(sector?: Sector): Product[] {
  const products = getProductsArray();
  const publishedIds = getPublishedIds();
  
  if (!sector) {
    return products.filter((p) => publishedIds.includes(p.id));
  }
  
  return products.filter((p) => 
    publishedIds.includes(p.id) && 
    (p.sector === sector || !p.sector) // Sektör belirtilmemiş ürünler de gösterilsin (eski ürünler için)
  );
}
