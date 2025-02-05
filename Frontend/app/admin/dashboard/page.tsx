"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import Link from 'next/link'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { adminApi } from '@/lib/api'

interface DashboardStats {
  totalOrders: number;
  totalEstimates: number;
  totalFurniture: number;
  recentOrders: any[];
  recentEstimates: any[];
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || !user.isAdmin) {
      router.replace('/login');
      return;
    }

    loadDashboardData();
  }, [user, isHydrated, router]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [orders, estimates, furniture] = await Promise.all([
        adminApi.getOrders(),
        adminApi.getEstimates(),
        adminApi.getFurniture()
      ]);

      setStats({
        totalOrders: orders.length,
        totalEstimates: estimates.length,
        totalFurniture: furniture.length,
        recentOrders: orders.slice(0, 5),
        recentEstimates: estimates.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading Dashboard...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome back, {user?.name || user?.email}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search orders, estimates, or furniture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Orders</h3>
          <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
          <Link href="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
            View All Orders →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Estimates</h3>
          <p className="text-3xl font-bold">{stats?.totalEstimates || 0}</p>
          <Link href="/admin/estimates" className="text-blue-600 hover:underline mt-4 inline-block">
            View All Estimates →
          </Link>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-2">Furniture Items</h3>
          <p className="text-3xl font-bold">{stats?.totalFurniture || 0}</p>
          <Link href="/admin/furniture" className="text-blue-600 hover:underline mt-4 inline-block">
            Manage Inventory →
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/furniture/new">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">Add New Furniture</h3>
            <p className="text-gray-600">List new furniture items for sale</p>
          </Card>
        </Link>

        <Link href="/admin/estimates">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">Review Estimates</h3>
            <p className="text-gray-600">Process pending estimate requests</p>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">Manage Orders</h3>
            <p className="text-gray-600">View and update order status</p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Orders</h3>
          {stats?.recentOrders?.length ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{order.user?.email}</p>
                    <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent orders</p>
          )}
        </Card>

        {/* Recent Estimates */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Recent Estimates</h3>
          {stats?.recentEstimates?.length ? (
            <div className="space-y-4">
              {stats.recentEstimates.map((estimate) => (
                <div key={estimate._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{estimate.user?.email}</p>
                    <p className="text-sm text-gray-600">{new Date(estimate.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                    estimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {estimate.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent estimates</p>
          )}
        </Card>
      </div>
    </div>
  );
} 