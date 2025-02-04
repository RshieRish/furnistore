"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createEstimate } from "@/lib/api"
import { useSocket } from "@/hooks/useSocket"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/store/auth"
import Link from "next/link"

interface EstimateResult {
  price: number;
  complexity: 'simple' | 'medium' | 'complex';
  materials: string[];
  laborHours: number;
  explanation: string;
}

export default function EstimatePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [requirements, setRequirements] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const socket = useSocket()
  const { user } = useAuth()

  useEffect(() => {
    if (!socket || !user) return;

    const handleStatus = (data: { status: string; message: string }) => {
      toast({
        title: 'Status Update',
        description: data.message,
      });
    };

    const handleResult = (data: { estimate: EstimateResult }) => {
      setEstimate(data.estimate);
      setIsLoading(false);
      toast({
        title: 'Success',
        description: 'Estimate received!',
      });
    };

    socket.on(`estimate:${user.id}:status`, handleStatus);
    socket.on(`estimate:${user.id}:result`, handleResult);

    return () => {
      socket.off(`estimate:${user.id}:status`, handleStatus);
      socket.off(`estimate:${user.id}:result`, handleResult);
    };
  }, [socket, user, toast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedImage) {
      toast({
        title: 'Error',
        description: 'Please select an image',
        variant: 'destructive',
      })
      return
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to create an estimate',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setEstimate(null)

    try {
      const result = await createEstimate(selectedImage, {
        requirements
      })
      setEstimate(result)
      toast({
        title: 'Success',
        description: 'Estimate request submitted',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get estimate. Please try again.')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to get estimate',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Get a Custom Furniture Estimate</h1>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Please Log In</h2>
          <p className="mb-4">You need to be logged in to create an estimate.</p>
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Get a Custom Furniture Estimate</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload Furniture Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/90"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-md rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Requirements and Details
          </label>
          <Textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe your furniture requirements, including materials, size, style, and any special features..."
            className="min-h-[150px]"
          />
        </div>
        
        <Button
          type="submit"
          disabled={isLoading || !selectedImage}
          className="w-full"
        >
          {isLoading ? 'Getting Estimate...' : 'Get Estimate'}
        </Button>
      </form>
      
      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {estimate && (
        <Card className="mt-6 p-6">
          <h2 className="text-2xl font-semibold mb-4">Estimate Details</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Price:</span>{' '}
              ${estimate?.price?.toLocaleString() ?? 'N/A'}
            </div>
            <div>
              <span className="font-medium">Complexity:</span>{' '}
              {estimate?.complexity ? estimate.complexity.charAt(0).toUpperCase() + estimate.complexity.slice(1) : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Labor Hours:</span>{' '}
              {estimate?.laborHours ?? 'N/A'}
            </div>
            <div>
              <span className="font-medium">Materials Needed:</span>
              <ul className="list-disc ml-6 mt-2">
                {estimate?.materials?.map((material, index) => (
                  <li key={index}>{material}</li>
                )) ?? <li>No materials specified</li>}
              </ul>
            </div>
            <div>
              <span className="font-medium">Detailed Explanation:</span>
              <p className="mt-2 whitespace-pre-wrap">{estimate?.explanation ?? 'No explanation available'}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

