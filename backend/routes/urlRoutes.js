import express from "express";
import {
  createUrl,
  getUserLinks,
  deleteUrl,
  updateUrl,
  toggleUrlActive,
  getUrlAnalytics,
} from "../controllers/urlController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

// Rate limiter for creating short URLs (10 requests per 15 minutes per IP)
const createUrlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Protected routes (require authentication)
router.post("/shorten", verifyAuth, createUrlLimiter, createUrl);
router.get("/user-links", verifyAuth, getUserLinks);
router.delete("/:id", verifyAuth, deleteUrl);
router.put("/:id", verifyAuth, updateUrl);
router.patch("/:id/toggle", verifyAuth, toggleUrlActive);
router.get("/:id/analytics", verifyAuth, getUrlAnalytics);

export default router;
