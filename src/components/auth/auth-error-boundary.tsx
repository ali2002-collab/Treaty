"use client"

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { signOutClient } from '@/lib/auth-client'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('Auth error boundary caught an error:', error, errorInfo)
    
    // Check if this is an auth-related error
    if (error.message?.includes('Invalid Refresh Token') || 
        error.message?.includes('Refresh Token Not Found') ||
        error.message?.includes('JWT expired')) {
      // Handle auth errors by signing out
      signOutClient()
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleSignOut = () => {
    signOutClient()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Authentication Error
                </h1>
                <p className="text-muted-foreground">
                  {this.state.error?.message || 'An authentication error occurred'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleSignOut} variant="destructive">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 