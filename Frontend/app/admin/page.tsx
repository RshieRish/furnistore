"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { adminApi } from "@/lib/api"
import useStore from "@/store/store"
import { Furniture, Estimate, Order } from "@/types"

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useStore()
  const [loading, setLoading] = useState(true)
  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [newFurniture, setNewFurniture] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    console.log('Admin dashboard mounted, user:', user);
    
    if (!user) {
      console.log('No user found, redirecting to login');
      window.location.href = '/login';
      return;
    }

    if (!user.role || user.role !== 'admin' || !user.isAdmin) {
      console.log('User is not admin, redirecting to home');
      window.location.href = '/';
      return;
    }

    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching admin data...');
      const [furnitureData, estimatesData, ordersData] = await Promise.all([
        adminApi.getFurniture(),
        adminApi.getEstimates(),
        adminApi.getOrders()
      ])
      console.log('Admin data fetched:', { furnitureData, estimatesData, ordersData });
      setFurniture(furnitureData)
      setEstimates(estimatesData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateFurniture = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('name', newFurniture.name)
      formData.append('price', newFurniture.price)
      formData.append('category', newFurniture.category)
      formData.append('description', newFurniture.description)
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      await adminApi.createFurniture(formData)
      setIsAddDialogOpen(false)
      setNewFurniture({
        name: "",
        price: "",
        category: "",
        description: "",
      })
      setSelectedImage(null)
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      fetchData()
    } catch (error) {
      console.error('Failed to create furniture:', error)
      setError("Failed to create furniture")
    }
  }

  const handleUpdateFurniture = async (id: string, status: string) => {
    try {
      await adminApi.updateFurniture(id, { status })
      fetchData()
    } catch (error) {
      console.error('Failed to update furniture:', error)
    }
  }

  const handleDeleteFurniture = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this furniture?')) {
      try {
        await adminApi.deleteFurniture(id)
        fetchData()
      } catch (error) {
        console.error('Failed to delete furniture:', error)
      }
    }
  }

  const handleUpdateEstimate = async (estimateId: string, status: string) => {
    try {
      await adminApi.updateEstimate(estimateId, status)
      const updatedEstimates = await adminApi.getEstimates()
      setEstimates(updatedEstimates)
    } catch (error) {
      console.error('Failed to update estimate:', error)
    }
  }

  const handleUpdateOrder = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrder(orderId, status)
      const updatedOrders = await adminApi.getOrders()
      setOrders(updatedOrders)
    } catch (error) {
      console.error('Failed to update order:', error)
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="text-right mb-4">
        <p>Welcome back, {user?.name || 'Admin User'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{orders.length}</p>
            <Button 
              variant="link" 
              className="p-0 mt-2"
              onClick={() => router.push('/admin/orders')}
            >
              View All Orders →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{estimates.length}</p>
            <Button 
              variant="link" 
              className="p-0 mt-2"
              onClick={() => router.push('/admin/estimates')}
            >
              View All Estimates →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Furniture Items</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{furniture.length}</p>
            <Button 
              variant="link" 
              className="p-0 mt-2"
              onClick={() => router.push('/admin/furniture')}
            >
              Manage Inventory →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="furniture">
        <TabsList className="mb-4">
          <TabsTrigger value="furniture">Furniture</TabsTrigger>
          <TabsTrigger value="estimates">Estimates</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="furniture">
          <div className="mb-4">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Furniture</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Furniture</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateFurniture} className="space-y-4">
                  <Input
                    placeholder="Name"
                    value={newFurniture.name}
                    onChange={(e) => setNewFurniture({ ...newFurniture, name: e.target.value })}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newFurniture.price}
                    onChange={(e) => setNewFurniture({ ...newFurniture, price: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Category"
                    value={newFurniture.category}
                    onChange={(e) => setNewFurniture({ ...newFurniture, category: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Description"
                    value={newFurniture.description}
                    onChange={(e) => setNewFurniture({ ...newFurniture, description: e.target.value })}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Upload Image
                    </label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    {previewUrl && (
                      <div className="mt-2">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <Button type="submit">Create Furniture</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {furniture.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Price: ${item.price}</p>
                  <p>Category: {item.category}</p>
                  <p>Status: {item.status}</p>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover rounded-md my-2"
                    />
                  )}
                  <div className="mt-4 space-x-2">
                    <Select
                      onValueChange={(value) => handleUpdateFurniture(item.id, value)}
                      defaultValue={item.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFurniture(item.id)}
                      className="mt-2"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estimates">
          <div className="grid gap-4">
            {estimates.map((estimate) => (
              <Card key={estimate.id}>
                <CardHeader>
                  <CardTitle>Estimate Request</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Customer:</strong> {estimate.userId?.name ? `${estimate.userId.name} (${estimate.userId.email})` : 'Unknown User'}</p>
                    <p><strong>Requirements:</strong> {estimate.requirements}</p>
                    <p><strong>Price:</strong> ${estimate.price}</p>
                    <p><strong>Status:</strong> {estimate.status}</p>
                    <p><strong>Created:</strong> {new Date(estimate.createdAt).toLocaleDateString()}</p>
                    {estimate.imageUrl && (
                      <div className="mt-4">
                        <p><strong>Reference Image:</strong></p>
                        <img
                          src={estimate.imageUrl}
                          alt="Estimate reference"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <div className="mt-4">
                      <p><strong>Explanation:</strong></p>
                      <p className="text-sm text-gray-600">{estimate.explanation}</p>
                    </div>
                    <div className="mt-4">
                      <Select
                        onValueChange={(value) => handleUpdateEstimate(estimate.id, value)}
                        defaultValue={estimate.status}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>Order #{order.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>User: {order.userId}</p>
                  <p>Total: ${order.total}</p>
                  <p>Status: {order.status}</p>
                  <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="mt-4">
                    <Select
                      onValueChange={(value) => handleUpdateOrder(order.id, value)}
                      defaultValue={order.status}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 