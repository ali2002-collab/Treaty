"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'
import { refreshSession, getCurrentUser } from '@/lib/auth-client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshAuth = async () => {
    try {
      setLoading(true)
      const newSession = await refreshSession()
      
      if (newSession) {
        setSession(newSession)
        setUser(newSession.user)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setSession(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setSession(session)
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session) {
          setSession(session)
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setSession(session)
          setUser(session.user)
        } else if (event === 'USER_UPDATED' && session) {
          setSession(session)
          setUser(session.user)
        }
        
        setLoading(false)
      }
    )

    // Set up periodic token refresh check
    const refreshInterval = setInterval(async () => {
      if (session) {
        try {
          const currentUser = await getCurrentUser()
          if (!currentUser) {
            // Token is invalid, refresh auth
            await refreshAuth()
          }
        } catch (error) {
          console.error('Periodic auth check failed:', error)
          await refreshAuth()
        }
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [session])

  const value = {
    user,
    session,
    loading,
    refreshAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 