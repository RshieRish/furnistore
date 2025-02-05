"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { adminApi } from '@/lib/api'
import Link from 'next/link'

interface FurnitureItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export default function FurniturePage() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || !user.isAdmin) {
      router.replace('/login');
      return;
    }

    loadFurniture();
  }, [user, isHydrated, router]);

  const loadFurniture = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getFurniture();
      setFurniture(data);
    } catch (error) {
      console.error('Error loading furniture:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await adminApi.deleteFurniture(id);
      setFurniture(furniture.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting furniture:', error);
      alert('Failed to delete item');
    }
  };

  const filteredFurniture = furniture.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(furniture.map(item => item.category))];

  if (!isHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading Furniture...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Furniture Management</h1>
        <Link href="/admin/furniture/new">
          <Button>Add New Furniture</Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="search"
          placeholder="Search furniture..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-md p-2"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Furniture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFurniture.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold mb-2">${item.price}</p>
              <p className="text-sm text-gray-500 mb-4">Category: {item.category}</p>
              
              <div className="flex justify-between items-center">
                <Link href={`/admin/furniture/${item._id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <Button 
                  variant="destructive"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFurniture.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No furniture items found</p>
        </div>
      )}
    </div>
  );
} 