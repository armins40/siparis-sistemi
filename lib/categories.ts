// Category management with localStorage
import { safeGetItem, safeSetItem, safeParseJSON, safeStringifyJSON } from './storage';
import type { Category } from './types';

const CATEGORIES_KEY = 'siparisCategories';

function getCategoriesArray(): Category[] {
  const stored = safeGetItem(CATEGORIES_KEY);
  const parsed = safeParseJSON<Category[]>(stored, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveCategoriesArray(categories: Category[]): boolean {
  const json = safeStringifyJSON(categories);
  if (!json) return false;
  return safeSetItem(CATEGORIES_KEY, json);
}

export function getAllCategories(): Category[] {
  return getCategoriesArray();
}

export function getCategoryById(id: string): Category | null {
  const categories = getCategoriesArray();
  return categories.find((c) => c.id === id) || null;
}

export function getCategoryByName(name: string): Category | null {
  const categories = getCategoriesArray();
  return categories.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
}

export function createCategory(name: string): Category | null {
  if (!name || name.trim().length === 0) {
    return null;
  }

  const categories = getCategoriesArray();
  
  // Check for duplicate
  if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return null; // Duplicate category
  }

  const newCategory: Category = {
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: name.trim(),
    order: categories.length,
  };

  categories.push(newCategory);
  saveCategoriesArray(categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
  const categories = getCategoriesArray();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  // Check for duplicate name (if name is being updated)
  if (updates.name && categories.some((c, i) => i !== index && c.name.toLowerCase() === updates.name!.toLowerCase())) {
    return null; // Duplicate category name
  }

  categories[index] = { ...categories[index], ...updates };
  saveCategoriesArray(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategoriesArray();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  categories.splice(index, 1);
  saveCategoriesArray(categories);
  return true;
}

export function reorderCategories(categoryIds: string[]): boolean {
  const categories = getCategoriesArray();
  const reordered: Category[] = [];
  
  categoryIds.forEach((id, index) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      reordered.push({ ...category, order: index });
    }
  });

  // Add any categories not in the reorder list
  categories.forEach((cat) => {
    if (!categoryIds.includes(cat.id)) {
      reordered.push(cat);
    }
  });

  saveCategoriesArray(reordered);
  return true;
}

// Toplu kategori ekleme fonksiyonu
export function addBulkCategories(categoryNames: string[]): { added: number; skipped: number } {
  const categories = getCategoriesArray();
  const existingNames = new Set(categories.map(c => c.name.toLowerCase()));
  let added = 0;
  let skipped = 0;
  
  categoryNames.forEach(name => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      skipped++;
      return;
    }
    
    if (existingNames.has(trimmedName.toLowerCase())) {
      skipped++;
      return;
    }
    
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: trimmedName,
      order: categories.length + added,
    };
    
    categories.push(newCategory);
    existingNames.add(trimmedName.toLowerCase());
    added++;
  });
  
  if (added > 0) {
    saveCategoriesArray(categories);
  }
  
  return { added, skipped };
}
