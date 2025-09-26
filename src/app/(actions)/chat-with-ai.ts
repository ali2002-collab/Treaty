"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const genAI = new GoogleGenAI({ apiKey: apiKey || '' })

export async function chatWithAI(contractId: string, userQuestion: string, chatHistory: Array<{role: string, content: string}>) {
  try {
    // Check if Google API key is configured
    if (!apiKey) {
      throw new Error('Google AI API key not configured')
    }

    const supabase = await createClient()
    
    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      throw new Error('Unauthorized')
    }

    // Get contract data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      throw new Error('Contract not found')
    }

    // Get extraction data (the actual contract text)
    const { data: extraction, error: extractionError } = await supabase
      .from('extractions')
      .select('*')
      .eq('contract_id', contractId)
      .single()

    if (extractionError || !extraction) {
      throw new Error('Contract text not found')
    }

    // Get analysis data if available
    const { data: analysis } = await supabase
      .from('analyses')
      .select('*')
      .eq('contract_id', contractId)
      .single()

    // Create the AI prompt with full contract context
    const prompt = `You are an expert contract analyst AI assistant. You have access to a complete ${contract.detected_type || 'contract'} document and its analysis.

CONTRACT INFORMATION:
- Contract Type: ${contract.detected_type || 'Unknown'}
- Filename: ${contract.filename}
- Analysis Score: ${analysis?.score || 'Not analyzed yet'}

CONTRACT TEXT:
${extraction.text}

${analysis ? `
ANALYSIS RESULTS:
- Overall Score: ${analysis.score}/100
- Favorable: ${analysis.favorable ? 'Yes' : 'No'}
- Summary: ${analysis.summary}
- Key Risks: ${analysis.risks?.map((r: { type: string; severity: string }) => `${r.type} (${r.severity})`).join(', ') || 'None identified'}
- Key Opportunities: ${analysis.opportunities?.map((o: { type: string; note: string }) => `${o.type}: ${o.note}`).join(', ') || 'None identified'}
- Negotiation Points: ${analysis.negotiation_points?.join(', ') || 'None identified'}
` : ''}

CHAT HISTORY:
${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
1. Answer the user's question based on the actual contract content and analysis
2. Provide specific, accurate information from the contract text
3. If the question is about something not in the contract, say so clearly
4. If the question is unrelated to contracts or this specific contract, politely redirect to contract-related topics
5. Use the analysis data to provide insights when relevant
6. Be helpful, professional, and accurate
7. Cite specific sections or clauses when possible

Please provide a comprehensive, helpful response based on the contract content and analysis.`

    // Generate AI response (Gemini API v1)
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const result = await genAI.models.generateContent({
      model: modelName,
      contents: prompt
    })
    const aiResponse = result.text

    return {
      success: true,
      response: aiResponse
    }

  } catch (error) {
    console.error('AI chat error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AI response'
    }
  }
} 