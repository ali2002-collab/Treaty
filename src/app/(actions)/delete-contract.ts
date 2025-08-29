"use server"

import { createClient } from '@/lib/supabase-server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function deleteContract(contractId: string) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Get contract details first
    const { data: contract, error: fetchError } = await supabase
      .from('contracts')
      .select('storage_path, user_id')
      .eq('id', contractId)
      .single()

    if (fetchError || !contract) {
      throw new Error('Contract not found')
    }

    // Verify ownership
    if (contract.user_id !== userId) {
      throw new Error('Unauthorized to delete this contract')
    }

    // Create service role client for admin operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete from storage
    if (contract.storage_path) {
      const { error: storageError } = await serviceClient.storage
        .from('contracts')
        .remove([contract.storage_path])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete extraction record
    await supabase
      .from('extractions')
      .delete()
      .eq('contract_id', contractId)

    // Delete contract record
    const { error: deleteError } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId)

    if (deleteError) {
      throw new Error('Failed to delete contract from database')
    }

    return { success: true }
  } catch (error) {
    console.error('Delete contract error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
} 