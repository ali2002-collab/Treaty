"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Upload, X, Loader2 } from "lucide-react"
import { uploadAndProcessContract } from "@/app/(actions)/upload-and-process-contract"
import { toast } from "sonner"

interface NewContractDialogProps {
  onContractAdded: () => void
}

export function NewContractDialog({ onContractAdded }: NewContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    
    try {
      // Create FormData for the server action
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const result = await uploadAndProcessContract(formData)
      
      if (result.success) {
        toast.success("Contract uploaded and processed successfully!")
        onContractAdded() // Refresh the dashboard
        resetForm()
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to process contract")
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
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
          <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {selectedFile?.type === 'application/pdf' ? 'Processing PDF...' : 'Processing DOCX...'}
              </>
            ) : (
              "Analyze with AI"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 