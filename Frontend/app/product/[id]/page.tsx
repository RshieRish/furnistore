"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getProduct } from "@/lib/api"
import useStore from "@/store/store"

interface Product {
  id: number
  name: string
  price: number
  description: string
  image: string
  category: string
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const { cart } = useStore()

  useEffect(() => {
    const fetchProduct = async () => {
      const fetchedProduct = await getProduct(Number(id))
      setProduct(fetchedProduct)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      cart.addItem(product)
    }
  }

  if (!product) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-auto"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <Button onClick={handleAddToCart} className="w-full md:w-auto">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}

