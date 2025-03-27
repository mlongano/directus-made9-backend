// knexfile.js
import dotenv from "dotenv";
dotenv.config(); // Ensure .env file variables are loaded

export default {
  development: {
    client: "pg", // <--- Changed from "sqlite3"
    connection: {
      host: process.env.DB_HOST || "postgres", // Matches Docker service name or env var
      port: process.env.DB_PORT || 5432, // Standard PostgreSQL port or env var
      database: process.env.DB_DATABASE || "directus", // Matches env var
      user: process.env.DB_USER || "directus", // Matches env var
      password: process.env.DB_PASSWORD || "your_postgres_password", // Matches env var (ensure this matches your actual password)
      // You might need ssl configuration depending on your setup, e.g.:
      // ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: "./migrations",
      loadExtensions: [".js"],
    },
    seeds: {
      directory: "./seeds",
      loadExtensions: [".js"],
    },
    // Remove SQLite specific option if present:
    // useNullAsDefault: true, // <-- Remove this line if it exists in the development block
  },

  // Production environment remains unchanged, assuming it's already correct for pg
  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Add SSL config if needed for production
      // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    },
    migrations: {
      directory: "./migrations",
      loadExtensions: [".js"],
    },
    seeds: {
      directory: "./seeds",
      loadExtensions: [".js"],
    },
  },
};
