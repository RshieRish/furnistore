"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import useStore from "@/store/store"
import { getOrders } from "@/lib/api"

interface Order {
  id: number
  date: string
  total: number
  status: string
}

export default function AccountPage() {
  const { user, logout } = useStore()
  const [orders, setOrders] = useState<Order[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    } else {
      fetchOrders()
    }
  }, [user, router])

  const fetchOrders = async () => {
    try {
      const fetchedOrders = await getOrders(user?.id.toString() || "")
      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Account</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <Button onClick={handleLogout} className="mt-4">
          Logout
        </Button>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
        {orders.length === 0 ? (
          <p>You haven't placed any orders yet.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="border p-4 rounded-lg">
                <p>Order ID: {order.id}</p>
                <p>Date: {order.date}</p>
                <p>Total: ${order.total.toFixed(2)}</p>
                <p>Status: {order.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

