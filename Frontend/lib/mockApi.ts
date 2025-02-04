// Mock product data
const mockProducts = [
  { id: 1, name: "Modern Sofa", price: 999, image: "/placeholder.svg", category: "living-room" },
  { id: 2, name: "Elegant Dining Table", price: 599, image: "/placeholder.svg", category: "dining-room" },
  { id: 3, name: "Cozy Armchair", price: 399, image: "/placeholder.svg", category: "living-room" },
  { id: 4, name: "Office Desk", price: 299, image: "/placeholder.svg", category: "office" },
  { id: 5, name: "Queen Size Bed", price: 799, image: "/placeholder.svg", category: "bedroom" },
]

export const mockGetProducts = (category?: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (category) {
        resolve(mockProducts.filter((product) => product.category === category))
      } else {
        resolve(mockProducts)
      }
    }, 500) // Simulate network delay
  })
}

export const mockGetProduct = (id: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.id === id)
      if (product) {
        resolve(product)
      } else {
        reject(new Error("Product not found"))
      }
    }, 500) // Simulate network delay
  })
}

export const mockEstimateFurniture = (file: File) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      // In a real scenario, this would involve image processing and ML model inference
      const randomEstimate = Math.floor(Math.random() * 1000) + 500
      resolve(`$${randomEstimate}`)
    }, 1500) // Simulate network delay
  })
}

export const mockEstimateRepair = (file: File) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      // In a real scenario, this would involve image processing and ML model inference
      const randomEstimate = Math.floor(Math.random() * 500) + 100
      resolve(`$${randomEstimate}`)
    }, 1500) // Simulate network delay
  })
}

