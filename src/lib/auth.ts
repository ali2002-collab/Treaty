// SERVER-ONLY FUNCTIONS - Do not import in client components
// Use auth-client.ts for client-side authentication functions

import { redirect } from 'next/navigation'
import { createClient } from './supabase-server'
import { isRefreshTokenError } from './auth-utils'

export type Session = {
  user: {
    id: string
    email: string
  }
}

export async function getSessionServer(): Promise<Session | null> {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      
      // Handle specific refresh token errors
      if (isRefreshTokenError(error)) {
        // Clear invalid session and return null
        try {
          await supabase.auth.signOut()
        } catch (signOutError) {
          console.error('Error signing out after token error:', signOutError)
        }
        return null
      }
      
      return null
    }
    
    if (!session) {
      return null
    }

    // Verify the user is still valid
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('Error getting user:', userError)
        return null
      }
      
      return {
        user: {
          id: user.id,
          email: user.email!,
        }
      }
    } catch (userError) {
      console.error('Error verifying user:', userError)
      return null
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function requireSessionServer(): Promise<Session> {
  const session = await getSessionServer()
  
  if (!session) {
    redirect('/signin')
  }
  
  return session
}

export async function signOutServer() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  } catch (error) {
    console.error('Error signing out:', error)
    // Even if sign out fails, redirect to home
    redirect('/')
  }
} 