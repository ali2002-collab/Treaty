"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'

/**
 * Detects parties from a contract using AI
 */
export async function detectContractParties(contractId: string) {
  try {
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the extracted text from the contract
    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .select('text')
      .eq('contract_id', contractId)
      .single()

    if (extractionError || !extraction) {
      return { success: false, error: 'Contract text not found' }
    }

    // Use Gemini AI to detect parties
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return { success: false, error: 'Google API key not configured' }
    }
    
    const genAI = new GoogleGenAI({ apiKey })
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const contractText = extraction.text.substring(0, 20000) // Increased to 20k chars

    const prompt = `You are an expert contract analyst. Analyze the contract text below and identify ALL parties involved.

CRITICAL: You MUST return a valid JSON array. Do not include any markdown, explanations, or text outside the JSON.

INSTRUCTIONS:
1. Look for party names in the contract (usually at the beginning after "This Agreement is between..." or "Party A" and "Party B")
2. Identify the role of each party (Employer, Employee, Client, Vendor, Service Provider, Licensor, Licensee, Buyer, Seller, etc.)
3. Extract the full legal name or company name of each party
4. Provide a brief description of each party's role

Return ONLY this JSON array structure (no other text):
[
  {
    "name": "Full Party Name or Company Name",
    "role": "Employer",
    "description": "Brief description of this party's role"
  },
  {
    "name": "Full Party Name or Company Name",
    "role": "Employee",
    "description": "Brief description of this party's role"
  }
]

If you find parties, return them. If no parties are clearly identified, return an empty array: []

Contract text:
${contractText}

Return ONLY the JSON array, nothing else.`

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt
    })
    const text = result.text

    // Parse the JSON response
    let parties: Array<{ name: string; role: string; description: string }> = []
    
    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/```json\n?/g, '')
      cleanedText = cleanedText.replace(/```\n?/g, '')
      cleanedText = cleanedText.trim()
      
      // Try to extract JSON array if it's wrapped in text
      const arrayMatch = cleanedText.match(/\[[\s\S]*\]/)
      if (arrayMatch) {
        cleanedText = arrayMatch[0]
      }
      
      parties = JSON.parse(cleanedText)
      
      // Validate the structure
      if (!Array.isArray(parties)) {
        throw new Error('Invalid response format - not an array')
      }
      
      // Validate each party has required fields
      parties = parties.filter((party: any) => {
        return party && typeof party.name === 'string' && party.name.trim().length > 0
      }).map((party: any) => ({
        name: party.name.trim(),
        role: party.role || 'Party',
        description: party.description || `Party in the contract`
      }))
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', text)
      
      // Fallback: Try to extract parties using pattern matching
      parties = extractPartiesFallback(extraction.text)
      
      // If fallback also fails, try one more time with a simpler extraction
      if (parties.length === 0) {
        console.log('Attempting enhanced fallback party extraction')
        parties = extractPartiesFallbackEnhanced(extraction.text)
      }
    }

    // Store detected parties - they will be included in analyses.parties when analysis is created
    // For now, we just return them and they'll be stored during the analysis step
    // This keeps everything linked through the existing tables structure

    return {
      success: true,
      parties: parties
    }

  } catch (error) {
    console.error('Error detecting parties:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detect parties'
    }
  }
}

/**
 * Fallback method to extract parties using pattern matching
 */
function extractPartiesFallback(text: string): Array<{ name: string; role: string; description: string }> {
  const parties: Array<{ name: string; role: string; description: string }> = []
  
  // Common patterns for party identification
  const partyPatterns = [
    /(?:between|by and between)\s+([A-Z][A-Za-z\s&,\.]+?)(?:\s+and\s+)([A-Z][A-Za-z\s&,\.]+?)(?:\s|,|\.|$)/gi,
    /(?:party|parties)\s+(?:A|1|One)[\s:]+([A-Z][A-Za-z\s&,\.]+?)(?:\s|,|\.|$)/gi,
    /(?:party|parties)\s+(?:B|2|Two)[\s:]+([A-Z][A-Za-z\s&,\.]+?)(?:\s|,|\.|$)/gi,
    /(?:this\s+)?(?:agreement|contract)\s+(?:is\s+)?(?:between|by and between)\s+([A-Z][A-Za-z\s&,\.]+?)(?:\s+and\s+)([A-Z][A-Za-z\s&,\.]+?)/gi,
  ]

  const foundParties = new Set<string>()
  
  // Extract party names from patterns
  partyPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && !foundParties.has(match[1].trim())) {
        foundParties.add(match[1].trim())
        parties.push({
          name: match[1].trim(),
          role: 'Party',
          description: 'Detected from contract text'
        })
      }
      if (match[2] && !foundParties.has(match[2].trim())) {
        foundParties.add(match[2].trim())
        parties.push({
          name: match[2].trim(),
          role: 'Party',
          description: 'Detected from contract text'
        })
      }
    }
  })

  // If no parties found, try to find company names or entities
  if (parties.length === 0) {
    const companyPattern = /\b([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.|LLP|LP))\b/g
    const companyMatches = text.matchAll(companyPattern)
    for (const match of companyMatches) {
      if (match[1] && !foundParties.has(match[1].trim())) {
        foundParties.add(match[1].trim())
        parties.push({
          name: match[1].trim(),
          role: 'Entity',
          description: 'Detected entity name'
        })
      }
    }
  }

  return parties.slice(0, 5) // Limit to 5 parties max
}

/**
 * Enhanced fallback method with more patterns
 */
function extractPartiesFallbackEnhanced(text: string): Array<{ name: string; role: string; description: string }> {
  const parties: Array<{ name: string; role: string; description: string }> = []
  const foundParties = new Set<string>()
  
  // Enhanced patterns for employment contracts
  const employmentPatterns = [
    /(?:employer|company|corporation)[\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.)?)/gi,
    /(?:employee|employee name)[\s:]+([A-Z][A-Za-z\s]+)/gi,
    /(?:between|by and between)[\s]+([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Ltd|Corp)?)[\s]+(?:and|&)[\s]+([A-Z][A-Za-z\s]+)/gi,
  ]
  
  employmentPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 2 && !foundParties.has(match[1].trim())) {
        foundParties.add(match[1].trim())
        const role = pattern.source.includes('employer') ? 'Employer' : 
                     pattern.source.includes('employee') ? 'Employee' : 'Party'
        parties.push({
          name: match[1].trim(),
          role: role,
          description: `Detected ${role.toLowerCase()} from contract text`
        })
      }
      if (match[2] && match[2].trim().length > 2 && !foundParties.has(match[2].trim())) {
        foundParties.add(match[2].trim())
        parties.push({
          name: match[2].trim(),
          role: 'Party',
          description: 'Detected from contract text'
        })
      }
    }
  })
  
  return parties.slice(0, 5)
}

