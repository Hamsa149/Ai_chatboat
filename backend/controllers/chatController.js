// controllers/chatController.js
import db from "../config/database.js";
import { generateSessionId } from "../utils/helpers.js";
import { retrieveRelevantPassages } from "../services/vectorStore.js";
import { generateResponse } from "../services/geminiService.js";

/**
 * ✅ Send message & generate AI response
 */
export async function sendMessage(req, res) {
  try {
    const { message, sessionId: clientSessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let sessionId = clientSessionId || generateSessionId();

    // ✅ Create session if it does not exist
    const sessionExists = await db.query(
      "SELECT * FROM sessions WHERE session_id = $1",
      [sessionId]
    );

    if (sessionExists.rows.length === 0) {
      await db.query(
        "INSERT INTO sessions (session_id, created_at, updated_at) VALUES ($1, NOW(), NOW())",
        [sessionId]
      );
    }

    // ✅ Save user message
    await db.query(
      "INSERT INTO transcripts (session_id, role, content, timestamp) VALUES ($1, $2, $3, NOW())",
      [sessionId, "user", message]
    );

    // ✅ Get relevant passages from vector store
    const relevantPassages = await retrieveRelevantPassages(message, 5);

    // ✅ Generate AI response
    const aiResponse = await generateResponse(message, relevantPassages);

    // ✅ Save assistant message
    await db.query(
      "INSERT INTO transcripts (session_id, role, content, timestamp) VALUES ($1, $2, $3, NOW())",
      [sessionId, "assistant", aiResponse]
    );

    res.json({
      sessionId,
      response: aiResponse,
      relevantArticles: relevantPassages.map((p) => p.metadata || p.text),
    });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ error: "Failed to process message" });
  }
}

/**
 * ✅ Get all sessions with first user message as title
 */
export async function getSessions(req, res) {
  try {
    const sessionsResult = await db.query(
      "SELECT session_id, created_at FROM sessions ORDER BY created_at DESC"
    );

    const sessions = [];

    for (const row of sessionsResult.rows) {
      const transcriptResult = await db.query(
        "SELECT content FROM transcripts WHERE session_id = $1 AND role='user' ORDER BY timestamp ASC LIMIT 1",
        [row.session_id]
      );

      sessions.push({
        session_id: row.session_id,
        created_at: row.created_at,
        title: transcriptResult.rows[0]?.content || "No messages yet",
      });
    }

    res.json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
}

/**
 * ✅ Get chat history for a session
 */
export async function getChatHistory(req, res) {
  try {
    const { sessionId } = req.params;
    const result = await db.query(
      "SELECT role, content, timestamp FROM transcripts WHERE session_id = $1 ORDER BY timestamp ASC",
      [sessionId]
    );
    res.json({ history: result.rows });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
}

/**
 * ✅ Clear chat history for a session (delete transcripts + session)
 */
export async function clearChatHistory(req, res) {
  try {
    const { sessionId } = req.params;

    // Delete transcripts
    await db.query("DELETE FROM transcripts WHERE session_id = $1", [sessionId]);

    // Delete session itself
    await db.query("DELETE FROM sessions WHERE session_id = $1", [sessionId]);

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error clearing history:", err);
    res.status(500).json({ error: "Failed to clear history" });
  }
}
