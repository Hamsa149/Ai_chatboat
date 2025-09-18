// app.js - Main entry point for the RAG Chatbot Backend

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";

import chatRoutes from "./routes/chat.js";
import newsRoutes from "./routes/news.js";
import { initGemini } from "./services/geminiService.js";
import { initRedis } from "./config/redis.js";
import { initializeSocket } from "./utils/socketManager.js"; // named export

dotenv.config();

// Environment
const isProduction = process.env.NODE_ENV === "production";

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (!isProduction) process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (!isProduction) process.exit(1);
});

const app = express();
const server = http.createServer(app);

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== Health Check Endpoint =====
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "RAG Chatbot API is running",
    timestamp: new Date().toISOString(),
  });
});

// ===== Root Endpoint =====
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to RAG News Chatbot API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      chat: "/api/chat",
      news: "/api/news",
    },
  });
});

// ===== API Routes =====
app.use("/api/chat", chatRoutes);
app.use("/api/news", newsRoutes);

// ===== 404 Handler (Express 5 compatible) =====
app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
  });
});

// ===== Global Error Handler =====
app.use((error, req, res, next) => {
  console.error("Application error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: isProduction ? "Something went wrong" : error.message,
  });
});

// ===== Initialize Services =====
(async () => {
  try {
    // Initialize Redis
    await initRedis();

    // Initialize Gemini AI
    await initGemini();

    console.log("✅ Services initialized successfully");
  } catch (err) {
    console.error("❌ Failed to initialize services:", err);
    if (!isProduction) process.exit(1);
  }
})();

// ===== Socket.IO =====
initializeSocket(server); // use named export

// ===== Start Server =====
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health check available at: http://localhost:${PORT}/health`);
  if (!isProduction) console.log("🚧 Development mode: Debug logging enabled");
});

// ===== Graceful Shutdown =====
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => console.log("Process terminated"));
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => console.log("Process terminated"));
});

export default app;
