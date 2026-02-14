// Password hashing and verification utilities
// Dynamic import for bcryptjs to avoid Next.js build issues

const SALT_ROUNDS = 12; // Production için yeterli güvenlik seviyesi

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }
  
  // Dynamic import for Next.js compatibility
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  
  try {
    // Dynamic import for Next.js compatibility
    const bcrypt = await import('bcryptjs');
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

/**
 * Check if a password hash is valid (starts with $2a$, $2b$, or $2y$)
 */
export function isValidHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  
  // bcrypt hashes start with $2a$, $2b$, or $2y$
  return hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$');
}
