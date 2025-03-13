"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { getProducts } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ProductCard from "@/components/ProductCard"

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  category: string
  description: string
  material: string
  style: string
  color: string
}

export default function ProductListingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [category, setCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const fetchedProducts = await getProducts(category)
      setProducts(fetchedProducts)
      setFilteredProducts(fetchedProducts)
      setError(null)
    } catch (error) {
      console.error("Failed to fetch products:", error)
      setError("Failed to load products. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "" || product.category === category
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.color.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesPrice && matchesSearch
    })
    setFilteredProducts(filtered)
  }, [products, category, priceRange, searchQuery])

  const handleCategoryChange = (value: string) => {
    setCategory(value === "all" ? "" : value)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">All Products</h1>
        <p className="text-center py-8">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />
      </div>
      
      <div className="flex flex-wrap mb-8">
        <div className="w-full md:w-1/4 mb-4 md:mb-0 pr-4">
          <Select value={category} onValueChange={handleCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Living Room">Living Room</SelectItem>
              <SelectItem value="Bedroom">Bedroom</SelectItem>
              <SelectItem value="Dining Room">Dining Room</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Kitchen">Kitchen</SelectItem>
              <SelectItem value="Bathroom">Bathroom</SelectItem>
              <SelectItem value="Kids">Kids</SelectItem>
              <SelectItem value="Entryway">Entryway</SelectItem>
              <SelectItem value="Storage">Storage</SelectItem>
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
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p className="col-span-full text-center py-8">No products found matching your criteria.</p>
        )}
      </div>
    </div>
  )
}

