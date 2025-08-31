import { AuthError } from '@supabase/supabase-js'

export function isRefreshTokenError(error: any): boolean {
  if (!error) return false
  
  const message = error.message?.toLowerCase() || ''
  const code = error.status || error.code || ''
  
  return (
    message.includes('invalid refresh token') ||
    message.includes('refresh token not found') ||
    message.includes('jwt expired') ||
    message.includes('token expired') ||
    code === 401 ||
    code === 'PGRST301'
  )
}

export function isAuthError(error: any): error is AuthError {
  return error && typeof error === 'object' && 'message' in error
}

export function handleAuthError(error: any): { shouldRedirect: boolean; message: string } {
  if (isRefreshTokenError(error)) {
    return {
      shouldRedirect: true,
      message: 'Your session has expired. Please sign in again.'
    }
  }
  
  if (isAuthError(error)) {
    return {
      shouldRedirect: false,
      message: error.message || 'Authentication error occurred'
    }
  }
  
  return {
    shouldRedirect: false,
    message: 'An unexpected error occurred'
  }
}

export function clearAuthData(): void {
  // Clear any stored auth data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.removeItem('supabase.auth.token')
    
    // Clear any other potential auth-related storage
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('supabase.') || key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
    
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith('supabase.') || key.startsWith('sb-')) {
        sessionStorage.removeItem(key)
      }
    })
  }
}

export function getAuthErrorMessage(error: any): string {
  if (isRefreshTokenError(error)) {
    return 'Your session has expired. Please sign in again.'
  }
  
  if (isAuthError(error)) {
    return error.message || 'Authentication error occurred'
  }
  
  return 'An unexpected error occurred'
} 