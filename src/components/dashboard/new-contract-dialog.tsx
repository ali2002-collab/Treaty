"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, X, Loader2, Brain } from "lucide-react"
import { uploadAndProcessContract } from "@/app/(actions)/upload-and-process-contract"
import { analyzeWithGemini } from "@/app/(actions)/analyze-with-gemini"
import { toast } from "sonner"

interface NewContractDialogProps {
  onContractAdded: () => void
}

export function NewContractDialog({ onContractAdded }: NewContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [workflowStep, setWorkflowStep] = useState<'upload' | 'detecting' | 'confirm' | 'analyzing' | 'success'>('upload')
  const [detectedType, setDetectedType] = useState<string>('')
  const [contractId, setContractId] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and DOCX files are supported')
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
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and DOCX files are supported')
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
    setWorkflowStep('detecting')
    
    try {
      // Create FormData for the server action
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const result = await uploadAndProcessContract(formData)
      
      if (result.success) {
        // Now detect contract type with AI
        if (result.contractId) {
          setContractId(result.contractId)
        }
        
        // For now, we'll use a simple heuristic to detect type
        // In a real implementation, you'd call the AI here
        const detectedType = detectContractType(selectedFile.name)
        setDetectedType(detectedType)
        setWorkflowStep('confirm')
      } else {
        toast.error(result.error || "Failed to process contract")
        setWorkflowStep('upload')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("An unexpected error occurred")
      setWorkflowStep('upload')
    } finally {
      setIsSubmitting(false)
    }
  }

  const detectContractType = (filename: string): string => {
    const lowerFilename = filename.toLowerCase()
    if (lowerFilename.includes('employment') || lowerFilename.includes('employee') || lowerFilename.includes('hire')) {
      return 'Employment'
    }
    if (lowerFilename.includes('nda') || lowerFilename.includes('non-disclosure') || lowerFilename.includes('confidentiality')) {
      return 'NDA'
    }
    if (lowerFilename.includes('msa') || lowerFilename.includes('master service')) {
      return 'MSA'
    }
    if (lowerFilename.includes('saas') || lowerFilename.includes('software')) {
      return 'SaaS'
    }
    return 'Other'
  }

  const handleAnalyze = async () => {
    if (!contractId) return
    
    setWorkflowStep('analyzing')
    
    try {
      const result = await analyzeWithGemini(contractId)
      
      if (result.success) {
        setAnalysisResult(result)
        setWorkflowStep('success')
      } else {
        toast.error(result.error || "Analysis failed")
        setWorkflowStep('confirm')
      }
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error("An unexpected error occurred during analysis")
      setWorkflowStep('confirm')
    }
  }

  const handleViewResults = () => {
    // Navigate to results page
    window.location.href = `/results/${contractId}`
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
    setDetectedType('')
    setContractId('')
    setAnalysisResult(null)
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
                          <p className="text-xs text-muted-foreground">PDF, DOCX up to 10MB</p>
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
                  accept=".pdf,.docx"
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

        {workflowStep === 'detecting' && (
          <>
            <DialogHeader>
              <DialogTitle>Detecting Contract Type</DialogTitle>
              <DialogDescription>
                Our AI is analyzing your contract to determine its type...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing contract content...
              </p>
            </div>
          </>
        )}

        {workflowStep === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Contract Type Detected</DialogTitle>
              <DialogDescription>
                We have detected that your contract is a <strong>{detectedType}</strong>. Would you like to analyze it with our AI?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-4">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium">
                Contract Type: <span className="text-primary">{detectedType}</span>
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                No, Try Again
              </Button>
              <Button onClick={handleAnalyze}>
                Yes, Analyze
              </Button>
            </DialogFooter>
          </>
        )}

        {workflowStep === 'analyzing' && (
          <>
            <DialogHeader>
              <DialogTitle>Analyzing Contract</DialogTitle>
              <DialogDescription>
                Our AI is performing a comprehensive analysis of your contract...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-8">
              <Brain className="h-8 w-8 mx-auto text-primary" />
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                Analyzing risks, opportunities, and key clauses...
              </p>
            </div>
          </>
        )}

        {workflowStep === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>
                Your contract has been analyzed successfully by our AI. You can now view the results.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-4">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-lg font-medium text-green-600">
                Analysis Complete!
              </p>
              {analysisResult && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Score: {analysisResult.score}/100
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-700">
                    Type: {analysisResult.detected_type}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={handleViewResults}>
                View AI Analysis Results
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
} 