import express from "express";
import { addAmountToSession, addItemToSession, createSession, deleteItemFromSession, deleteSessionById, getAllSessions, getSessionById, paySession } from "../controllers/orderSessionController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create", protect, createSession); // POST /api/sessions/create
router.get("/", protect, getAllSessions); // GET /api/sessions
router.get("/:id", protect, getSessionById); // GET /api/sessions/:id
router.delete("/:id", protect, deleteSessionById); // DELETE /api/sessions/:id
router.patch("/:id/add-amount", protect, addAmountToSession);
router.patch("/:id/pay", protect, paySession);
router.patch("/:id/add-item", protect, addItemToSession);
router.delete("/:sessionId/items/:itemId", protect, deleteItemFromSession);

export default router;
