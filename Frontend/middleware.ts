import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to decode JWT payload
function decodeJWT(token: string) {
  try {
    const base64Payload = token.split('.')[1]
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8')
    return JSON.parse(payload)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  console.log('Middleware processing path:', request.nextUrl.pathname)
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value
  console.log('Token present:', !!token)

  // Create a new URL for potential redirects
  const url = new URL(request.url)
  
  // If we're already on the login page
  if (request.nextUrl.pathname === '/login') {
    // If we have a token, verify it
    if (token) {
      try {
        const payload = decodeJWT(token)
        console.log('Login page token payload:', payload)
        
        if (payload && payload.role === 'admin' && payload.isAdmin) {
          // Check if we're being redirected from somewhere
          const from = request.nextUrl.searchParams.get('from')
          if (from) {
            // Redirect to the original destination
            url.pathname = from
          } else {
            // Default redirect to dashboard
            url.pathname = '/admin/dashboard'
          }
          console.log('Redirecting authenticated admin to:', url.pathname)
          return NextResponse.redirect(url)
        }
      } catch (error) {
        console.error('Token verification error:', error)
        // Clear invalid token
        const response = NextResponse.next()
        response.cookies.delete('token')
        return response
      }
    }
    return NextResponse.next()
  }

  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Processing admin route')
    
    if (!token) {
      console.log('No token found, redirecting to login')
      url.pathname = '/login'
      url.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    try {
      const payload = decodeJWT(token)
      console.log('Admin route token payload:', payload)
      
      // Check if the user has admin role and isAdmin flag
      if (!payload || payload.role !== 'admin' || !payload.isAdmin) {
        console.log('Access denied:', payload)
        url.pathname = '/'
        return NextResponse.redirect(url)
      }

      console.log('Admin access granted')
      return NextResponse.next()
    } catch (error) {
      console.error('Admin route error:', error)
      url.pathname = '/login'
      url.searchParams.set('from', request.nextUrl.pathname)
      const response = NextResponse.redirect(url)
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login']
} 