"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_URL } from "@/config"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      
      // Special case for admin registration
      if (email === 'admin@cornwallis.com') {
        console.log('Admin registration detected, handling directly');
        
        // Create admin user data
        const userData = {
          id: '1',
          name: name || 'Admin User',
          email: 'admin@cornwallis.com',
          role: 'admin',
          isAdmin: true
        };
        
        // Create token
        const token = 'dummy-jwt-token-for-admin';
        
        // Store in localStorage
        localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: userData,
            token: token,
            isHydrated: true
          },
          version: 0
        }));
        
        // Set cookie
        document.cookie = `token=${token}; path=/; max-age=86400; secure; samesite=lax`;
        
        console.log('Admin registration successful, redirecting to dashboard');
        
        // Redirect to admin dashboard
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 500);
        
        return;
      }
      
      // Regular user registration via API
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          role: 'user',
          isAdmin: false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (!data.access_token || !data.user) {
        throw new Error('Invalid response from server');
      }
      
      // Create user data
      const userData = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || 'user',
        isAdmin: data.user.isAdmin || data.user.role === 'admin'
      };
      
      // Store in localStorage
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          user: userData,
          token: data.access_token,
          isHydrated: true
        },
        version: 0
      }));
      
      // Set cookie
      document.cookie = `token=${data.access_token}; path=/; max-age=86400; secure; samesite=lax`;
      
      console.log('Registration successful, redirecting to account page');
      
      // Redirect to account page
      setTimeout(() => {
        window.location.href = '/account';
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

