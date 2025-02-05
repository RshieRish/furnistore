export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isAdmin: boolean
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
}

export interface Furniture {
  id: string
  name: string
  price: number
  category: string
  status: string
  description?: string
  imageUrl?: string
}

export interface Estimate {
  id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  imageUrl: string
  requirements: string
  price: number
  explanation: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Order {
  id: string
  userId: string
  total: number
  status: string
  items: Array<{
    furnitureId: string
    quantity: number
    price: number
  }>
  createdAt: string
} 