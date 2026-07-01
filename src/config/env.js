import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = Number(process.env.PORT || 3000);
export const LOG_LEVEL = process.env.LOG_LEVEL || "info";
export const LOG_FILE = process.env.LOG_FILE || "logs/app.log";
export const DB_TYPE = process.env.DB_TYPE || "postgres";
export const DATABASE_URL = process.env.DATABASE_URL;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
