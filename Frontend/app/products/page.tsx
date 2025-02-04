"use client"

import { useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getProducts } from "@/lib/api"
import { Box } from "@/components/ui/box"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
}

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [category, setCategory] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getProducts(category)
      setProducts(fetchedProducts)
      setFilteredProducts(fetchedProducts)
      setError(null)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setError("Failed to load products. Please try again later.")
    }
  }

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "" || product.category === category
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesCategory && matchesPrice
    })
    setFilteredProducts(filtered)
  }, [products, category, priceRange])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      {error && (
        <Box p={4} bg="red.100" color="red.900" borderRadius="md" mb={4}>
          {error}
        </Box>
      )}
      <div className="flex flex-wrap mb-8">
        <div className="w-full md:w-1/4 mb-4 md:mb-0 pr-4">
          <Select value={category} onValueChange={(value) => setCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="living-room">Living Room</SelectItem>
              <SelectItem value="bedroom">Bedroom</SelectItem>
              <SelectItem value="dining-room">Dining Room</SelectItem>
              <SelectItem value="office">Office</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/4 mb-4 md:mb-0 pr-4">
          <Input
            type="number"
            placeholder="Min Price"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
          />
        </div>
        <div className="w-full md:w-1/4 mb-4 md:mb-0">
          <Input
            type="number"
            placeholder="Max Price"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

