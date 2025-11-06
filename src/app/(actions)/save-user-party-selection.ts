"use server"

import { createClient } from '@/lib/supabase-server'

/**
 * Saves the user's selected party for a contract
 */
export async function saveUserPartySelection(contractId: string, partyName: string) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized' }
    }

    const userId = session.user.id

    // Verify the contract belongs to the user
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, user_id')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (contractError || !contract) {
      return { success: false, error: 'Contract not found or unauthorized' }
    }

    // Update the contract with user's selected party
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        user_selected_party: partyName
      })
      .eq('id', contractId)
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error saving party selection:', updateError)
      return { success: false, error: 'Failed to save party selection' }
    }

    return { success: true }

  } catch (error) {
    console.error('Error saving party selection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save party selection'
    }
  }
}

