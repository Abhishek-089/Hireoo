// Chrome extension authentication utilities
export interface AuthUser {
  id: string
  email: string
  name?: string
  jwt: string
}

export class ExtensionAuth {
  private static readonly STORAGE_KEY = 'hireoo_auth'
  // Base URL for the Hireoo web app API
  private static readonly API_BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

  // Store authentication data
  static async setAuthData(user: AuthUser): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: {
          ...user,
          lastLogin: Date.now(),
        },
      })
    } catch (error) {
      console.error('Failed to store auth data:', error)
      throw new Error('Failed to save authentication data')
    }
  }

  // Get authentication data
  static async getAuthData(): Promise<AuthUser | null> {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY])
      const authData = result[this.STORAGE_KEY]

      if (!authData) return null

      // Check if JWT is still valid (basic check)
      const isExpired = this.isTokenExpired(authData.lastLogin)
      if (isExpired) {
        await this.clearAuthData()
        return null
      }

      return {
        id: authData.id,
        email: authData.email,
        name: authData.name,
        jwt: authData.jwt,
      }
    } catch (error) {
      console.error('Failed to get auth data:', error)
      return null
    }
  }

  // Clear authentication data
  static async clearAuthData(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.STORAGE_KEY])
    } catch (error) {
      console.error('Failed to clear auth data:', error)
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const authData = await this.getAuthData()
    return authData !== null
  }

  // Get JWT token
  static async getToken(): Promise<string | null> {
    const authData = await this.getAuthData()
    return authData?.jwt || null
  }

  // Login with JWT from website
  static async loginWithJWT(jwt: string): Promise<AuthUser> {
    try {
      // Decode JWT to get user info (basic implementation)
      const payload = this.decodeJWT(jwt)

      if (!payload || !payload.id || !payload.email) {
        throw new Error('Invalid JWT token')
      }

      const user: AuthUser = {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        jwt,
      }

      await this.setAuthData(user)
      return user
    } catch (error) {
      console.error('Login failed:', error)
      throw new Error('Authentication failed')
    }
  }

  // Basic JWT decode (without verification)
  private static decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode JWT:', error)
      return null
    }
  }

  // Check if token is expired (24 hours from last login)
  private static isTokenExpired(lastLogin: number): boolean {
    const TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    return Date.now() - lastLogin > TOKEN_EXPIRY
  }

  // Make authenticated API request
  static async authenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    }

    const fullUrl = url.startsWith('http')
      ? url
      : `${this.API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`

    return fetch(fullUrl, {
      ...options,
      headers,
    })
  }
}


