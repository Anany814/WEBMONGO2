import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

/**
 * @desc    Get all products with filtering, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    supplier,
    sortBy,
    order,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  // Build filter query
  const query = {};

  // Category filter (exact match, case-insensitive)
  if (category) {
    query.category = { $regex: new RegExp(`^${category.trim()}$`, "i") };
  }

  // Supplier filter (case-insensitive substring)
  if (supplier) {
    query.supplier = { $regex: supplier.trim(), $options: "i" };
  }

  // Keyword search across name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { sku: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== "") {
      query.price.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      query.price.$lte = Number(maxPrice);
    }
  }

  // Sorting
  let sortCriteria = { createdAt: -1 };
  if (sort) {
    // Allows format like ?sort=-price or ?sort=price
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith("-") ? -1 : 1;
    sortCriteria = { [sortField]: sortDirection };
  } else if (sortBy) {
    const sortDirection = order && order.toLowerCase() === "desc" ? -1 : 1;
    sortCriteria = { [sortBy]: sortDirection };
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Product.countDocuments(query);
  const totalPages = Math.ceil(total / limitNum) || 1;

  const products = await Product.find(query)
    .sort(sortCriteria)
    .skip(skip)
    .limit(limitNum);

  res.status(200).json({
    total,
    page: pageNum,
    totalPages,
    count: products.length,
    products,
  });
});

/**
 * @desc    Get low-stock alert report (quantity <= reorderLevel) using aggregation
 * @route   GET /api/products/low-stock
 * @access  Public
 */
export const getLowStockReport = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.aggregate([
    {
      $match: {
        $expr: { $lte: ["$quantity", "$reorderLevel"] },
      },
    },
    {
      $addFields: {
        stockValue: { $multiply: ["$price", "$quantity"] },
        id: { $toString: "$_id" },
      },
    },
    {
      $sort: { quantity: 1 },
    },
  ]);

  res.status(200).json({
    count: lowStockItems.length,
    lowStockItems,
  });
});

/**
 * @desc    Category-wise inventory summary using aggregation
 * @route   GET /api/products/summary
 * @access  Public
 */
export const getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        avgPrice: { $avg: "$price" },
      },
    },
    {
      $project: {
        _id: 1,
        totalItems: 1,
        totalQuantity: 1,
        totalStockValue: 1,
        avgPrice: { $round: ["$avgPrice", 2] },
      },
    },
    {
      $sort: { totalStockValue: -1 },
    },
  ]);

  res.status(200).json({
    categories: summary.length,
    summary,
  });
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

/**
 * @desc    Update product details
 * @route   PUT /api/products/:id
 * @access  Public
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

/**
 * @desc    Stock adjustment (restock or sale)
 * @route   PATCH /api/products/:id/stock
 * @access  Public
 */
export const updateStock = asyncHandler(async (req, res) => {
  const { change } = req.body;

  if (typeof change !== "number" || isNaN(change)) {
    return res.status(400).json({
      message:
        "Invalid input. 'change' must be a valid number (positive for restock, negative for sale).",
    });
  }

  if (change === 0) {
    return res.status(400).json({
      message: "Stock change cannot be zero.",
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (product.quantity + change < 0) {
    return res.status(400).json({
      message: `Insufficient stock. Current quantity is ${product.quantity}, cannot reduce by ${Math.abs(change)}.`,
    });
  }

  product.quantity += change;
  await product.save();

  res.status(200).json({
    message: "Stock updated",
    product,
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Public
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    message: "Product deleted",
    id: product._id.toString(),
  });
});
