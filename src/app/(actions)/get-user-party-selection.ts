"use server"

import { createClient } from '@/lib/supabase-server'

/**
 * Gets the user's selected party for a contract
 */
export async function getUserPartySelection(contractId: string) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    // Get the user's party selection from contracts table
    const { data: contract, error: selectError } = await supabase
      .from('contracts')
      .select('user_selected_party')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (selectError) {
      if (selectError.code === 'PGRST116') {
        // No contract found
        return { success: true, partyName: null }
      }
      return { success: false, error: 'Failed to get party selection' }
    }

    return {
      success: true,
      partyName: contract?.user_selected_party || null
    }

  } catch (error) {
    console.error('Error getting party selection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get party selection'
    }
  }
}

