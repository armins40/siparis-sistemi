// Utility functions

/**
 * Generate a URL-friendly slug from business name
 * - Converts to lowercase
 * - Removes Turkish characters
 * - Replaces spaces with hyphens
 * - Removes special characters
 */
export function generateSlug(businessName: string): string {
  if (!businessName) return 'shop'

  // Turkish character replacements
  const turkishChars: Record<string, string> = {
    'ş': 's', 'Ş': 'S', 'ı': 'i', 'İ': 'I',
    'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
  }

  let slug = businessName

  // Replace Turkish characters
  Object.keys(turkishChars).forEach(char => {
    slug = slug.replace(new RegExp(char, 'g'), turkishChars[char])
  })

  // Convert to lowercase
  slug = slug.toLowerCase()

  // Replace spaces and special chars with hyphens
  slug = slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Ensure it's not empty
  if (!slug) slug = 'shop'

  return slug
}

