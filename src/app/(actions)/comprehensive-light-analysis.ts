"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'

/**
 * Comprehensive light analysis that detects contract type and parties in one AI call
 * Uses the same comprehensive approach as full analysis for better accuracy
 */
export async function performComprehensiveLightAnalysis(contractId: string) {
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

    // Use Gemini AI for comprehensive detection
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return { success: false, error: 'Google API key not configured' }
    }
    
    const genAI = new GoogleGenAI({ apiKey })
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const contractText = extraction.text.substring(0, 30000) // Use more text for better accuracy

    const prompt = `You are an expert contract analyst. Analyze the contract text below and provide:

1. CONTRACT TYPE DETECTION:
Carefully analyze the content to determine the EXACT contract type from this comprehensive list:

EMPLOYMENT & HR:
- Employment (for employment agreements, employment contracts, job agreements, employee agreements)
- Independent Contractor (for contractor agreements, freelance contracts, 1099 agreements)
- Consulting Agreement (for consulting services agreements)
- Non-Compete Agreement (for non-compete, non-competition agreements)

CONFIDENTIALITY & IP:
- NDA (for non-disclosure agreements, confidentiality agreements)
- IP Assignment (for intellectual property assignment agreements)
- Trade Secret Agreement (for trade secret protection agreements)

SERVICE & CONSULTING:
- MSA (for master service agreements)
- Statement of Work (for SOW, statement of work documents)
- Professional Services (for professional services agreements)

TECHNOLOGY & SOFTWARE:
- SaaS (for software as a service agreements)
- Software License (for software licensing agreements)
- API Agreement (for API usage agreements)
- Cloud Services (for cloud hosting, cloud service agreements)
- Data Processing Agreement (for data processing, GDPR agreements)

REAL ESTATE & PROPERTY:
- Lease Agreement (for property lease, rental agreements)
- Purchase Agreement (for purchase, sale agreements)
- Property Management (for property management agreements)
- Construction Contract (for construction, building agreements)

FINANCIAL & INVESTMENT:
- Loan Agreement (for loan, lending agreements)
- Investment Agreement (for investment, equity agreements)
- Financial Services (for financial services agreements)

BUSINESS & COMMERCIAL:
- Partnership Agreement (for partnership agreements)
- Joint Venture (for joint venture agreements)
- Vendor Agreement (for vendor, supplier agreements)
- Distribution Agreement (for distribution agreements)
- Supply Agreement (for supply chain agreements)

HEALTHCARE & MEDICAL:
- Medical Services (for medical, healthcare service agreements)
- Research Agreement (for research, clinical trial agreements)
- Clinical Trial Agreement (for clinical trial agreements)

EDUCATION & TRAINING:
- Training Agreement (for training, educational service agreements)
- Research Agreement (for academic research)

GOVERNMENT & PUBLIC:
- Government Contract (for government contracts)
- Grant Agreement (for grant agreements)

OTHER:
- Other (only if none of the above match)

2. PARTY DETECTION:
Identify ALL parties involved in the contract. Look for:
- Party names (usually at the beginning: "This Agreement is between [Party A] and [Party B]")
- Company names, individual names
- Roles: Employer, Employee, Client, Vendor, Service Provider, Licensor, Licensee, Buyer, Seller, etc.

Return ONLY a valid JSON object with this exact structure:
{
  "detected_type": "Employment",
  "confidence": 0.95,
  "reasoning": "This contract contains employment terms, job duties, salary information, and employer-employee relationship indicators",
  "parties": [
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
}

CRITICAL INSTRUCTIONS:
- For contract type: Look for key indicators like "employee", "employer", "salary", "benefits", "job duties" = "Employment"
- For parties: Extract full legal names, identify their roles clearly
- Return ONLY valid JSON, no markdown, no explanations outside the JSON
- If no parties found, return empty array: "parties": []

Contract text:
${contractText}

Return ONLY the JSON object, nothing else.`

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt
    })
    const text = result.text

    // Parse the JSON response
    let detectedType: string = 'Other'
    let confidence: number = 0
    let reasoning: string = ''
    let parties: Array<{ name: string; role: string; description: string }> = []
    
    try {
      // Clean the response
      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/```json\n?/g, '')
      cleanedText = cleanedText.replace(/```\n?/g, '')
      cleanedText = cleanedText.trim()
      
      // Extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      const parsed = JSON.parse(cleanedText)
      
      detectedType = parsed.detected_type || 'Other'
      confidence = parsed.confidence || 0
      reasoning = parsed.reasoning || ''
      parties = Array.isArray(parsed.parties) ? parsed.parties : []
      
      // Validate detected type
      const validTypes = [
        'Employment', 'Independent Contractor', 'Consulting Agreement', 'Non-Compete Agreement',
        'NDA', 'IP Assignment', 'Trade Secret Agreement', 'MSA', 'Statement of Work', 'Professional Services',
        'SaaS', 'Software License', 'API Agreement', 'Cloud Services', 'Data Processing Agreement',
        'Lease Agreement', 'Purchase Agreement', 'Property Management', 'Construction Contract',
        'Loan Agreement', 'Investment Agreement', 'Financial Services', 'Partnership Agreement',
        'Joint Venture', 'Vendor Agreement', 'Distribution Agreement', 'Supply Agreement',
        'Medical Services', 'Research Agreement', 'Clinical Trial Agreement', 'Training Agreement',
        'Government Contract', 'Grant Agreement', 'Other'
      ]
      
      if (!validTypes.includes(detectedType)) {
        console.warn(`Invalid detected type: ${detectedType}, defaulting to Other`)
        detectedType = 'Other'
      }
      
      // Validate and clean parties
      parties = parties
        .filter((party: any) => party && typeof party.name === 'string' && party.name.trim().length > 0)
        .map((party: any) => ({
          name: party.name.trim(),
          role: party.role || 'Party',
          description: party.description || `Party in the contract`
        }))
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', text)
      
      // Enhanced fallback for type
      const lowerText = extraction.text.toLowerCase()
      if (lowerText.includes('employment') || lowerText.includes('employee') || lowerText.includes('employer') || 
          lowerText.includes('job duties') || lowerText.includes('salary') || lowerText.includes('benefits')) {
        detectedType = 'Employment'
        reasoning = 'Detected from contract text keywords'
      }
      
      // Fallback for parties - try to extract from text
      parties = extractPartiesFallback(extraction.text)
    }

    // Update contract with detected type
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ detected_type: detectedType })
      .eq('id', contractId)

    if (updateError) {
      console.error('Error updating contract type:', updateError)
    }

    // Store parties in analyses.parties
    if (parties.length > 0) {
      const { data: existingAnalysis } = await supabase
        .from('analyses')
        .select('id')
        .eq('contract_id', contractId)
        .single()

      const partiesData = {
        parties: parties,
        detected_at: new Date().toISOString()
      }

      if (existingAnalysis) {
        await supabase
          .from('analyses')
          .update({ parties: partiesData })
          .eq('id', existingAnalysis.id)
      } else {
        await supabase
          .from('analyses')
          .insert({
            contract_id: contractId,
            score: null,
            favorable: null,
            parties: partiesData
          })
      }
    }

    return {
      success: true,
      contractType: detectedType,
      contractTypeConfidence: confidence,
      contractTypeReasoning: reasoning,
      parties: parties
    }

  } catch (error) {
    console.error('Error performing comprehensive light analysis:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform light analysis'
    }
  }
}

/**
 * Fallback method to extract parties using pattern matching
 */
function extractPartiesFallback(text: string): Array<{ name: string; role: string; description: string }> {
  const parties: Array<{ name: string; role: string; description: string }> = []
  const foundParties = new Set<string>()
  
  // Enhanced patterns
  const patterns = [
    /(?:between|by and between)\s+([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.)?)(?:\s+and\s+)([A-Z][A-Za-z\s]+)/gi,
    /(?:employer|company|corporation)[\s:]+([A-Z][A-Za-z\s&,\.]+(?:Inc|LLC|Ltd|Corp|Corporation|Company|Co\.)?)/gi,
    /(?:employee|employee name)[\s:]+([A-Z][A-Za-z\s]+)/gi,
    /(?:party|parties)\s+(?:A|1|One)[\s:]+([A-Z][A-Za-z\s&,\.]+?)(?:\s|,|\.|$)/gi,
    /(?:party|parties)\s+(?:B|2|Two)[\s:]+([A-Z][A-Za-z\s&,\.]+?)(?:\s|,|\.|$)/gi,
  ]
  
  patterns.forEach(pattern => {
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

