#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pipedAnswers = process.stdin.isTTY
  ? []
  : readFileSync(0, "utf8").split(/\r?\n/);

let pipedAnswerIndex = 0;

const rl = process.stdin.isTTY
  ? createInterface({
      input: process.stdin,
      output: process.stdout,
    })
  : null;

const ask = (question) => {
  if (pipedAnswers.length) {
    process.stdout.write(question);
    return Promise.resolve((pipedAnswers[pipedAnswerIndex++] || "").trim());
  }

  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
};

const slugify = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const run = (command, options = {}) => {
  try {
    execSync(command, { stdio: "ignore", ...options });
    return true;
  } catch {
    return false;
  }
};

const updatePackage = ({ projectName, dbChoice }) => {
  const pkgPath = join(__dirname, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

  pkg.name = projectName;
  delete pkg.bin;

  if (dbChoice === "postgres") {
    delete pkg.dependencies.mongoose;
  } else {
    delete pkg.dependencies.pg;
  }

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  rmSync(join(__dirname, "package-lock.json"), { force: true });
};

const writeEnv = ({ projectName, dbChoice }) => {
  const env = [
    "NODE_ENV=development",
    "PORT=3000",
    "LOG_FILE=_.ignore.logs",
    `DB_TYPE=${dbChoice}`,
    "",
  ];

  if (dbChoice === "postgres") {
    env.push(
      "# Postgres",
      `POSTGRES_PROD=postgres://postgres:password@localhost:5432/${projectName.replaceAll("-", "_")}`,
    );
  } else {
    env.push(
      "# Mongo",
      `MONGO_PROD=mongodb://localhost:27017/${projectName.replaceAll("-", "_")}`,
      "MONGO_DATABASE_NAME=production",
    );
  }

  writeFileSync(join(__dirname, ".env"), `${env.join("\n")}\n`);
};

const copyDbTemplate = (dbChoice) => {
  const templatePath = join(__dirname, "templates", "config", `${dbChoice}.db.js`);
  const destinationPath = join(__dirname, "src", "config", "db.js");

  if (!existsSync(templatePath)) {
    throw new Error(`Missing database template: ${templatePath}`);
  }

  writeFileSync(destinationPath, readFileSync(templatePath, "utf8"));
};

const resetGit = () => {
  rmSync(join(__dirname, ".git"), { recursive: true, force: true });

  if (!run("git init")) {
    return;
  }

  run("git add .");
  run('git commit -m "Initial commit from boilerplate"');
};

const cleanup = () => {
  rmSync(join(__dirname, "templates"), { recursive: true, force: true });
  rmSync(__filename, { force: true });
};

const main = async () => {
  console.log("\nInitializing Node Express API boilerplate\n");

  const rawProjectName = await ask("Project name: ");
  const projectName = slugify(rawProjectName || "node-express-api");

  const rawDbChoice = await ask("Choose database (postgres/mongo) [postgres]: ");
  const dbChoice = (rawDbChoice || "postgres").toLowerCase();

  if (!["postgres", "mongo"].includes(dbChoice)) {
    throw new Error("Database choice must be either postgres or mongo.");
  }

  updatePackage({ projectName, dbChoice });
  writeEnv({ projectName, dbChoice });
  copyDbTemplate(dbChoice);
  cleanup();
  resetGit();

  console.log(`\nDone. ${projectName} is ready.`);
  console.log("Run `npm install` and `npm run dev` to start.\n");
};

main()
  .catch((error) => {
    console.error(`\nSetup failed: ${error.message}\n`);
    process.exitCode = 1;
  })
  .finally(() => {
    rl?.close();
  });
