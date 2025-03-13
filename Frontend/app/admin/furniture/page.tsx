"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/store/auth'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { adminApi } from '@/lib/api'
import Link from 'next/link'
import { API_URL } from '@/config'

interface FurnitureItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  images?: string[];
  status?: string;
  createdAt?: string;
  stockQuantity?: number;
}

export default function FurniturePage() {
  const router = useRouter()
  const { user, isHydrated } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [furniture, setFurniture] = useState<FurnitureItem[]>([])
  const [products, setProducts] = useState<FurnitureItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || !user.isAdmin) {
      router.replace('/login');
      return;
    }

    loadFurnitureAndProducts();
  }, [user, isHydrated, router]);

  const loadFurnitureAndProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch furniture from admin endpoint
      const furnitureData = await adminApi.getFurniture();
      setFurniture(furnitureData);
      
      // Fetch products from products endpoint
      const productsResponse = await fetch(`${API_URL}/products`);
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        // Transform products to match furniture structure
        const transformedProducts = productsData.map((product: any) => ({
          _id: product._id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          images: product.images,
          stockQuantity: product.stockQuantity,
          // Add a flag to identify this as a product, not furniture
          isProduct: true
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error loading furniture and products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, isProduct: boolean = false) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (isProduct) {
        // Handle product deletion (if implemented)
        alert('Product deletion from admin panel is not implemented yet.');
      } else {
        // Delete furniture
        await adminApi.deleteFurniture(id);
        setFurniture(furniture.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleImageError = (id: string) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  };

  // Combine furniture and products
  const allItems = [...furniture, ...products];

  const filteredItems = allItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      item.category.toLowerCase() === selectedCategory.toLowerCase() ||
      // Map product categories to furniture categories
      (item.category === 'Living Room' && selectedCategory.toLowerCase() === 'sofas') ||
      (item.category === 'Bedroom' && selectedCategory.toLowerCase() === 'beds') ||
      (item.category === 'Dining Room' && selectedCategory.toLowerCase() === 'tables');
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from both furniture and products
  const categories = ['all', ...Array.from(new Set(allItems.map(item => 
    typeof item.category === 'string' ? item.category : 'Other'
  )))];

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
        {filteredItems.map((item) => (
          <Card key={item._id} className="overflow-hidden">
            {/* Image handling for both furniture and products */}
            {!imageError[item._id] && (
              <img
                src={
                  item.imageUrl || 
                  (item.images && item.images.length > 0 ? item.images[0] : '/placeholder.svg')
                }
                alt={item.name}
                className="w-full h-48 object-cover"
                onError={() => handleImageError(item._id)}
              />
            )}
            {imageError[item._id] && (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image not available</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                {(item as any).isProduct && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Product</span>
                )}
                {!(item as any).isProduct && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Furniture</span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold mb-2">${item.price}</p>
              <p className="text-sm text-gray-500 mb-4">Category: {item.category}</p>
              {item.stockQuantity !== undefined && (
                <p className="text-sm text-gray-500 mb-4">Stock: {item.stockQuantity}</p>
              )}
              
              <div className="flex justify-between items-center">
                {!(item as any).isProduct && (
                  <>
                    <Link href={`/admin/furniture/${item._id}`}>
                      <Button variant="outline">Edit</Button>
                    </Link>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
                {(item as any).isProduct && (
                  <div className="w-full text-center">
                    <span className="text-gray-500 text-sm">Products can be managed through the database</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No furniture items found</p>
        </div>
      )}
    </div>
  );
} 