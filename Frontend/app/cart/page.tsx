"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useStore from "@/store/store"

export default function CartPage() {
  const { cart } = useStore()
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({})

  const handleQuantityChange = (id: number, quantity: number) => {
    setQuantities({ ...quantities, [id]: quantity })
    cart.updateQuantity(id, quantity)
  }

  const handleRemoveItem = (id: number) => {
    cart.removeItem(id)
  }

  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      {cart.items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link href="/products" className="text-blue-500 hover:underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    min="1"
                    value={quantities[item.id] || item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                    className="w-20"
                  />
                  <Button variant="destructive" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <p className="text-2xl font-bold">Total: ${total.toFixed(2)}</p>
            <Button className="mt-4">Proceed to Checkout</Button>
          </div>
        </>
      )}
    </div>
  )
}

