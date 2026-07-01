import mongoose from "mongoose";
import dotenv from "dotenv";

import { MONGO } from "./env.js";
import logger from "./logger.js";

dotenv.config();

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

  static async init(mongoUri = MONGO.PROD) {
    if (
      DB.initialized &&
      DB.database &&
      DB.connection &&
      DB.connection.readyState === 1
    ) {
      return DB.database;
    }

    const databaseName = MONGO.DATABASE_NAME || "production";

    if (!mongoUri) {
      throw new Error("MONGO.PROD is required");
    }

    DB.connection = await mongoose
      .createConnection(mongoUri, { dbName: databaseName })
      .asPromise();
    DB.database = DB.connection.db;
    DB.initialized = true;

    DB.#bindShutdownHandlers();

    logger.info(`MongoDB connected to ${databaseName}`);
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
