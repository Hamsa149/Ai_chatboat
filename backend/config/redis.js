import { createClient } from "redis";

let redisClient;

export const initRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  redisClient.on("error", (err) => console.error("Redis error:", err));
  redisClient.on("connect", () => console.log("Connected to Redis"));

  await redisClient.connect();
  return redisClient;
};

// Helper to get the client safely after initialization
export const getRedisClient = () => {
  if (!redisClient) throw new Error("Redis not initialized. Call initRedis first.");
  return redisClient;
};
