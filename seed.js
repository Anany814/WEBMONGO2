import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Study Table",
    sku: "FURN-TB-812",
    category: "Furniture",
    price: 3999,
    quantity: 2,
    reorderLevel: 4,
    supplier: "IKEA India",
  },
  {
    name: "Gel Pen Pack of 15",
    sku: "STNY-PN-713",
    category: "Stationery",
    price: 120,
    quantity: 40,
    reorderLevel: 20,
    supplier: "Cello Pens",
  },
  {
    name: "Ergonomic Office Chair",
    sku: "FURN-CH-101",
    category: "Furniture",
    price: 5499,
    quantity: 5,
    reorderLevel: 8,
    supplier: "Featherlite",
  },
  {
    name: "Wireless Mechanical Keyboard",
    sku: "ELEC-KB-201",
    category: "Electronics",
    price: 3499,
    quantity: 25,
    reorderLevel: 10,
    supplier: "Logitech",
  },
  {
    name: "Gaming Mouse RGB",
    sku: "ELEC-MS-202",
    category: "Electronics",
    price: 1899,
    quantity: 30,
    reorderLevel: 15,
    supplier: "Razer",
  },
  {
    name: "27-inch 4K Monitor",
    sku: "ELEC-MN-203",
    category: "Electronics",
    price: 14500,
    quantity: 11,
    reorderLevel: 5,
    supplier: "Dell",
  },
  {
    name: "Noise-Cancelling Headphones",
    sku: "ELEC-HP-204",
    category: "Electronics",
    price: 2649,
    quantity: 30,
    reorderLevel: 10,
    supplier: "Sony",
  },
  {
    name: "Cotton Casual Shirt",
    sku: "APPL-SH-301",
    category: "Apparel",
    price: 1299,
    quantity: 45,
    reorderLevel: 15,
    supplier: "FabIndia",
  },
  {
    name: "Slim Fit Denim Jeans",
    sku: "APPL-JN-302",
    category: "Apparel",
    price: 1499,
    quantity: 33,
    reorderLevel: 20,
    supplier: "Levi's",
  },
  {
    name: "A4 Spiral Notebook 300 Pgs",
    sku: "STNY-NB-714",
    category: "Stationery",
    price: 180,
    quantity: 15,
    reorderLevel: 25,
    supplier: "Classmate",
  },
  {
    name: "Permanent Marker Set (4 colors)",
    sku: "STNY-MK-715",
    category: "Stationery",
    price: 160,
    quantity: 3,
    reorderLevel: 10,
    supplier: "Camlin",
  },
  {
    name: "Stainless Steel Water Bottle 1L",
    sku: "HOME-BT-501",
    category: "Home & Kitchen",
    price: 499,
    quantity: 50,
    reorderLevel: 15,
    supplier: "Milton",
  },
];

async function seedData() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI not found in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: "inventory" });
    console.log("Connected to MongoDB for seeding...");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${inserted.length} products!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
}

seedData();
