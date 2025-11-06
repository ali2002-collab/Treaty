"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'

/**
 * Detects contract type from contract text using AI
 */
export async function detectContractType(contractId: string) {
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

    // Use Gemini AI to detect contract type
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return { success: false, error: 'Google API key not configured' }
    }
    
    const genAI = new GoogleGenAI({ apiKey })
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

    const contractText = extraction.text.substring(0, 20000) // Increased to 20k chars

    const prompt = `You are an expert contract analyst. Analyze the contract text below and determine the EXACT contract type.

CRITICAL: You MUST return a valid JSON object. Do not include any markdown, explanations, or text outside the JSON.

CONTRACT TYPES (use EXACTLY these names):
- Employment (for employment agreements, employment contracts, job agreements)
- Independent Contractor (for contractor agreements, freelance contracts)
- Consulting Agreement (for consulting services agreements)
- Non-Compete Agreement (for non-compete, non-competition agreements)
- NDA (for non-disclosure agreements, confidentiality agreements)
- IP Assignment (for intellectual property assignment agreements)
- Trade Secret Agreement (for trade secret protection agreements)
- MSA (for master service agreements)
- Statement of Work (for SOW, statement of work documents)
- Professional Services (for professional services agreements)
- SaaS (for software as a service agreements)
- Software License (for software licensing agreements)
- API Agreement (for API usage agreements)
- Cloud Services (for cloud hosting, cloud service agreements)
- Data Processing Agreement (for data processing, GDPR agreements)
- Lease Agreement (for property lease, rental agreements)
- Purchase Agreement (for purchase, sale agreements)
- Property Management (for property management agreements)
- Construction Contract (for construction, building agreements)
- Loan Agreement (for loan, lending agreements)
- Investment Agreement (for investment, equity agreements)
- Financial Services (for financial services agreements)
- Partnership Agreement (for partnership agreements)
- Joint Venture (for joint venture agreements)
- Vendor Agreement (for vendor, supplier agreements)
- Distribution Agreement (for distribution agreements)
- Supply Agreement (for supply chain agreements)
- Medical Services (for medical, healthcare service agreements)
- Research Agreement (for research, clinical trial agreements)
- Clinical Trial Agreement (for clinical trial agreements)
- Training Agreement (for training, educational service agreements)
- Government Contract (for government contracts)
- Grant Agreement (for grant agreements)
- Other (only if none of the above match)

ANALYSIS INSTRUCTIONS:
1. Read the contract text carefully
2. Look for key indicators: job titles, employment terms, salary, benefits = "Employment"
3. Look for party names, roles, and relationships
4. Identify the primary purpose and structure of the contract
5. Match to the EXACT type name from the list above
6. If it's clearly an employment agreement with terms like "employee", "employer", "salary", "benefits", "job duties" = "Employment"

Return ONLY this JSON structure (no other text):
{
  "detected_type": "Employment",
  "confidence": 0.95,
  "reasoning": "This contract contains employment terms, job duties, salary information, and employer-employee relationship indicators"
}

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
    
    try {
      // Clean the response (remove markdown code blocks if present)
      let cleanedText = text.trim()
      cleanedText = cleanedText.replace(/```json\n?/g, '')
      cleanedText = cleanedText.replace(/```\n?/g, '')
      cleanedText = cleanedText.trim()
      
      // Try to extract JSON if it's wrapped in text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanedText = jsonMatch[0]
      }
      
      const parsed = JSON.parse(cleanedText)
      
      detectedType = parsed.detected_type || 'Other'
      confidence = parsed.confidence || 0
      reasoning = parsed.reasoning || ''
      
      // Validate detected type is from our list
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
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('Raw response:', text)
      
      // Enhanced fallback: try multiple extraction methods
      const typeMatch1 = text.match(/"detected_type"\s*:\s*"([^"]+)"/i)
      const typeMatch2 = text.match(/detected_type["\s]*:["\s]*([A-Za-z\s]+)/i)
      const typeMatch3 = text.match(/(Employment|NDA|MSA|SaaS|Lease|Loan|Partnership)/i)
      
      if (typeMatch1) {
        detectedType = typeMatch1[1].trim()
      } else if (typeMatch2) {
        detectedType = typeMatch2[1].trim()
      } else if (typeMatch3) {
        detectedType = typeMatch3[1]
      }
      
      // If still not found, try to detect from contract text directly
      if (detectedType === 'Other' && extraction.text) {
        const lowerText = extraction.text.toLowerCase()
        if (lowerText.includes('employment') || lowerText.includes('employee') || lowerText.includes('employer') || 
            lowerText.includes('job duties') || lowerText.includes('salary') || lowerText.includes('benefits')) {
          detectedType = 'Employment'
          reasoning = 'Detected from contract text keywords'
        }
      }
    }

    // Update contract with detected type
    const { error: updateError } = await supabase
      .from('contracts')
      .update({ detected_type: detectedType })
      .eq('id', contractId)

    if (updateError) {
      console.error('Error updating contract type:', updateError)
      // Continue anyway - we still have the detected type
    }

    return {
      success: true,
      detectedType: detectedType,
      confidence: confidence,
      reasoning: reasoning
    }

  } catch (error) {
    console.error('Error detecting contract type:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detect contract type'
    }
  }
}

