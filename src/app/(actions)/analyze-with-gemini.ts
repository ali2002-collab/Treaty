"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { analysisJsonSchema, zAnalysis, type Analysis } from '@/lib/analysis-schema'

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
- MSA (Master Service Agreement): service terms, scope of work, deliverables, payment terms
- Statement of Work: specific project details, deliverables, timelines, requirements
- Professional Services: professional expertise, service delivery, quality standards

TECHNOLOGY & SOFTWARE:
- SaaS: software licensing, subscription terms, service levels, usage rights
- Software License: software usage rights, restrictions, licensing terms
- API Agreement: application programming interface usage, rate limits, data access
- Cloud Services: cloud hosting, infrastructure, service availability
- Data Processing Agreement: data handling, privacy, GDPR compliance

REAL ESTATE:
- Lease Agreement: property rental, terms, conditions, responsibilities
- Purchase Agreement: property sale, terms, conditions, closing
- Real Estate Contract: property transactions, development, management
- Property Management: facility management, maintenance, operations

FINANCIAL & BANKING:
- Loan Agreement: lending terms, interest rates, repayment schedules
- Credit Agreement: credit terms, limits, conditions
- Investment Agreement: investment terms, returns, risk allocation
- Financial Services: banking, payment processing, financial products

MANUFACTURING & SUPPLY:
- Supply Agreement: vendor relationships, supply terms, quality standards
- Manufacturing Contract: production terms, specifications, quality control
- Distribution Agreement: distribution channels, territories, marketing
- Procurement Contract: purchasing terms, vendor selection, pricing

HEALTHCARE & MEDICAL:
- Medical Services: healthcare delivery, patient care, medical procedures
- Clinical Trial Agreement: research protocols, patient safety, data collection
- Medical Device Contract: equipment supply, maintenance, compliance

EDUCATION & TRAINING:
- Training Agreement: educational services, curriculum, learning outcomes
- Research Agreement: academic research, funding, publication rights
- Academic Contract: educational institution agreements, faculty terms

ENTERTAINMENT & MEDIA:
- Content License: content usage rights, licensing terms, royalties
- Media Production: film, video, audio production agreements
- Performance Agreement: live performances, venues, compensation

TRANSPORTATION & LOGISTICS:
- Transportation Agreement: shipping, delivery, logistics services
- Fleet Management: vehicle management, maintenance, operations

ENERGY & UTILITIES:
- Energy Contract: power supply, energy services, utility agreements
- Renewable Energy: solar, wind, sustainable energy projects

INSURANCE & RISK:
- Insurance Policy: coverage terms, premiums, claims process
- Risk Management: risk assessment, mitigation strategies

LEGAL & COMPLIANCE:
- Legal Services: attorney representation, legal advice
- Government Contract: regulatory compliance, government requirements

PARTNERSHIP & JOINT VENTURE:
- Partnership Agreement: business partnerships, profit sharing, decision making
- Strategic Alliance: business collaborations, shared objectives

DETAILED ANALYSIS REQUIREMENTS:
- detected_type: Must be accurately determined from content analysis
- summary: Provide a comprehensive 3-4 sentence analysis covering key terms, risks, and overall assessment
- recommendations: Provide specific, actionable advice (3-4 sentences) based on the analysis
- clauses: Extract actual values from the contract text. If a clause is not mentioned, use "Not specified" instead of null
- risks: Identify specific risks with exact contract excerpts and detailed analysis. IMPORTANT: severity must be exactly "high", "medium", or "low" (lowercase only)
- opportunities: Identify opportunities. Look for:
  * Favorable payment terms (good rates, flexible schedules, early payment discounts)
  * Strong liability protections (high caps, good exclusions, favorable indemnity)
  * Good termination terms (reasonable notice periods, fair cause requirements)
  * Strong confidentiality protections (broad scope, long duration, good carve-outs)
  * Favorable IP terms (ownership retention, broad licensing rights, derivative rights)
  * Good dispute resolution (preferred jurisdiction, arbitration options, mediation)
  * Renewal benefits (automatic renewal, favorable renewal terms, good conditions)
  * Service level guarantees (performance commitments, quality standards, uptime guarantees)
  * Volume discounts or tiered pricing benefits
  * Any other contract terms that benefit the client/party

OPPORTUNITIES ANALYSIS GUIDANCE:
The AI MUST identify opportunities in EVERY contract. Opportunities are positive aspects that benefit the client or provide leverage. Examples:
- Payment terms that are favorable (good rates, discounts, flexible schedules)
- Liability protections that are strong (high caps, good exclusions)
- Termination terms that are reasonable (fair notice periods, good cause requirements)
- Service guarantees that protect the client (performance commitments, quality standards)
- IP rights that are favorable (ownership retention, broad licensing)
- Renewal terms that are beneficial (automatic renewal, good conditions)
- Any other terms that provide value or protection to the client

If no obvious opportunities exist, identify potential areas where the contract could be improved to create opportunities.

SCORING RULES:
- Start at 70 points
- Subtract 10 points for each HIGH risk identified
- Subtract 5 points for each MEDIUM risk identified  
- Subtract 2 points for each LOW risk identified
- Add 5 points for favorable terms or opportunities
- Clamp final score between 0-100

CONTRACT TEXT:
<<<TEXT START>>>
${extraction.text.substring(0, 8000)}${extraction.text.length > 8000 ? '...' : ''}
<<<TEXT END>>>

CRITICAL FORMAT REQUIREMENTS:
- All severity values in risks MUST be exactly "high", "medium", or "low" (lowercase only)
- Opportunities do NOT need severity values
- Do not use capital letters for severity values
- Ensure all JSON fields match the exact schema format

Return only valid JSON matching the schema or the error format above.`

    // Generate content with Gemini
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('Gemini response:', text)

    // Parse JSON response
    let analysisData: any
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
      analysisData.risks.forEach((risk: any) => {
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

    if (insertError || !analysis) {
      console.error('Database insert error:', insertError)
      throw new Error('Failed to save analysis to database')
    }

    // Update contract with detected type
    await supabase
      .from('contracts')
      .update({ 
        detected_type: detectedType
      })
      .eq('id', contractId)

    return { 
      success: true, 
      analysisId: analysis.id,
      score: validatedData.score,
      favorable: favorable,
      detected_type: detectedType
    }

  } catch (error) {
    console.error('Gemini analysis error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
} 