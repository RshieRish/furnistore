import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to decode JWT payload
function decodeJWT(token: string) {
  try {
    const base64Payload = token.split('.')[1]
    const payload = Buffer.from(base64Payload, 'base64').toString('utf8')
    return JSON.parse(payload)
  } catch (error) {
    return null
  }
}

export function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const payload = decodeJWT(token)
      
      // Check if the user has admin role and isAdmin flag
      if (!payload || payload.role !== 'admin' || !payload.isAdmin) {
        console.log('Access denied:', payload)
        return NextResponse.redirect(new URL('/', request.url))
      }

      return NextResponse.next()
    } catch (error) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
} 