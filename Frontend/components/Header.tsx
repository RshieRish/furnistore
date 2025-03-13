"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Calculator, Menu, X } from "lucide-react"
import useStore from "@/store/store"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { cart, user } = useStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            FurniStore
          </Link>
          
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch}>
              <Input
                type="search"
                placeholder="Search for furniture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </form>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/estimate">
              <Button variant="ghost" className="flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                Estimate
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.items.length}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link href="/account">
                <Button variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        
        {/* Mobile search */}
        <div className="mt-4 md:hidden">
          <form onSubmit={handleSearch}>
            <Input
              type="search"
              placeholder="Search for furniture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </form>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="mt-4 md:hidden flex flex-col space-y-2 pb-4">
            <Link href="/estimate">
              <Button variant="ghost" className="w-full justify-start">
                <Calculator className="mr-2 h-4 w-4" />
                Estimate
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost" className="w-full justify-start relative">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
                {cart.items.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.items.length}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Link href="/account">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="mr-2 h-5 w-5" />
                  My Account
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start">Login</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full justify-start">Register</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

