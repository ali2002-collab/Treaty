"use server"

import { createClient } from '@/lib/supabase-server'
import { GoogleGenAI } from '@google/genai'
import FirecrawlApp from '@mendable/firecrawl-js'

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const genAI = new GoogleGenAI({ apiKey: apiKey || '' })
const firecrawlApiKey = process.env.FIRECRAWL_API_KEY
const firecrawl = firecrawlApiKey ? new FirecrawlApp({ apiKey: firecrawlApiKey }) : null

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

    // Step 1: Determine if the query needs web search
    const needsWebSearch = await determineIfNeedsWebSearch(userQuestion, contract.detected_type || 'contract')
    
    // Step 2: If web search is needed, perform it
    let webSearchResults = ''
    if (needsWebSearch && firecrawl) {
      try {
        webSearchResults = await performWebSearch(userQuestion, contract.detected_type || 'contract')
      } catch (error) {
        console.error('Web search error:', error)
        // Continue without web search results
      }
    }

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

${webSearchResults ? `
═══════════════════════════════════════════════════════════════
WEB SEARCH RESULTS - USE THESE TO ANSWER THE USER'S QUESTION
═══════════════════════════════════════════════════════════════

${webSearchResults}

═══════════════════════════════════════════════════════════════
CRITICAL INSTRUCTIONS - READ CAREFULLY:
═══════════════════════════════════════════════════════════════

The user explicitly asked you to search online. The web search has been performed and results are provided above.

YOU MUST:
1. Use the web search results above to answer the user's question
2. The web search results contain the information the user requested
3. Do NOT say you cannot search online - the search is already done
4. Do NOT say you don't have access to external information - you do, it's above
5. Provide a helpful answer using BOTH contract information AND web search results
6. Cite the sources from the web search results when providing information

DO NOT:
- Say you cannot perform online searches
- Say you don't have access to external information
- Refuse to use the web search results
- Tell the user to check external sources (you already have them)

The user asked: "${userQuestion}"
Answer this question using the web search results provided above.
` : ''}

INSTRUCTIONS:
1. Answer the user's question based on the actual contract content and analysis
2. ${webSearchResults ? 'MANDATORY: Use the web search results provided above to answer questions requiring external information. The search has been performed for you - use the results! ' : ''}Provide specific, accurate information from the contract text
3. If the question is about something not in the contract, ${webSearchResults ? 'use the web search results provided above to give a complete answer. ' : ''}say so clearly
4. If the question is unrelated to contracts or this specific contract, politely redirect to contract-related topics
5. Use the analysis data to provide insights when relevant
6. Be helpful, professional, and accurate
7. Cite specific sections or clauses when possible
8. ${webSearchResults ? 'When using web search information, cite your sources and distinguish between contract-specific information and general information from the web. ' : ''}

Please provide a comprehensive, helpful response based on the contract content${webSearchResults ? ', web search results' : ''}, and analysis.`

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

/**
 * Determines if a user query needs web search
 * Uses AI to intelligently detect if the question requires current information, industry standards, or external knowledge
 */
async function determineIfNeedsWebSearch(userQuestion: string, contractType: string): Promise<boolean> {
  if (!apiKey) return false

  // Quick keyword check first (faster and more reliable)
  const lowerQuestion = userQuestion.toLowerCase()
  const searchKeywords = [
    'search', 'online', 'web', 'internet', 'google', 'current', 'latest', 'recent',
    'government', 'gov', 'tax', 'rate', 'rates', 'standard', 'benchmark', 'industry',
    'law', 'legal', 'regulation', 'calculate', 'calculator', 'estimate', 'how much',
    'what is the', 'what are the', 'uk', 'us', 'usa', 'salary', 'market rate',
    'best practice', 'typical', 'average', 'compare', 'comparison'
  ]
  
  const hasSearchKeywords = searchKeywords.some(keyword => lowerQuestion.includes(keyword))
  
  // If user explicitly asks to search, always return true
  if (lowerQuestion.includes('search') || lowerQuestion.includes('online') || lowerQuestion.includes('web')) {
    return true
  }

  // If keywords suggest web search needed, return true
  if (hasSearchKeywords) {
    return true
  }

  // Otherwise, use AI to determine
  try {
    const decisionPrompt = `You are an AI assistant that determines if a user's contract-related question needs web search to answer accurately.

