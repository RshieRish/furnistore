"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getProduct } from "@/lib/api"
import useStore from "@/store/store"
import { ShoppingCart } from "lucide-react"

interface Product {
  _id: string
  name: string
  price: number
  description: string
  images: string[]
  category: string
  material: string
  style: string
  color: string
  features?: string[]
  stockQuantity: number
  rating?: number
  reviews?: number
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { cart } = useStore()
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const fetchedProduct = await getProduct(id as string)
        setProduct(fetchedProduct)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch product:", err)
        setError("Failed to load product. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      cart.addItem({
        id: parseInt(product._id) || Math.floor(Math.random() * 10000),
        name: product.name,
        price: product.price,
        quantity: 1
      })
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center py-8">Loading product details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 text-center py-8">{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center py-8">Product not found</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={imageError ? "/placeholder.svg" : (product.images?.[0] || "/placeholder.svg")}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-auto rounded-lg shadow-md"
            onError={handleImageError}
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-yellow-400 mr-1">★</span>
            <span className="text-gray-700">{product.rating?.toFixed(1) || "N/A"} ({product.reviews || 0} reviews)</span>
          </div>
          <p className="text-2xl font-semibold text-primary mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700">Category</h3>
              <p>{product.category}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Material</h3>
              <p>{product.material}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Style</h3>
              <p>{product.style}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Color</h3>
              <p>{product.color}</p>
            </div>
          </div>
          
          {product.features && product.features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Features</h3>
              <ul className="list-disc pl-5">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Availability</h3>
            <p className={product.stockQuantity > 0 ? "text-green-600" : "text-red-600"}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity} available)` : "Out of Stock"}
            </p>
          </div>
          
          <Button 
            onClick={handleAddToCart} 
            className="w-full md:w-auto"
            disabled={product.stockQuantity <= 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

