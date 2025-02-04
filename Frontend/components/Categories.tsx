import type React from "react"
import { Button } from "@/components/ui/button"

const categories = ["Living Room", "Bedroom", "Dining Room", "Office", "Outdoor"]

const Categories: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Button key={category} variant="outline">
              {category}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories

