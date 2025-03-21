"use client"

import { useEffect } from 'react'
import { useAuth } from '@/store/auth'
import { Toaster } from '@/components/ui/toaster'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { API_URL } from '@/config'
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser, setToken } = useAuth()

  useEffect(() => {
    // Check for existing token in cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1]

    if (token) {
      // Fetch user profile with token
      fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setToken(token)
        }
      })
      .catch(console.error)
    }
  }, [setUser, setToken])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  )
} 