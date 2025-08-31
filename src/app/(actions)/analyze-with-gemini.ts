"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analysisJsonSchema, zAnalysis } from '@/lib/analysis-schema'

export async function analyzeWithGemini(contractId: string) {
  try {
    // Create Supabase server client and get current user
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Unauthorized')
    }

    const userId = session.user.id

    // Verify user owns the contract
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('id, user_id, filename, detected_type')
      .eq('id', contractId)
      .eq('user_id', userId)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found or access denied')
    }

    // Fetch latest extraction for this contract
    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .select('text, pages')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (extractionError || !extraction) {
      throw new Error('No contract text found for analysis')
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('analyses')
      .select('id')
      .eq('contract_id', contractId)
      .limit(1)

    if (existingAnalysis && existingAnalysis.length > 0) {
      throw new Error('Analysis already exists for this contract')
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured')
    }

    // Get generative model with JSON response configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: analysisJsonSchema
      }
    })

    // Create the prompt for contract analysis
    const prompt = `You are an expert contract analyst. Analyze the provided text and determine if it's a valid contract document.

FIRST: Validate if this is actually a contract document. If the text appears to be:
- Random text, spam, or unrelated content
- Incomplete or corrupted
- Not a legal document
- A different type of document (invoice, receipt, etc.)

Then return: {"error": "This document does not appear to be a valid contract. Please upload a proper contract document."}

IF IT IS A VALID CONTRACT, proceed with analysis and return STRICT JSON matching the schema.

CONTRACT TYPE DETECTION:
Carefully analyze the content to determine the most accurate contract type from this comprehensive list:

EMPLOYMENT & HR:
- Employment: employment terms, job duties, salary, benefits, termination clauses
- Independent Contractor: contractor terms, project scope, payment for services
- Consulting Agreement: consulting services, deliverables, professional advice
- Non-Compete Agreement: restrictive covenants, competition limitations

CONFIDENTIALITY & IP:
- NDA: confidentiality, non-disclosure, trade secrets, proprietary information
- IP Assignment: intellectual property ownership, patent assignments, copyright transfers
- Trade Secret Agreement: proprietary information protection, confidentiality obligations

SERVICE & CONSULTING:
- MSA: master service agreement, general terms, service framework
- SOW: statement of work, specific deliverables, project scope
- Consulting Agreement: professional services, expert advice, deliverables
- Service Agreement: service provision, terms, conditions, deliverables

BUSINESS & COMMERCIAL:
- Partnership Agreement: business partnership, profit sharing, responsibilities
- Joint Venture: collaborative business arrangement, shared resources
- Vendor Agreement: supplier terms, product delivery, payment terms
- Distribution Agreement: product distribution, territory, exclusivity

FINANCIAL & INVESTMENT:
- Loan Agreement: lending terms, interest rates, repayment schedule
- Investment Agreement: investment terms, equity, returns
- Revenue Share: profit sharing, revenue distribution, percentages
- Royalty Agreement: licensing fees, royalty rates, payment terms

REAL ESTATE & PROPERTY:
- Lease Agreement: property rental, terms, conditions, duration
- Purchase Agreement: property sale, terms, closing conditions
- Property Management: property oversight, maintenance, tenant relations
- Construction Contract: building work, timelines, specifications

TECHNOLOGY & SOFTWARE:
- SaaS Agreement: software as a service, subscription terms
- Software License: software usage rights, restrictions, terms
- API Agreement: application programming interface, usage terms
- Data Processing: data handling, privacy, security terms

HEALTHCARE & MEDICAL:
- Medical Services: healthcare provision, patient care, terms
- Research Agreement: medical research, clinical trials, protocols
- Healthcare Partnership: medical collaboration, shared resources
- Telemedicine: remote healthcare, digital consultation terms

EDUCATION & TRAINING:
- Training Agreement: educational services, course delivery, terms
- Research Collaboration: academic research, shared resources
- Student Agreement: educational terms, responsibilities, policies
- Internship: work experience, learning objectives, terms

GOVERNMENT & PUBLIC:
- Government Contract: public service, compliance, regulations
- Grant Agreement: funding terms, project requirements, reporting
- Public Partnership: government collaboration, shared objectives
- Regulatory Compliance: legal compliance, standards, requirements

OTHER SPECIALIZED:
- Franchise Agreement: business franchise, brand usage, terms
- Licensing Agreement: intellectual property licensing, usage rights
- Settlement Agreement: legal dispute resolution, terms
- Confidentiality Agreement: information protection, non-disclosure
- Other: any other contract type not listed above

DETAILED ANALYSIS REQUIREMENTS:
- detected_type: Must be exactly one of the contract types listed above
- score: Risk score from 0-100 (0 = extremely risky, 100 = very favorable)
- summary: 2-3 sentence summary of the contract's key points and overall assessment
- recommendations: 2-3 actionable recommendations for the client
- clauses: Array of key contract clauses with brief descriptions
- risks: Array of identified risks with severity (high/medium/low) and analysis
- opportunities: Array of identified opportunities with analysis
- negotiation_points: Array of specific negotiation points with actionable advice

RISK ANALYSIS GUIDANCE:
The AI MUST identify risks in EVERY contract. Risks are negative aspects that could harm the client or create liability. Examples:
- Unfavorable payment terms (late fees, penalties, high rates)
- Weak liability protections (low caps, broad exclusions)
- Unreasonable termination clauses (short notice, high penalties)
- Unfavorable dispute resolution (mandatory arbitration, venue restrictions)
- Weak intellectual property protections
- Unreasonable confidentiality obligations
- Unfavorable renewal terms
- Any other contract terms that disadvantage the client

OPPORTUNITIES ANALYSIS GUIDANCE:
The AI MUST identify opportunities in EVERY contract. Opportunities are positive aspects that benefit the client or provide leverage. Examples:
- Favorable payment terms (good rates, flexible schedules, early payment discounts)
- Strong liability protections (high caps, good exclusions, favorable indemnity)
- Flexible termination options (reasonable notice, low penalties)
- Favorable dispute resolution (choice of venue, mediation options)
- Strong intellectual property protections
- Reasonable confidentiality obligations
- Favorable renewal terms
- Any other contract terms that benefit the client

If no obvious opportunities exist, identify potential areas where the contract could be improved to create opportunities.

CRITICAL FORMAT REQUIREMENTS:
- All severity values in risks MUST be exactly "high", "medium", or "low" (lowercase only)
- Opportunities do NOT need severity values
- All text must be professional and legally appropriate
- JSON must be valid and parseable
- No HTML tags or special characters in text fields

CONTRACT TEXT TO ANALYZE:
${extraction.text}

Analyze this contract and return the JSON response.`

    // Generate content with the prompt
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response:', text)

    // Parse JSON response
    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      throw new Error('Failed to parse AI analysis response')
    }

    // Check if AI detected an invalid contract
    if (analysisData.error) {
      throw new Error(analysisData.error)
    }

    // Fix common format issues before validation
    if (analysisData.risks && Array.isArray(analysisData.risks)) {
      analysisData.risks.forEach((risk: { severity?: string }) => {
        if (risk.severity) {
          risk.severity = risk.severity.toLowerCase()
        }
      })
    }

    // Validate with Zod schema
    const parsed = zAnalysis.safeParse(analysisData)
    if (!parsed.success) {
      console.error('Zod validation error:', parsed.error)
      throw new Error('Invalid analysis JSON')
    }

    const validatedData = parsed.data

    // Calculate favorable based on score
    const favorable = validatedData.score >= 70

    // Provide fallback values for null fields
    const detectedType = validatedData.detected_type || 'Other'
    const summary = validatedData.summary || `Contract analysis completed with a score of ${validatedData.score}/100.`
    const recommendations = validatedData.recommendations || `Based on the score of ${validatedData.score}/100, ${favorable ? 'this contract appears favorable' : 'review the identified risks and opportunities'}.`

    // Insert analysis into database
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        contract_id: contractId,
        score: validatedData.score,
        favorable: favorable,
        clauses: validatedData.clauses,
        risks: validatedData.risks,
        opportunities: validatedData.opportunities,
        summary: summary,
        recommendations: recommendations,
        negotiation_points: validatedData.negotiation_points
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error('Failed to save analysis to database')
    }

    // Update contract with detected type if not already set
    if (!contract.detected_type && detectedType !== 'Other') {
      await supabase
        .from('contracts')
        .update({ detected_type: detectedType })
        .eq('id', contractId)
    }

    return {
      success: true, 
      analysisId: analysis.id,
      score: validatedData.score,
      favorable: favorable,
      detected_type: detectedType
    }

  } catch (error: unknown) {
    console.error('Gemini analysis error:', error)
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: 'Unknown error occurred'
    }
  }
} 