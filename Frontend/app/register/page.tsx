"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { register } from "@/lib/api"
import { useAuth } from "@/store/auth"
import { API_URL } from "@/config"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser, setToken } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      console.log(`Registering user with email: ${email}, name: ${name}, API URL: ${API_URL}`);
      const response = await register(name, email, password)
      console.log('Registration response:', response);
      
      if (!response.access_token || !response.user) {
        console.error('Invalid registration response:', response);
        setError("Invalid response from server");
        setIsLoading(false);
        return;
      }
      
      // Set token in auth store
      setToken(response.access_token);
      
      // Set user in auth store
      setUser(response.user);
      
      // Set token in cookie manually
      document.cookie = `token=${response.access_token}; path=/; max-age=86400; secure; samesite=lax`;
      
      console.log('Registration successful, redirecting to account page');
      
      // Use a timeout to ensure state is updated before redirect
      setTimeout(() => {
        router.push("/account");
      }, 500);
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Register</h1>
      <div className="text-center mb-4">
        <p>Connected to API: <code className="bg-gray-100 p-1 rounded">{API_URL}</code></p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <Input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            disabled={isLoading}
            required 
          />
        </div>
        <div className="mb-4">
          <Input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            disabled={isLoading}
            required 
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
        <p className="mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

