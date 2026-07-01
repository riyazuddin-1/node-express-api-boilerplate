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
  const databaseName = projectName.replaceAll("-", "_");
  const env = [
    "NODE_ENV=development",
    "PORT=3000",
    "LOG_LEVEL=debug",
    "LOG_FILE=logs/app.log",
    "",
    "# --- Database (Single URI per type) ---",
    "# The app picks ONE of these based on DB_TYPE.",
    `DATABASE_URL=postgres://user:pass@localhost:5432/${databaseName}`,
    `MONGODB_URI=mongodb://localhost:27017/${databaseName}`,
    "",
    "# --- App Configuration ---",
    `DB_TYPE=${dbChoice}`,
    "JWT_SECRET=super-secret-key-change-me",
  ];

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

const writeReadme = ({ projectName, dbChoice }) => {
  const title = projectName
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const readme = `# ${title}

ESM-based Express API using ${dbChoice === "postgres" ? "Postgres" : "MongoDB"}.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

## Scripts

\`\`\`bash
npm run dev    # Start with node --watch
npm start      # Start normally
npm test       # Run node:test suite
\`\`\`

## Environment

\`\`\`env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# --- Database (Single URI per type) ---
# The app picks ONE of these based on DB_TYPE.
DATABASE_URL=postgres://user:pass@localhost:5432/${projectName.replaceAll("-", "_")}
MONGODB_URI=mongodb://localhost:27017/${projectName.replaceAll("-", "_")}

# --- App Configuration ---
DB_TYPE=${dbChoice}
JWT_SECRET=super-secret-key-change-me
\`\`\`

## Structure

\`\`\`text
src
├── app.js
├── server.js
├── config
│   ├── constants.js
│   ├── db.js
│   ├── env.js
│   └── logger.js
├── middlewares
├── modules
└── utils
\`\`\`

## API Flow

\`\`\`text
Route -> Controller -> Service -> Repository -> src/config/db.js
\`\`\`

## Endpoints

- \`GET /health\` - Service-backed health check.
- \`GET /api/v1/users\` - Sample module showing repository usage.
`;

  writeFileSync(join(__dirname, "README.md"), readme);
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
  writeReadme({ projectName, dbChoice });
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
