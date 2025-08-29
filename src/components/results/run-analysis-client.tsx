"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { analyzeWithGemini } from "@/app/(actions)/analyze-with-gemini"
import { toast } from "sonner"

interface RunAnalysisClientProps {
  contractId: string
}

type AnalysisState = 'idle' | 'analyzing' | 'saving' | 'done' | 'error'

export function RunAnalysisClient({ contractId }: RunAnalysisClientProps) {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle')
  const [analysisResult, setAnalysisResult] = useState<{
    score: number
    favorable: boolean
    detected_type: string
  } | null>(null)
  const router = useRouter()

  const handleAnalysis = async () => {
    setAnalysisState('analyzing')
    
    try {
      const result = await analyzeWithGemini(contractId)
      
      if (result.success) {
        setAnalysisState('saving')
        
        // Simulate a brief saving state
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setAnalysisResult({
          score: result.score!,
          favorable: result.favorable!,
          detected_type: result.detected_type!
        })
        
        setAnalysisState('done')
        toast.success(`Analysis complete! Score: ${result.score}/100`)
        
        // Refresh the page to show the new analysis
        setTimeout(() => {
          router.refresh()
        }, 1000)
        
      } else {
        setAnalysisState('error')
        toast.error(result.error || "Analysis failed")
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisState('error')
      toast.error("An unexpected error occurred during analysis")
    }
  }

  const getButtonContent = () => {
    switch (analysisState) {
      case 'analyzing':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analyzing with AI...
          </>
        )
      case 'saving':
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving results...
          </>
        )
      case 'done':
        return (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Analysis Complete
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Try Again
          </>
        )
      default:
        return (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Analyze with AI
          </>
        )
    }
  }

  const getButtonVariant = () => {
    switch (analysisState) {
      case 'done':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const isDisabled = analysisState === 'analyzing' || analysisState === 'saving'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Analyze with AI
        </CardTitle>
        <CardDescription>
          We will securely send extracted text to Gemini and store only structured results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Analysis Status</p>
            <p className="text-xs text-muted-foreground">
              {analysisState === 'idle' && 'Ready to analyze'}
              {analysisState === 'analyzing' && 'Processing contract with Gemini AI...'}
              {analysisState === 'saving' && 'Saving analysis results...'}
              {analysisState === 'done' && 'Analysis complete!'}
              {analysisState === 'error' && 'Analysis failed - please try again'}
            </p>
          </div>
          
          {analysisState === 'analyzing' && (
            <div className="text-sm text-muted-foreground">
              Processing...
            </div>
          )}
          
          {analysisState === 'done' && analysisResult && (
            <div className="text-sm text-muted-foreground">
              Score: {analysisResult.score}/100
            </div>
          )}
        </div>

        <Button
          onClick={handleAnalysis}
          disabled={isDisabled}
          variant={getButtonVariant()}
          className="w-full"
          size="lg"
        >
          {getButtonContent()}
        </Button>

        {analysisState === 'done' && analysisResult && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Analysis Results:</strong> Your contract received a score of {analysisResult.score}/100. 
              {analysisResult.favorable ? ' This appears to be a favorable contract.' : ' Consider reviewing the identified risks and opportunities.'}
              {analysisResult.detected_type && ` Detected type: ${analysisResult.detected_type}.`}
            </p>
            <p className="text-sm text-green-700 dark:text-green-700 mt-2">
              <strong>Next:</strong> Return to your dashboard to see the updated contract score and analysis.
            </p>
          </div>
        )}

        {analysisState === 'error' && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Analysis Failed:</strong> There was an error processing your contract. 
              Please try again or contact support if the issue persists.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 