"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Mail } from "lucide-react"
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
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

    try {
      if (isSignUp) {
        const { error, data: signUpData } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
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
          setSuccess("Account created successfully! Please check your email to confirm your account before signing in.")
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
                We've sent you a confirmation link to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Please check your email and click the confirmation link to activate your account.</p>
                <p className="mt-2">Once confirmed, you can sign in with your email and password.</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={resetForm}
                  className="w-full"
                  variant="outline"
                >
                  Back to sign in
                </Button>
                
                <Button 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  I've confirmed my email
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
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          aria-label="Email address"
                          disabled={isLoading}
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
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          aria-label="Password"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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