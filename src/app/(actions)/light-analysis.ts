"use server"

import { createClient } from '@/lib/supabase-server'
import { performComprehensiveLightAnalysis } from './comprehensive-light-analysis'

/**
 * Performs light analysis: detects contract type and parties
 * This is done immediately after upload, before full analysis
 * Uses comprehensive single AI call for better accuracy
 */
export async function performLightAnalysis(contractId: string) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Use comprehensive analysis that detects both type and parties in one call
    // This ensures consistency and better accuracy
    const result = await performComprehensiveLightAnalysis(contractId)
    
    if (!result.success) {
      return result
    }

    // Return in the expected format
    // Note: Parties are already stored in analyses.parties by comprehensive-light-analysis
    return {
      success: true,
      contractType: result.contractType,
      contractTypeConfidence: result.contractTypeConfidence,
      contractTypeReasoning: result.contractTypeReasoning,
      parties: result.parties || [],
      typeDetectionError: null,
      partiesDetectionError: null
    }

  } catch (error) {
    console.error('Error performing light analysis:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform light analysis'
    }
  }
}

