import winston from "winston";

import { LOG_FILE, LOG_LEVEL, NODE_ENV } from "./env.js";

const { combine, colorize, errors, json, printf, splat, timestamp } =
  winston.format;

const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  json(),
);

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} | ${level} | ${stack || message}${details}`;
  }),
);

const transports =
  NODE_ENV === "test"
    ? []
    : [
        new winston.transports.Console({ format: consoleFormat }),
        new winston.transports.File({
          filename: LOG_FILE,
          format: fileFormat,
        }),
      ];

const logger = winston.createLogger({
  level: LOG_LEVEL,
  defaultMeta: {
    service: "node-express-api",
  },
  transports,
  silent: NODE_ENV === "test",
});

export default logger;
