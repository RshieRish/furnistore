// Mock product data
const mockProducts = [
  { 
    _id: "1", 
    name: "Antique Marble Top Table", 
    price: 600, 
    images: ["/images/marble-top-table.jpg"], 
    category: "Living Room",
    description: "MARBLE TOP TABLE\tMAHOGANY WOOD\tBORER & TERMITE TREATED\tFINELY HANDCRAFTED",
    material: "Marble, Mahogany",
    style: "Traditional",
    color: "Brown, White",
    stockQuantity: 5,
    features: ["Marble Top", "Mahogany Wood", "Borer & Termite Treated", "Finely Handcrafted"],
    rating: 4.8,
    reviews: 12,
    isOnSale: false,
    isFeatured: true
  },
]

// Generate more mock products
for (let i = 2; i <= 100; i++) {
  const categories = [
    'Living Room',
    'Bedroom',
    'Dining Room',
    'Office',
    'Outdoor',
    'Kitchen',
    'Bathroom',
    'Kids',
    'Entryway',
    'Storage'
  ]
  
  const materials = [
    'Wood',
    'Leather',
    'Fabric',
    'Metal',
    'Glass',
    'Marble',
    'Plastic',
    'Rattan',
    'Bamboo',
    'Velvet'
  ]
  
  const styles = [
    'Modern',
    'Traditional',
    'Contemporary',
    'Rustic',
    'Industrial',
    'Scandinavian',
    'Mid-Century',
    'Bohemian',
    'Farmhouse',
    'Minimalist'
  ]
  
  const colors = [
    'Black',
    'White',
    'Brown',
    'Gray',
    'Beige',
    'Blue',
    'Green',
    'Red',
    'Yellow',
    'Purple'
  ]
  
  const category = categories[Math.floor(Math.random() * categories.length)]
  const material = materials[Math.floor(Math.random() * materials.length)]
  const style = styles[Math.floor(Math.random() * styles.length)]
  const color = colors[Math.floor(Math.random() * colors.length)]
  const price = Math.floor(Math.random() * 1500) + 100
  
  mockProducts.push({
    _id: i.toString(),
    name: `${style} ${material} ${category} Piece`,
    price: price,
    images: [`/images/furniture-${i-1}.jpg`],
    category: category,
    description: `Beautiful ${style.toLowerCase()} ${category.toLowerCase()} piece made of high-quality ${material.toLowerCase()} in a stunning ${color.toLowerCase()} finish.`,
    material: material,
    style: style,
    color: color,
    stockQuantity: Math.floor(Math.random() * 20) + 1,
    features: [
      `Made of premium ${material}`,
      `${style} design`,
      `${color} finish`,
      'Easy assembly',
      'Durable construction'
    ],
    rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
    reviews: Math.floor(Math.random() * 50),
    isOnSale: Math.random() > 0.7,
    isFeatured: Math.random() > 0.8
  })
}

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

export const mockGetProduct = (id: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p._id === id)
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

