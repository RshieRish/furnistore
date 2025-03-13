import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ProductsService } from './products/products.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productsService = app.get(ProductsService);

  // Sample products
  const products = [
    { 
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
    {
      name: "Modern Leather Sofa",
      price: 1200,
      images: ["/images/leather-sofa.jpg"],
      category: "Living Room",
      description: "Luxurious leather sofa with modern design. Perfect for contemporary living spaces.",
      material: "Leather, Metal",
      style: "Modern",
      color: "Black",
      stockQuantity: 3,
      features: ["Genuine Leather", "Stainless Steel Legs", "Comfortable Cushions", "Easy to Clean"],
      rating: 4.5,
      reviews: 8,
      isOnSale: true,
      isFeatured: true
    },
    {
      name: "Wooden Dining Table",
      price: 800,
      images: ["/images/dining-table.jpg"],
      category: "Dining Room",
      description: "Solid oak dining table that seats 6 people comfortably. Perfect for family gatherings.",
      material: "Oak",
      style: "Rustic",
      color: "Natural Wood",
      stockQuantity: 4,
      features: ["Solid Oak", "Seats 6", "Sturdy Construction", "Easy Assembly"],
      rating: 4.7,
      reviews: 15,
      isOnSale: false,
      isFeatured: true
    },
    {
      name: "Queen Size Bed Frame",
      price: 950,
      images: ["/images/bed-frame.jpg"],
      category: "Bedroom",
      description: "Elegant queen size bed frame with upholstered headboard. Adds sophistication to any bedroom.",
      material: "Wood, Fabric",
      style: "Contemporary",
      color: "Gray",
      stockQuantity: 2,
      features: ["Queen Size", "Upholstered Headboard", "Sturdy Base", "No Box Spring Needed"],
      rating: 4.6,
      reviews: 10,
      isOnSale: false,
      isFeatured: true
    },
    {
      name: "Office Desk with Drawers",
      price: 450,
      images: ["/images/office-desk.jpg"],
      category: "Office",
      description: "Functional office desk with multiple drawers for storage. Perfect for home office setup.",
      material: "Wood, Metal",
      style: "Modern",
      color: "White",
      stockQuantity: 7,
      features: ["Multiple Drawers", "Cable Management", "Spacious Surface", "Easy Assembly"],
      rating: 4.4,
      reviews: 6,
      isOnSale: true,
      isFeatured: false
    }
  ];

  console.log('Starting to seed products...');

  // Clear existing products
  try {
    // Add each product
    for (const product of products) {
      await productsService.create(product);
      console.log(`Created product: ${product.name}`);
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 