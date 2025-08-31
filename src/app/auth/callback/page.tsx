"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Container } from '@/components/ui/container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function AuthCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth parameters from the URL
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        
        if (!token || !type) {
          setStatus('error')
          setMessage('Invalid verification link. Please try again or contact support.')
          return
        }

        // Handle the auth callback
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: type as any,
        })

        if (error) {
          console.error('Auth callback error:', error)
          setStatus('error')
          setMessage(error.message || 'Verification failed. Please try again.')
          return
        }

        // Success
        setStatus('success')
        setMessage('Email verified successfully! You can now sign in to your account.')
        
        // Redirect to signin after a short delay with verification success parameter
        setTimeout(() => {
          try {
            router.push('/signin?verified=true')
          } catch (redirectError) {
            // Fallback: use window.location if router fails
            console.warn('Router redirect failed, using fallback:', redirectError)
            window.location.href = '/signin?verified=true'
          }
        }, 2000)
        
      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred. Please try again.')
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase.auth])

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />
    }
  }

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...'
      case 'success':
        return 'Email verified successfully!'
      case 'error':
        return 'Verification failed'
    }
  }

  const getStatusDescription = () => {
    switch (status) {
      case 'loading':
        return 'Please wait while we verify your email address.'
      case 'success':
        return message
      case 'error':
        return message
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Container className="max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full flex items-center justify-center">
                {getStatusIcon()}
              </div>
            </div>
            <CardTitle className="text-2xl">{getStatusTitle()}</CardTitle>
            <CardDescription className="text-base">
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Redirecting you to sign in automatically in 2 seconds...
                </p>
                <Button asChild className="w-full">
                  <Link href="/signin?verified=true">Sign In Now (Don't Wait)</Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Or wait for automatic redirect...
                </p>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <Button asChild>
                  <Link href="/signin">Try Again</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Container className="max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900/20 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription className="text-base">
                Please wait while we prepare the verification page.
              </CardDescription>
            </CardHeader>
          </Card>
        </Container>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
} 