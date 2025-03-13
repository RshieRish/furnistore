import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative h-[600px] bg-[url('/images/hero-bg.jpg')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-start">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Elevate Your Space with Modern Furniture
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Discover premium quality furniture that combines style, comfort, and functionality for every room in your home.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/products">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-black" asChild>
              <Link href="/collections">View Collections</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

