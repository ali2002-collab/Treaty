"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, CheckCircle2 } from "lucide-react"
import { saveUserPartySelection } from "@/app/(actions)/save-user-party-selection"
import { toast } from "sonner"

interface Party {
  name: string
  role: string
  description: string
}

interface PartySelectionProps {
  contractId: string
  parties: Party[]
  onPartySelected: (partyName: string) => void
  onSkip?: () => void
}

export function PartySelection({ contractId, parties, onPartySelected, onSkip }: PartySelectionProps) {
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleSelectParty = async (partyName: string) => {
    setSelectedParty(partyName)
    setIsSaving(true)

    try {
      const result = await saveUserPartySelection(contractId, partyName)
      
      if (result.success) {
        toast.success(`Selected party: ${partyName}`)
        onPartySelected(partyName)
      } else {
        toast.error(result.error || 'Failed to save party selection')
        setSelectedParty(null)
      }
    } catch (error) {
      console.error('Error selecting party:', error)
      toast.error('An unexpected error occurred')
      setSelectedParty(null)
    } finally {
      setIsSaving(false)
    }
  }

  if (parties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            No Parties Detected
          </CardTitle>
          <CardDescription>
            We couldn't detect any parties in this contract. You can proceed without selecting a party.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {onSkip && (
            <Button onClick={onSkip} variant="outline" className="w-full">
              Continue Without Selection
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 mx-auto mb-4 text-violet-500" />
        <h3 className="text-xl font-semibold mb-2">Select Your Party</h3>
        <p className="text-sm text-muted-foreground">
          We detected {parties.length} {parties.length === 1 ? 'party' : 'parties'} in this contract. 
          Please select which party you represent. This will help us provide more accurate analysis and metrics.
        </p>
      </div>

      <div className="grid gap-3">
        {parties.map((party, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 ${
              selectedParty === party.name
                ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-950/20'
                : 'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md'
            }`}
            onClick={() => !isSaving && handleSelectParty(party.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-base">{party.name}</h4>
                    {selectedParty === party.name && (
                      <CheckCircle2 className="h-5 w-5 text-violet-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <span className="font-medium">{party.role}</span>
                  </p>
                  {party.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {party.description}
                    </p>
                  )}
                </div>
                {isSaving && selectedParty === party.name && (
                  <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {onSkip && (
        <Button 
          onClick={onSkip} 
          variant="ghost" 
          className="w-full mt-4"
          disabled={isSaving}
        >
          Skip (Continue Without Selection)
        </Button>
      )}

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong>Note:</strong> Your selection will be used to personalize risk assessments, 
          negotiation suggestions, and metrics. You can change this later in the contract settings.
        </p>
      </div>
    </div>
  )
}

