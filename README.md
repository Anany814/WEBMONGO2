# Assignment 3: Inventory and Data Management System

A RESTful backend service built with **Node.js**, **Express.js**, **MongoDB**, and **Mongoose** to manage product catalogues, inventory stock levels, advanced query filtering/sorting/pagination, and analytical aggregation reports.

---

## 🛠️ Technology Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Configuration:** dotenv

---

## 📁 Project Structure

```text
inventory-management-system/
├── controllers/
│   └── productController.js      # Business logic, aggregations & query handling
├── middleware/
│   └── errorHandler.js           # Centralized error handler & ID validation
├── models/
│   └── Product.js                # Mongoose schema, validation, & stockValue virtual
├── routes/
│   └── productRoutes.js          # REST routes with proper precedence
├── .env.example                  # Environment variables template
├── .gitignore                    # Ignored files (node_modules, .env)
├── package.json                  # Scripts and dependencies
├── seed.js                       # Sample data seeder
├── server.js                     # Server entrypoint and MongoDB connection
└── README.md                     # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed (v18+)
- MongoDB Atlas account or local MongoDB instance

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Shruti-codes27/Web-Dev-Assignment-3.git
cd Web-Dev-Assignment-3
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

### 4. Seed Sample Data
Populate the database with sample products:
```bash
npm run seed
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (auto-reload on save)
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🔌 API Endpoints & Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Get all products (supports filtering, sorting, pagination) |
| `GET` | `/api/products/:id` | Get single product by MongoDB ObjectId |
| `POST` | `/api/products` | Create a new product with field validations |
| `PUT` | `/api/products/:id` | Update product details |
| `PATCH` | `/api/products/:id/stock` | Safe stock adjustment (`{ "change": number }`) |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/products/low-stock` | Low-stock alert report (`quantity <= reorderLevel`) |
| `GET` | `/api/products/summary` | Category-wise inventory aggregation summary |

### Sample Requests & Features

#### 1. Create Product (`POST /api/products`)
```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

#### 2. Filtering, Sorting & Pagination (`GET /api/products`)
- **Pagination:** `GET /api/products?page=1&limit=10`
- **Category Filter:** `GET /api/products?category=Furniture`
- **Price Filter:** `GET /api/products?minPrice=1000&maxPrice=5000`
- **Sorting:** `GET /api/products?sortBy=price&order=desc`
- **Search:** `GET /api/products?search=Table`

#### 3. Stock Adjustment (`PATCH /api/products/:id/stock`)
```json
{
  "change": 10
}
```
*Safely prevents negative quantities and dynamically recalculates total stock value.*

#### 4. Low-Stock Report (`GET /api/products/low-stock`)
Uses a MongoDB aggregation pipeline to find items where `quantity <= reorderLevel`.

#### 5. Category-wise Summary (`GET /api/products/summary`)
Aggregates count of products, total quantity, total stock value, and average price per category.

---

## 🛡️ Error Handling
Centralized error handling catches:
- Mongoose validation errors (`400 Bad Request`)
- Duplicate SKU errors (`code 11000`)
- Invalid MongoDB ObjectIds (`CastError`)
- Unknown route requests (`404 Not Found`)
