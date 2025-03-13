import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">About Us</h3>
            <p className="text-gray-600">Your one-stop shop for modern furniture.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary transition-colors">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-primary transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/category/living-room" className="text-gray-600 hover:text-primary transition-colors">
                  Living Room
                </Link>
              </li>
              <li>
                <Link href="/category/bedroom" className="text-gray-600 hover:text-primary transition-colors">
                  Bedroom
                </Link>
              </li>
              <li>
                <Link href="/category/dining-room" className="text-gray-600 hover:text-primary transition-colors">
                  Dining Room
                </Link>
              </li>
              <li>
                <Link href="/category/office" className="text-gray-600 hover:text-primary transition-colors">
                  Office
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Connect With Us</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} FurniStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

