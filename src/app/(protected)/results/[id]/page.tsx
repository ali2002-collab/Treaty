import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Calendar, User, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-server"
import { notFound } from "next/navigation"
import { RunAnalysisClient } from "@/components/results/run-analysis-client"
import { ScoreDonut } from "@/components/results/score-donut"
import { AnalysisTabs } from "@/components/results/analysis-tabs"
import { type Analysis, zDetectedType } from "@/lib/analysis-schema"

interface ResultsPageProps {
  params: Promise<{
    id: string
  }>
}

interface ContractData {
  id: string
  filename: string
  mime: string
  detected_type?: string
  size: number
  created_at: string
  user_id: string
  project_id: string
  score?: number
}

interface ExtractionData {
  contract_id: string
  text: string
  pages: number
  created_at: string
}

interface AnalysisData {
  id: string
  contract_id: string
  score: number
  favorable: boolean
  detected_type: string
  clauses: Analysis['clauses']
  risks: Analysis['risks']
  opportunities: Analysis['opportunities']
  summary: string
  recommendations: string
  negotiation_points: string[]
  created_at: string
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get contract data
  const { data: contract, error: contractError } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single()

  if (contractError || !contract) {
    notFound()
  }

  // Get extraction data
  const { data: extraction, error: extractionError } = await supabase
    .from('extractions')
    .select('*')
    .eq('contract_id', id)
    .single()

  if (extractionError || !extraction) {
    return (
      <div className="p-4">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to dashboard
              </Link>
            </div>
            
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-red-700 dark:text-red-300">No Extracted Text Found</CardTitle>
                <CardDescription className="text-red-600 dark:text-red-400">
                  This contract does not have any extracted text available for analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Container>
      </div>
    )
  }

  // Get analysis data if it exists
  const { data: analysis } = await supabase
    .from('analyses')
    .select('*')
    .eq('contract_id', id)
    .single()

  const contractData: ContractData = contract
  const extractionData: ExtractionData = extraction
  const analysisData: AnalysisData | null = analysis

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  // Transform analysis data to match the Analysis type
  const transformedAnalysis: Analysis | null = analysisData ? {
    detected_type: analysisData.detected_type as any, // Cast to enum type
    clauses: analysisData.clauses,
    risks: analysisData.risks,
    opportunities: analysisData.opportunities,
    score: analysisData.score,
    summary: analysisData.summary,
    recommendations: analysisData.recommendations,
    negotiation_points: analysisData.negotiation_points
  } : null

  return (
    <div className="p-4">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to dashboard
            </Link>
          </div>
          
          {/* Contract Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{contractData.filename}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{contractData.mime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(contractData.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{formatFileSize(contractData.size)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary">{contractData.detected_type || 'Detecting...'}</Badge>
                <Badge variant="outline">{extractionData.pages} page{extractionData.pages !== 1 ? 's' : ''}</Badge>
                {contractData.score && (
                  <Badge variant={getScoreVariant(contractData.score)}>
                    Score: {contractData.score}/100
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {transformedAnalysis ? (
            <div className="space-y-6 mb-8">
              {/* Score Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Contract Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-generated risk assessment and overall contract evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <ScoreDonut score={transformedAnalysis.score} />
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Analysis Summary</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {transformedAnalysis.summary}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Badge variant={analysisData?.favorable ? "default" : "secondary"}>
                          {analysisData?.favorable ? "Favorable" : "Needs Review"}
                        </Badge>
                        <Badge variant="outline">
                          {transformedAnalysis.detected_type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Tabs */}
              <AnalysisTabs analysis={transformedAnalysis} />
            </div>
          ) : (
            <div className="mb-8">
              <RunAnalysisClient contractId={id} />
            </div>
          )}
          
          {/* Extracted Text */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Extraction
              </CardTitle>
              <CardDescription>
                Raw text extracted from the uploaded contract document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
                  {extractionData.text}
                </pre>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Extracted on {new Date(extractionData.created_at).toLocaleString()}</p>
                <p>Character count: {extractionData.text.length.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
} 