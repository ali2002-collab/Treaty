"use client"

import { createClient } from './supabase-browser'

export async function signOutClient() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  } catch (error) {
    console.error('Error signing out:', error)
    window.location.href = '/'
  }
} 