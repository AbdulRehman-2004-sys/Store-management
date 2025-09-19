import express from "express";
import { registerUser, loginUser, getUserProfile, logoutUser } from "../controllers/authContoller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);

export default router;
