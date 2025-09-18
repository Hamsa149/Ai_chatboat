import express from "express";
import {
  sendMessage,
  getChatHistory,
  getSessions,
  clearChatHistory
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/sessions", getSessions);
router.get("/history/:sessionId", getChatHistory);
router.delete("/history/:sessionId", clearChatHistory);

export default router;
