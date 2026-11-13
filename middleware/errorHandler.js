import mongoose from "mongoose";

/**
 * Middleware to validate MongoDB ObjectId parameters
 */
export const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      message: `Invalid ID format: '${req.params.id}' is not a valid MongoDB ObjectId`,
    });
  }
  next();
};

/**
 * Wrapper for async route handlers to eliminate try-catch boilerplate
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error (e.g., duplicate SKU)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    message = `Duplicate value entered for '${field}': '${value}'. Must be unique.`;
  }

  // Mongoose invalid ObjectId (CastError)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found. Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
