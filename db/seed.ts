import { db } from "./index";
import { perfumes, insertPerfumeSchema } from "@shared/schema";

async function seed() {
  try {
    // Check if perfumes already exist
    const existingPerfumes = await db.select({ count: { value: perfumes.id } }).from(perfumes);
    
    if (existingPerfumes.length > 0 && existingPerfumes[0].count.value > 0) {
      console.log("Perfumes already seeded, skipping...");
      return;
    }
    
    // Sample perfume data
    const perfumeData = [
      {
        name: "Mystic Amber",
        brand: "La Maison Parfum",
        description: "A sophisticated blend of amber, vanilla, and woody notes. Perfect for evening occasions.",
        price: 89.99,
        rating: 4.5,
        reviews: 126,
        gender: ["men", "women"],
        fragrance_type: ["woody", "oriental"],
        occasions: ["date", "special"],
        image_url: null
      },
      {
        name: "Ocean Breeze",
        brand: "Azure Fragrances",
        description: "A fresh, aquatic scent with notes of bergamot and sea salt. Perfect for daily wear.",
        price: 64.50,
        rating: 4.0,
        reviews: 87,
        gender: ["men"],
        fragrance_type: ["fresh"],
        occasions: ["everyday", "work"],
        image_url: null
      },
      {
        name: "Urban Musk",
        brand: "Noir Collection",
        description: "A modern blend of musk, cedar and vetiver. Sophisticated and long-lasting.",
        price: 78.75,
        rating: 4.5,
        reviews: 103,
        gender: ["men"],
        fragrance_type: ["woody", "oriental"],
        occasions: ["work", "date"],
        image_url: null
      },
      {
        name: "Floral Symphony",
        brand: "Bloom & Co",
        description: "An elegant bouquet of jasmine, rose, and lily of the valley, with a hint of citrus.",
        price: 92.25,
        rating: 4.7,
        reviews: 156,
        gender: ["women"],
        fragrance_type: ["floral"],
        occasions: ["everyday", "special"],
        image_url: null
      },
      {
        name: "Citrus Burst",
        brand: "Sunshine Scents",
        description: "Energizing blend of lemon, grapefruit and mandarin with underlying notes of mint.",
        price: 58.99,
        rating: 4.2,
        reviews: 94,
        gender: ["men", "women"],
        fragrance_type: ["fresh"],
        occasions: ["everyday", "work"],
        image_url: null
      },
      {
        name: "Velvet Rose",
        brand: "La Maison Parfum",
        description: "A luxurious rose fragrance with vanilla and sandalwood undertones. Elegant and timeless.",
        price: 105.50,
        rating: 4.8,
        reviews: 189,
        gender: ["women"],
        fragrance_type: ["floral", "oriental"],
        occasions: ["date", "special"],
        image_url: null
      },
      {
        name: "Midnight Forest",
        brand: "Noir Collection",
        description: "Deep and mysterious blend of pine, cedar, and patchouli with a hint of leather.",
        price: 82.75,
        rating: 4.3,
        reviews: 112,
        gender: ["men"],
        fragrance_type: ["woody"],
        occasions: ["date", "special"],
        image_url: null
      },
      {
        name: "Mediterranean Breeze",
        brand: "Azure Fragrances",
        description: "Light and refreshing with notes of sea breeze, citrus, and white musk.",
        price: 68.50,
        rating: 4.1,
        reviews: 78,
        gender: ["men", "women"],
        fragrance_type: ["fresh"],
        occasions: ["everyday", "work"],
        image_url: null
      },
      {
        name: "Spiced Vanilla",
        brand: "Aromatic Essence",
        description: "Warm vanilla infused with cinnamon, cardamom, and a touch of amber.",
        price: 72.99,
        rating: 4.4,
        reviews: 95,
        gender: ["women"],
        fragrance_type: ["oriental"],
        occasions: ["date", "special"],
        image_url: null
      },
      {
        name: "Aqua Vitae",
        brand: "Sunshine Scents",
        description: "Fresh and invigorating aquatic scent with notes of mint, lemon, and sea minerals.",
        price: 59.99,
        rating: 4.0,
        reviews: 83,
        gender: ["men"],
        fragrance_type: ["fresh"],
        occasions: ["everyday", "work"],
        image_url: null
      }
    ];
    
    // Validate and insert perfumes
    const validatedPerfumes = perfumeData.map(perfume => insertPerfumeSchema.parse(perfume));
    
    // Insert in batches
    for (let i = 0; i < validatedPerfumes.length; i += 5) {
      const batch = validatedPerfumes.slice(i, i + 5);
      await db.insert(perfumes).values(batch);
    }
    
    console.log(`Successfully seeded ${validatedPerfumes.length} perfumes`);
  } catch (error) {
    console.error("Error seeding perfumes:", error);
  }
}

seed();
