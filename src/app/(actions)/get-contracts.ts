"use server"

import { createClient } from '@/lib/supabase-server'

export interface Contract {
  id: string
  filename: string
  mime: string
  detected_type?: string
  size: number
  created_at: string
  user_id: string
  project_id: string
  score?: number
  has_analysis?: boolean
}

export async function getContracts(): Promise<Contract[]> {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Get contracts with analysis data using left join
    // Only select columns that actually exist in the analyses table
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select(`
        *,
        analyses!left(
          score
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contracts:', error)
      throw new Error('Failed to fetch contracts')
    }

    // Transform the data to match our interface
    const transformedContracts: Contract[] = (contracts || []).map(contract => ({
      id: contract.id,
      filename: contract.filename,
      mime: contract.mime,
      detected_type: contract.detected_type || undefined, // Use contract's detected_type
      size: contract.size,
      created_at: contract.created_at,
      user_id: contract.user_id,
      project_id: contract.project_id,
      score: contract.analyses?.[0]?.score || undefined, // Get score from analysis if it exists
      has_analysis: !!(contract.analyses && contract.analyses.length > 0)
    }))

    return transformedContracts
  } catch (error) {
    console.error('Get contracts error:', error)
    return []
  }
} 