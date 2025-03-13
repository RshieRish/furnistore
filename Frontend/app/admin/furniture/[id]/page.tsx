"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi } from "@/lib/api"
import Image from "next/image"

export default function EditFurniturePage() {
  const { id } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    status: "available"
  })

  useEffect(() => {
    const fetchFurniture = async () => {
      try {
        setIsLoading(true)
        const furniture = await adminApi.getFurniture()
        const item = furniture.find((item: any) => item._id === id)
        
        if (item) {
          setFormData({
            name: item.name,
            price: String(item.price),
            category: item.category,
            description: item.description || "",
            status: item.status || "available"
          })
          
          if (item.imageUrl) {
            setImageUrls([item.imageUrl])
          }
        } else {
          setError("Furniture item not found")
        }
      } catch (err) {
        console.error("Failed to fetch furniture:", err)
        setError("Failed to load furniture item. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (id) {
      fetchFurniture()
    }
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files)
      setImages(prev => [...prev, ...newImages])
      
      // Create preview URLs
      const newImageUrls = newImages.map(file => URL.createObjectURL(file))
      setImageUrls(prev => [...prev, ...newImageUrls])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      
      const data = new FormData()
      data.append("name", formData.name)
      data.append("price", formData.price)
      data.append("category", formData.category)
      data.append("description", formData.description)
      data.append("status", formData.status)
      
      // Add images if any
      images.forEach(image => {
        data.append("image", image)
      })
      
      console.log("Submitting form data:", {
        id,
        name: formData.name,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        status: formData.status,
        images: images.map(img => img.name)
      })
      
      // Debug FormData contents
      console.log("FormData entries:")
      Array.from(data.entries()).forEach(pair => {
        console.log(pair[0], pair[1])
      })
      
      try {
        const result = await adminApi.updateFurniture(id as string, data)
        console.log("Update successful:", result)
        router.push("/admin/furniture")
      } catch (updateError: any) {
        console.error("Update error details:", updateError)
        setError(`Failed to update furniture: ${updateError.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error("Failed to update furniture:", err)
      setError("Failed to update furniture. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center py-8">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 text-center py-8">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Furniture</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange("category", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sofas">Sofas</SelectItem>
              <SelectItem value="chairs">Chairs</SelectItem>
              <SelectItem value="tables">Tables</SelectItem>
              <SelectItem value="beds">Beds</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="decor">Decor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Current Images</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {imageUrls.length > 0 ? (
              imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <Image
                    src={imageError ? "/placeholder.svg" : url}
                    alt={`Furniture image ${index + 1}`}
                    width={200}
                    height={200}
                    className="object-cover rounded-md"
                    onError={handleImageError}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No images available</p>
            )}
          </div>
          
          <label htmlFor="images" className="block text-sm font-medium mb-1">Add Images</label>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          <p className="text-xs text-gray-500 mt-1">You can select multiple images</p>
        </div>
        
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Furniture"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/furniture")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 