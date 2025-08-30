"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Brain, Send, Loader2 } from "lucide-react"
import { chatWithAI } from "@/app/(actions)/chat-with-ai"

interface AIChatButtonProps {
  contractId: string
  contractType: string
}

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function AIChatButton({ contractId, contractType }: AIChatButtonProps) {
  const displayType = contractType || 'Contract'
  const [showAIChat, setShowAIChat] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: `Hello! I'm your AI contract assistant. I have full access to your ${displayType} contract and can answer any questions about its terms, clauses, risks, opportunities, and analysis. 

What would you like to know about your contract? You can ask about:
• Specific clauses (payment, termination, confidentiality, etc.)
• Risk assessment and opportunities
• Negotiation points
• Contract analysis insights
• Any other contract-related questions

I'm here to help you understand every aspect of your contract!`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Reset messages when dialog opens
  const handleOpenDialog = () => {
    setMessages([
      {
        role: 'ai',
        content: `Hello! I'm your AI contract assistant. I have full access to your ${displayType} contract and can answer any questions about its terms, clauses, risks, opportunities, and analysis. 

What would you like to know about your contract? You can ask about:
• Specific clauses (payment, termination, confidentiality, etc.)
• Risk assessment and opportunities
• Negotiation points
• Contract analysis insights
• Any other contract-related questions

I'm here to help you understand every aspect of your contract!`,
        timestamp: new Date()
      }
    ])
    setInputValue('')
    setIsLoading(false)
    setShowAIChat(true)
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Call the real AI service with contract context
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      const result = await chatWithAI(contractId, userMessage.content, chatHistory)
      
      if (result.success) {
        const aiResponse: ChatMessage = {
          role: 'ai',
          content: result.response,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        // Handle AI service error
        const errorResponse: ChatMessage = {
          role: 'ai',
          content: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment. Error: ${result.error}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (error) {
      console.error('AI chat error:', error)
      const errorResponse: ChatMessage = {
        role: 'ai',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCloseDialog = () => {
    setShowAIChat(false)
    // Reset state after a short delay to allow animation to complete
    setTimeout(() => {
      setMessages([
        {
          role: 'ai',
          content: `Hello! I'm your AI contract assistant. I have full access to your ${displayType} contract and can answer any questions about its terms, clauses, risks, opportunities, and analysis. 

What would you like to know about your contract? You can ask about:
• Specific clauses (payment, termination, confidentiality, etc.)
• Risk assessment and opportunities
• Negotiation points
• Contract analysis insights
• Any other contract-related questions

I'm here to help you understand every aspect of your contract!`,
          timestamp: new Date()
        }
      ])
      setInputValue('')
      setIsLoading(false)
    }, 200)
  }

  return (
    <>
      <Button 
        onClick={handleOpenDialog}
        className="ml-auto"
        size="sm"
      >
        <Brain className="h-4 w-4 mr-2" />
        Ask AI
      </Button>

      <Dialog open={showAIChat} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[700px] h-[700px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chat with AI about your contract</DialogTitle>
            <DialogDescription>
              Ask questions about your {displayType} contract. The AI has full context of your contract.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/20 rounded-lg">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg break-words ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-background border p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking.</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Question */}
            <div className="text-center">
              <button
                onClick={() => setInputValue("What are the specific conditions for contract termination?")}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                What are the specific conditions for contract termination?
              </button>
            </div>

            {/* Input */}
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Thinking Status */}
            {isLoading && (
              <div className="text-center text-sm text-muted-foreground">
                Thinking.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 