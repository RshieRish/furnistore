"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { getProducts } from "@/lib/api"

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  category: string
  isFeatured: boolean
}

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true)
        const products = await getProducts()
        // Filter for featured products or take the first 4 if none are marked as featured
        const featured = products.filter((product: any) => product.isFeatured).slice(0, 4)
        
        // If no featured products, just take the first 4
        setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 4))
        setError(null)
      } catch (err) {
        console.error("Failed to fetch featured products:", err)
        setError("Failed to load featured products. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium furniture pieces that combine style, comfort, and durability.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
              <CardHeader className="p-0">
                <div className="relative h-64 w-full">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
                  {product.category}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <Link href={`/product/${product._id}`} className="block">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-primary font-medium mt-2">
                  ${product.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