A question NEEDS web search if it asks about:
- Current laws, regulations, or legal standards (e.g., "UK tax rates", "government regulations")
- Industry best practices or benchmarks
- Market rates, pricing, or salary information
- Recent legal changes or updates
- Comparison with industry standards
- External references or citations
- General legal information not in the contract
- Calculations requiring external data (tax calculations, salary calculators)
- Government websites or official sources
- Real-time or current information

A question does NOT need web search if it:
- Asks about specific clauses in the contract
- Asks about the contract's analysis or risks
- Asks about what's written in the contract text
- Asks about the contract type or parties
- Can be answered from the contract content alone

User Question: "${userQuestion}"
Contract Type: ${contractType}

Respond with ONLY "YES" or "NO" (no explanation, no other text).`

    const result = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: decisionPrompt
    })
    
    const response = result.text.trim().toUpperCase()
    return response.includes('YES')
  } catch (error) {
    console.error('Error determining web search need:', error)
    // If error but has keywords, default to true
    return hasSearchKeywords
  }
}

/**
 * Performs web search using Firecrawl for contract-related queries
 */
async function performWebSearch(query: string, contractType: string): Promise<string> {
  if (!firecrawl) {
    return ''
  }

  try {
    // Build a focused search query for contract-related information
    const searchQuery = query.includes('tax') || query.includes('bracket') 
      ? `${query} UK government HMRC` 
      : `${query} ${contractType} contract legal`
    
    // Use Firecrawl's search API
    let searchResults: any = null
    
    try {
      // Try Firecrawl search method - check available methods
      const firecrawlAny = firecrawl as any
      
      if (typeof firecrawlAny.search === 'function') {
        // Try: search(query, options)
        searchResults = await firecrawlAny.search(searchQuery, { limit: 5 })
      } else if (typeof firecrawlAny.scrapeUrl === 'function') {
        // If search doesn't exist, return empty
        return ''
      } else {
        return ''
      }
    } catch (apiError: any) {
      // Try alternative format
      try {
        const firecrawlAny = firecrawl as any
        searchResults = await firecrawlAny.search({
          query: searchQuery,
          limit: 5
        })
      } catch (e: any) {
        console.error('Firecrawl API error:', e.message)
        return ''
      }
    }
    
    if (!searchResults) {
      return ''
    }

    // Handle different response formats
    let results: any[] = []
    
    // Try different possible response structures
    if (Array.isArray(searchResults)) {
      results = searchResults
    } else if (searchResults.data && Array.isArray(searchResults.data)) {
      results = searchResults.data
    } else if (searchResults.results && Array.isArray(searchResults.results)) {
      results = searchResults.results
    } else if (searchResults.items && Array.isArray(searchResults.items)) {
      results = searchResults.items
    } else if (typeof searchResults === 'object') {
      // Try to extract any array from the object
      const keys = Object.keys(searchResults)
      for (const key of keys) {
        if (Array.isArray(searchResults[key])) {
          results = searchResults[key]
          break
        }
      }
    }

    if (results.length === 0) {
      // Try to use the raw response if it has useful content
      if (typeof searchResults === 'string' && searchResults.length > 0) {
        return `SEARCH RESULTS FOR: "${query}"

${searchResults.substring(0, 3000)}

Note: Raw search results provided. Use this information to answer the user's question.`
      }
      return ''
    }

    // Format search results for the AI prompt
    const formattedResults = results
      .slice(0, 3) // Use top 3 results
      .map((result: any, index: number) => {
        const title = result.title || result.name || result.headline || 'Result'
        const content = result.markdown || result.content || result.description || result.text || result.snippet || result.summary || ''
        const url = result.url || result.link || result.source || ''
        
        // Limit content length to avoid token limits
        const truncatedContent = content.substring(0, 2000)
        
        return `[Source ${index + 1}: ${title}]${url ? `(${url})` : ''}
${truncatedContent}${content.length > 2000 ? '...' : ''}`
      })
      .join('\n\n---\n\n')

    return `SEARCH RESULTS FOR: "${query}"

${formattedResults}

Note: Use this information to supplement your answer, but always prioritize the actual contract content when answering contract-specific questions.`
  } catch (error) {
    console.error('Firecrawl search error:', error)
    return ''
  }
} 