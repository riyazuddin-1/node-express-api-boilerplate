import mongoose from "mongoose";
import dotenv from "dotenv";

import { MONGODB_URI } from "./env.js";
import logger from "./logger.js";

dotenv.config({ quiet: true });

class DB {
  static connection = null;
  static database = null;
  static initialized = false;
  static _handlersBound = false;

  constructor(collectionName) {
    if (!DB.database) {
      throw new Error(
        "Database not initialized. Call DB.init() before creating collections.",
      );
    }

    return DB.database.collection(collectionName);
  }

  static async init(mongoUri = MONGODB_URI) {
    if (
      DB.initialized &&
      DB.database &&
      DB.connection &&
      DB.connection.readyState === 1
    ) {
      return DB.database;
    }

    if (!mongoUri) {
      throw new Error("MONGODB_URI is required");
    }

    DB.connection = await mongoose.createConnection(mongoUri).asPromise();
    DB.database = DB.connection.db;
    DB.initialized = true;

    DB.#bindShutdownHandlers();

    logger.info(`MongoDB connected to ${DB.connection.name}`);
    return DB.database;
  }

  static async close() {
    if (!DB.connection) {
      return;
    }

    await DB.connection.close();
    logger.info("MongoDB connection closed");

    DB.connection = null;
    DB.database = null;
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
