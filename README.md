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
│   ├── db.js
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

## Scripts

```bash
npm run dev    # Start with node --watch
npm start      # Start normally
npm test       # Run node:test suite
npm run init   # Configure a freshly cloned/template project
```

## Endpoints

- `GET /health` - Service-backed health check.
- `GET /api/v1/users` - Sample module showing repository usage.

## Database Selection

Before `npm run init`, the boilerplate ships both database templates:

- `templates/config/postgres.db.js`
- `templates/config/mongo.db.js`

After initialization, only `src/config/db.js` remains.
