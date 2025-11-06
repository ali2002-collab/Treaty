"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PartySelection } from "@/components/dashboard/party-selection"
import { analyzeWithGemini } from "@/app/(actions)/analyze-with-gemini"
import { detectContractParties } from "@/app/(actions)/detect-contract-parties"
import { getUserPartySelection } from "@/app/(actions)/get-user-party-selection"
import { Brain, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PreAnalysisViewProps {
  contractId: string
  detectedType?: string
  initialParties?: Array<{ name: string; role: string; description: string }>
}

export function PreAnalysisView({ contractId, detectedType, initialParties }: PreAnalysisViewProps) {
  const router = useRouter()
  const [parties, setParties] = useState<Array<{ name: string; role: string; description: string }>>(initialParties || [])
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoadingParties, setIsLoadingParties] = useState(false)

  useEffect(() => {
    // Load user's previously selected party
    const loadSelectedParty = async () => {
      const result = await getUserPartySelection(contractId)
      if (result.success && result.partyName) {
        setSelectedParty(result.partyName)
      }
    }
    loadSelectedParty()

    // If no parties provided, try to detect them
    if (!initialParties || initialParties.length === 0) {
      setIsLoadingParties(true)
      detectContractParties(contractId).then(result => {
        if (result.success && result.parties) {
          setParties(result.parties)
        }
        setIsLoadingParties(false)
      })
    }
  }, [contractId, initialParties])

  const handlePartySelected = (partyName: string) => {
    setSelectedParty(partyName)
    // Toast is already shown by PartySelection component, no need to duplicate
  }

  const handleFullAnalysis = async () => {
    if (!selectedParty && parties.length > 0) {
      toast.error("Please select which party you represent before running full analysis")
      return
    }

    setIsAnalyzing(true)
    
    try {
      const result = await analyzeWithGemini(contractId)
      
      if (result.success) {
        toast.success("Full analysis complete!")
        router.refresh() // Refresh to show the analysis results
      } else {
        toast.error(result.error || "Analysis failed")
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("An unexpected error occurred during analysis")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Contract Type Card */}
      {detectedType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-violet-500" />
              Detected Contract Type
            </CardTitle>
            <CardDescription>
              Our AI has identified the type of this contract
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="default" className="text-base px-4 py-2">
                {detectedType}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Ready for full analysis
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Party Selection Card */}
      {isLoadingParties ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Detecting parties...</p>
          </CardContent>
        </Card>
      ) : parties.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Your Party</CardTitle>
            <CardDescription>
              We detected {parties.length} {parties.length === 1 ? 'party' : 'parties'} in this contract. 
              Please select which party you represent to get personalized analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PartySelection
              contractId={contractId}
              parties={parties}
              onPartySelected={handlePartySelected}
            />
            {selectedParty && (
              <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-lg border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-medium text-violet-900 dark:text-violet-100">
                  Selected: <span className="font-semibold">{selectedParty}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Parties Detected</CardTitle>
            <CardDescription>
              We couldn't detect parties in this contract. You can still run full analysis.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Full Analysis Button */}
      <Card>
        <CardHeader>
          <CardTitle>Ready for Full Analysis</CardTitle>
          <CardDescription>
            {selectedParty 
              ? `Run comprehensive AI analysis from the perspective of ${selectedParty}`
              : "Run comprehensive AI analysis of this contract"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleFullAnalysis}
            disabled={isAnalyzing}
            size="lg"
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Do Full Analysis
              </>
            )}
          </Button>
          {parties.length > 0 && !selectedParty && (
            <p className="mt-2 text-sm text-muted-foreground">
              💡 Tip: Select your party above for personalized analysis
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

