import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for categories
const categories = [
  {
    id: 1,
    name: "Living Room",
    image: "/images/living-room.jpg",
    count: 24
  },
  {
    id: 2,
    name: "Bedroom",
    image: "/images/bedroom.jpg",
    count: 18
  },
  {
    id: 3,
    name: "Dining Room",
    image: "/images/dining-room.jpg",
    count: 12
  },
  {
    id: 4,
    name: "Office",
    image: "/images/office.jpg",
    count: 15
  }
]

export default function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our curated collections of furniture designed for every room in your home.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.name.toLowerCase().replace(" ", "-")}`}
              className="block group"
            >
              <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg border-0">
                <CardContent className="p-0 relative">
                  <div className="relative h-80 w-full">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} Products</p>
                    <div className="mt-4 bg-white text-primary px-4 py-2 rounded-full text-sm font-medium opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Shop Now
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

