"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"
import useStore from "@/store/store"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { user, setUser } = useStore()

  useEffect(() => {
    // Check if user is already logged in
    if (user) {
      console.log('User already logged in:', user);
      if (user.role === 'admin' && user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    console.log('Attempting login with:', { email }); // Debug log

    try {
      const response = await login(email, password)
      console.log('Login response:', JSON.stringify(response, null, 2)) // Pretty print response
      
      if (!response.user || !response.user.role) {
        console.error('Invalid user data in response:', response)
        setError("Invalid response from server")
        return
      }

      // Set user in store
      setUser(response.user)
      console.log('User data set in store:', response.user) // Debug log
      
      // Force navigation
      if (response.user.role === 'admin' && response.user.isAdmin) {
        console.log('User is admin, forcing navigation to admin dashboard')
        window.location.href = '/admin'
      } else {
        console.log('User is not admin, forcing navigation to account page')
        window.location.href = '/account'
      }
    } catch (error: any) {
      console.error('Login error details:', error)
      setError(error.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Login</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Login
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

