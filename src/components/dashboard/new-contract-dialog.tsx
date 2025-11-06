"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, X, Loader2, Brain, Users } from "lucide-react"
import { uploadAndProcessContract } from "@/app/(actions)/upload-and-process-contract"
import { performLightAnalysis } from "@/app/(actions)/light-analysis"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface NewContractDialogProps {
  onContractAdded: () => void
}

export function NewContractDialog({ onContractAdded }: NewContractDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workflowStep, setWorkflowStep] = useState<'upload' | 'analyzing' | 'success'>('upload')
  const [contractId, setContractId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only DOCX files are supported. PDF support has been removed.')
        return
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only DOCX files are supported. PDF support has been removed.')
        return
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    setIsSubmitting(true)
    setWorkflowStep('analyzing')
    
    try {
      // Step 1: Upload contract
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const uploadResult = await uploadAndProcessContract(formData)
      
      if (!uploadResult.success) {
        toast.error(uploadResult.error || "Failed to process contract")
        setWorkflowStep('upload')
        return
      }

      if (!uploadResult.contractId) {
        toast.error("Failed to get contract ID")
        setWorkflowStep('upload')
        return
      }

      setContractId(uploadResult.contractId)

      // Step 2: Perform light analysis (detect type + parties)
      const lightAnalysisResult = await performLightAnalysis(uploadResult.contractId)
      
      if (!lightAnalysisResult.success) {
        toast.error(lightAnalysisResult.error || "Failed to analyze contract")
        setWorkflowStep('upload')
        return
      }

      // Success - redirect to results page
      setWorkflowStep('success')
      toast.success("Contract uploaded and analyzed!")
      
      // Close dialog and redirect to results page
      onContractAdded()
      resetForm()
      setOpen(false)
      router.push(`/results/${uploadResult.contractId}`)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("An unexpected error occurred")
      setWorkflowStep('upload')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Removed - now using AI detection
  const _detectContractTypeLegacy = (filename: string): string => {
    const lowerFilename = filename.toLowerCase()
    
    // Employment & HR
    if (lowerFilename.includes('employment') || lowerFilename.includes('employee') || lowerFilename.includes('hire') || lowerFilename.includes('job')) {
      return 'Employment'
    }
    if (lowerFilename.includes('contractor') || lowerFilename.includes('freelance') || lowerFilename.includes('1099')) {
      return 'Independent Contractor'
    }
    if (lowerFilename.includes('consulting') || lowerFilename.includes('consultant')) {
      return 'Consulting Agreement'
    }
    if (lowerFilename.includes('non-compete') || lowerFilename.includes('noncompete') || lowerFilename.includes('restrictive covenant')) {
      return 'Non-Compete Agreement'
    }
    
    // Confidentiality & IP
    if (lowerFilename.includes('nda') || lowerFilename.includes('non-disclosure') || lowerFilename.includes('confidentiality')) {
      return 'NDA'
    }
    if (lowerFilename.includes('ip assignment') || lowerFilename.includes('intellectual property') || lowerFilename.includes('patent')) {
      return 'IP Assignment'
    }
    if (lowerFilename.includes('trade secret') || lowerFilename.includes('proprietary')) {
      return 'Trade Secret Agreement'
    }
    
    // Service & Consulting
    if (lowerFilename.includes('msa') || lowerFilename.includes('master service')) {
      return 'MSA'
    }
    if (lowerFilename.includes('sow') || lowerFilename.includes('statement of work') || lowerFilename.includes('scope of work')) {
      return 'Statement of Work'
    }
    if (lowerFilename.includes('professional services') || lowerFilename.includes('service agreement')) {
      return 'Professional Services'
    }
    
    // Technology & Software
    if (lowerFilename.includes('saas') || lowerFilename.includes('software as a service')) {
      return 'SaaS'
    }
    if (lowerFilename.includes('software license') || lowerFilename.includes('software agreement')) {
      return 'Software License'
    }
    if (lowerFilename.includes('api') || lowerFilename.includes('application programming interface')) {
      return 'API Agreement'
    }
    if (lowerFilename.includes('cloud') || lowerFilename.includes('hosting')) {
      return 'Cloud Services'
    }
    if (lowerFilename.includes('data processing') || lowerFilename.includes('dpa') || lowerFilename.includes('gdpr')) {
      return 'Data Processing Agreement'
    }
    
    // Real Estate
    if (lowerFilename.includes('lease') || lowerFilename.includes('rental') || lowerFilename.includes('tenancy')) {
      return 'Lease Agreement'
    }
    if (lowerFilename.includes('purchase') || lowerFilename.includes('sale') || lowerFilename.includes('buy')) {
      return 'Purchase Agreement'
    }
    if (lowerFilename.includes('real estate') || lowerFilename.includes('property')) {
      return 'Real Estate Contract'
    }
    if (lowerFilename.includes('property management') || lowerFilename.includes('facility management')) {
      return 'Property Management'
    }
    
    // Financial & Banking
    if (lowerFilename.includes('loan') || lowerFilename.includes('credit') || lowerFilename.includes('mortgage')) {
      return 'Loan Agreement'
    }
    if (lowerFilename.includes('investment') || lowerFilename.includes('securities') || lowerFilename.includes('fund')) {
      return 'Investment Agreement'
    }
    if (lowerFilename.includes('financial services') || lowerFilename.includes('banking') || lowerFilename.includes('payment')) {
      return 'Financial Services'
    }
    
    // Manufacturing & Supply
    if (lowerFilename.includes('supply') || lowerFilename.includes('vendor') || lowerFilename.includes('supplier')) {
      return 'Supply Agreement'
    }
    if (lowerFilename.includes('manufacturing') || lowerFilename.includes('production') || lowerFilename.includes('assembly')) {
      return 'Manufacturing Contract'
    }
    if (lowerFilename.includes('distribution') || lowerFilename.includes('wholesale') || lowerFilename.includes('retail')) {
      return 'Distribution Agreement'
    }
    if (lowerFilename.includes('procurement') || lowerFilename.includes('purchase order') || lowerFilename.includes('po')) {
      return 'Procurement Contract'
    }
    
    // Healthcare & Medical
    if (lowerFilename.includes('medical') || lowerFilename.includes('healthcare') || lowerFilename.includes('clinical')) {
      return 'Medical Services'
    }
    if (lowerFilename.includes('clinical trial') || lowerFilename.includes('research study')) {
      return 'Clinical Trial Agreement'
    }
    if (lowerFilename.includes('medical device') || lowerFilename.includes('equipment')) {
      return 'Medical Device Contract'
    }
    
    // Education & Training
    if (lowerFilename.includes('training') || lowerFilename.includes('education') || lowerFilename.includes('learning')) {
      return 'Training Agreement'
    }
    if (lowerFilename.includes('research') || lowerFilename.includes('academic') || lowerFilename.includes('university')) {
      return 'Research Agreement'
    }
    
    // Entertainment & Media
    if (lowerFilename.includes('content') || lowerFilename.includes('media') || lowerFilename.includes('publishing')) {
      return 'Content License'
    }
    if (lowerFilename.includes('production') || lowerFilename.includes('film') || lowerFilename.includes('video')) {
      return 'Media Production'
    }
    if (lowerFilename.includes('performance') || lowerFilename.includes('concert') || lowerFilename.includes('show')) {
      return 'Performance Agreement'
    }
    
    // Transportation & Logistics
    if (lowerFilename.includes('transportation') || lowerFilename.includes('shipping') || lowerFilename.includes('logistics')) {
      return 'Transportation Agreement'
    }
    if (lowerFilename.includes('fleet') || lowerFilename.includes('vehicle') || lowerFilename.includes('car')) {
      return 'Fleet Management'
    }
    
    // Energy & Utilities
    if (lowerFilename.includes('energy') || lowerFilename.includes('power') || lowerFilename.includes('utility')) {
      return 'Energy Contract'
    }
    if (lowerFilename.includes('renewable') || lowerFilename.includes('solar') || lowerFilename.includes('wind')) {
      return 'Renewable Energy'
    }
    
    // Insurance & Risk
    if (lowerFilename.includes('insurance') || lowerFilename.includes('policy') || lowerFilename.includes('coverage')) {
      return 'Insurance Policy'
    }
    if (lowerFilename.includes('reinsurance') || lowerFilename.includes('risk management')) {
      return 'Risk Management'
    }
    
    // Legal & Compliance
    if (lowerFilename.includes('legal services') || lowerFilename.includes('attorney') || lowerFilename.includes('lawyer')) {
      return 'Legal Services'
    }
    if (lowerFilename.includes('compliance') || lowerFilename.includes('regulatory') || lowerFilename.includes('government')) {
      return 'Government Contract'
    }
    
    // Partnership & Joint Venture
    if (lowerFilename.includes('partnership') || lowerFilename.includes('joint venture') || lowerFilename.includes('collaboration')) {
      return 'Partnership Agreement'
    }
    if (lowerFilename.includes('strategic alliance') || lowerFilename.includes('alliance')) {
      return 'Strategic Alliance'
    }
    
    return 'Other'
  }


  const handleClose = () => {
    onContractAdded() // Refresh the dashboard
    resetForm()
    setWorkflowStep('upload')
    setOpen(false)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setWorkflowStep('upload')
    setContractId('')
  }



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {workflowStep === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload a new contract</DialogTitle>
              <DialogDescription>
                Select a contract file. Our AI will automatically detect the contract type and provide comprehensive analysis.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>Contract File</Label>
                <Card 
                  className={`border-2 border-dashed transition-colors ${
                    selectedFile 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                  }`}
                >
                  <CardContent className="p-6">
                    {!selectedFile ? (
                      <div
                        className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-sm font-medium">Click to upload or drag and drop</p>
                          <p className="text-xs text-muted-foreground">DOCX files only, up to 10MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!selectedFile}
              >
                Upload Contract
              </Button>
            </DialogFooter>
          </>
        )}

        {workflowStep === 'analyzing' && (
          <>
            <DialogHeader>
              <DialogTitle>Uploading & Analyzing Contract</DialogTitle>
              <DialogDescription>
                Uploading your contract and performing light analysis...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-8">
              <Brain className="h-8 w-8 mx-auto text-violet-500" />
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Detecting contract type and parties...
              </p>
            </div>
          </>
        )}

        {workflowStep === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Upload Complete!</DialogTitle>
              <DialogDescription>
                Your contract has been uploaded and analyzed. Redirecting to results page...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-medium text-green-600">
                Contract Ready!
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 