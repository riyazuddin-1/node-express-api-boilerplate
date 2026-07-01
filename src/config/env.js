import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = Number(process.env.PORT || 3000);
export const LOG_FILE = process.env.LOG_FILE || "_.ignore.logs";
export const DB_TYPE = process.env.DB_TYPE || "postgres";

export const POSTGRES = {
  PROD: process.env.POSTGRES_PROD,
};

export const MONGO = {
  PROD: process.env.MONGO_PROD,
  DATABASE_NAME: process.env.MONGO_DATABASE_NAME || "production",
};
