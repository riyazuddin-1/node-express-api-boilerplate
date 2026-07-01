import { DB_TYPE, NODE_ENV } from "../../config/env.js";

export const getHealth = () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: DB_TYPE,
  };
};
