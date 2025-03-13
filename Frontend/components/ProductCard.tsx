import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import useStore from "@/store/store"
import { useState } from "react"

interface Product {
  _id: string
  name: string
  price: number
  images: string[]
  category?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart } = useStore()
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = () => {
    cart.addItem({
      id: parseInt(product._id) || Math.floor(Math.random() * 10000),
      name: product.name,
      price: product.price,
      quantity: 1
    })
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Link href={`/product/${product._id}`}>
        <Image
          src={imageError ? "/placeholder.svg" : (product.images?.[0] || "/placeholder.svg")}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
          onError={handleImageError}
        />
      </Link>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart} className="w-full">
          Add to Cart
        </Button>
      </div>
    </div>
  )
}

