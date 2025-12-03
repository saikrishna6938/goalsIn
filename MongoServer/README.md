# MongoServer

TypeScript + Express service that derives MongoDB collections from the existing `jotbox.sql` schema and exposes a lightweight API layer.

## Getting started

1. Copy `.env.example` to `.env` and adjust the Mongo connection string, database name, port, and SQL file location if required.
2. Install dependencies (already run if `node_modules` exists):

```bash
cd MongoServer
npm install
```

3. Bootstrap MongoDB collections from `jotbox.sql`:

```bash
npm run bootstrap
```

The bootstrap script parses every `CREATE TABLE` block in the SQL dump, infers BSON types, and creates/updates MongoDB collections with `$jsonSchema` validators so the Mongo database mirrors the relational structure.

4. Start the API server:

```bash
npm run dev       # ts-node + nodemon
# or
npm run build && npm start
```

The server exposes `GET /health` and `GET /collections` endpoints so you can verify connectivity and inspect which collections were created. Extend `src/app.ts` with additional routes/controllers as you implement Mongo-backed features.
