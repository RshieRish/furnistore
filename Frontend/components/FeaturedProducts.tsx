import type React from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// This is a mock data array. In a real application, this would come from an API or database
const featuredProducts = [
  { id: 1, name: "Modern Sofa", price: 999, image: "/placeholder.svg" },
  { id: 2, name: "Elegant Dining Table", price: 599, image: "/placeholder.svg" },
  { id: 3, name: "Cozy Armchair", price: 399, image: "/placeholder.svg" },
]

const FeaturedProducts: React.FC = () => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={200}
                className="w-full h-48 object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle>{product.name}</CardTitle>
              <p className="text-2xl font-bold mt-2">${product.price}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default FeaturedProducts

