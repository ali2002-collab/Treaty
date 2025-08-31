"use client"

import { createClient } from './supabase-browser'
import { isRefreshTokenError, clearAuthData, getAuthErrorMessage } from './auth-utils'
import { logger } from './logger'

export async function signOutClient() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (error) {
    logger.error('Error signing out:', error)
  } finally {
    // Always clear local auth data and redirect
    clearAuthData()
    window.location.href = '/'
  }
}

export async function refreshSession() {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      logger.error('Error refreshing session:', error)
      
      // Handle refresh token errors
      if (isRefreshTokenError(error)) {
        // Clear invalid session and redirect to signin
        await signOutClient()
        return null
      }
      
      throw error
    }
    
    return session
  } catch (error) {
    logger.error('Session refresh failed:', error)
    // If refresh fails, sign out and redirect
    await signOutClient()
    return null
  }
}

export async function getCurrentUser() {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.error('Error getting current user:', error)
      
      // Handle refresh token errors
      if (isRefreshTokenError(error)) {
        // Clear invalid session and redirect to signin
        await signOutClient()
        return null
      }
      
      return null
    }
    
    return user
  } catch (error) {
    logger.error('Get current user failed:', error)
    return null
  }
}

export function handleAuthError(error: any): void {
  const message = getAuthErrorMessage(error)
  
  if (isRefreshTokenError(error)) {
    // For refresh token errors, sign out and redirect
    signOutClient()
  } else {
    // For other auth errors, just log them
    logger.error('Auth error:', error)
  }
} 