// Simple auth utilities for localStorage (client-side only)

export interface SiparisUser {
  businessName: string
  email: string
  password: string
  isLoggedIn: boolean
}

const STORAGE_KEY = 'siparisUser'

export const auth = {
  // Get user from localStorage (must be called client-side)
  getUser: (): SiparisUser | null => {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(STORAGE_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as SiparisUser
    } catch {
      return null
    }
  },

  // Save user to localStorage (must be called client-side)
  saveUser: (user: SiparisUser): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  },

  // Check if user is authenticated (must be called client-side)
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    const user = auth.getUser()
    return user !== null && user.isLoggedIn === true
  },

  // Register user - saves with isLoggedIn = true (auto-login)
  register: (businessName: string, email: string, password: string): boolean => {
    if (typeof window === 'undefined') return false
    
    // Check if email already exists (prevent duplicate registration with same email)
    const existingUser = auth.getUser()
    if (existingUser && existingUser.email.toLowerCase() === email.toLowerCase()) {
      return false
    }

    // Save new user
    const newUser: SiparisUser = {
      businessName,
      email: email.toLowerCase(),
      password,
      isLoggedIn: true
    }
    
    auth.saveUser(newUser)
    return true
  },

  // Login user - validates email + password and sets isLoggedIn = true
  login: (email: string, password: string): boolean => {
    if (typeof window === 'undefined') return false
    
    const user = auth.getUser()
    
    if (!user) {
      return false
    }

    // Validate email and password
    if (
      user.email.toLowerCase() !== email.toLowerCase() ||
      user.password !== password
    ) {
      return false
    }

    // Set logged in
    const updatedUser: SiparisUser = {
      ...user,
      isLoggedIn: true
    }
    
    auth.saveUser(updatedUser)
    return true
  },

  // Logout user - sets isLoggedIn = false
  logout: (): void => {
    if (typeof window === 'undefined') return
    const user = auth.getUser()
    if (user) {
      const updatedUser: SiparisUser = {
        ...user,
        isLoggedIn: false
      }
      auth.saveUser(updatedUser)
    }
  },

  // Get user info without password (for display)
  getUserInfo: (): { businessName: string; email: string } | null => {
    if (typeof window === 'undefined') return null
    const user = auth.getUser()
    if (!user) return null
    return {
      businessName: user.businessName,
      email: user.email
    }
  }
}

// Export User type for backward compatibility with dashboard
export type User = {
  businessName: string
  email: string
}
