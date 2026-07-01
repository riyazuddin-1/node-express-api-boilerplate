import fs from "node:fs";
import util from "node:util";

import { LOG_FILE, NODE_ENV } from "./env.js";

class Logger {
  constructor(logFile = LOG_FILE) {
    this.logFile = logFile;
  }

  format(args) {
    return args
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : util.inspect(arg, { depth: null, colors: false }),
      )
      .join(" ");
  }

  write(args) {
    if (NODE_ENV === "test") {
      return;
    }

    fs.appendFileSync(this.logFile, `${this.format(args)}\n`);
  }

  info(...args) {
    const fullLogArgs = [new Date().toISOString(), "| INFO |", ...args];
    console.log(...fullLogArgs);
    this.write(fullLogArgs);
  }

  warn(...args) {
    const fullLogArgs = [new Date().toISOString(), "| WARN |", ...args];
    console.warn(...fullLogArgs);
    this.write(fullLogArgs);
  }

  error(...args) {
    const fullLogArgs = [new Date().toISOString(), "| ERROR |", ...args];
    console.error(...fullLogArgs);
    this.write(fullLogArgs);
  }

  debug(...args) {
    if (NODE_ENV !== "development") {
      return;
    }

    const fullLogArgs = [new Date().toISOString(), "| DEBUG |", ...args];
    console.debug(...fullLogArgs);
    this.write(fullLogArgs);
  }
}

const logger = new Logger();

export default logger;
