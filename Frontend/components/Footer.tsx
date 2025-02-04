import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 mt-8">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">About Us</h3>
            <p>Your one-stop shop for modern furniture.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/shipping">Shipping</Link>
              </li>
              <li>
                <Link href="/returns">Returns</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/living-room">Living Room</Link>
              </li>
              <li>
                <Link href="/category/bedroom">Bedroom</Link>
              </li>
              <li>
                <Link href="/category/dining-room">Dining Room</Link>
              </li>
              <li>
                <Link href="/category/office">Office</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Connect With Us</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  Pinterest
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2023 FurniStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

