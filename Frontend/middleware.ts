import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to decode JWT payload
function decodeJWT(token: string) {
  try {
    console.log('Attempting to decode token:', token.substring(0, 20) + '...');
    
    // Check if it's our dummy token for admin
    if (token === 'dummy-jwt-token-for-admin') {
      console.log('Using hardcoded admin payload for dummy token');
      return {
        id: '1',
        email: 'admin@cornwallis.com',
        name: 'Admin User',
        role: 'admin',
        isAdmin: true
      };
    }
    
    // For dummy tokens with timestamp
    if (token.startsWith('dummy-jwt-token-')) {
      console.log('Using hardcoded user payload for dummy token');
      return {
        id: token.substring('dummy-jwt-token-'.length),
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        isAdmin: false
      };
    }
    
    // For real JWT tokens
    const base64Payload = token.split('.')[1]
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8')
    const parsedPayload = JSON.parse(payload);
    console.log('Decoded JWT payload:', parsedPayload);
    return parsedPayload;
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  console.log('Middleware processing path:', request.nextUrl.pathname)
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value
  console.log('Token present:', !!token, token ? `(${token.substring(0, 20)}...)` : '')

  // Create a new URL for potential redirects
  const url = new URL(request.url)
  
  // If we're already on the login page
  if (request.nextUrl.pathname === '/login') {
    // If we have a token, verify it
    if (token) {
      try {
        const payload = decodeJWT(token)
        console.log('Login page token payload:', payload)
        
        // Special case for admin token
        if (token === 'dummy-jwt-token-for-admin') {
          console.log('Admin token detected on login page, redirecting to dashboard');
          url.pathname = '/admin/dashboard';
          return NextResponse.redirect(url);
        }
        
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
        } else if (payload) {
          // Regular user with valid token
          console.log('Regular user detected on login page, redirecting to account');
          url.pathname = '/account';
          return NextResponse.redirect(url);
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
      // Special case for our dummy admin token - do this check first
      if (token === 'dummy-jwt-token-for-admin') {
        console.log('Admin access granted via dummy token');
        return NextResponse.next();
      }
      
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

  // Add matcher for account page to ensure authentication
  if (request.nextUrl.pathname === '/account') {
    console.log('Processing account route')
    
    if (!token) {
      console.log('No token found for account page, redirecting to login')
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    
    try {
      const payload = decodeJWT(token)
      console.log('Account route token payload:', payload)
      
      if (!payload) {
        console.log('Invalid token for account page')
        url.pathname = '/login'
        const response = NextResponse.redirect(url)
        response.cookies.delete('token')
        return response
      }
      
      // Valid token, allow access
      return NextResponse.next()
    } catch (error) {
      console.error('Account route error:', error)
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/account']
} 