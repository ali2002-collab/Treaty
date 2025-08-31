"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { createClient } from "@/lib/supabase-browser"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

type SignInForm = z.infer<typeof signInSchema>

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    label: string
    color: string
  }>({ score: 0, label: "Very Weak", color: "text-red-500" })
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check if user just verified their email
  useEffect(() => {
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setShowVerificationSuccess(true)
      setSuccess('Your email has been verified successfully! You can now sign in to your account.')
    }
  }, [searchParams])

  const calculatePasswordStrength = (password: string) => {
    // Don't show strength indicator if password is empty
    if (!password || password.length === 0) {
      setPasswordStrength({ score: 0, label: "", color: "text-muted-foreground" })
      return
    }

    let score = 0
    let label = "Very Weak"
    let color = "text-red-500"

    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score === 5) {
      label = "Very Strong"
      color = "text-green-500"
    } else if (score === 4) {
      label = "Strong"
      color = "text-green-600"
    } else if (score === 3) {
      label = "Good"
      color = "text-yellow-500"
    } else if (score === 2) {
      label = "Fair"
      color = "text-orange-500"
    } else if (score === 1) {
      label = "Weak"
      color = "text-red-600"
    } else {
      label = "Very Weak"
      color = "text-red-500"
    }

    setPasswordStrength({ score, label, color })
  }

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignInForm) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Check password strength for signup
    if (isSignUp && passwordStrength.score < 3) {
      setError("Please create a stronger password. Your password should be at least 'Good' strength.")
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_APP_URL 
              ? process.env.NEXT_PUBLIC_APP_URL + '/auth/callback'
              : undefined
          }
        })
        
        if (error) {
          // Handle specific error cases for duplicate accounts
          const errorMessage = error.message.toLowerCase()
          const isDuplicateAccount = 
            errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('email in use') ||
            errorMessage.includes('user already registered') ||
            error.code === '23505' || // PostgreSQL unique constraint violation
            error.status === 422 // Common status for validation errors
          
          if (isDuplicateAccount) {
            setError("An account with this email already exists. Please sign in instead.")
            setIsSignUp(false) // Switch to sign in mode
          } else {
            throw error
          }
          return
        }
        
        // Additional check: if no error but also no user data, something went wrong
        if (!signUpData || !signUpData.user) {
          setError("Signup failed. Please try again.")
          return
        }
        
        // Check if this might be a duplicate user by looking at the user data
        // If the user was created but has no identities, it might be a duplicate
        if (signUpData.user.identities && signUpData.user.identities.length === 0) {
          setError("An account with this email already exists. Please sign in instead.")
          setIsSignUp(false) // Switch to sign in mode
          return
        }
        
        // Check if email confirmation is required
        if (signUpData.user && !signUpData.session) {
          setIsEmailSent(true)
          setSuccess("Account created successfully! Please check your email to verify your account before signing in.")
          form.reset()
        } else if (signUpData.session) {
          // If session exists (email confirmation not required), redirect to dashboard
          router.push("/dashboard")
        } else {
          setError("Unexpected response from signup. Please try again.")
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        
        if (error) throw error
        
        router.push("/dashboard")
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsEmailSent(false)
    setSuccess(null)
    setError(null)
    setIsSignUp(false) // Reset to signin mode
    setPasswordStrength({ score: 0, label: "Very Weak", color: "text-red-500" })
    form.reset()
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Container className="max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent you a verification link to activate your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Please check your email and click the verification link to activate your account.</p>
                <p className="mt-2">Once verified, you can sign in with your email and password.</p>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={resetForm}
                  className="w-full"
                  variant="outline"
                >
                  Back to sign in
                </Button>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }





  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Container className="max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4">
              <span className="text-2xl font-bold text-foreground">Treaty</span>
            </div>
            <CardTitle className="text-2xl">
              {isSignUp ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Sign up to start analyzing contracts with AI"
                : "Sign in to your account to continue"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email" className="mb-2 block">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          aria-label="Email address"
                          disabled={isLoading}
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            if (showVerificationSuccess) {
                              setSuccess(null)
                              setShowVerificationSuccess(false)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password" className="mb-2 block">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          aria-label="Password"
                          disabled={isLoading}
                          onChange={(e) => {
                            field.onChange(e.target.value)
                            calculatePasswordStrength(e.target.value)
                            if (showVerificationSuccess) {
                              setSuccess(null)
                              setShowVerificationSuccess(false)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSignUp && (
                  <div className="space-y-2">
                    {form.watch('password') && form.watch('password').length > 0 && (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password strength:</span>
                          <span className={`font-medium ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-colors ${
                                level <= passwordStrength.score
                                  ? passwordStrength.score >= 4
                                    ? 'bg-green-500'
                                    : passwordStrength.score >= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <p>Password must contain:</p>
                      <ul className="mt-1 space-y-1">
                        <li className={`${form.watch('password') && form.watch('password').length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          • At least 8 characters
                        </li>
                        <li className={`${form.watch('password') && /[A-Z]/.test(form.watch('password')) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          • One uppercase letter
                        </li>
                        <li className={`${form.watch('password') && /[a-z]/.test(form.watch('password')) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          • One lowercase letter
                        </li>
                        <li className={`${form.watch('password') && /[0-9]/.test(form.watch('password')) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          • One number
                        </li>
                        <li className={`${form.watch('password') && /[^A-Za-z0-9]/.test(form.watch('password')) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          • One special character
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-3 rounded-md">
                    {success}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  aria-label={isSignUp ? "Create account" : "Sign in"}
                >
                  {isLoading ? "Loading..." : (isSignUp ? "Create account" : "Sign in")}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError(null)
                  setSuccess(null)
                  setShowVerificationSuccess(false)
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {isSignUp 
                  ? "Already have an account? Sign in" 
                  : "Don't have an account? Create one"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Container className="max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to home
            </Link>
          </div>
          
          <Card>
            <CardHeader className="text-center">
              <div className="mb-4">
                <span className="text-2xl font-bold text-foreground">Treaty</span>
              </div>
              <CardTitle className="text-2xl">Loading...</CardTitle>
              <CardDescription>Please wait...</CardDescription>
            </CardHeader>
          </Card>
        </Container>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}