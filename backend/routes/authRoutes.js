import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
