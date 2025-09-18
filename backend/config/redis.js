import { createClient } from "redis";

let redisClient;

export const initRedis = async () => {
  // Use REDIS_URL from environment (Render/Heroku) or fallback to localhost
  const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  redisClient = createClient({
    url: redisUrl,
  });

  redisClient.on("error", (err) => console.error("Redis error:", err));
  redisClient.on("connect", () => console.log("Connected to Redis"));

  try {
    await redisClient.connect();
    console.log("Redis client connected successfully!");
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    if (!process.env.REDIS_URL) {
      console.warn("If deploying, set the REDIS_URL environment variable!");
    }
  }

  return redisClient;
};

// Helper to get the client safely after initialization
export const getRedisClient = () => {
  if (!redisClient) throw new Error("Redis not initialized. Call initRedis first.");
  return redisClient;
};
