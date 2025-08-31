import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isRefreshTokenError, getAuthErrorMessage } from '@/lib/auth-utils'
import { signOutClient } from '@/lib/auth-client'
import { logger } from '@/lib/logger'

export function useAuthError() {
  const router = useRouter()

  const handleAuthError = useCallback((error: any, options?: {
    showToast?: boolean
    redirectToSignin?: boolean
  }) => {
    const { showToast = true, redirectToSignin = true } = options || {}
    
    logger.error('Auth error handled:', error)
    
    if (isRefreshTokenError(error)) {
      // For refresh token errors, always sign out and redirect
      if (showToast) {
        // You can integrate with your toast system here
        logger.info('Session expired. Redirecting to sign in...')
      }
      
      // Sign out and redirect
      signOutClient()
      return
    }
    
    // For other auth errors
    const message = getAuthErrorMessage(error)
    
    if (showToast) {
      // You can integrate with your toast system here
      logger.info('Auth error:', message)
    }
    
    if (redirectToSignin) {
      router.push('/signin')
    }
  }, [router])

  return { handleAuthError }
} 