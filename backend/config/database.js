import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: "postgres", // default PostgreSQL user
  host: "localhost",
  database: "chatboat",
  password: "12345",
  port: 5432,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error acquiring client", err.stack);
  } else {
    console.log("Connected to PostgreSQL database");
    release();
  }
});

export default pool;
