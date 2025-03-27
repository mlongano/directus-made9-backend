// knexfile.js
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  development: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "database/data.db"),
    },
    // Required for SQLite so that knex doesn't complain about missing default values
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "migrations"),
      loadExtensions: [".js"],
    },
    seeds: {
      directory: path.join(__dirname, "seeds"),
      loadExtensions: [".js"],
    },
  },
  production: {
    client: "sqlite3",
    connection: {
      filename: path.join(__dirname, "prod.sqlite3"),
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.join(__dirname, "migrations"),
      loadExtensions: [".js"],
    },
    seeds: {
      directory: path.join(__dirname, "seeds"),
      loadExtensions: [".js"],
    },
  },
};
