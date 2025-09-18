import pool from "../config/database.js";

// Create transcripts table if it doesn't exist
const createTranscriptsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS transcripts (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (session_id) ON DELETE CASCADE
    )
  `;
  
  try {
    await pool.query(query);
    console.log("Transcripts table created or already exists");
  } catch (error) {
    console.error("Error creating transcripts table:", error);
  }
};

// Initialize the table
createTranscriptsTable();

const Transcript = {
  // Create a new transcript entry
  create: async (sessionId, role, content) => {
    const query =
      "INSERT INTO transcripts (session_id, role, content) VALUES ($1, $2, $3) RETURNING *";
    try {
      const result = await pool.query(query, [sessionId, role, content]);
      return result.rows[0];
    } catch (error) {
      console.error("Error creating transcript:", error);
      throw error;
    }
  },

  // Find all transcripts for a session
  findBySessionId: async (sessionId) => {
    const query =
      "SELECT * FROM transcripts WHERE session_id = $1 ORDER BY timestamp ASC";
    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows;
    } catch (error) {
      console.error("Error finding transcripts:", error);
      throw error;
    }
  },

  // Delete all transcripts for a session
  deleteBySessionId: async (sessionId) => {
    const query = "DELETE FROM transcripts WHERE session_id = $1";
    try {
      await pool.query(query, [sessionId]);
      return true;
    } catch (error) {
      console.error("Error deleting transcripts:", error);
      throw error;
    }
  },
};

export default Transcript;
