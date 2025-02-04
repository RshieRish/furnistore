import type React from "react"
import { Button } from "@/components/ui/button"

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gray-100 py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Furniture Store</h1>
          <p className="text-xl mb-8">Discover beautiful, high-quality furniture for every room in your home.</p>
          <Button size="lg">Shop Now</Button>
        </div>
      </div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-20 bg-cover bg-center" />
    </section>
  )
}

export default Hero

