import Session from "../models/Session.js";
import Transcript from "../models/Transcript.js";
import { getRedisClient } from "../config/redis.js";

const REDIS_TTL = 24 * 60 * 60; // 1 day in seconds

const sessionManager = {
  // Get session history from Redis or DB
  getSessionHistory: async (sessionId) => {
    const redisClient = getRedisClient();
    const cached = await redisClient.get(`session:${sessionId}:history`);
    if (cached) return JSON.parse(cached);

    const history = await Transcript.findBySessionId(sessionId);
    await redisClient.setEx(`session:${sessionId}:history`, REDIS_TTL, JSON.stringify(history));
    return history;
  },

  // Save a message to DB and clear Redis cache
  saveMessage: async (sessionId, role, content) => {
    const redisClient = getRedisClient();

    // Ensure session exists in DB
    const existingSession = await Session.findBySessionId(sessionId);
    if (!existingSession) {
      await Session.create(sessionId);
    }

    // Save the transcript
    await Transcript.create(sessionId, role, content);

    // Clear session history in Redis
    await redisClient.del(`session:${sessionId}:history`);
  },

  // Clear session (DB + Redis)
  clearSession: async (sessionId) => {
    const redisClient = getRedisClient();
    await Transcript.deleteBySessionId(sessionId);
    await Session.delete(sessionId);
    await redisClient.del(`session:${sessionId}:history`);
  }
};

export default sessionManager;
