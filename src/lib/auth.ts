// SERVER-ONLY FUNCTIONS - Do not import in client components
// Use auth-client.ts for client-side authentication functions

import { redirect } from 'next/navigation'
import { createClient } from './supabase-server'

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
    
    if (error || !session) {
      return null
    }

    return {
      user: {
        id: session.user.id,
        email: session.user.email!,
      }
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
    redirect('/')
  }
} 