import { DB_TYPE } from "../../config/env.js";

export const listUsers = async () => {
  const DB = (await import("../../config/db.js")).default;

  if (DB_TYPE === "mongo") {
    const users = new DB("users");
    return users.find({}).limit(50).toArray();
  }

  const result = await DB.query(
    "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 50",
  );

  return result.rows;
};
