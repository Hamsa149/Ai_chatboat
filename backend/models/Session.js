import pool from "../config/database.js";

// Create sessions table if it doesn't exist
const createSessionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  try {
    await pool.query(query);
    console.log('Sessions table created or already exists');
  } catch (error) {
    console.error('Error creating sessions table:', error);
  }
};

// Initialize the table
createSessionsTable();

const Session = {
  create: async (sessionId) => {
    const query = 'INSERT INTO sessions (session_id) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  },

  findBySessionId: async (sessionId) => {
    const query = 'SELECT * FROM sessions WHERE session_id = $1';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  },

  delete: async (sessionId) => {
    const query = 'DELETE FROM sessions WHERE session_id = $1';
    await pool.query(query, [sessionId]);
    return true;
  }
};

export default Session;
