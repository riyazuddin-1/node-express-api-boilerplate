import { Pool } from "pg";
import dotenv from "dotenv";

import { DATABASE_URL } from "./env.js";
import logger from "./logger.js";

dotenv.config({ quiet: true });

class DB {
  static pool = null;
  static initialized = false;
  static _handlersBound = false;

  constructor() {
    throw new Error("Use DB.init() and DB.query() instead of 'new DB()'.");
  }

  static async init(connectionString = DATABASE_URL) {
    if (DB.initialized && DB.pool) {
      return DB.pool;
    }

    if (!connectionString) {
      throw new Error("DATABASE_URL connection string is required");
    }

    DB.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    DB.pool.on("error", (err) => {
      logger.error(`Unexpected error on idle client: ${err.message}`);
    });

    try {
      await DB.pool.query("SELECT NOW()");
      DB.initialized = true;
      DB.#bindShutdownHandlers();
      logger.info("PostgreSQL connected successfully");
    } catch (err) {
      logger.error(`PostgreSQL connection failed: ${err.message}`);
      throw err;
    }

    return DB.pool;
  }

  static async query(text, params) {
    if (!DB.pool) {
      throw new Error("Database not initialized. Call DB.init() first.");
    }

    const start = Date.now();

    try {
      const result = await DB.pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug("Executed query", { text, duration, rows: result.rowCount });
      return result;
    } catch (err) {
      logger.error("Query error", { text, err: err.message });
      throw err;
    }
  }

  static async connect() {
    if (!DB.pool) {
      throw new Error("Database not initialized. Call DB.init() first.");
    }

    return DB.pool.connect();
  }

  static async close() {
    if (!DB.pool) {
      return;
    }

    await DB.pool.end();
    logger.info("PostgreSQL pool closed");

    DB.pool = null;
    DB.initialized = false;
  }

  static #bindShutdownHandlers() {
    if (DB._handlersBound) {
      return;
    }

    const shutdown = async () => {
      await DB.close();
      process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    DB._handlersBound = true;
  }
}

export default DB;
