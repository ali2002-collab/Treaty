import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If there's an auth error, clear the session and redirect to signin
    if (error) {
      console.error('Middleware auth error:', error)
      
      // Clear any invalid cookies and redirect
      const response = NextResponse.redirect(new URL('/signin', request.url))
      response.cookies.delete('sb-access-token')
      response.cookies.delete('sb-refresh-token')
      return response
    }

    // If accessing dashboard without session, redirect to signin
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/signin', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If we have a session, try to refresh it if needed
    if (session) {
      try {
        // Check if token needs refresh (this will automatically refresh if needed)
        const { data: { user }, error: refreshError } = await supabase.auth.getUser()
        
        if (refreshError) {
          console.error('Token refresh error:', refreshError)
          // If refresh fails, clear session and redirect to signin
          const response = NextResponse.redirect(new URL('/signin', request.url))
          response.cookies.delete('sb-access-token')
          response.cookies.delete('sb-refresh-token')
          return response
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // If refresh fails, clear session and redirect to signin
        const response = NextResponse.redirect(new URL('/signin', request.url))
        response.cookies.delete('sb-access-token')
        response.cookies.delete('sb-refresh-token')
        return response
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    
    // If there's any error, redirect to signin and clear cookies
    const response = NextResponse.redirect(new URL('/signin', request.url))
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
} 