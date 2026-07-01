# Node Express API Boilerplate

ESM-based Express API boilerplate with a feature-module structure, config-managed database clients, and a zero-dependency initializer.

## Setup

```bash
npm run init
npm install
npm run dev
```

The initializer prompts for a project name and database choice, generates `.env`, copies the selected database client into `src/config/db.js`, removes setup templates, and starts a fresh Git history.

## Structure

```text
src
├── app.js
├── server.js
├── config
│   ├── constants.js
│   ├── env.js
│   └── logger.js
├── middlewares
│   ├── error.middleware.js
│   └── notFound.middleware.js
├── modules
│   ├── health
│   │   ├── health.controller.js
│   │   ├── health.route.js
│   │   └── health.service.js
│   └── users
│       ├── user.controller.js
│       ├── user.repository.js
│       ├── user.route.js
│       └── user.service.js
└── utils
    ├── asyncHandler.js
    └── response.js
```

## API Flow

```text
Route -> Controller -> Service -> Repository -> src/config/db.js
```

Controllers handle HTTP request/response concerns only. Services hold business logic. Repositories own database queries. The active database client lives in `src/config/db.js`.

`src/config/db.js` is intentionally not committed in the raw template. It is created by `npm run init` from the selected database template.

## Scripts

```bash
npm run dev    # Start with node --watch
npm start      # Start normally
npm test       # Run node:test suite
npm run init   # Configure a freshly cloned/template project
```

## Environment

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# --- Database (Single URI per type) ---
# The app picks ONE of these based on DB_TYPE.
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
MONGODB_URI=mongodb://localhost:27017/mydb

# --- App Configuration ---
DB_TYPE=postgres
JWT_SECRET=super-secret-key-change-me
```

## Endpoints

- `GET /health` - Service-backed health check.
- `GET /api/v1/users` - Sample module showing repository usage.

## Database Selection

Before `npm run init`, the boilerplate ships both database templates:

- `templates/config/postgres.db.js`
- `templates/config/mongo.db.js`

After initialization, only `src/config/db.js` remains.
