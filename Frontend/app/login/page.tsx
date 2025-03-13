"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { API_URL } from "@/config"

// Component that uses useSearchParams
function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isHydrated, setUser, setToken } = useAuth()

  useEffect(() => {
    // Log initial state
    console.log('Login page mounted. Auth state:', {
      isHydrated,
      hasUser: !!user,
      user,
      isRedirecting
    });

    if (isHydrated && user && !isRedirecting) {
      setIsRedirecting(true); // Prevent multiple redirects
      console.log('User authenticated, redirecting:', { user });
      
      // Get the redirect destination
      const from = searchParams.get('from');
      
      if (user.role === 'admin' && user.isAdmin) {
        console.log('Admin user detected, redirecting to:', from || '/admin/dashboard');
        // Use push instead of replace for more reliable navigation
        router.push(from || '/admin/dashboard');
      } else {
        console.log('Regular user detected, redirecting to account');
        router.push('/account');
      }
    }
  }, [user, isHydrated, router, isRedirecting, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading || isRedirecting) return;
    
    setError("")
    setIsLoading(true)
    console.log('Starting login process with:', { email, apiUrl: API_URL });

    try {
      const response = await login(email, password)
      console.log('Login successful:', JSON.stringify(response, null, 2))
      
      if (!response.user || !response.user.role) {
        console.error('Invalid user data in response:', response)
        setError("Invalid response from server")
        return
      }

      // Update auth store
      setToken(response.access_token);
      setUser(response.user);

      // Manual redirect for admin users to ensure it works
      if (response.user.role === 'admin' && response.user.isAdmin) {
        console.log('Admin login detected, redirecting to dashboard');
        // Use window.location for a full page reload to ensure clean state
        window.location.href = '/admin/dashboard';
        return;
      }

      // Let the useEffect handle redirection for non-admin users
      setIsRedirecting(true);

    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message === 'Failed to fetch') {
        setError("Could not connect to server. Please try again.")
      } else {
        setError(error.message || "Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show redirecting state
  if (isRedirecting) {
    const from = searchParams.get('from');
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Redirecting to {from || 'dashboard'}...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <Input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading || isRedirecting}
            required 
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isRedirecting}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading || isRedirecting}>
          {isLoading ? 'Logging in...' : isRedirecting ? 'Redirecting...' : 'Login'}
        </Button>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

// Loading fallback
function LoginLoading() {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl mb-4">Loading...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}

