import app from "./app.js";
import { PORT } from "./config/env.js";
import logger from "./config/logger.js";

let server = null;
let DB = null;

const start = async () => {
  try {
    DB = (await import("./config/db.js")).default;
    await DB.init();

    server = app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info("Shutting down server");

  if (server) {
    server.close();
  }

  await DB?.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start();
