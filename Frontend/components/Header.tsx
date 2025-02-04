"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShoppingCart, User, Calculator } from "lucide-react"
import useStore from "@/store/store"

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { cart, user } = useStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          FurniStore
        </Link>
        <form onSubmit={handleSearch} className="flex-1 mx-4">
          <Input
            type="search"
            placeholder="Search for furniture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </form>
        <nav className="flex items-center space-x-4">
          <Link href="/estimate">
            <Button variant="ghost">
              <Calculator className="mr-2 h-4 w-4" />
              Estimate
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" className="relative">
              <ShoppingCart />
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
                <User />
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
        </nav>
      </div>
    </header>
  )
}

