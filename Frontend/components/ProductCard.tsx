import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import useStore from "@/store/store"

interface Product {
  id: number
  name: string
  price: number
  image: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { cart } = useStore()

  const handleAddToCart = () => {
    cart.addItem(product)
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Link href={`/product/${product.id}`}>
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover"
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

