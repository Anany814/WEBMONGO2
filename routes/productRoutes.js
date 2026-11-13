import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockReport,
  getCategorySummary,
} from "../controllers/productController.js";
import { validateObjectId } from "../middleware/errorHandler.js";

const router = express.Router();

// Static report routes must be declared before /:id parameter routes
router.get("/low-stock", getLowStockReport);
router.get("/summary", getCategorySummary);

// Base resource routes
router.route("/").get(getProducts).post(createProduct);

// Stock adjustment sub-resource route
router.patch("/:id/stock", validateObjectId, updateStock);

// Individual resource routes by ID
router
  .route("/:id")
  .get(validateObjectId, getProductById)
  .put(validateObjectId, updateProduct)
  .delete(validateObjectId, deleteProduct);

export default router;
